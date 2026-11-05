import type { IncomingMessage, ServerResponse } from 'http';

export function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate?: number,
  numChannels?: number,
  bitDepth?: number
): Buffer;

export function handleTtsRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: Record<string, string | undefined>
): Promise<void>;

export function handleSttRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: Record<string, string | undefined>
): Promise<void>;
