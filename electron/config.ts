import { join } from 'path'

export const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
export const APP_ROOT = join(__dirname, '..')
