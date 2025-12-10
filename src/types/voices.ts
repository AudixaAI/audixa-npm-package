/**
 * Voice-related types
 */

import type { TTSModel } from "./tts";

/**
 * Individual voice information
 */
export interface Voice {
  /**
   * Unique identifier for the voice
   */
  voice_id: string;

  /**
   * Display name of the voice
   */
  name: string;

  /**
   * Gender of the voice
   */
  gender: string;

  /**
   * Accent of the voice
   */
  accent: string;

  /**
   * Whether the voice is available for free tier users
   */
  free: boolean;

  /**
   * Description of the voice characteristics
   */
  description: string;
}

/**
 * Response from getting available voices
 */
export interface GetVoicesResponse {
  /**
   * User ID making the request
   */
  user_id: string;

  /**
   * Model for which voices are listed
   */
  model: TTSModel;

  /**
   * List of available voices
   */
  voices: Voice[];
}
