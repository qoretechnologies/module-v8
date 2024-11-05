import { IActionOptions, IActionResponse, TActionData } from 'global/models/actions';
import { EQoreAppActionCode, TQorePartialAction } from 'global/models/qore';
import { L } from '../../../../i18n/i18n-node';
import { hubspotRequest } from '../../client';

// Defining a function to fetch user by id

const options: IActionOptions = {
  id: {
    type: 'number',
    name: 'id',
    display_name: L.en.apps.hubspot.actions.users.id.displayName(),
    short_desc: L.en.apps.hubspot.actions.users.id.shortDesc(),
    desc: L.en.apps.hubspot.actions.users.id.longDesc(),
    example_value: 123,
  },
} as IActionOptions;
export const response_type: IActionResponse = {
  id: {
    type: 'number',
    name: 'id',
    display_name: L.en.apps.hubspot.actions.users.id.displayName(),
    short_desc: L.en.apps.hubspot.actions.users.id.shortDesc(),
    desc: L.en.apps.hubspot.actions.users.id.longDesc(),
    example_value: 123,
  },
  created_at: {
    type: 'string',
    name: 'created_at',
    display_name: L.en.apps.hubspot.actions.users.created_at.displayName(),
    short_desc: L.en.apps.hubspot.actions.users.created_at.shortDesc(),
    desc: L.en.apps.hubspot.actions.users.created_at.longDesc(),
    example_value: '2021-08-25T09:00:00Z',
  },
  updated_at: {
    type: 'string',
    name: 'updated_at',
    display_name: L.en.apps.hubspot.actions.users.updated_at.displayName(),
    short_desc: L.en.apps.hubspot.actions.users.updated_at.shortDesc(),
    desc: L.en.apps.hubspot.actions.users.updated_at.longDesc(),
    example_value: '2021-08-25T09:00:00Z',
  },
  archived: {
    type: 'boolean',
    name: 'archived',
    display_name: L.en.apps.hubspot.actions.users.archived.displayName(),
    short_desc: L.en.apps.hubspot.actions.users.archived.shortDesc(),
    desc: L.en.apps.hubspot.actions.users.archived.longDesc(),
    example_value: true,
  },
};

const getUser = async ({ id }: TActionData<typeof options>) => {
  try {
    const data: any = await hubspotRequest(`/objects/users/${id}.json`, 'GET');

    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export default {
  action: 'get_user',
  action_code: EQoreAppActionCode.ACTION,
  api_function: getUser,
  options,
  response_type,
  _localizationGroup: 'users',
} satisfies TQorePartialAction<typeof options, typeof response_type>;
