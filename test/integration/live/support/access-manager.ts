/** Parsed tokens list every permission flag. The docs show the granted ones, so compare only those. */
export const granted = (permissions: object | undefined): Record<string, boolean> =>
  Object.fromEntries(Object.entries(permissions ?? {}).filter(([, value]) => value === true));
