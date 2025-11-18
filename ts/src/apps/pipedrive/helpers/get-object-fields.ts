import {
  IQoreAllowedValue,
  TQoreAnyType,
  TQoreAppActionOption,
  TQoreOptions,
  TQoreType,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { fetchPipedrivePaginatedRecords } from './client';
import { getPipedriveOrganizationIdAllowedValues } from './get-organization-id-allowed-values';
import { getPipedrivePersonIdAllowedValues } from './get-person-id-allowed-values';
import { getPipedriveStageIdAllowedValues } from './get-stage-id-allowed-values';
import { getPipedriveUserIdAllowedValues } from './get-user-id-allowed-values';
import { getPipedriveDealIdAllowedValues } from './get-deal-id-allowed-values';
import { getPipedriveProjectIdAllowedValues } from './get-project-id-allowed-values';
import { getPipedriveLeadIdAllowedValues } from './get-lead-id-allowed-values';
import { TPipedriveTable } from './record-based/constants';

const PIPEDRIVE_MULTISELECT_FIELD_TYPES = ['set'];

const commonFields: Record<string, TQoreAppActionOption> = {
  id: { type: 'number' },
  add_time: { type: 'string' },
  update_time: { type: 'string' },
};

export const PipedriveTypeToQoreTypeMap: Record<string, TQoreType> = {
  varchar: 'string',
  varchar_auto: 'string',
  text: 'string',
  double: 'number',
  monetary: 'number',
  set: { type: 'list', element_type: 'string' },
  enum: 'string',
  user: 'number',
  org: 'number',
  people: 'number',
  phone: 'string',
  time: 'string',
  timerange: {
    type: 'hash',
    fields: {
      from: { type: 'string' },
      to: { type: 'string' },
    },
  },
  date: 'string',
  daterange: {
    type: 'hash',
    fields: {
      from: { type: 'string' },
      to: { type: 'string' },
    },
  },
  stage: 'softstring',
  status: 'string',
  address: {
    type: 'hash',
    fields: {
      value: { type: 'string' },
      country: { type: 'string' },
      postal_code: { type: 'string' },
      street_number: { type: 'string' },
      route: { type: 'string' },
    },
  },
  int: 'integer',
  varchar_options: 'string',
  visible_to: 'integer',
  deal: 'integer',
  project: 'integer',
} as const;

type TPipedriveObjectField = {
  id: number;
  key: string;
  name: string;
  options: { id: number; label: string }[];
  field_type: string;
  edit_flag: boolean;
};

export const getPipedriveObjectFields = async (
  token: string,
  pathToObjectFields: string
): Promise<TPipedriveObjectField[]> => {
  const dealFields: TPipedriveObjectField[] = [];

  try {
    const data = await fetchPipedrivePaginatedRecords<any, TPipedriveObjectField>({
      token,
      path: `v1${pathToObjectFields}`,
      object: 'data',
    });

    dealFields.push(...data);
  } catch (error) {
    Debugger.log(`Failed to fetch Pipedrive object fields: ${error}`);
  } finally {
    return dealFields;
  }
};

export const PipedriveTableNameToFieldEndpointMap: Record<TPipedriveTable, string | undefined> = {
  activities: '/activityFields',
  deals: '/dealFields',
  notes: '/noteFields',
  organizations: '/organizationFields',
  persons: '/personFields',
  products: '/productFields',
  leads: undefined,
  tasks: undefined,
} as const;

export const getPipedriveFieldNameToIdMap = async (
  token: string,
  pathToFields: string
): Promise<Record<string, string> | undefined> => {
  const fieldNameToIdMap: Record<string, string> = {};

  try {
    const fields = await getPipedriveObjectFields(token, pathToFields);

    fields.forEach((field) => {
      if (field.id) {
        fieldNameToIdMap[field.key] = field.id.toString();
      }
    });

    return fieldNameToIdMap;
  } catch (error) {
    Debugger.log(`Failed to get Pipedrive field name to ID map: ${error}`);
    return undefined;
  }
};

export const mapPipedriveFieldsToQoreOptions = async (options: {
  token: string;
  predefinedFields: Record<string, TQoreAppActionOption>;
  pathToObjectFields: string;
  requiredFields?: string[];
}): Promise<TQoreOptions> => {
  const qoreOptions: TQoreOptions = {};
  try {
    const pipedriveFields = await getPipedriveObjectFields(
      options.token,
      options.pathToObjectFields
    );

    const predefinedFieldsKeys = Object.keys(options.predefinedFields);

    // only get the predefined fields to get options for them or if the field is a custom field
    const pipedriveFilteredFields = pipedriveFields.filter(
      (field) => predefinedFieldsKeys.includes(field.key) || field.edit_flag === true
    );

    for (const field of pipedriveFilteredFields) {
      const fieldType = (PipedriveTypeToQoreTypeMap[field.field_type] || 'any') as TQoreAnyType;
      const fieldOptions = field.options || [];
      const isMultiselect = PIPEDRIVE_MULTISELECT_FIELD_TYPES.includes(field.field_type);
      const fieldDesc = options.predefinedFields[field.key]?.desc;

      let qoreOptionsAdditionalFields: Record<string, any> = {};

      const allowedValuesFunction = getFieldAllowedValuesFunction(field.field_type);

      if (allowedValuesFunction) {
        qoreOptionsAdditionalFields = {
          ...qoreOptionsAdditionalFields,
          get_allowed_values: allowedValuesFunction,
          allowed_values_creatable: true,
        };
      }

      if (fieldOptions.length) {
        const allowedValues: IQoreAllowedValue<any>[] = [];
        fieldOptions.forEach((option) => {
          allowedValues.push({
            value: option.id,
            display_name: option.label,
          });
        });

        if (isMultiselect) {
          qoreOptionsAdditionalFields = {
            ...qoreOptionsAdditionalFields,
            element_allowed_values: allowedValues,
            element_allowed_values_creatable: true,
          };
        } else {
          qoreOptionsAdditionalFields = {
            ...qoreOptionsAdditionalFields,
            allowed_values: allowedValues,
            allowed_values_creatable: true,
          };
        }
      }

      qoreOptions[field.key] = {
        type: fieldType,
        display_name: field.name,
        required: options.requiredFields?.includes(field.key) || false,
        ...qoreOptionsAdditionalFields,
        ...(fieldDesc && { desc: fieldDesc }),
      };
    }

    return { ...qoreOptions, ...commonFields };
  } catch (error) {
    throw new Error(`Failed to map Pipedrive fields to Qore options: ${error.message || error}`);
  }
};

const getFieldAllowedValuesFunction = (fieldType: string) => {
  switch (fieldType) {
    case 'stage':
      return getPipedriveStageIdAllowedValues;
    case 'org':
      return getPipedriveOrganizationIdAllowedValues;
    case 'user':
      return getPipedriveUserIdAllowedValues;
    case 'people':
      return getPipedrivePersonIdAllowedValues;
    case 'deal':
      return getPipedriveDealIdAllowedValues;
    case 'project':
      return getPipedriveProjectIdAllowedValues;
    case 'lead':
      return getPipedriveLeadIdAllowedValues;
    default:
      return undefined;
  }
};
