// import { DatabaseError } from "sequelize";
import { NotFoundError } from "../errors.js";
import { User } from "../models/index.js";
import { Result } from "better-result";
import { tryDb } from "../utils/dbResult.js";

export const findById = async (id: string) =>
  await tryDb({
    try: () => User.findByPk(id),
    message: "Failed to fetch user from database",
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
