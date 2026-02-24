import {
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../../utils/Debugger';
import { PipedriveError } from '../../constants';
import { getPipedriveDealChannelAllowedValues } from '../get-deal-properties-allowed-values';
import { getPipedrivePersonIdAllowedValues } from '../get-person-id-allowed-values';
import { getPipedriveOrganizationIdAllowedValues } from '../get-organization-id-allowed-values';

export const PipedriveLeadRequiredFields = ['title'];

export const PipedriveLeadFields = {
  title: { type: 'string', required: true, desc: 'The name of the lead' },
  owner_id: { type: 'int', desc: 'The ID of the user who will be the owner of the created lead' },
  label_ids: {
    type: 'list',
    desc: 'The IDs of the lead labels which will be associated with the lead',
  },
  person_id: {
    type: 'int',
    allowed_values_creatable: true,
    desc: 'The ID of a person which this lead will be linked to',
  },
  organization_id: {
    type: 'int',
    desc: 'The ID of an organization which this lead will be linked to',
    allowed_values_creatable: true,
  },
  value: { type: 'hash', desc: 'The potential value of the lead' },
  expected_close_date: {
    type: 'string',
    desc: 'The date of when the deal which will be created from the lead is expected to be closed',
  },
  visible_to: { type: 'string', desc: 'The visibility of the lead' },
  was_seen: {
    type: 'bool',
    desc: 'A flag indicating whether the lead was seen by someone in the Pipedrive UI',
  },
  origin_id: {
    type: 'string',
    desc: 'The optional ID to further distinguish the origin of the lead',
  },
  channel: {
    type: 'int',
    allowed_values_creatable: true,
    desc: 'The ID of Marketing channel this lead was created from',
  },
  channel_id: {
    type: 'int',
    desc: 'The optional ID to further distinguish the Marketing channel',
    allowed_values_creatable: true,
  },
} satisfies Record<string, TQoreAppActionOption>;

export const getPipedriveLeadRecordType: TQoreGetDynamicTypeFunction = async (
  context
): Promise<TQoreTypeObject> => {
  try {
    let personAllowedValues;
    let organizationAllowedValues;
    let channelAllowedValues;

    try {
      [personAllowedValues, organizationAllowedValues, channelAllowedValues] = await Promise.all([
        getPipedrivePersonIdAllowedValues(context),
        getPipedriveOrganizationIdAllowedValues(context),
        getPipedriveDealChannelAllowedValues(context),
      ]);
    } catch (error) {
      Debugger.log('Failed to resolve Pipedrive lead allowed values for record type', error);
    }

    return {
      type: 'hash',
      fields: {
        ...PipedriveLeadFields,
        person_id: {
          ...PipedriveLeadFields.person_id,
          ...(personAllowedValues && { allowed_values: personAllowedValues }),
        },
        organization_id: {
          ...PipedriveLeadFields.organization_id,
          ...(organizationAllowedValues && { allowed_values: organizationAllowedValues }),
        },
        channel: {
          ...PipedriveLeadFields.channel,
          ...(channelAllowedValues && { allowed_values: channelAllowedValues }),
        },
        channel_id: {
          ...PipedriveLeadFields.channel_id,
          ...(channelAllowedValues && { allowed_values: channelAllowedValues }),
        },
      },
    };
  } catch (error) {
    throw new PipedriveError(`Failed to get Pipedrive lead record type: ${error.message || error}`);
  }
};
