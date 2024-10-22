/**
 * PubNub operation error module.
 *
 * @internal
 */

import { Status } from '../core/types/api';
import StatusCategory from '../core/constants/categories';

/**
 * PubNub operation error.
 *
 * When an operation can't be performed or there is an error from the server, this object will be returned.
 */
export class PubNubError extends Error {
  /**
   * Create PubNub operation error.
   *
   * @param message - Message with details about why operation failed.
   * @param [status] - Additional information about performed operation.
   *
   * @returns Configured and ready to use PubNub operation error.
   *
   * @internal
   */
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

/**
 * Create error status object.
 *
 * @param errorPayload - Additional information which should be attached to the error status object.
 *
 * @returns Error status object.
 *
 * @internal
 */
function createError(errorPayload: { message: string; statusCode?: number }): Status {
  errorPayload.statusCode ??= 0;

  return {
    ...errorPayload,
    statusCode: errorPayload.statusCode!,
    category: StatusCategory.PNValidationErrorCategory,
    error: true,
  };
}

/**
 * Create operation arguments validation error status object.
 *
 * @param message - Information about failed validation requirement.
 * @param [statusCode] - Operation HTTP status code.
 *
 * @returns Operation validation error status object.
 *
 * @internal
 */
export function createValidationError(message: string, statusCode?: number) {
  return createError({ message, ...(statusCode !== undefined ? { statusCode } : {}) });
}
