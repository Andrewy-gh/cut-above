export const parseName = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return { name: undefined, firstName: undefined, lastName: undefined };
  }
  const [firstName, ...rest] = trimmed.split(/\s+/);
  const lastName = rest.length > 0 ? rest.join(" ") : undefined;
  return { name: trimmed, firstName, lastName };
};
