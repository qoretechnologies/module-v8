import { people_v1 } from '@googleapis/people';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreMappedOptions,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CONTACTS_APP_NAME, GoogleContactsError } from '../constants';
import { createGooglePeopleClient } from '../helpers/constants';

const options = {
  search_name: {
    type: 'string',
    required: false,
  },
  group_type: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'all', display_name: 'All Groups' },
      { value: 'user', display_name: 'User Created Groups Only' },
      { value: 'system', display_name: 'System Groups Only' },
    ],
    default_value: 'all',
  },
  group_fields: {
    type: 'string',
    required: false,
    default_value: 'name,groupType,memberCount,metadata',
    allowed_values: [
      { value: 'name', display_name: 'Name only' },
      { value: 'name,groupType', display_name: 'Name and type' },
      { value: 'name,groupType,memberCount', display_name: 'Name, type, and member count' },
      { value: 'name,groupType,memberCount,metadata', display_name: 'All basic fields' },
      {
        value: 'name,groupType,memberCount,metadata,clientData',
        display_name: 'All fields including custom data',
      },
    ],
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    success: { type: 'boolean' },
    totalGroups: { type: 'number' },
    systemGroups: { type: 'number' },
    userGroups: { type: 'number' },
    groups: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            resourceName: { type: 'string' },
            name: { type: 'string' },
            groupType: { type: 'string' },
            memberCount: { type: 'number' },
            etag: { type: 'string' },
            formattedName: { type: 'string' },
            metadata: {
              type: {
                type: 'hash',
                fields: {
                  updateTime: { type: 'string' },
                  deleted: { type: 'boolean' },
                },
              },
            },
            customData: { type: 'hash' },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

type TGroup = Partial<TQoreMappedOptions<(typeof response_type)['fields']>['groups'][number]>;

const listGroups = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CONTACTS_APP_NAME,
  action: 'list_groups',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GoogleContactsError,
    });

    const { search_name, group_type, group_fields } = obj || {};

    try {
      const client = createGooglePeopleClient(token);

      const allGroups: people_v1.Schema$ContactGroup[] = [];
      let nextPageToken: string | undefined | null = null;

      do {
        const requestParams: any = {
          pageSize: 1000,
          groupFields: group_fields || 'name,groupType,memberCount,metadata',
        };

        if (nextPageToken) {
          requestParams.pageToken = nextPageToken;
        }

        const response = await client.contactGroups.list(requestParams);
        const groups = response.data.contactGroups || [];

        allGroups.push(...groups);
        nextPageToken = response.data.nextPageToken;
      } while (nextPageToken);

      let processedGroups = allGroups.map((group) => {
        const processedGroup: TGroup = {
          resourceName: group.resourceName || '',
          name: group.name || '',
          groupType: group.groupType || 'USER_CONTACT_GROUP',
          memberCount: group.memberCount || 0,
          etag: group.etag || '',
          formattedName: group.formattedName || group.name || '',
        };

        if (group.metadata) {
          processedGroup.metadata = {
            updateTime: group.metadata.updateTime || '',
            deleted: group.metadata.deleted || false,
          };
        }

        if (group.clientData && group.clientData.length > 0) {
          processedGroup.customData = {};
          group.clientData.forEach((data) => {
            if (data.key) processedGroup.customData![data.key] = data.value;
          });
        }

        return processedGroup;
      });

      if (group_type && group_type !== 'all') {
        if (group_type === 'user') {
          processedGroups = processedGroups.filter(
            (group: TGroup) => group.groupType === 'USER_CONTACT_GROUP'
          );
        } else if (group_type === 'system') {
          processedGroups = processedGroups.filter(
            (group: TGroup) => group.groupType === 'SYSTEM_CONTACT_GROUP'
          );
        }
      }

      if (search_name) {
        const searchTerm = search_name.toLowerCase().trim();
        processedGroups = processedGroups.filter((group: TGroup) => {
          const groupName = (group.name || '').toLowerCase();
          const formattedName = (group.formattedName || '').toLowerCase();

          return groupName.includes(searchTerm) || formattedName.includes(searchTerm);
        });
      }

      const systemGroups = processedGroups.filter(
        (group: TGroup) => group.groupType === 'SYSTEM_CONTACT_GROUP'
      );
      const userGroups = processedGroups.filter(
        (group: TGroup) => group.groupType === 'USER_CONTACT_GROUP'
      );

      return {
        totalGroups: processedGroups.length,
        systemGroups: systemGroups.length,
        userGroups: userGroups.length,
        groups: processedGroups,
      };
    } catch (error) {
      throw new GoogleContactsError(`Failed to list groups: ${error}`);
    }
  },
  response_type,
});

export default listGroups;
