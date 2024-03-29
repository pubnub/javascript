import { Status } from '../core/types/api';

export class PubNubError extends Error {
  constructor(
    message: string,
    public status?: Status,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function createError(
  errorPayload: { message: string; statusCode?: number },
  type: string,
): { message: string; type: string; error: boolean; statusCode: number } {
  errorPayload.statusCode ??= 0;

  return {
    ...errorPayload,
    statusCode: errorPayload.statusCode!,
    error: true,
    type,
  };
}

export function createValidationError(message: string, statusCode?: number) {
  return createError({ message, ...(statusCode !== undefined ? { statusCode } : {}) }, 'validationError');
}
