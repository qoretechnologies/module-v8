import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';

const action = 'delete_content_type';

const options = {
  ...contentfulBaseWithContentTypeOptions,
} satisfies TQoreOptions;

const DeleteContentType = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string', short_desc: 'Deleted content type ID' },
      deleted: { type: 'bool', short_desc: 'Whether the content type was successfully deleted' },
    },
  },
  api_function: async (obj, _opts, context) => {
    const { space_id, content_type_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'content_type_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      await client.contentType.delete({ contentTypeId: content_type_id });

      return { id: content_type_id, deleted: true };
    } catch (error) {
      throw new ContentfulError(`Failed to delete content type: ${error}`);
    }
  },
});

export default DeleteContentType;
