import { hc } from 'hono/client'
import type { AppType } from '@raspberry-display/api/types'

export const apiClient = hc<AppType>('http://localhost:5173');