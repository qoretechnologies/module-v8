import {
  TCustomConnOptions,
  TQoreAnyType,
  TQoreGetAllowedValuesFunction,
  TQoreGetDynamicTypeFunction,
  TQoreOptions,
  TQoreResponseType,
  TQoreSimpleType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AzureDevOpsError } from '../constants';
import { createAzureDevOpsClient } from './constants';
import { getAzureDevOpsUserAllowedValues } from './get-user-allowed-values';

type TAzureMappedField = {
  type: string;
  name: string | undefined;
  referenceName: string;
  description: string | undefined;
  defaultValue: string | undefined;
  allowedValues: string[] | undefined;
  helpText: string | undefined;
  alwaysRequired: boolean | undefined;
};

const fieldTypeMap = {
  0: 'String',
  1: 'Integer',
  2: 'DateTime',
  3: 'PlainText',
  4: 'Html',
  5: 'TreePath',
  6: 'History',
  7: 'Double',
  8: 'Guid',
  9: 'Boolean',
  10: 'Identity',
  11: 'PicklistString',
  12: 'PicklistInteger',
  13: 'PicklistDouble',
};

const numberTypes = ['Integer', 'Double', 'PicklistInteger', 'PicklistDouble'];

const AzureDevOpsTypeToQoreTypeMap: Record<string, TQoreSimpleType> = {
  String: 'string',
  Integer: 'integer',
  DateTime: 'string',
  PlainText: 'string',
  Html: 'string',
  TreePath: 'string',
  History: 'string',
  Double: 'number',
  Guid: 'string',
  Boolean: 'bool',
  Identity: 'string',
  PicklistString: 'string',
  PicklistInteger: 'integer',
  PicklistDouble: 'number',
};

export const getAzureDevOpsWorkItemFields = async (options: {
  token: string;
  organization: string;
  itemType: string;
  project: string;
}) => {
  try {
    const { project, itemType } = options;

    const client = createAzureDevOpsClient(options);

    const workItemApi = await client.getWorkItemTrackingApi();
    const allFields = await workItemApi.getFields(project);
    const workItemType = await workItemApi.getWorkItemType(project, itemType);

    const fields: TAzureMappedField[] = [];

    workItemType.fields?.forEach((field) => {
      const fieldDetails = allFields.find((f) => f.referenceName === field.referenceName);
      if (!fieldDetails?.isDeleted && !fieldDetails?.readOnly && fieldDetails?.referenceName)
        fields.push({
          type: fieldTypeMap[fieldDetails?.type || 0] || 'String',
          name: field?.name,
          referenceName: fieldDetails?.referenceName,
          description: fieldDetails?.description,
          defaultValue: field?.defaultValue,
          allowedValues: field?.allowedValues,
          helpText: field?.helpText,
          alwaysRequired: field?.alwaysRequired,
        });
    });

    return fields;
  } catch (error) {
    throw new AzureDevOpsError(`Failed to get work item type: ${error}`);
  }
};

export const getAzureDevOpsWorkItemFieldOptions: TQoreGetDynamicTypeFunction = async (context) => {
  const { token, organization, itemType, project } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'organization'],
    optionFields: ['itemType', 'project'],
    ErrorClass: AzureDevOpsError,
  });

  const fields = await getAzureDevOpsWorkItemFields({ token, organization, itemType, project });

  const qoreOptions: TQoreOptions = {};

  fields.forEach((field) => {
    let default_value = undefined;

    if (field.defaultValue) {
      if (numberTypes.includes(field.type)) {
        default_value = Number(field.defaultValue);
      } else if (field.type === 'Boolean') {
        default_value = field.defaultValue === 'true';
      } else {
        default_value = field.defaultValue;
      }
    }

    qoreOptions[field.referenceName] = {
      type: (AzureDevOpsTypeToQoreTypeMap[field.type] || 'string') as TQoreAnyType,
      display_name: field.name,
      desc: field.helpText || field.description,
      allowed_values_creatable: true,
      required: field.referenceName === 'System.Title' ? true : false,
      preselected: field.alwaysRequired || false,
      ...(default_value && { default_value }),
      ...((field.type === 'Identity' || field.referenceName === 'System.AssignedTo') && {
        get_allowed_values: getAzureDevOpsUserAllowedValues,
      }),
      ...(field.allowedValues && {
        allowed_values: field.allowedValues.map((value: string) => ({
          display_name: value,
          value,
        })),
      }),
    };
  });

  return {
    type: 'hash',
    fields: qoreOptions,
  };
};

export const AzureDevOpsDefaultWorkItemResponseType: TQoreResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    url: { type: 'string' },
    AreaPath: { type: 'string' },
    TeamProject: { type: 'string' },
    IterationPath: { type: 'string' },
    WorkItemType: { type: 'string' },
    State: { type: 'string' },
    Reason: { type: 'string' },
    CreatedDate: { type: 'string' },
    CreatedBy: {
      type: {
        type: 'hash',
        fields: {
          displayName: { type: 'string' },
          url: { type: 'string' },
          id: { type: 'string' },
          uniqueName: { type: 'string' },
          imageUrl: { type: 'string' },
          descriptor: { type: 'string' },
        },
      },
    },
    ChangedDate: { type: 'string' },
    ChangedBy: {
      type: {
        type: 'hash',
        fields: {
          displayName: { type: 'string' },
          url: { type: 'string' },
          id: { type: 'string' },
          uniqueName: { type: 'string' },
          imageUrl: { type: 'string' },
          descriptor: { type: 'string' },
        },
      },
    },
    CommentCount: { type: 'integer' },
    Title: { type: 'string' },
    Description: { type: 'string' },
  },
};

export const getAzureDevOpsWorkItemResponseType: TQoreGetDynamicTypeFunction = async (context) => {
  const { token, organization } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'organization'],
    ErrorClass: AzureDevOpsError,
  });

  const { itemType, project } = context?.opts || {};

  if (!itemType || !project) {
    return AzureDevOpsDefaultWorkItemResponseType;
  }

  const fields = await getAzureDevOpsWorkItemFields({ token, organization, itemType, project });

  const qoreOptions: TQoreOptions = {};

  fields.forEach((field) => {
    const name = field.referenceName.replace('System.', '');
    qoreOptions[name] = {
      type: (AzureDevOpsTypeToQoreTypeMap[field.type] || 'string') as TQoreAnyType,
      display_name: field.name,
      desc: field.helpText || field.description,
    };
  });

  return {
    type: 'hash',
    fields: qoreOptions,
  };
};

export const getAzureDevOpsWorkItemFieldAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, organization, itemType, project } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'organization'],
    optionFields: ['itemType', 'project'],
    ErrorClass: AzureDevOpsError,
  });

  const fields = await getAzureDevOpsWorkItemFields({ token, organization, itemType, project });

  const allowedValues = fields.map((field) => {
    return {
      display_name: field.name,
      desc: field.helpText || field.description,
      value: field.referenceName,
    };
  });

  return allowedValues;
};
