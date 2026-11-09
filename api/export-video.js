import { handleExportVideoRequest } from '../server/videoService.js';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb'
  },
  maxDuration: 60
};

/**
 * SiftX Video Subtitle Burn & Export Serverless Endpoint
 * Path: /api/export-video
 */
export default async function handler(req, res) {
  await handleExportVideoRequest(req, res);
}
