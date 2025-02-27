import {
  IQoreAllowedValue,
  IQoreTypeObjectNonList,
  QorusRequest,
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
  TQoreSimpleType,
  TQoreType,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { TFetchHubspotObjectPropertiesOptions } from './object-properties-allowed-values';

type THubspotObjectProperty = {
  name: 'string';
  label: 'string';
  description: 'string';
  type: 'string';
  formField: boolean;
  options: {
    label: 'string';
    value: 'string';
  }[];
  modificationMetadata: {
    archivable: boolean;
    readOnlyDefinition: boolean;
    readOnlyValue: boolean;
  };
};

const hubspotToQoreTypeMap: Record<string, TQoreSimpleType> = {
  bool: 'boolean',
  enumeration: 'softstring',
  date: 'date',
  datetime: 'date',
  number: 'softnumber',
  string: 'softstring',
};

const fetchHubspotObjectEditableProperties = async (
  options: TFetchHubspotObjectPropertiesOptions
): Promise<THubspotObjectProperty[]> => {
  const token = options.token;
  const object = options.object;

  if (!token || !object) {
    throw new Error(`The token and object are required to fetch Hubspot object properties`);
  }

  const response = await QorusRequest.get<{
    data: { results: THubspotObjectProperty[] };
  }>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/crm/v3/properties/${object}`,
    },
    {
      url: `https://api.hubapi.com`,
      endpointId: 'Hubspot',
    }
  );

  const responseData = response?.data;

  if (!responseData || !responseData.results) {
    throw new Error('No data found for hubspot object properties');
  }

  return responseData.results.filter((property) => !property.modificationMetadata.readOnlyValue);
};

export const getHubspotPropertyOptionFunction = ({
  defaultProperties,
  object,
}: {
  defaultProperties: IQoreTypeObjectNonList['fields'];
  object: string;
}): TQoreGetDynamicTypeFunction => {
  return async (context): Promise<TQoreType> => {
    const additionalProperties: IQoreTypeObjectNonList['fields'] = {};
    try {
      const token = context?.conn_opts?.token;

      if (!token) {
        throw new Error(`The token is required to get Hubspot ${object} properties`);
      }
      const properties = await fetchHubspotObjectEditableProperties({
        token,
        object,
      });

      properties.forEach((property) => {
        // @ts-expect-error - TS doesn't recognize the mapped type
        additionalProperties[property.name] = {
          type: hubspotToQoreTypeMap[property.type] || 'auto',
          display_name: property.label,
          short_desc: property.description,
          ...(property.options?.length
            ? {
                allowed_values_creatable: true,
                allowed_values: property.options.map(
                  (option): IQoreAllowedValue<string> => ({
                    display_name: option.label,
                    value: option.value,
                  })
                ),
              }
            : {}),
          required: false,
        };
      });
    } catch (error) {
      Debugger.log(`Error while getting hubspot ${object} properties`, error);
    } finally {
      if (Object.keys(additionalProperties).length && defaultProperties) {
        Object.keys(defaultProperties).forEach((key) => {
          if (!additionalProperties[key]) {
            return;
          }
          const defaultProperty = defaultProperties[key];
          const additionalProperty = additionalProperties[key] as TQoreAppActionOption;

          additionalProperties[key] = {
            ...additionalProperty,
            required: defaultProperty.required,
          };
        });
      }

      return {
        type: 'hash',
        fields: {
          ...defaultProperties,
          ...additionalProperties,
        },
      };
    }
  };
};

export const getHubspotContactPropertiesType: TQoreGetDynamicTypeFunction =
  getHubspotPropertyOptionFunction({
    defaultProperties: {
      email: {
        type: 'string',
        display_name: 'Email',
        short_desc: 'The email address of the contact',
        required: true,
      },
      firstname: {
        type: 'string',
        display_name: 'First Name',
        short_desc: 'The first name of the contact',
        required: true,
      },
      lastname: {
        type: 'string',
        display_name: 'Last Name',
        short_desc: 'The last name of the contact',
        required: true,
      },
    },
    object: 'contacts',
  });

export const getHubspotCompanyPropertiesType: TQoreGetDynamicTypeFunction =
  getHubspotPropertyOptionFunction({
    object: 'companies',
    defaultProperties: {
      name: {
        type: 'string',
        display_name: 'Name',
        short_desc: 'The name of the company',
        required: true,
      },
      domain: {
        type: 'string',
        display_name: 'Domain',
        short_desc: 'The domain of the company',
        required: true,
      },
    },
  });

export const getHubspotDealPropertiesType: TQoreGetDynamicTypeFunction =
  getHubspotPropertyOptionFunction({
    object: 'deals',
    defaultProperties: {
      dealname: {
        type: 'string',
        display_name: 'Name',
        short_desc: 'The name of the deal',
        required: true,
      },
      dealstage: {
        type: 'softnumber',
        display_name: 'Stage',
        short_desc: 'The stage of the deal',
        required: true,
      },
      pipeline: {
        type: 'softstring',
        display_name: 'Pipeline',
        short_desc: 'The pipeline of the deal',
        required: true,
      },
      dealtype: {
        type: 'softstring',
        display_name: 'Type',
        short_desc: 'The type of the deal',
        required: true,
      },
      hs_priority: {
        type: 'softstring',
        display_name: 'Priority',
        short_desc: 'The priority of the deal',
        required: true,
      },
    },
  });

