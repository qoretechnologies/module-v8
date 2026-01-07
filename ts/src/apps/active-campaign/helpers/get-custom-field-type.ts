import {
  IQoreAllowedValue,
  TQoreAppActionOption,
  TQoreOptions,
  TQoreType,
} from '@qoretechnologies/ts-toolkit';
import { ActiveCampaignError } from '../constants';
import { activeCampaignClient } from './constants';

type TCustomField = {
  id: string;
  fieldLabel: string;
  fieldType: string;
  fieldOptions: string[];
  fieldDefaultCurrency: string;
};

type TContactCustomField = {
  id: string;
  title: string;
  descript: string;
  type: string;
  isrequired: string;
  options: string[];
};

type TContactCustomFieldOption = {
  field: string;
  value: string;
  label: string;
  id: string;
};

type TContactCustomFieldsResponse = {
  fieldOptions: TContactCustomFieldOption[];
  fields: TContactCustomField[];
};

export const ActiveCampaignAccountCustomFieldTypeToQoreTypeMap: Record<string, TQoreType> = {
  text: 'string',
  textarea: 'string',
  hidden: 'string',
  number: 'number',
  money: 'number',
  date: 'date',
  dropdown: 'string',
  radio: 'string',
  listbox: {
    type: 'list',
    element_type: 'string',
  },
  checkbox: {
    type: 'list',
    element_type: 'string',
  },
};

export const fetchActiveCampaignAccountCustomFields = async (options: {
  token: string;
  url: string;
}) => {
  try {
    const fields = await activeCampaignClient.fetchPaginated<TCustomField>({
      path: 'accountCustomFieldMeta',
      token: options.token,
      baseUrl: options.url,
      itemsPath: 'accountCustomFieldMeta',
      maxResults: 500,
    });

    return fields;
  } catch (error) {
    throw new ActiveCampaignError(`Couldn't fetch custom account fields ${error}`);
  }
};

export const fetchActiveCampaignContactCustomFields = async (options: {
  token: string;
  url: string;
}): Promise<TContactCustomFieldsResponse> => {
  try {
    const fields = await activeCampaignClient.get<TContactCustomFieldsResponse>('fields', {
...options
      });

    return fields;
  } catch (error) {
    throw new ActiveCampaignError(`Couldn't fetch custom account fields ${error}`);
  }
};

export const mapActiveCampaignAccountCustomFieldsToQoreOptions = async (options: {
  token: string;
  url: string;
}): Promise<TQoreOptions> => {
  const fields = await fetchActiveCampaignAccountCustomFields(options);

  const mappedOptions: TQoreOptions = {};

  fields.forEach((field) => {
    const fieldOptions = field.fieldOptions;
    let allowed_values: IQoreAllowedValue<any>[] = [];
    const type = ActiveCampaignAccountCustomFieldTypeToQoreTypeMap[field.fieldType] || 'any';

    if (
      fieldOptions?.length &&
      (typeof fieldOptions[0] === 'string' || typeof fieldOptions[0] === 'number')
    ) {
      allowed_values = fieldOptions.map((option) => ({
        value: option,
        display_name: option,
      }));
    }

    mappedOptions[field.id] = {
      display_name: field.fieldLabel,
      ...(allowed_values?.length && {
        allowed_values,
      }),
      type,
    } as TQoreAppActionOption;
  });

  return mappedOptions;
};

export const mapActiveCampaignContactCustomFieldsToQoreOptions = async (options: {
  token: string;
  url: string;
}): Promise<TQoreOptions> => {
  const { fieldOptions, fields } = await fetchActiveCampaignContactCustomFields(options);

  const mappedOptions: TQoreOptions = {};

  fields.forEach((field) => {
    let allowed_values: IQoreAllowedValue<any>[] = [];
    const required = field.isrequired === '1';
    const type = ActiveCampaignAccountCustomFieldTypeToQoreTypeMap[field.type] || 'any';

    if (fieldOptions?.length) {
      allowed_values = fieldOptions
        .filter((option) => option.field === field.id)
        .map((option) => ({
          value: option.value,
          display_name: option.label,
        }));
    }

    mappedOptions[field.id] = {
      display_name: field.title,
      ...(field.descript && { desc: field.descript }),
      ...(allowed_values?.length && {
        allowed_values,
      }),
      required,
      type,
    } as TQoreAppActionOption;
  });

  return mappedOptions;
};
