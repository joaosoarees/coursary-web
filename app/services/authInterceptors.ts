import { type AxiosInstance, isAxiosError } from 'axios';

import { refreshSession } from '~/session/refreshSession';
import {
  endSession,
  getAccessToken,
  getSessionGeneration,
} from '~/session/session';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retried?: boolean;
    _session?: number;
  }
}

const bearer = (token: string | undefined) =>
  token === undefined ? undefined : `Bearer ${token}`;

export function installAuthInterceptors(client: AxiosInstance) {
  const requestId = client.interceptors.request.use((config) => {
    const authorization = bearer(getAccessToken());

    if (authorization !== undefined) {
      config.headers.set('Authorization', authorization);
    }

    config._session = getSessionGeneration();

    return config;
  });

  const responseId = client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (
        !isAxiosError(error) ||
        error.response?.status !== 401 ||
        !error.config
      ) {
        throw error;
      }

      const request = error.config;
      const sent = request.headers.get('Authorization');

      if (!sent || request._session !== getSessionGeneration()) {
        throw error;
      }

      if (request._retried) {
        endSession();
        throw error;
      }

      request._retried = true;

      if (sent === bearer(getAccessToken())) {
        await refreshSession();
      }

      return client(request);
    },
  );

  return () => {
    client.interceptors.request.eject(requestId);
    client.interceptors.response.eject(responseId);
  };
}
