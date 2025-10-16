export const apiConfig = {
  nominatim: {
    baseUrl: process.env.NEXT_PUBLIC_NOMINATIM_URL || 'https://nominatim.openstreetmap.org',
    rateLimit: 1000, // 1 request per second
    userAgent: 'PaperMap/1.0',
  },
  googleOAuth: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  },
} as const
