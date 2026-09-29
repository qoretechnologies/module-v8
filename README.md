# module-v8
JavaScript / v8 module for Qore

HubSpot connection deployment and read-only CMS examples:
[Optional CMS authorization](docs/hubspot-cms-oauth.md).

The native library includes LGPL-2.1-or-later sources (see `COPYING.LGPL` and
`COPYING.GPL`); supporting headers and Qore modules retain their MIT notices.
TypeScript execution uses Node's built-in compiler where available, or the
`typescript` package (`node-typescript` on Debian/Ubuntu). The separately built
`ts/` app catalogue is optional; see `debian/README.source` for package scope.
