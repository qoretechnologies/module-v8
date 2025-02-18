import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';
import { callMondayAPI } from './constants';

const options = {
  payload: {
    display_name: 'Payload',
    short_desc: 'Payload for your custom action',
    desc: 'The payload for your custom action',
    type: 'hash',
    required: false,
  },
  actionName: {
    display_name: 'Action Name',
    short_desc: 'The name of the custom action to execute',
    desc: 'The name of the custom action to execute',
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {},
} satisfies TQoreResponseType;

export const CustomAction = QoreAppCreator.createAction({
  action: 'custom-action',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  display_name: 'Custom Action',
  short_desc: 'Perform a user-defined operation.',
  desc:
    'This action allows you to execute a custom operation defined by your integration or automation setup, ' +
    'providing flexibility for various tasks.',

  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const url = context?.conn_opts?.url;
    const payload = data?.payload;
    const actionName = data?.actionName;

    if (!token || !url || !actionName) {
      throw new Error(
        'Token, action name and api url are required to create a record in a Monday app'
      );
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
      url,
      query,
      variables: { actionName, payload },
    });
  },
  options,
  response_type,
});
