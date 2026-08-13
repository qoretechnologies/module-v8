import * as helpscoutConstants from '../apps/helpscout/constants';
import facebookPagesApp from '../apps/facebook-pages';
import { FACEBOOK_PAGES_API_VERSION } from '../apps/facebook-pages/constants';
import klaviyoApp from '../apps/klaviyo';
import { KLAVIYO_API_REVISION } from '../apps/klaviyo/constants';
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

  it('pings Klaviyo with the revision its SDK sends', () => {
    const app = klaviyoApp('en' as any);

    // klaviyo-api@19 sends 2025-07-15 and offers no override, so this is the only value that
    // describes what the actions actually do
    expect(app.rest.ping_headers.revision).toBe(KLAVIYO_API_REVISION);
    expect(KLAVIYO_API_REVISION).toBe('2025-07-15');
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

describe('Help Scout', () => {
  it('declares no API version constant, because it has no versioned API', () => {
    // 'v8' matched no Help Scout API version and was referenced nowhere; the real calls use the
    // Mailbox API's /v2/ paths, which carry the version in the path
    expect(helpscoutConstants).not.toHaveProperty('HELPSCOUT_API_VERSION');
  });
});
