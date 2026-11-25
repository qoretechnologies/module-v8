// Copyright 2026 Qore Technologies, s.r.o.
import { parse } from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import { requestShopifyTestToken } from './shopify-test-token';

/**
 * Runs once before the suites of a jest run. What it sets in the environment reaches every suite:
 * jest starts its workers after this function has returned.
 */
export default async function globalSetup(): Promise<void> {
  // A local run keeps the suites' credentials in .env, which every live suite loads itself. This
  // runs before any of them, so it reads the file too; a variable that is set wins over the file,
  // as it does in the suites. The file's values are not put into the environment here.
  const fromFile = existsSync('.env') ? parse(readFileSync('.env')) : {};
  const token = await requestShopifyTestToken(
    { ...fromFile, ...process.env },
    { fetch, output: (line) => console.log(line) }
  );
  if (token) {
    process.env.SHOPIFY_ACCESS_TOKEN = token;
  }
}
