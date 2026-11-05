import type { IncomingMessage, ServerResponse } from 'http';

export function handleExportVideoRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void>;
