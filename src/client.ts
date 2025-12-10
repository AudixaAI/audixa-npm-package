/**
 * HTTP client for making API requests
 */

import type { RequestConfig, AudixaOptions } from "./types/common";
import { AudixaError } from "./errors";

/**
 * Default API base URL
 */
const DEFAULT_BASE_URL = "https://api.audixa.ai/v2";

/**
 * Default request timeout in milliseconds
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Internal HTTP client for the Audixa SDK
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly apiKey: string;

  /**
   * Creates a new HTTP client instance
   */
  constructor(apiKey: string, options?: AudixaOptions) {
    if (!apiKey || typeof apiKey !== "string") {
      throw new AudixaError(
        "API key is required and must be a string",
        "INVALID_PARAMS"
      );
    }

    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl || DEFAULT_BASE_URL;
    this.timeout = options?.timeout || DEFAULT_TIMEOUT;
  }

  /**
   * Makes an HTTP request to the Audixa API
   *
   * @param config - Request configuration
   * @returns Parsed JSON response
   * @throws AudixaError on failure
   */
  async request<T>(config: RequestConfig): Promise<T> {
    const { method, path, body, params, signal } = config;

    // Build URL with query parameters - safely join base URL and path
    const baseWithoutTrailingSlash = this.baseUrl.replace(/\/+$/, "");
    const pathWithoutLeadingSlash = path.replace(/^\/+/, "");
    const url = new URL(`${baseWithoutTrailingSlash}/${pathWithoutLeadingSlash}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    // Combine user signal with timeout signal
    const combinedSignal = signal
      ? this.combineSignals(signal, controller.signal)
      : controller.signal;

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      // Parse response body
      let responseData: unknown;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        throw AudixaError.fromResponse(
          response.status,
          responseData as Record<string, unknown>
        );
      }

      return responseData as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle known error types
      if (error instanceof AudixaError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          // Check if it was our timeout or user cancellation
          if (signal?.aborted) {
            throw new AudixaError("Request was cancelled", "UNKNOWN");
          }
          throw AudixaError.timeout();
        }

        throw AudixaError.networkError(error);
      }

      throw new AudixaError("An unknown error occurred", "UNKNOWN");
    }
  }

  /**
   * Combines multiple AbortSignals into one
   */
  private combineSignals(
    userSignal: AbortSignal,
    timeoutSignal: AbortSignal
  ): AbortSignal {
    const controller = new AbortController();

    const abortHandler = () => controller.abort();

    userSignal.addEventListener("abort", abortHandler);
    timeoutSignal.addEventListener("abort", abortHandler);

    return controller.signal;
  }
}
