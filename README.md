# Audixa

> Official Node.js + TypeScript SDK for the [Audixa](https://audixa.ai) Text-to-Speech API

[![npm version](https://img.shields.io/npm/v/audixa.svg)](https://www.npmjs.com/package/audixa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## What is Audixa?

Audixa is a powerful AI-powered text-to-speech platform that generates natural, human-like voices. This SDK provides a simple, type-safe way to integrate Audixa's TTS capabilities into your Node.js applications.

**Features:**
- 🎯 Full TypeScript support with complete type definitions
- 🔄 Dual module support (ESM + CommonJS)
- 🛡️ Robust error handling with custom error classes
- ⏱️ Configurable timeouts and request cancellation
- 📚 Comprehensive JSDoc documentation for IDE auto-completion

## Installation

```bash
npm install audixa
```

or with yarn:

```bash
yarn add audixa
```

or with pnpm:

```bash
pnpm add audixa
```

## Quick Start

### TypeScript

```typescript
import Audixa from 'audixa';

const audixa = new Audixa('your-api-key');

// Generate TTS and wait for completion
const audioUrl = await audixa.generateTTS({
  text: 'Hello! This is a test of the Audixa text-to-speech API.',
  voice: 'en-US-female-1',
  model: 'base'
});

console.log('Audio URL:', audioUrl);
```

### JavaScript (CommonJS)

```javascript
const { Audixa } = require('audixa');

const audixa = new Audixa('your-api-key');

// Generate TTS and wait for completion
audixa.generateTTS({
  text: 'Hello! This is a test of the Audixa text-to-speech API.',
  voice: 'en-US-female-1',
  model: 'base'
}).then(audioUrl => {
  console.log('Audio URL:', audioUrl);
});
```

### JavaScript (ESM)

```javascript
import Audixa from 'audixa';

const audixa = new Audixa('your-api-key');

const audioUrl = await audixa.generateTTS({
  text: 'Hello! This is a test of the Audixa text-to-speech API.',
  voice: 'en-US-female-1'
});

console.log('Audio URL:', audioUrl);
```

## Configuration

```typescript
import Audixa from 'audixa';

const audixa = new Audixa('your-api-key', {
  baseUrl: 'https://api.audixa.ai/v2', // Custom API base URL (optional)
  timeout: 30000                         // Request timeout in ms (default: 30000)
});
```

## API Reference

### Start TTS Generation

Creates a new text-to-speech task and returns a generation ID.

```typescript
const { generation_id } = await audixa.startTTS({
  // Required parameters
  text: 'Your text here (minimum 30 characters)',
  voice: 'en-US-female-1',

  // Optional parameters
  model: 'base',        // 'base' or 'advance'
  speed: 1.0,           // 0.5 to 2.0

  // Advance model only
  emotion: 'happy',     // 'neutral', 'happy', 'sad', 'angry', 'surprised'
  temperature: 0.8,     // 0.7 to 0.9
  top_p: 0.9,           // 0.7 to 0.98
  do_sample: true
});

console.log('Generation ID:', generation_id);
```

### Poll TTS Status

Check the status of a TTS generation job.

```typescript
const status = await audixa.getStatus(generation_id);

console.log('Status:', status.status);      // 'Generating', 'Completed', or 'Failed'
console.log('Audio URL:', status.audio_url); // Available when status is 'Completed'
```

### Complete Polling Example

```typescript
async function generateAndWait(text: string, voice: string): Promise<string> {
  // Start generation
  const { generation_id } = await audixa.startTTS({ text, voice });

  // Poll until complete
  while (true) {
    const status = await audixa.getStatus(generation_id);

    if (status.status === 'Completed') {
      return status.audio_url!;
    }

    if (status.status === 'Failed') {
      throw new Error('TTS generation failed');
    }

    // Wait 1 second before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

Or use the convenience method:

```typescript
const audioUrl = await audixa.generateTTS(
  { text: 'Your text here', voice: 'en-US-female-1' },
  { pollInterval: 1000, maxWaitTime: 60000 }
);
```

### Get Available Voices

Retrieve the list of available voices for a specific model.

```typescript
const { voices } = await audixa.getVoices('base');

for (const voice of voices) {
  console.log(`${voice.name} (${voice.voice_id})`);
  console.log(`  Gender: ${voice.gender}`);
  console.log(`  Accent: ${voice.accent}`);
  console.log(`  Free: ${voice.free}`);
  console.log(`  Description: ${voice.description}`);
}
```

## Error Handling

The SDK provides a custom `AudixaError` class for comprehensive error handling:

```typescript
import Audixa, { AudixaError } from 'audixa';

const audixa = new Audixa('your-api-key');

try {
  const result = await audixa.startTTS({
    text: 'Hello world',
    voice: 'en-US-female-1'
  });
} catch (error) {
  if (error instanceof AudixaError) {
    console.log('Error code:', error.code);
    console.log('HTTP status:', error.status);
    console.log('Message:', error.message);

    switch (error.code) {
      case 'INVALID_API_KEY':
        console.log('Please check your API key');
        break;
      case 'INSUFFICIENT_CREDITS':
        console.log('Please add more credits to your account');
        break;
      case 'INVALID_PARAMS':
        console.log('Please check your request parameters');
        break;
      case 'FORBIDDEN':
        console.log('You do not have access to this voice');
        break;
      case 'TIMEOUT':
        console.log('The request timed out');
        break;
      case 'NETWORK_ERROR':
        console.log('Network error occurred');
        break;
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_PARAMS` | 400 | Invalid request parameters |
| `INVALID_API_KEY` | 401 | Invalid or missing API key |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits in account |
| `FORBIDDEN` | 403 | Access denied to resource |
| `NOT_FOUND` | 404 | Resource not found |
| `TIMEOUT` | - | Request timed out |
| `NETWORK_ERROR` | - | Network connectivity issue |

## Request Cancellation

All methods support cancellation via `AbortController`:

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const result = await audixa.startTTS(
    { text: 'Hello world', voice: 'en-US-female-1' },
    { signal: controller.signal }
  );
} catch (error) {
  if (error instanceof AudixaError && error.code === 'TIMEOUT') {
    console.log('Request was cancelled');
  }
}
```

## TypeScript Types

All types are exported for use in your TypeScript projects:

```typescript
import Audixa, {
  // Options
  AudixaOptions,
  RequestOptions,

  // TTS types
  StartTTSRequest,
  StartTTSResponse,
  TTSStatusResponse,
  TTSModel,
  TTSEmotion,
  TTSStatus,

  // Voice types
  GetVoicesResponse,
  Voice,

  // Error types
  AudixaError,
  AudixaErrorCode
} from 'audixa';
```

### Type Definitions

```typescript
// TTS Request
interface StartTTSRequest {
  text: string;            // Required, min 30 chars
  voice: string;           // Required
  model?: 'base' | 'advance';
  speed?: number;          // 0.5 - 2.0

  // Advance model only
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';
  temperature?: number;    // 0.7 - 0.9
  top_p?: number;          // 0.7 - 0.98
  do_sample?: boolean;
}

// TTS Status Response
interface TTSStatusResponse {
  status: 'Generating' | 'Completed' | 'Failed';
  audio_url: string | null;
  generation_id?: string;
}

// Voice
interface Voice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  free: boolean;
  description: string;
}
```

## Full API Documentation

For complete API documentation, visit: [https://docs.audixa.ai](https://docs.audixa.ai)

## License

MIT © [anurag-pro](https://github.com/anurag-pro)

## Links

- [Audixa Website](https://audixa.ai)
- [Audixa Dashboard](https://audixa.ai/dashboard)
- [API Documentation](https://docs.audixa.ai)
- [GitHub Repository](https://github.com/AudixaAI/audixa-npm-sdk)
- [npm Package](https://www.npmjs.com/package/audixa)
# audixa-npm-package
