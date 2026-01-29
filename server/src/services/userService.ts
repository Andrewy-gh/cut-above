// import { DatabaseError } from "sequelize";
import { DatabaseError, NotFoundError } from "../errors.js";
import { User } from "../models/index.js";
import { Result } from "better-result";

export const findById = async (id: string) =>
  await Result.tryPromise({
    try: () => User.findByPk(id),
    catch: (cause) =>
      new DatabaseError({
        statusCode: 500,
        message: "Failed to fetch user from database",
        cause,
      }),
  });

export const findByIdOrNotFound = async (id: string) => {
  const userResult = await findById(id);
  return userResult.andThen((user) =>
    user
      ? Result.ok(user)
      : Result.err(
          new NotFoundError({ statusCode: 404, message: "User not found" }),
        ),
  );
};
