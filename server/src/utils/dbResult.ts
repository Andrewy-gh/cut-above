import { Result } from "better-result";
import { DatabaseError } from "../errors.js";

type TryDbOptions<T> = {
  try: () => Promise<T>;
  message: string;
  statusCode?: number;
};

export const tryDb = <T>({
  try: tryFn,
  message,
  statusCode = 500,
}: TryDbOptions<T>) =>
  Result.tryPromise({
    try: tryFn,
    catch: (cause: unknown) =>
      new DatabaseError({
        statusCode,
        message,
        cause,
      }),
  });
