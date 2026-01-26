import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';
import { callMondayAPI } from '../helpers/constants';

const options = {
  payload: {
    type: 'hash',
    required: false,
  },
  actionName: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {},
} satisfies TQoreResponseType;

const CustomAction = QoreAppCreator.createLocalizedAction({
  action: 'custom_action',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,

  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const payload = data?.payload;
    const actionName = data?.actionName;

    if (!token || !actionName) {
      throw new Error('Token and action name are required to perform a custom action in a Monday app');
    }

    const query = `
    mutation CustomAction($actionName: String!, $payload: JSON) {
      custom_action(action_name: $actionName, payload: $payload) {
        result
      }
    }
  `;

    return await callMondayAPI({
      token,
      query,
      variables: { actionName, payload },
    });
  },
  options,
  response_type,
});

export default CustomAction;
