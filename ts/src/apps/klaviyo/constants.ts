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
 * goes through `klaviyo-api@19.0.2`, which sends `2025-07-15` and offers no way to override it. The
 * connection ping must therefore declare the same revision: a ping that announces a different one
 * tests a contract no action uses, so a connection can pass its test and still fail every call.
 *
 * This is **not** the current revision — Klaviyo keeps a revision stable for a year, deprecated for
 * a second, then removes it, which puts `2025-07-15` out on 2027-07-15. Reaching the current
 * revision means bumping the SDK four majors (19 to 23), which is a migration rather than a
 * version-string edit and is tracked separately.
 */
export const KLAVIYO_API_REVISION = '2025-07-15';
export const KLAVIYO_APP_LOGO =
  'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDY3LjggNDUuNCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjcuOCA0NS40OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogIC5zdDB7ZmlsbDojRkZGRkZGO30KIDwvc3R5bGU+CiA8Zz4KICA8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNjcuOCw0NS40SDBWMGg2Ny44TDUzLjYsMjIuN0w2Ny44LDQ1LjRMNjcuOCw0NS40eiI+CiAgPC9wYXRoPgogPC9nPgo8L3N2Zz4=';
