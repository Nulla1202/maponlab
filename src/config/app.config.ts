export const appConfig = {
  name: 'PaperMap',
  version: '1.0.0',
  description: '論文から「知の地図」を描く',
  maxUploadSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ['application/pdf'],
} as const
