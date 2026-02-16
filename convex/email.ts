import { ConvexError, v } from "convex/values";

import { mutation } from "./_generated/server";
import { enqueueEmail } from "./lib/emailOutbox";

const contactDetailsSchema = v.object({
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
  message: v.string(),
});

const getEmailUser = () =>
  process.env.EMAIL_USER ?? process.env.DEV_EMAIL_USER ?? "";

const getDeliveryMode = () =>
  (process.env.EMAIL_DELIVERY_MODE ?? "smtp").toLowerCase().trim();

const cleanContactDetails = (contactDetails: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}) => ({
  firstName: contactDetails.firstName.trim(),
  lastName: contactDetails.lastName.trim(),
  email: contactDetails.email.trim().toLowerCase(),
  message: contactDetails.message.trim(),
});

export const sendMessage = mutation({
  args: {
    contactDetails: contactDetailsSchema,
  },
  handler: async (ctx, args) => {
    const emailUser = getEmailUser();
    const loggingOnlyMode = getDeliveryMode() === "log";

    if (!emailUser && !loggingOnlyMode) {
      throw new ConvexError("EMAIL_USER must be defined to send messages");
    }

    const contactDetails = cleanContactDetails(args.contactDetails);

    await enqueueEmail(ctx, {
      payload: {
        receiver: contactDetails.email,
        option: "message auto reply",
        contactDetails,
      },
      eventType: "contact.auto_reply",
    });

    if (emailUser) {
      await enqueueEmail(ctx, {
        payload: {
          receiver: emailUser,
          option: "message submission",
          contactDetails,
        },
        eventType: "contact.submission",
      });
    }

    return {
      success: true,
      message: loggingOnlyMode
        ? "Message received. Email notifications are temporarily disabled."
        : "Message sent",
    };
  },
});
