/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable require-await */
import { ActionContext, PropertyType } from 'core/framework';
import { ExecutionType } from 'core/shared';
import { TQoreType } from '@qoretechnologies/ts-toolkit';

export const piecePropTypeToQoreOptionTypeIndex: {
  [key in PropertyType]: TQoreType;
} = {
  [PropertyType.SHORT_TEXT]: 'string',
  [PropertyType.LONG_TEXT]: 'string',
  [PropertyType.MARKDOWN]: 'string',
  [PropertyType.DROPDOWN]: 'string',
  [PropertyType.STATIC_DROPDOWN]: 'string',
  [PropertyType.NUMBER]: 'number',
  [PropertyType.CHECKBOX]: 'bool',
  [PropertyType.OAUTH2]: 'string',
  [PropertyType.SECRET_TEXT]: 'string',
  [PropertyType.ARRAY]: 'list',
  [PropertyType.OBJECT]: 'hash',
  [PropertyType.BASIC_AUTH]: 'string',
  [PropertyType.JSON]: 'hash',
  [PropertyType.MULTI_SELECT_DROPDOWN]: 'list',
  [PropertyType.STATIC_MULTI_SELECT_DROPDOWN]: 'list',
  [PropertyType.DYNAMIC]: 'hash',
  [PropertyType.CUSTOM_AUTH]: 'string',
  [PropertyType.DATE_TIME]: 'date',
  [PropertyType.FILE]: 'file',
};

//TODO: you can see that most context data is currently mocked, need to figure out what to leave and what to remove
export const commonActionContext = {
  executionType: ExecutionType.BEGIN,
  run: {
    id: 'flow-run-id',
    stop: () => {},
    pause: () => {},
  },
  generateResumeUrl: () => 'https://resume.url',
  store: {
    put: async (_key, value, _scope) => value,
    get: async (_key, _scope) => null,
    delete: async (_key, _scope) => {},
  },
  project: {
    id: 'project-id',
    externalId: () => Promise.resolve('external-id'),
  },
  connections: {
    get: async (_connectionId) => ({ id: 'connection-id', name: 'connection-name' }),
  },
  tags: {
    add: async (_tags) => {},
  },
  server: {
    apiUrl: 'https://api.url',
    publicUrl: 'https://public.url',
    token: 'token',
  },
  files: {
    write: async ({ fileName }: { fileName: string }) => fileName,
  },
  serverUrl: 'https://server.url',
} satisfies Partial<ActionContext>;
