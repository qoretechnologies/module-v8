import contentful from 'contentful-management';
import { getQoreContextRequiredValues } from '../../global/helpers';
import { ContentfulError } from './constants';

/**
 * Creates a plain Contentful Management client with just the access token.
 * Use for operations that don't need a specific space (e.g., listing spaces).
 */
export const getContentfulClient = (context: Record<string, unknown> | undefined) => {
  const { access_token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_token'],
    ErrorClass: ContentfulError,
  });

  return contentful.createClient(
    { accessToken: access_token },
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
  const { access_token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_token'],
    ErrorClass: ContentfulError,
  });

  return contentful.createClient(
    { accessToken: access_token },
    {
      type: 'plain',
      defaults: {
        spaceId,
        environmentId: environmentId || 'master',
      },
    }
  );
};
