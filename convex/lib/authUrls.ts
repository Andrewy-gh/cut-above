const missingEnvError = (name: string) =>
  new Error(`Missing ${name} for Better Auth configuration.`);

export const requireOriginUrl = (value: string, name: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw missingEnvError(name);
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    throw new Error(`Invalid ${name} for Better Auth configuration: ${trimmed}`);
  }
};