export const getHubspotLeadPropertiesType: TQoreGetDynamicTypeFunction =
  getHubspotPropertyOptionFunction({
    object: 'leads',
    defaultProperties: {
      hs_lead_name: {
        type: 'string',
        display_name: 'Name',
        short_desc: 'The name of the lead',
        required: true,
      },
      hs_pipeline: {
        type: 'softstring',
        display_name: 'Pipeline',
        short_desc: 'The pipeline of the lead',
        required: true,
      },
      hs_pipeline_stage: {
        type: 'softstring',
        display_name: 'Pipeline Stage',
        short_desc: 'The pipeline stage of the lead',
        required: true,
      },
      hs_lead_type: {
        type: 'softstring',
        display_name: 'Lead Type',
        short_desc: 'The lead type',
        required: true,
      },
      hs_lead_label: {
        type: 'softstring',
        display_name: 'Lead Label',
        short_desc: 'The lead label',
        required: true,
      },
    },
  });

export const getHubspotProductPropertiesType: TQoreGetDynamicTypeFunction =
  getHubspotPropertyOptionFunction({
    object: 'products',
    defaultProperties: {
      name: {
        type: 'string',
        display_name: 'Name',
        short_desc: 'The name of the product',
        required: true,
      },
      description: {
        type: 'string',
        display_name: 'Description',
        short_desc: 'The description of the product',
        required: true,
      },
      hs_product_type: {
        type: 'softstring',
        display_name: 'Product Type',
        short_desc: 'The type of the product',
        required: true,
      },
    },
  });

export const getHubspotTicketPropertiesType: TQoreGetDynamicTypeFunction =
  getHubspotPropertyOptionFunction({
    object: 'tickets',
    defaultProperties: {
      subject: {
        type: 'string',
        display_name: 'Subject',
        short_desc: 'The subject of the ticket',
        required: true,
      },
      hs_pipeline: {
        type: 'softstring',
        display_name: 'Pipeline',
        short_desc: 'The pipeline of the ticket',
        required: true,
      },
      hs_pipeline_stage: {
        type: 'softstring',
        display_name: 'Ticket status',
        short_desc: 'The status of the ticket',
        required: true,
      },
      content: {
        type: 'string',
        display_name: 'Content',
        short_desc: 'The content of the ticket',
        required: true,
      },
      hs_object_source: {
        type: 'softstring',
        display_name: 'Source',
        short_desc: 'The source of the ticket',
        required: true,
      },
      hs_ticket_priority: {
        type: 'softstring',
        display_name: 'Priority',
        short_desc: 'The priority of the ticket',
        required: true,
      },
    },
  });

export const getHubspotTicketPropertiesTypeOptional = getHubspotPropertyOptionFunction({
  object: 'tickets',
  defaultProperties: {},
});

export const getHubspotContactPropertiesTypeOptional: TQoreGetDynamicTypeFunction =
  getHubspotPropertyOptionFunction({
    defaultProperties: {},
    object: 'contacts',
  });

export const getHubspotCompanyPropertiesTypeOptional: TQoreGetDynamicTypeFunction =
  getHubspotPropertyOptionFunction({
    object: 'companies',
    defaultProperties: {},
  });

export const getHubspotDealPropertiesTypeOptional: TQoreGetDynamicTypeFunction =
  getHubspotPropertyOptionFunction({
    object: 'deals',
    defaultProperties: {},
  });

export const getHubspotLeadPropertiesTypeOptional: TQoreGetDynamicTypeFunction =
  getHubspotPropertyOptionFunction({
    object: 'leads',
    defaultProperties: {},
  });

export const getHubspotProductPropertiesTypeOptional: TQoreGetDynamicTypeFunction =
  getHubspotPropertyOptionFunction({
    object: 'products',
    defaultProperties: {},
  });

export const getHubspotUserPropertiesTypeOptional: TQoreGetDynamicTypeFunction =
  getHubspotPropertyOptionFunction({
    object: 'users',
    defaultProperties: {},
  });

export const getHubspotCustomObjectPropertiesType: TQoreGetDynamicTypeFunction = async (
  context
): Promise<TQoreType> => {
  const additionalProperties: IQoreTypeObjectNonList['fields'] = {};
  try {
    const token = context?.conn_opts?.token;
    const objectType = context?.opts?.objectType;

    if (!token || !objectType) {
      throw new Error(
        `The token and object type are required to get Hubspot custom object properties`
      );
    }
    const properties = await fetchHubspotObjectEditableProperties({
      token,
      object: objectType,
    });

    properties.forEach((property) => {
      // @ts-expect-error - TS doesn't recognize the mapped type
      additionalProperties[property.name] = {
        type: hubspotToQoreTypeMap[property.type] || 'auto',
        display_name: property.label,
        short_desc: property.description,
        ...(property.options?.length
          ? {
              allowed_values_creatable: true,
              allowed_values: property.options.map(
                (option): IQoreAllowedValue<string> => ({
                  display_name: option.label,
                  value: option.value,
                })
              ),
            }
          : {}),
        required: false,
      };
    });
  } catch (error) {
    Debugger.log(`Error while getting hubspot custom object properties`, error);
  } finally {
    return Object.keys(additionalProperties).length
      ? {
          type: 'hash',
          fields: additionalProperties,
        }
      : {
          type: 'hash',
        };
  }
};
