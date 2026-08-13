export class KlaviyoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KlaviyoError';
  }
}

export const KLAVIYO_APP_NAME = 'Klaviyo';

/**
 * The Klaviyo API revision this application speaks.
 *
 * Klaviyo pins behaviour to a dated revision sent in the `revision` header, and every action here
 * goes through `klaviyo-api`, which sends the revision its major was generated against and offers
 * no way to override it. The connection ping must therefore declare the same revision: a ping that
 * announces a different one tests a contract no action uses, so a connection can pass its test and
 * still fail every call.
 *
 * `klaviyo-api@23` sends `2026-07-15`. Klaviyo keeps a revision stable for a year and deprecated
 * for a second, so this one is stable until 2027-07-15 and removed on 2028-07-15.
 *
 * This value is not free to choose: a test reads the revision out of the installed SDK and fails if
 * the two disagree, which is what the split this replaces looked like.
 */
export const KLAVIYO_API_REVISION = '2026-07-15';
export const KLAVIYO_APP_LOGO =
  'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDY3LjggNDUuNCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjcuOCA0NS40OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogIC5zdDB7ZmlsbDojRkZGRkZGO30KIDwvc3R5bGU+CiA8Zz4KICA8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNjcuOCw0NS40SDBWMGg2Ny44TDUzLjYsMjIuN0w2Ny44LDQ1LjRMNjcuOCw0NS40eiI+CiAgPC9wYXRoPgogPC9nPgo8L3N2Zz4=';
