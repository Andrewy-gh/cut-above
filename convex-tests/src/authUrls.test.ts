import { describe, expect, it } from "vitest";

import { requireOriginUrl } from "../../convex/lib/authUrls";

describe("requireOriginUrl", () => {
  it("normalizes a configured URL down to its origin", () => {
    expect(requireOriginUrl("https://cut-above.vercel.app/", "SITE_URL")).toBe(
      "https://cut-above.vercel.app"
    );
    expect(
      requireOriginUrl(
        "https://cut-above.vercel.app/login?next=/appointments",
        "SITE_URL"
      )
    ).toBe("https://cut-above.vercel.app");
  });

  it("rejects missing values", () => {
    expect(() => requireOriginUrl("", "SITE_URL")).toThrow(
      "Missing SITE_URL for Better Auth configuration."
    );
  });

  it("rejects invalid URLs", () => {
    expect(() => requireOriginUrl("cut-above.vercel.app", "SITE_URL")).toThrow(
      "Invalid SITE_URL for Better Auth configuration: cut-above.vercel.app"
    );
  });
});
