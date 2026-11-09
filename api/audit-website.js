import { handleAuditWebsiteRequest } from '../server/websiteAuditService.js';

export const config = {
  maxDuration: 25 // 25s timeout for deep site crawl
};

/**
 * SiftX Website Deep Auditor & SEO Serverless Endpoint
 * Path: /api/audit-website?url=...
 */
export default async function handler(req, res) {
  await handleAuditWebsiteRequest(req, res);
}
