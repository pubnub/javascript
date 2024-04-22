import { Status } from '../core/types/api';
import StatusCategory from '../core/constants/categories';

export class PubNubError extends Error {
  constructor(
    message: string,
    public status?: Status,
  ) {
    super(message);
    this.name = 'PubNubError';
    this.message = message;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function createError(errorPayload: { message: string; statusCode?: number }): Status {
  errorPayload.statusCode ??= 0;

  return {
    ...errorPayload,
    statusCode: errorPayload.statusCode!,
    category: StatusCategory.PNValidationErrorCategory,
    error: true,
  };
}

export function createValidationError(message: string, statusCode?: number) {
  return createError({ message, ...(statusCode !== undefined ? { statusCode } : {}) });
}
