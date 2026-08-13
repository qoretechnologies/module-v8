import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import * as helpscoutConstants from '../apps/helpscout/constants';
import azureDevOpsApp from '../apps/azure-devops';
import { AZURE_DEVOPS_API_VERSION } from '../apps/azure-devops/constants';
import esignatureApp from '../apps/esignature';
import { GOOGLE_ADS_API_VERSION } from '../apps/google-ads/constants';
import { ESIGNATURE_CONN_OPTIONS } from '../apps/esignature/conn-options';
import facebookPagesApp from '../apps/facebook-pages';
import { FACEBOOK_PAGES_API_VERSION } from '../apps/facebook-pages/constants';
import notionApp from '../apps/notion';
import { NOTION_API_VERSION } from '../apps/notion/helpers/constants';
import shopifyApp from '../apps/shopify';
import { SHOPIFY_API_VERSION } from '../apps/shopify/constants';

/**
 * Guards the vendor API versions and versioned endpoints applications pin themselves to.
 *
 * Every case here exists because the pin drifted once: either an application declared a version in
 * one place and used a different one elsewhere, or it named an endpoint the vendor has since
 * scheduled for removal. These assertions are cheap and they fail loudly at the point a pin is
 * edited, which is the only moment anyone is thinking about it.
 */

/**
 * A connection ping that announces a different version than the actions use tests a contract
 * nothing else exercises: the connection reports healthy and every action still fails. Each of
 * these three had drifted that way, so the pings are asserted against the pin rather than against
 * a literal — a copy of the version string here would be free to drift in exactly the same way.
 */
describe('connection pings ride the same API version as the actions', () => {
  it('pings Shopify on the pinned Admin API version', () => {
    const app = shopifyApp('en' as any);

    expect(app.rest.ping_path).toBe(`/admin/api/${SHOPIFY_API_VERSION}/shop.json`);
  });

  it('pings Notion with the version its client sends', () => {
    const app = notionApp('en' as any);

    expect(app.rest.ping_headers['Notion-Version']).toBe(NOTION_API_VERSION);
  });

});

describe('Facebook Pages Graph API version', () => {
  it('addresses the same Graph API version from REST as the SDK speaks', () => {
    const app = facebookPagesApp('en' as any);
    // the SDK's major tracks the Graph API version, so the installed major is the pin
    const sdkMajor = require('facebook-nodejs-business-sdk/package.json').version.split('.')[0];

    expect(FACEBOOK_PAGES_API_VERSION).toBe(`v${sdkMajor}.0`);
    expect(app.rest.url).toBe(`https://graph.facebook.com/${FACEBOOK_PAGES_API_VERSION}`);
  });
});

describe('Azure DevOps API revisions', () => {
  const APP_DIR = join(__dirname, '..', 'apps', 'azure-devops');

  /** every `.ts` under the app, with the file that owns the revisions excluded */
  const sourceFiles = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);

      if (entry.isDirectory()) {
        return sourceFiles(path);
      }

      return entry.isFile() && entry.name.endsWith('.ts') && path !== join(APP_DIR, 'constants.ts')
        ? [path]
        : [];
    });

  it('pings on the released revision', () => {
    const app = azureDevOpsApp('en' as any);

    expect(app.rest.ping_path).toBe(
      `/_apis/profile/profiles/me?api-version=${AZURE_DEVOPS_API_VERSION}`
    );
  });

  it('carries no api-version literal outside the file that owns them', () => {
    // the Graph and Service Hooks test-notification families are preview-only by Microsoft's
    // choice and cannot be eliminated, so the containment is that a revision bump is one edit —
    // this fails the moment a literal is reintroduced at a call site
    const offenders = sourceFiles(APP_DIR).filter((path) =>
      /api-version['"]?\s*[:=]\s*['"`]?\d+\.\d+/.test(readFileSync(path, 'utf8'))
    );

    expect(offenders).toEqual([]);
  });
});

describe('Google Ads API version', () => {
  it('addresses the same API version from REST as the SDK speaks', () => {
    // the app uses both: the SDK for most work, raw REST for listAccessibleCustomers and the
    // offline user-data jobs. google-ads-api's major tracks the API version, so a bump has to move
    // both together or the two halves address different versions — the Facebook Pages failure
    const sdkMajor = require('google-ads-api/package.json').version.split('.')[0];

    expect(GOOGLE_ADS_API_VERSION).toBe(`v${sdkMajor}`);
  });
});

describe('Notion API version', () => {
  const APP_DIR = join(__dirname, '..', 'apps', 'notion');

  const sourceFiles = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);

      if (entry.isDirectory()) {
        return sourceFiles(path);
      }

      return entry.isFile() && entry.name.endsWith('.ts') ? [path] : [];
    });

  it('does not use fields removed from the 2026-03-11 REST contract', () => {
    const removedFields = [
      /\barchived\s*:/,
      /\bafter\s*:/,
      /\btranscription\s*:/,
      /\btype\s*:\s*['"]transcription['"]/,
    ];
    const offenders = sourceFiles(APP_DIR).flatMap((path) => {
      const source = readFileSync(path, 'utf8');
      return removedFields.some((pattern) => pattern.test(source)) ? [path] : [];
    });

    expect(offenders).toEqual([]);
  });
});

describe('DocuSign environment selection', () => {
  const app = esignatureApp('en' as any);

  it('authenticates against the environment the connection selects', () => {
    // all three account-server sites hardcoded the developer demo host, so no production tenant
    // could authenticate at all
    expect(app.rest.oauth2_auth_url).toBe('https://{{environment}}.docusign.com/oauth/auth');
    expect(app.rest.oauth2_token_url).toBe('https://{{environment}}.docusign.com/oauth/token');
    expect(app.rest_modifiers.url_template_options).toContain('environment');
  });

  it('offers both account servers and defaults to the one it used before', () => {
    const values = ESIGNATURE_CONN_OPTIONS.environment.allowed_values.map((v) => v.value);

    expect(values).toEqual(['account-d', 'account']);
    // defaulting to production would silently repoint existing connections at a server their
    // integration key is not promoted for
    expect(ESIGNATURE_CONN_OPTIONS.environment.default_value).toBe('account-d');
  });
});

describe('Help Scout', () => {
  it('declares no API version constant, because it has no versioned API', () => {
    // 'v8' matched no Help Scout API version and was referenced nowhere; the real calls use the
    // Mailbox API's /v2/ paths, which carry the version in the path
    expect(helpscoutConstants).not.toHaveProperty('HELPSCOUT_API_VERSION');
  });
});
