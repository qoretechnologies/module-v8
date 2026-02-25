import {
  IQoreTypeObjectNonList,
  TQoreAppActionFunctionContext,
  TQoreGetRecordTypeFunction,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { ZendeskError } from '../../constants';
import { getZendeskFieldDynamicTypeFunction } from '../get-object-custom-fields';
import { TZendeskTable } from './get-table-list';
import { getOrganizationIdAllowedValues } from '../get-organization-id-allowed-values';
import { getBrandIdAllowedValues } from '../get-brand-id-allowed-values';
import { getGroupIdAllowedValues } from '../get-group-id-allowed-values';

export const getZendeskRecordType: TQoreGetRecordTypeFunction = async (
  context,
  tableName: TZendeskTable
) => {
  getQoreContextRequiredValues({
    context,
    connectionFields: ['url', 'token'],
    ErrorClass: ZendeskError,
  });

  return getRecordTypeForTable({ tableName, context });
};

const getRecordTypeForTable = async (options: {
  tableName: TZendeskTable;
  context: TQoreAppActionFunctionContext;
}): Promise<TQoreTypeObject> => {
  const { tableName, context } = options;
  switch (tableName) {
    case 'tickets':
      return getTicketRecordType(context);
    case 'users':
      return getUserRecordType(context);
    case 'organizations':
      return getOrganizationRecordType(context);
    default:
      return getCustomObjectRecordType({ tableName, context });
  }
};

const getTicketRecordType = async (
  context: TQoreAppActionFunctionContext
): Promise<TQoreTypeObject> => {
  let dynamicType: IQoreTypeObjectNonList = { type: 'hash', fields: {} };

  try {
    dynamicType = (await getZendeskFieldDynamicTypeFunction('tickets')(
      context
    )) as IQoreTypeObjectNonList;
  } catch (error) {
    Debugger.log('Failed to get dynamic ticket fields, falling back to static fields');
  }

  return {
    type: 'hash',
    fields: {
      subject: {
        type: 'string',
        desc: 'The value of the subject field for this ticket',
      },
      description: {
        type: 'string',
        desc: 'Read-only first comment on the ticket',
      },
      status: {
        type: 'string',
        desc: 'The state of the ticket',
        allowed_values: [
          { value: 'new' },
          { value: 'open' },
          { value: 'pending' },
          { value: 'hold' },
          { value: 'solved' },
          { value: 'closed' },
        ],
      },
      priority: {
        type: 'string',
        desc: 'The urgency with which the ticket should be addressed',
        allowed_values: [
          { value: 'urgent' },
          { value: 'high' },
          { value: 'normal' },
          { value: 'low' },
        ],
      },
      type: {
        type: 'string',
        desc: 'The type of this ticket',
        allowed_values: [
          { value: 'problem' },
          { value: 'incident' },
          { value: 'question' },
          { value: 'task' },
        ],
      },
      requester_id: {
        type: 'integer',
        desc: 'The user who requested this ticket',
      },
      assignee_id: {
        type: 'integer',
        desc: 'The agent currently assigned to the ticket',
      },
      group_id: {
        type: 'integer',
        desc: 'The group this ticket is assigned to',
      },
      organization_id: {
        type: 'integer',
        desc: 'The organization of the requester',
      },
      tags: {
        type: {
          type: 'list',
          element_type: 'string',
        },
        desc: 'The array of tags applied to this ticket',
      },
      due_at: {
        type: 'string',
        desc: 'If this is a ticket of type "task" it has a due date',
      },
      external_id: {
        type: 'string',
        desc: 'An id you can use to link Zendesk Support tickets to local records',
      },
      ...dynamicType.fields,
    },
  };
};

const getUserRecordType = async (
  context: TQoreAppActionFunctionContext
): Promise<TQoreTypeObject> => {
  let dynamicType: IQoreTypeObjectNonList = { type: 'hash', fields: {} };

  try {
    dynamicType = (await getZendeskFieldDynamicTypeFunction('users')(
      context
    )) as IQoreTypeObjectNonList;
  } catch (error) {
    Debugger.log('Failed to get dynamic user fields, falling back to static fields');
  }

  let brandAllowedValues;
  let organizationAllowedValues;

  try {
    [brandAllowedValues, organizationAllowedValues] = await Promise.all([
      getBrandIdAllowedValues(context as any),
      getOrganizationIdAllowedValues(context as any),
    ]);
  } catch (error) {
    Debugger.log('Failed to resolve Zendesk user allowed values for record type', error);
  }

  return {
    type: 'hash',
    fields: {
      name: {
        type: 'string',
        desc: 'The name of the user',
      },
      email: {
        type: 'string',
        desc: 'The primary email address of this user',
      },
      role: {
        type: 'string',
        desc: 'The role of the user',
        allowed_values: [
          { value: 'end-user', display_name: 'End User' },
          { value: 'agent', display_name: 'Agent' },
          { value: 'admin', display_name: 'Admin' },
        ],
      },
      agent_brand_ids: {
        type: {
          type: 'list',
          element_type: 'integer',
        },
        desc: 'The brand IDs that the agent has access to',
        ...(brandAllowedValues && { element_allowed_values: brandAllowedValues }),
      },
      phone: {
        type: 'string',
        desc: 'The primary phone number of this user',
      },
      organization_id: {
        type: 'integer',
        desc: 'The id of the organization this user is associated with',
        ...(organizationAllowedValues && { allowed_values: organizationAllowedValues }),
      },
      time_zone: {
        type: 'string',
        desc: 'The time-zone of this user',
      },
      locale: {
        type: 'string',
        desc: 'The locale for this user',
      },
      tags: {
        type: {
          type: 'list',
          element_type: 'string',
        },
        desc: 'The array of tags applied to this user',
      },
      notes: {
        type: 'string',
        desc: 'Any notes you want to store about the user',
      },
      details: {
        type: 'string',
        desc: 'Any details you want to store about the user',
      },
      active: {
        type: 'bool',
        desc: 'False if the user has been deleted',
      },
      verified: {
        type: 'bool',
        desc: 'Whether the user has verified their primary email',
      },
      suspended: {
        type: 'bool',
        desc: 'Whether the user has been suspended',
      },
      external_id: {
        type: 'string',
        desc: 'A unique identifier from another system',
      },
      ...dynamicType.fields,
    },
  };
};

const getOrganizationRecordType = async (
  context: TQoreAppActionFunctionContext
): Promise<TQoreTypeObject> => {
  let dynamicType: IQoreTypeObjectNonList = { type: 'hash', fields: {} };

  try {
    dynamicType = (await getZendeskFieldDynamicTypeFunction('organizations')(
      context
    )) as IQoreTypeObjectNonList;
  } catch (error) {
    Debugger.log('Failed to get dynamic organization fields, falling back to static fields');
  }

  let groupAllowedValues;

  try {
    groupAllowedValues = await getGroupIdAllowedValues(context as any);
  } catch (error) {
    Debugger.log('Failed to resolve Zendesk group allowed values for record type', error);
  }

  return {
    type: 'hash',
    fields: {
      name: {
        type: 'string',
        desc: 'A unique name for the organization',
      },
      domain_names: {
        type: {
          type: 'list',
          element_type: 'string',
        },
        desc: 'An array of domain names associated with this organization',
      },
      details: {
        type: 'string',
        desc: 'Any details about the organization',
      },
      notes: {
        type: 'string',
        desc: 'Any notes you have about the organization',
      },
      group_id: {
        type: 'integer',
        desc: 'New tickets from users in this organization are automatically put in this group',
        ...(groupAllowedValues && { allowed_values: groupAllowedValues }),
      },
      shared_tickets: {
        type: 'bool',
        desc: "End users in this organization can see each other's tickets",
      },
      shared_comments: {
        type: 'bool',
        desc: "End users in this organization can see each other's comments on tickets",
      },
      tags: {
        type: {
          type: 'list',
          element_type: 'string',
        },
        desc: 'The tags of the organization',
      },
      external_id: {
        type: 'string',
        desc: 'A unique external id to associate organizations to an external record',
      },
      ...dynamicType.fields,
    },
  };
};

const getCustomObjectRecordType = async (options: {
  tableName: string;
  context: TQoreAppActionFunctionContext;
}): Promise<TQoreTypeObject> => {
  let dynamicType: IQoreTypeObjectNonList = { type: 'hash', fields: {} };

  try {
    dynamicType = (await getZendeskFieldDynamicTypeFunction(options.tableName)(
      options.context
    )) as IQoreTypeObjectNonList;
  } catch (error) {
    Debugger.log(
      `Failed to get dynamic ${options.tableName} fields, falling back to static fields`
    );
  }

  return {
    type: 'hash',
    fields: {
      name: {
        type: 'string',
        desc: 'The name of the custom object record',
      },
      external_id: {
        type: 'string',
        desc: 'A unique external id to associate custom object records to an external record',
      },
      ...dynamicType.fields,
    },
  };
};
