/**
 * Audixa SDK - Official Node.js + TypeScript SDK for Audixa Text-to-Speech API
 *
 * @packageDocumentation
 */

import { HttpClient } from "./client";
import type { AudixaOptions } from "./types/common";
import type {
  StartTTSRequest,
  StartTTSResponse,
  TTSStatusResponse,
  TTSModel,
} from "./types/tts";
import type { GetVoicesResponse } from "./types/voices";

// Re-export types for consumers
export type { AudixaOptions } from "./types/common";

export type {
  StartTTSRequest,
  StartTTSResponse,
  TTSStatusResponse,
  TTSModel,
  TTSEmotion,
  TTSStatus,
} from "./types/tts";
export type { GetVoicesResponse, Voice } from "./types/voices";
export type { RequestConfig, APIErrorResponse } from "./types/common";
export { AudixaError } from "./errors";
export type { AudixaErrorCode } from "./errors";

/**
 * Options for individual API calls
 */
export interface RequestOptions {
  /**
   * AbortSignal for request cancellation
   */
  signal?: AbortSignal;
}

/**
 * Audixa SDK Client
 *
 * The main class for interacting with the Audixa Text-to-Speech API.
 *
 * @example
 * ```typescript
 * import Audixa from 'audixa';
 *
 * const audixa = new Audixa('your-api-key');
 *
 * // Start a TTS generation
 * const { generation_id } = await audixa.startTTS({
 *   text: 'Hello, this is a test of the Audixa text-to-speech API.',
 *   voice: 'en-US-female-1',
 *   model: 'base'
 * });
 *
 * // Poll for status
 * const status = await audixa.getStatus(generation_id);
 * console.log(status.audio_url);
 * ```
 */
export class Audixa {
  private readonly client: HttpClient;

  /**
   * Creates a new Audixa SDK instance
   *
   * @param apiKey - Your Audixa API key
   * @param options - Optional configuration options
   *
   * @example
   * ```typescript
   * // Basic usage
   * const audixa = new Audixa('your-api-key');
   *
   * // With custom options
   * const audixa = new Audixa('your-api-key', {
   *   baseUrl: 'https://custom-api.audixa.ai/v2',
   *   timeout: 60000
   * });
   * ```
   */
  constructor(apiKey: string, options?: AudixaOptions) {
    this.client = new HttpClient(apiKey, options);
  }

  /**
   * Start a new text-to-speech generation
   *
   * Creates a new TTS task and returns a generation ID.
   * Use {@link getStatus} to poll for the result.
   *
   * @param payload - TTS generation parameters
   * @param options - Request options (e.g., AbortSignal for cancellation)
   * @returns Promise resolving to the generation ID
   * @throws {AudixaError} When the request fails
   *
   * @example
   * ```typescript
   * // Basic TTS generation
   * const result = await audixa.startTTS({
   *   text: 'Hello world, this is a test of text-to-speech.',
   *   voice: 'en-US-female-1'
   * });
   *
   * // With advanced options
   * const result = await audixa.startTTS({
   *   text: 'Hello world, this is a test with advanced options.',
   *   voice: 'en-US-female-1',
   *   model: 'advance',
   *   speed: 1.2,
   *   emotion: 'happy',
   *   temperature: 0.8
   * });
   * ```
   */
  async startTTS(
    payload: StartTTSRequest,
    options?: RequestOptions
  ): Promise<StartTTSResponse> {
    return this.client.request<StartTTSResponse>({
      method: "POST",
      path: "/tts",
      body: payload as unknown as Record<string, unknown>,
      signal: options?.signal,
    });
  }

