/**
 * Custom error class for Audixa API errors
 */

import type { APIErrorResponse } from "./types/common";

/**
 * Error codes for Audixa API errors
 */
export type AudixaErrorCode =
  | "INVALID_PARAMS"
  | "INVALID_API_KEY"
  | "INSUFFICIENT_CREDITS"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

/**
 * Maps HTTP status codes to error codes
 */
function getErrorCodeFromStatus(status: number): AudixaErrorCode {
  switch (status) {
    case 400:
      return "INVALID_PARAMS";
    case 401:
      return "INVALID_API_KEY";
    case 402:
      return "INSUFFICIENT_CREDITS";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    default:
      return "UNKNOWN";
  }
}

/**
 * Custom error class for all Audixa SDK errors
 *
 * @example
 * ```typescript
 * try {
 *   await audixa.startTTS({ text: "Hello", voice: "test" });
 * } catch (error) {
 *   if (error instanceof AudixaError) {
 *     console.log(error.code); // e.g., "INVALID_API_KEY"
 *     console.log(error.status); // e.g., 401
 *   }
 * }
 * ```
 */
export class AudixaError extends Error {
  /**
   * Error code for programmatic error handling
   */
  public readonly code: AudixaErrorCode;

  /**
   * HTTP status code (if applicable)
   */
  public readonly status?: number;

  /**
   * Original response data from the API
   */
  public readonly response?: APIErrorResponse;

  /**
   * Creates a new AudixaError instance
   */
  constructor(
    message: string,
    code: AudixaErrorCode,
    status?: number,
    response?: APIErrorResponse
  ) {
    super(message);
    this.name = "AudixaError";
    this.code = code;
    this.status = status;
    this.response = response;

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, AudixaError.prototype);
  }

  /**
   * Creates an AudixaError from an HTTP response
   */
  static fromResponse(
    status: number,
    response?: APIErrorResponse
  ): AudixaError {
    const code = getErrorCodeFromStatus(status);
    const message =
      response?.message ||
      response?.error ||
      `Request failed with status ${status}`;
    return new AudixaError(message, code, status, response);
  }

  /**
   * Creates an AudixaError for network failures
   */
  static networkError(originalError: Error): AudixaError {
    return new AudixaError(
      `Network error: ${originalError.message}`,
      "NETWORK_ERROR"
    );
  }

  /**
   * Creates an AudixaError for timeout
   */
  static timeout(): AudixaError {
    return new AudixaError("Request timed out", "TIMEOUT");
  }
}
