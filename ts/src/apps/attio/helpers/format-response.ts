import { omit } from 'lodash';
import { fetchAttioData } from './constants';
import { TAttioAttribute } from './get-object-properties';

type TAttioAttributeValue = {
  active_from: string;
  active_until: string | null;
  created_by_actor: {
    type: string;
    id: string;
  };
  value?: string;
  option?: {
    id: {
      option_id: string;
    };
    title: string;
  };
  status?: {
    id: {
      status_id: string;
    };
    title: string;
    celebration_enabled: boolean;
  };
  attribute_type: string;
};

type TAttioRecordAttributes = {
  id: {
    workspace_id: string;
    object_id: string;
    record_id: string;
  };
  created_at: string;
  values: Record<string, TAttioAttributeValue[]>;
};

type TAttioEntryAttributes = {
  id: {
    workspace_id: string;
    list_id: string;
    entry_id: string;
  };
  parent_record_id: string;
  parent_object: string;
  created_at: string;
  entry_values: Record<string, TAttioAttributeValue[]>;
};

type TAttioResponse = {
  data:
    | TAttioRecordAttributes
    | TAttioRecordAttributes[]
    | TAttioEntryAttributes
    | TAttioEntryAttributes[];
};

type TFormattedAttributes = Record<string, any>;

interface TFormattedRecord extends TFormattedAttributes {
  id: string;
  created_at: string;
}

const sanitizeAttributeValue = (attributeValue: TAttioAttributeValue | undefined) => {
  if (!attributeValue) {
    return null;
  }

  if (attributeValue.value) {
    return attributeValue.value;
  }

  if (attributeValue.option) {
    return {
      id: attributeValue.option.id.option_id,
      title: attributeValue.option.title,
    };
  }

  if (attributeValue.status) {
    return {
      status_id: attributeValue.status.id.status_id,
      title: attributeValue.status.title,
      celebration_enabled: attributeValue.status.celebration_enabled,
    };
  }

  return omit(attributeValue, [
    'created_by_actor',
    'attribute_type',
    'active_from',
    'active_until',
  ]);
};

const processRecord = (
  record: TAttioRecordAttributes | TAttioEntryAttributes,
  objectAttributes: TAttioAttribute[],
  target: 'objects' | 'lists' = 'objects'
): TFormattedRecord => {
  let formattedRecordId: string;

  if (target === 'objects' && 'record_id' in record?.id) {
    formattedRecordId = record.id.record_id;
  } else if (target === 'lists' && 'entry_id' in record?.id) {
    formattedRecordId = record.id.entry_id;
  }

  const formattedRecord: TFormattedRecord = {
    id: formattedRecordId!,
    created_at: record.created_at,
  };

  if (target === 'lists' && 'parent_record_id' in record) {
    formattedRecord.parent_record_id = record.parent_record_id;
    formattedRecord.parent_object = record.parent_object;
  }

  const values =
    target === 'lists'
      ? 'entry_values' in record
        ? record.entry_values
        : {}
      : 'values' in record
        ? record.values
        : {};

  Object.entries(values).forEach(([key, value]) => {
    if (key === 'record_id' || key === 'entry_id') return;

    const attribute = objectAttributes.find((attr) => attr.api_slug === key);

    if (attribute?.is_multiselect) {
      formattedRecord[key] = value.map(sanitizeAttributeValue).filter(Boolean);
    } else {
      formattedRecord[key] = value.length ? sanitizeAttributeValue(value[0]) : null;
    }
  });

  return formattedRecord;
};

export const formatAttioResponse = async (
  response: TAttioResponse,
  target: 'objects' | 'lists',
  targetId: string,
  token: string
): Promise<TFormattedRecord | TFormattedRecord[]> => {
  const objectAttributes = await fetchAttioData<TAttioAttribute>({
    path: `${target}/${targetId}/attributes`,
    token,
  });

  if (Array.isArray(response.data)) {
    return response.data.map((record) => processRecord(record, objectAttributes, target));
  } else {
    return processRecord(response.data, objectAttributes, target);
  }
};
