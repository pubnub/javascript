/**
 * Extracts an union of values from an `O` object type.
 */
export type Values<E, O extends { [key: string]: E }> = O[keyof O]

/**
 * Creates a map of `T`.
 */
export type MapOf<T> = { [key: string]: T }
