// Copyright 2026 Qore Technologies, s.r.o.
import { setShopifyTestToken } from './shopify-test-token';

/**
 * Runs once before the suites of a jest run. What it sets in the environment reaches every suite:
 * jest starts its workers after this function has returned.
 */
export default async function globalSetup(): Promise<void> {
  await setShopifyTestToken(process.env, { fetch, output: (line) => console.log(line) });
}
