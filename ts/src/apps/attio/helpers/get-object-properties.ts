import {
  IQoreAllowedValue,
  TQoreAnyType,
  TQoreAppActionOption,
  TQoreOptions,
  TQoreType,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';
import { ATTIO_TO_QORUS_TYPE_MAP } from './attio-types-map';
import { fetchAttioData, getAttioAllowedValues } from './constants';

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
  };
  config: {
    record_reference: {
      allowed_object_ids: string[];
    };
  };
};

export type TAttioTargetRecord = {
  values: {
    record_id: {
      value: string;
    }[];
    name: {
      value?: string;
      full_name?: string;
    }[];
  };
};

const getAllowedValuesConfig = (
  type: TQoreType | TQoreAnyType,
  allowed_values: IQoreAllowedValue<any>[]
) => {
  const isListType = type === 'list' || (typeof type === 'object' && type.type === 'list');

  if (isListType) {
    return {
      element_allowed_values: allowed_values,
      element_allowed_values_creatable: true,
    };
  }

  return {
    allowed_values,
    allowed_values_creatable: true,
  };
};

export const getAttioObjectAttributes = async (
  object: string,
  token: string
): Promise<TAttioAttribute[]> => {
  const attributes = await fetchAttioData<TAttioAttribute>({
    path: `objects/${object}/attributes`,
    token,
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
  const attributes = await fetchAttioData<TAttioAttribute>({
    path: `lists/${list}/attributes`,
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

  await Promise.all(
    filteredAttributes.map(async (attribute) => {
      qoreOptions[attribute.api_slug] = await mapAttioAttributeToQoreOption(attribute, token);
    })
  );

  return qoreOptions;
};

export const mapAttioAttributeToQoreOption = async (
  attribute: TAttioAttribute,
  token: string
): Promise<TQoreAppActionOption> => {
  const { title, description, type, is_required } = attribute;
  let allowed_values: IQoreAllowedValue<string>[] | undefined;

  const qorusType = ATTIO_TO_QORUS_TYPE_MAP[type];
  let qorusFixedType: TQoreType | TQoreTypeObject = qorusType;
  if (qorusType === 'hash') {
    qorusFixedType = {
      type: 'hash',
    };
  } else if (qorusType === 'list') {
    qorusFixedType = {
      type: 'list',
      element_type: 'any',
    };
  }

  if (attribute.is_multiselect) {
    qorusFixedType = {
      type: 'list',
      element_type: qorusFixedType,
    };
  }

  if (attribute.type === 'select') {
    allowed_values = await getAttioAllowedValues<
      {
        id: { option_id: string };
        title: string;
        is_archived: boolean;
      },
      string
    >({
      token,
      path: `objects/${attribute.id.object_id}/attributes/${attribute.id.attribute_id}/options`,
      mapItemToAllowedValue: (item) => ({
        display_name: item.title,
        value: item.id.option_id,
      }),
    });
  }

  if (type === 'record-reference') {
    const targetAllowedValues = await getAttioAllowedValues<TAttioTargetRecord, string>({
      path: `objects/${attribute.relationship.id.object_id}/records/query`,
      token,
      method: 'POST',
      mapItemToAllowedValue: (item) => ({
        display_name:
          item.values.name[0].value ||
          item.values.name[0].full_name ||
          item.values.record_id[0].value,
        value: item.values.record_id[0].value,
      }),
    });

    const referenceFields = {
      target_object: {
        display_name: 'Target Object',
        on_change: ['refetch'],
        type: 'string',
        required: true,
        allowed_values_creatable: true,
        default_value: attribute.relationship.id.object_id,
      },
      target_record_id: {
        display_name: 'Target Record ID',
        type: 'string',
        required: true,
        allowed_values_creatable: true,
        allowed_values: targetAllowedValues,
        default_value: targetAllowedValues[0]?.value,
      },
    } satisfies TQoreOptions;

    if (attribute.is_multiselect) {
      qorusFixedType = {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: referenceFields,
        },
      };
    } else {
      qorusFixedType = {
        type: 'hash',
        preselected: false,
        fields: referenceFields,
      };
    }
  }

  const result = {
    display_name: title,
    short_desc: description || title,
    required: is_required,
    type: qorusFixedType as TQoreAnyType,
  };

  if (allowed_values) Object.assign(result, getAllowedValuesConfig(qorusFixedType, allowed_values));

  return result;
};
