import type { IncomingMessage, ServerResponse } from 'http';

export function handleAuditWebsiteRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void>;
