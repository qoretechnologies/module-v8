import {
  IQoreTypeObjectNonList,
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
} from '@qoretechnologies/ts-toolkit';
import { HUBSPOT_TO_QORE_TYPE_MAPPING } from './get-object-properties';
import { fetchHubspotObjectProperties } from './object-properties-allowed-values';

type TCreateHubspotGetDynamicEventInfoTypeOptions = {
  object: string;
  defaultProperties: IQoreTypeObjectNonList;
};

export const hubspotBaseEventInfoType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    archived: { type: 'boolean' },
    properties: {
      type: {
        type: 'hash',
        fields: {
          createdate: {
            type: 'string',
          },
          hs_object_id: {
            type: 'string',
          },
        },
      },
    },
  },
} satisfies IQoreTypeObjectNonList;

export const createHubspotGetDynamicEventInfoType = ({
  object,
  defaultProperties,
}: TCreateHubspotGetDynamicEventInfoTypeOptions): TQoreGetDynamicTypeFunction => {
  return async (context) => {
    const token = context?.conn_opts?.token;
    const additionalProperties = context?.opts?.additionalProperties;
    const eventInfoType = structuredClone(hubspotBaseEventInfoType);

    if (!token || !additionalProperties?.length) {
      eventInfoType.fields.properties.type.fields = {
        ...eventInfoType.fields.properties.type.fields,
        ...defaultProperties.fields,
      };

      return eventInfoType;
    }

    try {
      const properties = await fetchHubspotObjectProperties(object, token);

      const newObjectProperties = {} satisfies Record<string, TQoreAppActionOption>;

      properties.forEach((property) => {
        if (additionalProperties.includes(property.name)) {
          // @ts-expect-error - TS doesn't recognize the mapped type
          newObjectProperties[property.name] = {
            type: HUBSPOT_TO_QORE_TYPE_MAPPING[property.type] || 'auto',
            display_name: property.label,
            desc: property.description,
          };
        }
      });

      eventInfoType.fields.properties.type.fields = {
        ...eventInfoType.fields!.properties.type.fields,
        ...newObjectProperties,
      };

      return eventInfoType;
    } catch (error) {
      eventInfoType.fields.properties.type.fields = {
        ...eventInfoType.fields.properties.type.fields,
        ...defaultProperties.fields,
      };

      return eventInfoType;
    }
  };
};

export const getHubspotCustomObjectEventInfoType: TQoreGetDynamicTypeFunction = (context) => {
  const object = context?.opts?.object;

  if (!object) {
    return hubspotBaseEventInfoType;
  }

  return createHubspotGetDynamicEventInfoType({
    object,
    defaultProperties: hubspotBaseEventInfoType.fields!.properties.type,
  })(context);
};
