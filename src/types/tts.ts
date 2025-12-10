/**
 * Text-to-Speech related types
 */

/**
 * Available TTS models
 */
export type TTSModel = "base" | "advance";

/**
 * Available emotions for the advance model
 */
export type TTSEmotion = "neutral" | "happy" | "sad" | "angry" | "surprised";

/**
 * Request payload for starting a TTS generation
 */
export interface StartTTSRequest {
  /**
   * Text to convert to speech
   * @minLength 30
   */
  text: string;

  /**
   * Voice ID to use for generation
   */
  voice: string;

  /**
   * Model to use for generation
   * @default "base"
   */
  model?: TTSModel;

  /**
   * Speech speed multiplier
   * @minimum 0.5
   * @maximum 2.0
   * @default 1.0
   */
  speed?: number;

  /**
   * Emotion for the voice (advance model only)
   */
  emotion?: TTSEmotion;

  /**
   * Temperature for generation (advance model only)
   * @minimum 0.7
   * @maximum 0.9
   */
  temperature?: number;

  /**
   * Top-p sampling parameter (advance model only)
   * @minimum 0.7
   * @maximum 0.98
   */
  top_p?: number;

  /**
   * Whether to use sampling (advance model only)
   */
  do_sample?: boolean;
}

/**
 * Response from starting a TTS generation
 */
export interface StartTTSResponse {
  /**
   * Unique identifier for the generation job
   */
  generation_id: string;
}

/**
 * Status values for TTS generation
 */
export type TTSStatus = "Generating" | "Completed" | "Failed";

/**
 * Response from checking TTS job status
 */
export interface TTSStatusResponse {
  /**
   * Current status of the generation
   */
  status: TTSStatus;

  /**
   * URL to the generated audio file (available when status is "Completed")
   */
  url: string | null;

  /**
   * Generation ID
   */
  generation_id?: string;

  /**
   * Additional metadata about the generation
   */
  [key: string]: unknown;
}
