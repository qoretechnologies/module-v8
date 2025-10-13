import {
  TCustomConnOptions,
  TQoreAnyType,
  TQoreAppActionOption,
  TQoreGetAllowedValuesFunction,
  TQoreGetDynamicTypeFunction,
  TQoreOptions,
  TQoreType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { FirestoreError, getFirestoreErrorMessage } from '../constants';
import { firestoreApiClient, firestoreValueToJs, TFirestoreDocument } from './constants';

type TFirestoreField = {
  name: string;
  type: string;
  elementType?: string | Pick<TFirestoreField, 'type' | 'elementType' | 'fields'>;
  fields?: Record<string, TFirestoreField>;
  isNullable: boolean;
  sampleValue?: any;
};

const FirestoreTypeToQoreTypeMap: Record<string, TQoreType> = {
  stringValue: 'string',
  integerValue: 'integer',
  doubleValue: 'number',
  booleanValue: 'boolean',
  timestampValue: 'date',
  nullValue: 'string',
  bytesValue: 'string',
  referenceValue: 'string',
  geoPointValue: {
    type: 'hash',
    fields: {
      latitude: { type: 'number' },
      longitude: { type: 'number' },
    },
  },
  arrayValue: 'list',
  mapValue: 'hash',
};

export const getFirestoreCollectionFields = async (options: {
  token: string;
  projectId: string;
  collectionPath: string;
  sampleSize?: number;
}): Promise<TFirestoreField[]> => {
  try {
    const { projectId, token, collectionPath, sampleSize = 10 } = options;

    const basePath = `projects/${projectId}/databases/(default)/documents`;
    const collectionId = collectionPath.split('/').pop();

    const response = await firestoreApiClient<any[]>({
      token,
      path: `${basePath}:runQuery`,
      method: 'POST',
      body: {
        structuredQuery: {
          from: [{ collectionId }],
          limit: sampleSize,
        },
      },
    });

    const documents = response.filter((item) => item && item.document);

    if (documents.length === 0) {
      throw new Error(`No documents found in collection '${collectionPath}'`);
    }

    const fieldMap = new Map<string, TFirestoreField>();

    documents.forEach((item: any) => {
      const doc: TFirestoreDocument = item.document;

      const getTypeData = (
        field: any
      ): Pick<TFirestoreField, 'type' | 'elementType' | 'fields'> => {
        const firestoreType = Object.keys(field)[0];

        let elementType:
          | string
          | undefined
          | Pick<TFirestoreField, 'type' | 'elementType' | 'fields'>;
        let fields: Record<string, any> | undefined;
        if (firestoreType === 'arrayValue' && field.arrayValue?.values?.[0]) {
          const firstElement = field.arrayValue.values[0];
          elementType = getTypeData(firstElement);
        }
        if (firestoreType === 'mapValue' && field.mapValue?.fields) {
          fields = Object.entries(field.mapValue.fields).reduce(
            (acc, [k, v]) => {
              acc[k] = getTypeData(v);
              return acc;
            },
            {} as Record<string, any>
          );
        }

        return { type: firestoreType, elementType, fields };
      };

      if (doc.fields) {
        Object.entries(doc.fields).forEach(([fieldName, fieldValue]: [string, any]) => {
          const existingField = fieldMap.get(fieldName);

          const fieldData = getTypeData(fieldValue);

          if (!existingField) {
            fieldMap.set(fieldName, {
              name: fieldName,
              ...fieldData,
              isNullable: fieldData.type === 'nullValue',
              sampleValue: firestoreValueToJs(fieldValue),
            });
          } else {
            if (fieldData.type === 'nullValue') {
              existingField.isNullable = true;
            }
          }
        });
      }
    });

    return Array.from(fieldMap.values());
  } catch (error) {
    throw new FirestoreError(`Failed to get collection fields: ${getFirestoreErrorMessage(error)}`);
  }
};

const buildFirestoreFieldsType = (
  fields: TFirestoreField[],
  includeOptionExtras = false
): TQoreOptions => {
  const getType = (field: TFirestoreField): any => {
    let type: TQoreType = FirestoreTypeToQoreTypeMap[field.type] || 'string';

    if (field.type === 'arrayValue') {
      if (typeof field.elementType === 'string') {
        type = {
          type: 'list',
          element_type: FirestoreTypeToQoreTypeMap[field.elementType || 'stringValue'] || 'string',
        };
      } else if (typeof field.elementType === 'object') {
        if (!field.elementType.fields) {
          type = {
            type: 'list',
            element_type: FirestoreTypeToQoreTypeMap[field.elementType.type] || 'string',
          };
        } else {
          type = {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: Object.entries(field.elementType.fields).reduce(
                (acc, [k, v]) => {
                  acc[k] = getType(v);
                  return acc;
                },
                {} as Record<string, TQoreAppActionOption>
              ),
            },
          };
        }
      }
    }

    if (field.type === 'mapValue') {
      type = {
        type: 'hash',
        fields: Object.entries(field.fields || {}).reduce(
          (acc, [k, v]) => {
            acc[k] = getType(v);
            return acc;
          },
          {} as Record<string, TQoreAppActionOption>
        ),
      };
    }

    return type;
  };

  return fields.reduce((acc, field) => {
    const type = getType(field);
    acc[field.name] = {
      type: type as TQoreAnyType,
      display_name: humanizeNameTitle(field.name),
      ...(includeOptionExtras
        ? {
            allowed_values_creatable: true,
            preselected: false,
          }
        : {}),
      ...(field.sampleValue !== undefined &&
        field.sampleValue !== null &&
        typeof field.sampleValue !== 'object' && { desc: `Sample: ${field.sampleValue}` }),
    };
    return acc;
  }, {} as TQoreOptions);
};

const getFirestoreFieldsCommon = async (
  context: any,
  includeOptionExtras = false
): Promise<ReturnType<TQoreGetDynamicTypeFunction>> => {
  const { token, collection_path, project_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['project_id', 'collection_path'],
    ErrorClass: FirestoreError,
  });

  const fields = await getFirestoreCollectionFields({
    token,
    projectId: project_id,
    collectionPath: collection_path,
  });

  return {
    type: 'hash',
    fields: buildFirestoreFieldsType(fields, includeOptionExtras),
  };
};

export const getFirestoreCollectionFieldOptions: TQoreGetDynamicTypeFunction = async (context) =>
  getFirestoreFieldsCommon(context, true);

export const getFirestoreCollectionFieldsResponseType: TQoreGetDynamicTypeFunction = async (
  context
) => getFirestoreFieldsCommon(context, false);

export const getFirestoreCollectionFieldAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, collection_path, project_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['project_id', 'collection_path'],
    ErrorClass: FirestoreError,
  });

  const fields = await getFirestoreCollectionFields({
    token,
    projectId: project_id,
    collectionPath: collection_path,
  });

  const allowedValues = fields.map((field) => {
    let qoreType = FirestoreTypeToQoreTypeMap[field.type] || 'string';

    if (typeof qoreType === 'object') {
      qoreType = qoreType.type;
    }

    return {
      value: field.name,
      display_name: field.name,
      desc: `Type: ${qoreType}${field.sampleValue !== undefined && field.sampleValue !== null && typeof field.sampleValue !== 'object' ? `\nSample: ${field.sampleValue}` : ''}`,
    };
  });

  return allowedValues;
};
