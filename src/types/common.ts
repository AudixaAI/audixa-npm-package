/**
 * Common types shared across the Audixa SDK
 */

/**
 * Configuration options for the Audixa client
 */
export interface AudixaOptions {
  /**
   * Custom base URL for the API
   * @default "https://api.audixa.ai/v2"
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
}

/**
 * HTTP request configuration
 */
export interface RequestConfig {
  /** HTTP method */
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  /** Request path (relative to base URL) */
  path: string;
  /** Request body for POST/PUT/PATCH */
  body?: Record<string, unknown>;
  /** Query parameters */
  params?: Record<string, string>;
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
}

/**
 * Standard API error response structure
 */
export interface APIErrorResponse {
  /** Error message */
  message?: string;
  /** Error code */
  error?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}