  /**
   * Get the status of a TTS generation
   *
   * Poll this endpoint to check if your TTS generation is complete.
   * When status is "Completed", the url will contain the generated audio.
   *
   * @param generationId - The generation ID returned by {@link startTTS}
   * @param options - Request options (e.g., AbortSignal for cancellation)
   * @returns Promise resolving to the generation status
   * @throws {AudixaError} When the request fails
   *
   * @example
   * ```typescript
   * // Simple status check
   * const status = await audixa.getStatus('gen-123');
   *
   * if (status.status === 'Completed') {
   *   console.log('Audio URL:', status.url);
   * }
   *
   * // Polling pattern
   * async function waitForCompletion(generationId: string): Promise<string> {
   *   while (true) {
   *     const status = await audixa.getStatus(generationId);
   *
   *     if (status.status === 'Completed') {
   *       return status.url!;
   *     }
   *
   *     if (status.status === 'Failed') {
   *       throw new Error('Generation failed');
   *     }
   *
   *     await new Promise(resolve => setTimeout(resolve, 1000));
   *   }
   * }
   * ```
   */
  async getStatus(
    generationId: string,
    options?: RequestOptions
  ): Promise<TTSStatusResponse> {
    return this.client.request<TTSStatusResponse>({
      method: "GET",
      path: "/status",
      params: { generation_id: generationId },
      signal: options?.signal,
    });
  }

  /**
   * Get available voices for a model
   *
   * Returns a list of all available voices for the specified model.
   *
   * @param model - The model to get voices for ("base" or "advance")
   * @param options - Request options (e.g., AbortSignal for cancellation)
   * @returns Promise resolving to the list of voices
   * @throws {AudixaError} When the request fails
   *
   * @example
   * ```typescript
   * // Get base model voices
   * const { voices } = await audixa.getVoices('base');
   *
   * // Filter by gender
   * const femaleVoices = voices.filter(v => v.gender === 'female');
   *
   * // Get free voices only
   * const freeVoices = voices.filter(v => v.free);
   *
   * console.log('Available voices:', voices.map(v => v.name));
   * ```
   */
  async getVoices(
    model: TTSModel,
    options?: RequestOptions
  ): Promise<GetVoicesResponse> {
    return this.client.request<GetVoicesResponse>({
      method: "GET",
      path: "/voices",
      params: { model },
      signal: options?.signal,
    });
  }

  /**
   * Convenience method to generate TTS and wait for completion
   *
   * Combines {@link startTTS} and {@link getStatus} into a single call
   * that returns the audio URL when complete.
   *
   * @param payload - TTS generation parameters
   * @param options - Request options with optional polling configuration
   * @returns Promise resolving to the audio URL
   * @throws {AudixaError} When the request fails or generation fails
   *
   * @example
   * ```typescript
   * const audioUrl = await audixa.generateTTS({
   *   text: 'Hello world, this is a complete TTS generation.',
   *   voice: 'en-US-female-1'
   * }, {
   *   pollInterval: 1000,  // Check every second
   *   maxWaitTime: 60000   // Wait up to 60 seconds
   * });
   *
   * console.log('Audio URL:', audioUrl);
   * ```
   */
  async generateTTS(
    payload: StartTTSRequest,
    options?: RequestOptions & {
      /**
       * Polling interval in milliseconds
       * @default 1000
       */
      pollInterval?: number;
      /**
       * Maximum wait time in milliseconds
       * @default 120000
       */
      maxWaitTime?: number;
    }
  ): Promise<string> {
    const { pollInterval = 1000, maxWaitTime = 120000, signal } = options || {};

    // Start the generation
    const { generation_id } = await this.startTTS(payload, { signal });

    const startTime = Date.now();

    // Poll for completion
    while (true) {
      // Check if we've exceeded max wait time
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error(
          `Generation timed out after ${maxWaitTime}ms`
        );
      }

      // Check if cancelled
      if (signal?.aborted) {
        throw new Error("Generation was cancelled");
      }

      const status = await this.getStatus(generation_id, { signal });

      if (status.status === "Completed" && status.url) {
        return status.url;
      }

      if (status.status === "Failed") {
        throw new Error("TTS generation failed");
      }

      // Wait before polling again
      await new Promise<void>((resolve) => setTimeout(resolve, pollInterval));
    }
  }
}

// Default export
export default Audixa;
