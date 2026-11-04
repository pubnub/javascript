export function redact(text: string, env?: Record<string, string | undefined>): string;
export function addSecrets(values: Array<string | undefined>): void;
export function installRedaction(): void;
/** Literal secrets known to the redaction. Only for the reporter self-test, which checks output against them. Never print. */
export function knownSecrets(env?: Record<string, string | undefined>): string[];
