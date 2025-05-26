import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CONTACTS_APP_NAME, GoogleContactsError } from '../constants';
import { createGooglePeopleClient } from '../helpers/constants';

const options = {
  name: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const createGroup = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CONTACTS_APP_NAME,
  action: 'create_group',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['name'],
      connectionFields: ['token'],
      ErrorClass: GoogleContactsError,
    });

    try {
      const client = createGooglePeopleClient(token);

      const response = await client.contactGroups.create({
        requestBody: {
          contactGroup: {
            name,
          },
        },
      });

      const createdGroup = response.data;

      return {
        resourceName: createdGroup.resourceName,
        name: createdGroup.name,
        groupType: createdGroup.groupType,
        memberCount: createdGroup.memberCount || 0,
        etag: createdGroup.etag,
        formattedName: createdGroup.formattedName,
      };
    } catch (error) {
      throw new GoogleContactsError(`Failed to create group: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      resourceName: { type: 'string' },
      name: { type: 'string' },
      groupType: { type: 'string' },
      memberCount: { type: 'number' },
      etag: { type: 'string' },
      formattedName: { type: 'string' },
    },
  } satisfies TQoreResponseType,
});

export default createGroup;
