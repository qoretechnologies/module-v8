import { TAllowedPaths, TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import trello from '../../schemas/trello.swagger.json';
import { OpenAPIV2 } from 'openapi-types';
import { TRELLO_BOARDS_ALLOWED_PATHS } from './allowed-paths/boards';
import { TRELLO_CARDS_ALLOWED_PATHS } from './allowed-paths/cards';
import { TRELLO_CHECKLISTS_ALLOWED_PATHS } from './allowed-paths/checklists';
import { TRELLO_LABELS_ALLOWED_PATHS } from './allowed-paths/labels';
import { TRELLO_LISTS_ALLOWED_PATHS } from './allowed-paths/lists';
import { TRELLO_MEMBERS_ALLOWED_PATHS } from './allowed-paths/members';
import { TRELLO_ORGANIZATIONS_ALLOWED_PATHS } from './allowed-paths/organizations';
import { TRELLO_SEARCH_ALLOWED_PATHS } from './allowed-paths/search';
export const TRELLO_APP_NAME = 'Trello';
export const TRELLO_APP_LOGO =
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIEdlbmVyYXRvcjogU1ZHIFJlcG8gTWl4ZXIgVG9vbHMgLS0+Cjxzdmcgd2lkdGg9IjgwMHB4IiBoZWlnaHQ9IjgwMHB4IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+CiAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgeDE9IjUwJSIgeTE9IjAlIiB4Mj0iNTAlIiB5Mj0iMTAwJSIgaWQ9ImxpbmVhckdyYWRpZW50LTEiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMDA5MUU2IiBvZmZzZXQ9IjAlIj4KDTwvc3RvcD4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzAwNzlCRiIgb2Zmc2V0PSIxMDAlIj4KDTwvc3RvcD4KICAgICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPC9kZWZzPgogICAgPGc+CiAgICAgICAgPGc+CiAgICAgICAgICAgIDxyZWN0IGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtMSkiIHg9IjAiIHk9IjAiIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiByeD0iMjUiPgoNPC9yZWN0PgogICAgICAgICAgICA8cmVjdCBmaWxsPSIjRkZGRkZGIiB4PSIxNDQuNjQiIHk9IjMzLjI4IiB3aWR0aD0iNzguMDgiIGhlaWdodD0iMTEyIiByeD0iMTIiPgoNPC9yZWN0PgogICAgICAgICAgICA8cmVjdCBmaWxsPSIjRkZGRkZGIiB4PSIzMy4yOCIgeT0iMzMuMjgiIHdpZHRoPSI3OC4wOCIgaGVpZ2h0PSIxNzYiIHJ4PSIxMiI+Cg08L3JlY3Q+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';
export const TRELLO_KEY = 'c42891766a55f94a6e1666b540f58719';
export const TRELLO_CONN_OPTIONS = {
  key: {
    type: 'string',
    display_name: 'Key',
    short_desc: 'Trello API Key',
    desc: 'Trello API Key',
    default_value: TRELLO_KEY,
  },
} satisfies TCustomConnOptions;

export const TRELLO_ALLOWED_PATHS = {
  ...TRELLO_BOARDS_ALLOWED_PATHS,
  ...TRELLO_CARDS_ALLOWED_PATHS,
  ...TRELLO_CHECKLISTS_ALLOWED_PATHS,
  ...TRELLO_LABELS_ALLOWED_PATHS,
  ...TRELLO_LISTS_ALLOWED_PATHS,
  ...TRELLO_MEMBERS_ALLOWED_PATHS,
  ...TRELLO_ORGANIZATIONS_ALLOWED_PATHS,
  ...TRELLO_SEARCH_ALLOWED_PATHS,
} satisfies TAllowedPaths;

export const TRELLO_ACTIONS = buildActionsFromSwaggerSchema({
  schema: trello as unknown as OpenAPIV2.Document,
  allowedPaths: TRELLO_ALLOWED_PATHS,
  app: TRELLO_APP_NAME,
});
