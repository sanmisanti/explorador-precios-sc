export const config = {
    isDev: process.env.NODE_ENV === 'development',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    database: {
        url: process.env.DATABASE_URL
    }
}