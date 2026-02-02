import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { parseName } from "./lib/names";

const getFirstName = (user: Doc<"users">) => {
  const parsed = parseName(user.name);
  return user.firstName ?? parsed.firstName ?? "User";
};

export const getEmployees = query({
  args: {},
  handler: async (ctx) => {
    const employees = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "employee"))
      .collect();

    return employees.map((employee) => ({
      id: employee.id,
      firstName: getFirstName(employee),
    }));
  },
});

export const getEmployeeProfiles = query({
  args: {},
  handler: async (ctx) => {
    const employees = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "employee"))
      .collect();

    return employees.map((employee) => ({
      id: employee.id,
      firstName: getFirstName(employee),
      image: employee.image ?? "",
      profile: employee.profile ?? "",
    }));
  },
});
