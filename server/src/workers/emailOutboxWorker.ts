import { randomUUID } from 'crypto';
import { Op } from 'sequelize';
import EmailOutbox from '../models/EmailOutbox.js';
import EmailDelivery from '../models/EmailDelivery.js';
import { sendEmail } from '../services/emailService.js';
import { connectToDatabase, sequelize } from '../utils/db.js';
import logger from '../utils/logger/index.js';

const WORKER_ID = process.env.EMAIL_OUTBOX_WORKER_ID ?? randomUUID();
const POLL_INTERVAL_MS = Number(
  process.env.EMAIL_OUTBOX_POLL_INTERVAL_MS ?? '2000',
);
const BATCH_SIZE = Number(process.env.EMAIL_OUTBOX_BATCH_SIZE ?? '10');
const MAX_EMAIL_RETRIES = Number(process.env.EMAIL_MAX_RETRIES ?? '3');
const BASE_RETRY_DELAY_MS = Number(
  process.env.EMAIL_RETRY_BASE_DELAY_MS ?? '2000',
);
const MAX_RETRY_DELAY_MS = Number(
  process.env.EMAIL_RETRY_MAX_DELAY_MS ?? '60000',
);

const getRetryDelayMs = (attempt: number) =>
  Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);

const formatErrorMessage = (cause: unknown) =>
  cause instanceof Error ? cause.message : 'Unknown error';

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const claimOutboxBatch = async () =>
  sequelize.transaction(async (transaction) => {
    const items = await EmailOutbox.findAll({
      where: {
        status: 'pending',
        availableAt: {
          [Op.lte]: new Date(),
        },
      },
      order: [
        ['availableAt', 'ASC'],
        ['createdAt', 'ASC'],
      ],
      limit: BATCH_SIZE,
      lock: transaction.LOCK.UPDATE,
      skipLocked: true,
      transaction,
    });

    if (items.length === 0) {
      return [];
    }

    await EmailOutbox.update(
      {
        status: 'processing',
        lockedAt: new Date(),
        lockedBy: WORKER_ID,
      },
      {
        where: {
          id: items.map((item) => item.id),
        },
        transaction,
      },
    );

    return items;
  });

const markOutboxSent = async (outboxId: string) =>
  EmailOutbox.update(
    {
      status: 'sent',
      sentAt: new Date(),
      lockedAt: null,
      lockedBy: null,
      lastError: null,
    },
    { where: { id: outboxId } },
  );

const markOutboxFailed = async (
  outboxId: string,
  attempts: number,
  errorMessage: string,
) =>
  EmailOutbox.update(
    {
      status: 'failed',
      attempts,
      lastError: errorMessage,
      lockedAt: null,
      lockedBy: null,
    },
    { where: { id: outboxId } },
  );

const scheduleOutboxRetry = async (
  outboxId: string,
  attempts: number,
  errorMessage: string,
  delayMs: number,
) =>
  EmailOutbox.update(
    {
      status: 'pending',
      attempts,
      lastError: errorMessage,
      availableAt: new Date(Date.now() + delayMs),
      lockedAt: null,
      lockedBy: null,
    },
    { where: { id: outboxId } },
  );

const upsertDeliveryStatus = async (
  dedupeKey: string,
  status: 'sending' | 'sent' | 'failed',
  values: {
    providerMessageId?: string | null;
    lastError?: string | null;
    sentAt?: Date | null;
  } = {},
) =>
  EmailDelivery.upsert({
    dedupeKey,
    status,
    providerMessageId: values.providerMessageId ?? null,
    lastError: values.lastError ?? null,
    sentAt: values.sentAt ?? null,
  });

const processOutboxItem = async (item: EmailOutbox) => {
  const payload = item.payload;
  const dedupeKey = item.dedupeKey;

  const existingDelivery = await EmailDelivery.findOne({
    where: { dedupeKey },
  });

  if (existingDelivery?.status === 'sent') {
    await markOutboxSent(item.id);
    return;
  }

  await upsertDeliveryStatus(dedupeKey, 'sending');

  try {
    const info = await sendEmail(payload);
    await upsertDeliveryStatus(dedupeKey, 'sent', {
      providerMessageId: info?.messageId ?? null,
      sentAt: new Date(),
      lastError: null,
    });
    await markOutboxSent(item.id);
  } catch (cause) {
    const errorMessage = formatErrorMessage(cause);
    const nextAttempts = item.attempts + 1;

    await upsertDeliveryStatus(dedupeKey, 'failed', {
      lastError: errorMessage,
    });

    if (nextAttempts >= MAX_EMAIL_RETRIES) {
      logger.error(
        `Email failed after ${nextAttempts} attempts: ${errorMessage}`,
      );
      await markOutboxFailed(item.id, nextAttempts, errorMessage);
      return;
    }

    const delayMs = getRetryDelayMs(item.attempts);
    logger.warn(
      `Email send failed. Retrying in ${delayMs}ms (attempt ${nextAttempts}/${MAX_EMAIL_RETRIES}).`,
    );
    await scheduleOutboxRetry(item.id, nextAttempts, errorMessage, delayMs);
  }
};

const run = async () => {
  await connectToDatabase();
  logger.info(`Email outbox worker started (${WORKER_ID}).`);

  while (true) {
    try {
      const items = await claimOutboxBatch();
      if (items.length === 0) {
        await delay(POLL_INTERVAL_MS);
        continue;
      }

      for (const item of items) {
        await processOutboxItem(item);
      }
    } catch (cause) {
      logger.error(
        `Email outbox worker error: ${formatErrorMessage(cause)}`,
      );
      await delay(POLL_INTERVAL_MS);
    }
  }
};

run().catch((cause) => {
  logger.error(
    `Email outbox worker failed to start: ${formatErrorMessage(cause)}`,
  );
  process.exit(1);
});
