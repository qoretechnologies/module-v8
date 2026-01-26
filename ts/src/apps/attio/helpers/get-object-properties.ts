import {
  IQoreAllowedValue,
  IQoreAppActionListOption,
  IQoreTypeObjectList,
  TQoreAnyType,
  TQoreAppActionOption,
  TQoreOptions,
  TQoreType,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';
import { ATTIO_TO_QORUS_TYPE_MAP } from './attio-types-map';
import { fetchAttioAllowedValues, fetchAttioPaginatedRecords } from './client';
import { getReferenceAllowedValuesFunction } from './get-reference-allowed-values';
import { getStatusAttributeAllowedValuesFunction } from './get-status-attribute-allowed-values';
import { getAttioWorkspaceMemberEmailAllowedValues } from './get-workspace-member-allowed-values';

export type TAttioAttribute = {
  id: {
    object_id: string;
    attribute_id: string;
  };
  title: string;
  description?: string;
  type: string;
  api_slug: string;
  is_writable: boolean;
  is_required: boolean;
  is_archived: boolean;
  is_unique: boolean;
  is_multiselect: boolean;
  default_value?: {
    type: string;
    template: string | (Record<string, string> & { attribute_type: string });
  };
  relationship: {
    id: {
      object_id: string;
    };
    object_slug: string;
  };
  config: {
    record_reference: {
      allowed_object_ids: string[];
    };
  };
};

type TAllowedValuesConfig = Partial<
  Pick<TQoreAppActionOption, 'get_allowed_values' | 'allowed_values_creatable'> &
    Pick<
      IQoreAppActionListOption<any>,
      'get_element_allowed_values' | 'element_allowed_values_creatable'
    >
>;

type TTypeAndAllowedValues = {
  type: TQoreType | TQoreTypeObject | IQoreTypeObjectList;
  allowedValuesConfig: TAllowedValuesConfig;
};

export type { TAttioTargetRecord } from './types';

export const getAttioObjectAttributes = async (
  object: string,
  token: string
): Promise<TAttioAttribute[]> => {
  const attributes = await fetchAttioPaginatedRecords<TAttioAttribute[], TAttioAttribute>({
    path: `objects/${object}/attributes`,
    token,
    object: 'data',
  });

  if (!attributes || !attributes.length) {
    throw new AttioError('Failed to get Attio object attributes');
  }

  return attributes;
};

export const getAttioListAttributes = async (
  list: string,
  token: string
): Promise<TAttioAttribute[]> => {
  const attributes = await fetchAttioPaginatedRecords<TAttioAttribute[], TAttioAttribute>({
    path: `lists/${list}/attributes`,
    object: 'data',
    token,
  });

  if (!attributes || !attributes.length) {
    throw new AttioError('Failed to get Attio list attributes');
  }

  return attributes;
};

export const getAttioAttributesAsQoreOptions = async (
  target: 'objects' | 'lists',
  targetId: string,
  token: string
) => {
  const attributes =
    target === 'objects'
      ? await getAttioObjectAttributes(targetId, token)
      : await getAttioListAttributes(targetId, token);

  const filteredAttributes = attributes.filter(
    (attribute) => attribute.is_writable && !attribute.is_archived
  );

  const qoreOptions: TQoreOptions = {};

  filteredAttributes.forEach((attribute) => {
    qoreOptions[attribute.api_slug] = mapAttioAttributeToQoreOption(attribute, token, target);
  });

  return qoreOptions;
};

const getBaseType = (type: string): TQoreType | TQoreTypeObject => {
  const qorusType = ATTIO_TO_QORUS_TYPE_MAP[type] || 'any';

  if (qorusType === 'hash') {
    return { type: 'hash' };
  }

  if (qorusType === 'list') {
    return { type: 'list', element_type: 'any' };
  }

  return qorusType;
};

const createSelectAllowedValuesFetcher = (
  token: string,
  target: 'objects' | 'lists',
  attribute: TAttioAttribute
) => {
  return async () => {
    return fetchAttioAllowedValues<{
      id: { option_id: string };
      title: string;
      is_archived: boolean;
    }>({
      token,
      path: `${target}/${attribute.id.object_id}/attributes/${attribute.id.attribute_id}/options`,
      mapItemToAllowedValue: (item) => ({
        display_name: item.title,
        value: item.id.option_id,
      }),
    });
  };
};

const buildSelectTypeConfig = (
  attribute: TAttioAttribute,
  token: string,
  target: 'objects' | 'lists'
): TTypeAndAllowedValues => {
  const baseType = getBaseType(attribute.type);
  const getAllowedValues = createSelectAllowedValuesFetcher(token, target, attribute);

  if (attribute.is_multiselect) {
    return {
      type: { type: 'list', element_type: baseType },
      allowedValuesConfig: { get_element_allowed_values: getAllowedValues },
    };
  }

  return {
    type: baseType,
    allowedValuesConfig: { get_allowed_values: getAllowedValues },
  };
};

const buildStatusTypeConfig = (
  attribute: TAttioAttribute,
  target: 'objects' | 'lists'
): TTypeAndAllowedValues => {
  const baseType = getBaseType(attribute.type);

  if (attribute.is_multiselect) {
    return {
      type: { type: 'list', element_type: baseType },
      allowedValuesConfig: {
        get_element_allowed_values: getStatusAttributeAllowedValuesFunction({
          type: target,
          target: attribute.id.object_id,
          attribute: attribute.id.attribute_id,
        }),
      },
    };
  }

  return {
    type: baseType,
    allowedValuesConfig: {
      get_allowed_values: getStatusAttributeAllowedValuesFunction({
        type: target,
        target: attribute.id.object_id,
        attribute: attribute.id.attribute_id,
      }),
    },
  };
};

const buildRecordReferenceTypeConfig = (attribute: TAttioAttribute): TTypeAndAllowedValues => {
  const { relationship, config } = attribute;
  const targetObject =
    relationship?.id?.object_id || config?.record_reference?.allowed_object_ids?.[0];
  const getReferenceAllowedValues = targetObject
    ? getReferenceAllowedValuesFunction(targetObject)
    : undefined;

  const targetObjectAllowedValues = buildTargetObjectAllowedValues(relationship, config);
  const referenceFields = buildReferenceFields(targetObjectAllowedValues);

  if (attribute.is_multiselect) {
    return {
      type: {
        type: 'list',
        element_type: { type: 'hash', fields: referenceFields },
      } as IQoreTypeObjectList,
      allowedValuesConfig: {
        element_allowed_values_creatable: true,
        get_element_allowed_values: getReferenceAllowedValues,
      },
    };
  }

  return {
    type: { type: 'hash', fields: referenceFields } as TQoreTypeObject,
    allowedValuesConfig: {
      allowed_values_creatable: true,
      get_allowed_values: getReferenceAllowedValues,
    },
  };
};

const buildTargetObjectAllowedValues = (
  relationship: TAttioAttribute['relationship'],
  config: TAttioAttribute['config']
): IQoreAllowedValue<string>[] => {
  if (relationship?.id?.object_id) {
    return [
      {
        value: relationship.id.object_id,
        display_name: relationship.object_slug,
      },
    ];
  }

  if (config?.record_reference?.allowed_object_ids?.length) {
    return config.record_reference.allowed_object_ids.map((objectId) => ({
      value: objectId,
      display_name: objectId,
    }));
  }

  return [];
};

const buildReferenceFields = (
  targetObjectAllowedValues: IQoreAllowedValue<string>[]
): TQoreOptions => ({
  target_object: {
    display_name: 'Target Object',
    on_change: ['refetch'],
    type: 'string',
    required: true,
    allowed_values_creatable: false,
    allowed_values: targetObjectAllowedValues,
  },
  target_record_id: {
    display_name: 'Target Record ID',
    type: 'string',
    required: true,
    allowed_values_creatable: true,
  },
});

const buildActorReferenceTypeConfig = (attribute: TAttioAttribute): TTypeAndAllowedValues => {
  if (attribute.is_multiselect) {
    return {
      type: { type: 'list', element_type: 'string' },
      allowedValuesConfig: {
        element_allowed_values_creatable: true,
        get_element_allowed_values: getAttioWorkspaceMemberEmailAllowedValues,
      },
    };
  }

  return {
    type: 'string',
    allowedValuesConfig: {
      allowed_values_creatable: true,
      get_allowed_values: getAttioWorkspaceMemberEmailAllowedValues,
    },
  };
};

const buildDefaultTypeConfig = (attribute: TAttioAttribute): TTypeAndAllowedValues => {
  const baseType = getBaseType(attribute.type);

  if (attribute.is_multiselect) {
    return {
      type: { type: 'list', element_type: baseType },
      allowedValuesConfig: {},
    };
  }

  return {
    type: baseType,
    allowedValuesConfig: {},
  };
};

const getTypeAndAllowedValuesConfig = (
  attribute: TAttioAttribute,
  token: string,
  target: 'objects' | 'lists'
): TTypeAndAllowedValues => {
  switch (attribute.type) {
    case 'select':
      return buildSelectTypeConfig(attribute, token, target);
    case 'status':
      return buildStatusTypeConfig(attribute, target);
    case 'record-reference':
      return buildRecordReferenceTypeConfig(attribute);
    case 'actor-reference':
      return buildActorReferenceTypeConfig(attribute);
    default:
      return buildDefaultTypeConfig(attribute);
  }
};

export const mapAttioAttributeToQoreOption = (
  attribute: TAttioAttribute,
  token: string,
  target: 'objects' | 'lists' = 'objects'
): TQoreAppActionOption => {
  const { title, description, is_required } = attribute;
  const { type, allowedValuesConfig } = getTypeAndAllowedValuesConfig(attribute, token, target);

  return {
    display_name: title,
    short_desc: description || title,
    required: is_required,
    type: type as TQoreAnyType,
    ...allowedValuesConfig,
  };
};
