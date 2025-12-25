import {
  IQoreAllowedValue,
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractFrontErrorMessage, FrontError } from '../constants';
import { frontApiClient } from './constants';

type TFrontCustomFieldType =
  | 'string'
  | 'boolean'
  | 'datetime'
  | 'number'
  | 'teammate'
  | 'inbox'
  | 'enum';

type TFrontCustomFieldResource =
  | 'account'
  | 'contact'
  | 'conversation'
  | 'inbox'
  | 'link'
  | 'teammate';

type TFrontCustomFieldEnumValue = {
  value: string;
  label: string;
};

type TFrontCustomField = {
  id: string;
  name: string;
  type: TFrontCustomFieldType;
  description?: string;
  values?: TFrontCustomFieldEnumValue[];
  _links?: {
    self: string;
  };
};

type TFrontCustomFieldsResponse = {
  _links?: {
    self: string;
  };
  _results: TFrontCustomField[];
};

const RESOURCE_TO_ENDPOINT: Record<TFrontCustomFieldResource, string> = {
  account: 'accounts/custom_fields',
  contact: 'contacts/custom_fields',
  conversation: 'conversations/custom_fields',
  inbox: 'inboxes/custom_fields',
  link: 'links/custom_fields',
  teammate: 'teammates/custom_fields',
};

export const getFrontCustomFields = async (options: {
  token: string;
  resource: TFrontCustomFieldResource;
}): Promise<TFrontCustomField[]> => {
  const { token, resource } = options;

  try {
    const endpoint = RESOURCE_TO_ENDPOINT[resource];

    const response = await frontApiClient<TFrontCustomFieldsResponse>({
      token,
      path: endpoint,
      method: 'GET',
    });

    return response._results || [];
  } catch (error) {
    throw new FrontError(
      `Failed to fetch Front ${resource} custom fields: ${extractFrontErrorMessage(error)}`
    );
  }
};

const mapFrontEnumValueToAllowedValue = (
  enumValue: TFrontCustomFieldEnumValue
): IQoreAllowedValue<string> => {
  return {
    value: enumValue.value,
    display_name: enumValue.label,
  };
};

export const mapFrontCustomFieldToQoreOption = (
  customField: TFrontCustomField,
  isForResponse = false
): TQoreAppActionOption => {
  const { type, name, description, values } = customField;
  const display_name = name;
  const short_desc = description;
  const allowed_values = values?.map(mapFrontEnumValueToAllowedValue);

  switch (type) {
    case 'string':
      return {
        type: 'string',
        display_name,
        ...(short_desc && { short_desc }),
      };
    case 'boolean':
      return {
        type: 'bool',
        display_name,
        ...(short_desc && { short_desc }),
      };
    case 'datetime':
      return {
        type: 'float',
        display_name,
        short_desc: short_desc || 'Unix timestamp (epoch)',
      };
    case 'number':
      return {
        type: 'integer',
        display_name,
        ...(short_desc && { short_desc }),
      };
    case 'teammate':
      return {
        type: 'string',
        display_name,
        short_desc: short_desc || 'Teammate email address',
      };
    case 'inbox':
      return {
        type: 'string',
        display_name,
        short_desc: short_desc || 'Inbox identifier',
      };
    case 'enum':
      return {
        type: 'string',
        display_name,
        ...(short_desc && { short_desc }),
        ...(allowed_values && !isForResponse && { allowed_values }),
      };
    default:
      return {
        type: 'any',
        display_name,
        ...(short_desc && { short_desc }),
      };
  }
};

export const getFrontCustomFieldDynamicTypeFunction =
  (resource: TFrontCustomFieldResource): TQoreGetDynamicTypeFunction =>
  async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      const customFields = await getFrontCustomFields({
        token,
        resource,
      });

      const fields: Record<string, TQoreAppActionOption> = {};

      customFields.forEach((field) => {
        fields[field.name] = mapFrontCustomFieldToQoreOption(field);
      });

      return {
        type: 'hash',
        fields,
      };
    } catch (error) {
      if (error instanceof FrontError) {
        throw error;
      }

      throw new FrontError(
        `Failed to fetch Front ${resource} custom field options: ${extractFrontErrorMessage(error)}`
      );
    }
  };

export const getFrontCustomFieldDynamicResponseTypeFunction =
  (resource: TFrontCustomFieldResource): TQoreGetDynamicTypeFunction =>
  async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      const customFields = await getFrontCustomFields({
        token,
        resource,
      });

      const fields: Record<string, TQoreAppActionOption> = {};

      customFields.forEach((field) => {
        fields[field.name] = mapFrontCustomFieldToQoreOption(field, true);
      });

      return {
        type: 'hash',
        fields,
      };
    } catch (error) {
      if (error instanceof FrontError) {
        throw error;
      }

      throw new FrontError(
        `Failed to fetch Front ${resource} custom field response type: ${extractFrontErrorMessage(error)}`
      );
    }
  };

export const getFrontAccountCustomFieldDynamicType =
  getFrontCustomFieldDynamicTypeFunction('account');
export const getFrontAccountCustomFieldDynamicResponseType =
  getFrontCustomFieldDynamicResponseTypeFunction('account');

export const getFrontContactCustomFieldDynamicType =
  getFrontCustomFieldDynamicTypeFunction('contact');
export const getFrontContactCustomFieldDynamicResponseType =
  getFrontCustomFieldDynamicResponseTypeFunction('contact');

export const getFrontConversationCustomFieldDynamicType =
  getFrontCustomFieldDynamicTypeFunction('conversation');
export const getFrontConversationCustomFieldDynamicResponseType =
  getFrontCustomFieldDynamicResponseTypeFunction('conversation');

export const getFrontInboxCustomFieldDynamicType = getFrontCustomFieldDynamicTypeFunction('inbox');
export const getFrontInboxCustomFieldDynamicResponseType =
  getFrontCustomFieldDynamicResponseTypeFunction('inbox');

export const getFrontLinkCustomFieldDynamicType = getFrontCustomFieldDynamicTypeFunction('link');
export const getFrontLinkCustomFieldDynamicResponseType =
  getFrontCustomFieldDynamicResponseTypeFunction('link');

export const getFrontTeammateCustomFieldDynamicType =
  getFrontCustomFieldDynamicTypeFunction('teammate');
export const getFrontTeammateCustomFieldDynamicResponseType =
  getFrontCustomFieldDynamicResponseTypeFunction('teammate');
