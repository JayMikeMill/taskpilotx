import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { InMemoryCache, createHttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

import { routes } from './app.routes';

// Use environment or default to localhost for stability
const getBackendUrl = () => {
  // Check if we're running on network interface
  const isNetworkMode =
    window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  return isNetworkMode
    ? `http://${window.location.hostname}:8000/api/graphql/`
    : 'http://localhost:8000/api/graphql/';
};

const uri = getBackendUrl();

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideApollo(() => {
      const httpLink = createHttpLink({
        uri,
      });

      const authLink = setContext((_, { headers }) => {
        const token = localStorage.getItem('access_token');
        return {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
          },
        };
      });

      return {
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: {
            errorPolicy: 'all',
          },
        },
      };
    }),
  ],
};
