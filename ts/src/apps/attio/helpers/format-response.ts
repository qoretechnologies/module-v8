import { omit } from 'lodash';
import { fetchAttioData } from './constants';
import { TAttioAttribute } from './get-object-properties';

type TAttioRecordAttributeValue = {
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
  attribute_type: string;
};

type TAttioRecordAttributes = {
  id: {
    workspace_id: string;
    object_id: string;
    record_id: string;
  };
  created_at: string;
  values: Record<string, TAttioRecordAttributeValue[]>;
};

type TAttioResponse = {
  data: TAttioRecordAttributes | TAttioRecordAttributes[];
};

type TFormattedAttributes = Record<string, any>;

interface TFormattedRecord extends TFormattedAttributes {
  id: string;
  created_at: string;
}

const sanitizeAttributeValue = (attributeValue: TAttioRecordAttributeValue | undefined) => {
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

  return omit(attributeValue, [
    'created_by_actor',
    'attribute_type',
    'active_from',
    'active_until',
  ]);
};

const processRecord = (
  record: TAttioRecordAttributes,
  objectAttributes: TAttioAttribute[]
): TFormattedRecord => {
  const formattedRecord: TFormattedRecord = {
    id: record.id.record_id,
    created_at: record.created_at,
  };

  Object.entries(record.values).forEach(([key, value]) => {
    if (key === 'record_id') return;

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
    return response.data.map((record) => processRecord(record, objectAttributes));
  } else {
    return processRecord(response.data, objectAttributes);
  }
};
