import { join } from 'path'

export const isDev = process.env.NODE_ENV === 'development'
export const APP_ROOT = join(__dirname, '..')
