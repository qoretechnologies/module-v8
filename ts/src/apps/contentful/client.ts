import * as contentfulModule from 'contentful-management';

// Handle both ESM default import and CJS require
const contentful = (contentfulModule as unknown as { default?: typeof contentfulModule }).default || contentfulModule;
import { getQoreContextRequiredValues } from '../../global/helpers';
import { ContentfulError } from './constants';

/**
 * Creates a plain Contentful Management client with just the access token.
 * Use for operations that don't need a specific space (e.g., listing spaces).
 */
export const getContentfulClient = (context: Record<string, unknown> | undefined) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: ContentfulError,
  });

  return contentful.createClient(
    { accessToken: token },
    { type: 'plain' }
  );
};

/**
 * Creates a plain Contentful Management client scoped to a specific space and environment.
 * Use for operations on entries, assets, content types, etc.
 */
export const getContentfulScopedClient = (
  context: Record<string, unknown> | undefined,
  spaceId: string,
  environmentId?: string
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: ContentfulError,
  });

  return contentful.createClient(
    { accessToken: token },
    {
      type: 'plain',
      defaults: {
        spaceId,
        environmentId: environmentId || 'master',
      },
    }
  );
};
