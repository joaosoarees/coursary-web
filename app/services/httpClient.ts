import axios from 'axios';

import { env } from '~/lib/env';

// The API in the deployed build; in development, the Vite proxy in front of it.
export const baseURL = env.DEV ? '/api' : env.VITE_API_URL;

// Only a separate host is worth a preconnect; the development proxy shares the page's origin.
export const apiOrigin: string | undefined = baseURL.startsWith('http')
  ? new URL(baseURL).origin
  : undefined;

export const httpClient = axios.create({ baseURL, withCredentials: true });
