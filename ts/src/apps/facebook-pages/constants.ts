import { IEndpoint } from '@qoretechnologies/ts-toolkit/dist/QorusAuthenticator';

export const FACEBOOK_PAGES_APP_NAME = 'FacebookPages';
export const FACEBOOK_PAGES_APP_LOGO =
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8IS0tIENyZWF0b3I6IENvcmVsRFJBVyBYNiAtLT4NCjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTQuMjIyMmluIiBoZWlnaHQ9IjE0LjIyMjJpbiIgdmVyc2lvbj0iMS4xIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjsgdGV4dC1yZW5kZXJpbmc6Z2VvbWV0cmljUHJlY2lzaW9uOyBpbWFnZS1yZW5kZXJpbmc6b3B0aW1pemVRdWFsaXR5OyBmaWxsLXJ1bGU6ZXZlbm9kZDsgY2xpcC1ydWxlOmV2ZW5vZGQiDQp2aWV3Qm94PSIwIDAgMTQyMjIgMTQyMjIiDQogeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPg0KIDxkZWZzPg0KICA8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KICAgPCFbQ0RBVEFbDQogICAgLmZpbDAge2ZpbGw6IzE5NzdGMztmaWxsLXJ1bGU6bm9uemVyb30NCiAgICAuZmlsMSB7ZmlsbDojRkVGRUZFO2ZpbGwtcnVsZTpub256ZXJvfQ0KICAgXV0+DQogIDwvc3R5bGU+DQogPC9kZWZzPg0KIDxnIGlkPSJMYXllcl94MDAyMF8xIj4NCiAgPG1ldGFkYXRhIGlkPSJDb3JlbENvcnBJRF8wQ29yZWwtTGF5ZXIiLz4NCiAgPHBhdGggY2xhc3M9ImZpbDAiIGQ9Ik0xNDIyMiA3MTExYzAsLTM5MjcgLTMxODQsLTcxMTEgLTcxMTEsLTcxMTEgLTM5MjcsMCAtNzExMSwzMTg0IC03MTExLDcxMTEgMCwzNTQ5IDI2MDAsNjQ5MSA2MDAwLDcwMjVsMCAtNDk2OSAtMTgwNiAwIDAgLTIwNTYgMTgwNiAwIDAgLTE1NjdjMCwtMTc4MiAxMDYyLC0yNzY3IDI2ODYsLTI3NjcgNzc4LDAgMTU5MiwxMzkgMTU5MiwxMzlsMCAxNzUwIC04OTcgMGMtODgzLDAgLTExNTksNTQ4IC0xMTU5LDExMTFsMCAxMzM0IDE5NzIgMCAtMzE1IDIwNTYgLTE2NTcgMCAwIDQ5NjljMzQwMCwtNTMzIDYwMDAsLTM0NzUgNjAwMCwtNzAyNXoiLz4NCiAgPHBhdGggY2xhc3M9ImZpbDEiIGQ9Ik05ODc5IDkxNjdsMzE1IC0yMDU2IC0xOTcyIDAgMCAtMTMzNGMwLC01NjIgMjc1LC0xMTExIDExNTksLTExMTFsODk3IDAgMCAtMTc1MGMwLDAgLTgxNCwtMTM5IC0xNTkyLC0xMzkgLTE2MjQsMCAtMjY4Niw5ODQgLTI2ODYsMjc2N2wwIDE1NjcgLTE4MDYgMCAwIDIwNTYgMTgwNiAwIDAgNDk2OWMzNjIsNTcgNzMzLDg2IDExMTEsODYgMzc4LDAgNzQ5LC0zMCAxMTExLC04NmwwIC00OTY5IDE2NTcgMHoiLz4NCiA8L2c+DQo8L3N2Zz4NCg==';
/**
 * The Graph API version this application's own REST calls address.
 *
 * It must match the version `facebook-nodejs-business-sdk` speaks, because the application uses
 * both: the SDK for pages, posts and comments, and raw REST for the rest. The SDK's major tracks
 * the Graph API version, so the SDK's major *is* the pin — this was `v23.0` against a v24 SDK, so
 * the two halves of the application addressed different API versions.
 *
 * Not v25, which has been current since 2026-02-18: Meta has not published a v25 SDK major, so
 * moving the REST half alone would re-open the split it just closed. Revisit when the SDK ships.
 */
export const FACEBOOK_PAGES_API_VERSION = 'v24.0';

export const FACEBOOK_PAGES_APP_API_URL = `https://graph.facebook.com/${FACEBOOK_PAGES_API_VERSION}`;

export class FacebookPagesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FacebookPagesError';
  }
}

export const FacebookPagesEndpointData = {
  url: FACEBOOK_PAGES_APP_API_URL,
  endpointId: FACEBOOK_PAGES_APP_NAME,
} satisfies IEndpoint;
