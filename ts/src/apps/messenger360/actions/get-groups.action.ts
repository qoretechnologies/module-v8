import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MESSENGER360_APP_NAME, Messenger360Error } from '../constants';
import { fetch360MessengerData } from '../helpers/constants';

const getGroups = QoreAppCreator.createLocalizedAction({
  app: MESSENGER360_APP_NAME,
  action: 'get_groups',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: Messenger360Error,
    });

    try {
      const data = await fetch360MessengerData<Record<string, any>[]>({
        token,
        path: '/groupChat/getGroupList',
        dataPath: 'data.groups',
      });

      return data;
    } catch (error) {
      throw new Messenger360Error(`Failed to get groups: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
          display_name: 'Group ID',
          short_desc: 'The unique identifier of the group',
        },
        name: {
          type: 'string',
          display_name: 'Group Name',
          short_desc: 'The name of the group',
        },
      },
    },
  },
});

export default getGroups;
