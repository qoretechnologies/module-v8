import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { MAUTIC_APP_NAME, MauticError } from '../constants';
import { mauticClient } from '../client';
import { getMauticCampaignsAllowedValues, getMauticContactsAllowedValues } from '../helpers';

const action = 'add_contact_to_campaign';

const options = {
  campaign: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticCampaignsAllowedValues,
  },
  contact: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticContactsAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    campaignId: { type: 'number' },
    contactId: { type: 'number' },
  },
} satisfies TQoreResponseType;

const addContactToCampaign = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MAUTIC_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { instance_url, username, password, campaign, contact } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['instance_url', 'username', 'password'],
      optionFields: ['campaign', 'contact'],
      ErrorClass: MauticError,
    });

    try {
      await mauticClient.post(
        `campaigns/${campaign}/contact/${contact}/add`,
        {},
        {
          connectionOptions: { instance_url, username, password },
        }
      );

      return {
        success: true,
        campaignId: campaign,
        contactId: contact,
      };
    } catch (error) {
      throw new MauticError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
});

export default addContactToCampaign;
