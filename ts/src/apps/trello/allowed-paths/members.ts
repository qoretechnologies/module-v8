import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { getTrelloOrganizationIdAllowedValues } from '../helpers/get-organization-id-allowed-values';
import { getTrelloOrganizationMembersIdAllowedValues } from '../helpers/get-organization-members-allowed-values';
import { removeTrelloFieldsFromQuery } from './constants';

export const TRELLO_MEMBERS_ALLOWED_PATHS = {
  '/members/{id}': {
    GET: {
      override_options: {
        idOrganization: {
          type: 'string',
          required: false,
          preselected: true,
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
        },
        id: {
          get_allowed_values: getTrelloOrganizationMembersIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idOrganization']),
    },
    PUT: {
      override_options: {
        idOrganization: {
          type: 'string',
          required: false,
          preselected: true,
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
        },
        id: {
          get_allowed_values: getTrelloOrganizationMembersIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idOrganization']),
    },
  },
} satisfies TAllowedPaths;
