import {
  IQoreAllowedValue,
  IQoreTypeObjectNonList,
  QorusRequest,
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
  TQoreAppActionOption,
  TQoreAppActionWithEventOrWebhookEventInfo,
  TQoreGetDynamicTypeFunction,
  TQoreTypeObject,
  TWebhookDeregisterFunction,
  TWebhookRegisterFunction,
} from '@qoretechnologies/ts-toolkit';
import { pipedriveApiClient } from '../helpers/client';

type TPipedriveWebhookObjectType =
  | 'activity'
  | 'deal'
  | 'lead'
  | 'note'
  | 'organization'
  | 'person'
  | 'pipeline'
  | 'product'
  | 'stage'
  | 'user';

export const pipedriveActionAllowedValues = [
  {
    value: 'create',
    display_name: 'Created',
    desc: 'Triggered when a new activity is created',
  },
  {
    value: 'change',
    display_name: 'Change',
    desc: 'Triggered when an existing activity is changed',
  },
  {
    value: 'delete',
    display_name: 'Deleted',
    desc: 'Triggered when an existing activity is deleted',
  },
  {
    value: '*',
    display_name: 'Any',
    desc: 'Triggered when any activity is created, changed, or deleted',
  },
] satisfies IQoreAllowedValue[];

export type TPipedriveWebhookEventAction = 'create' | 'change' | 'delete' | '*';

type TPipedriveWebhook = {
  status: 'string';
  success: boolean;
  data: {
    id: number;
  };
};

export const registerPipedriveWebhook = async (options: {
  token: string;
  url: string;
  action: string;
  objectType: string;
}) => {
  const { token, url, action, objectType } = options;

  try {
    const response = await QorusRequest.post<{ data: TPipedriveWebhook }>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        path: '/v1/webhooks',
        data: {
          subscription_url: url,
          event_action: action,
          event_object: objectType,
        },
      },
      { endpointId: 'Pipedrive', url: 'https://api.pipedrive.com' }
    );

    const responseData = response?.data;

    if (!responseData?.success) {
      throw new Error(`Failed to register pipedrive webhook`);
    }

    return { webhook: responseData.data };
  } catch (error) {
    throw new Error(`Failed to register pipedrive webhook: ${error.message}`);
  }
};

export const createPipedriveWebhookRegisterFunction = (
  objectType: TPipedriveWebhookObjectType,
  action: TPipedriveWebhookEventAction
): TWebhookRegisterFunction<TCustomConnOptions> => {
  return async (context, url) => {
    const token = context.conn_opts?.token;

    const missing_values: string[] = [];

    if (!url) missing_values.push('url');
    if (!token) missing_values.push('token');

    if (missing_values.length) {
      throw new Error(
        `All of the following [${missing_values.join(', ')}] are required to register pipedrive webhook`
      );
    }

    return await registerPipedriveWebhook({ token: token!, url, objectType, action });
  };
};

export const deregisterPipedriveWebhook: TWebhookDeregisterFunction<TCustomConnOptions> = async (
  context,
  _url,
  regInfo: { webhook: TPipedriveWebhook['data'] }
) => {
  const token = context.conn_opts?.token;

  if (!token) {
    throw new Error(`Token is required to deregister pipedrive webhook`);
  }

  try {
    await QorusRequest.deleteReq(
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        path: `/v1/webhooks/${regInfo.webhook.id}`,
      },
      {
        endpointId: 'Pipedrive',
        url: `https://api.pipedrive.com`,
      }
    );
  } catch (error) {
    throw new Error(`Failed to deregister pipedrive webhook: ${error.message}`);
  }
};

export const getPipedriveEventInfoType = (
  dataType: TQoreAppActionOption | null,
  previousDataType: TQoreAppActionOption | null
): TQoreAppActionWithEventOrWebhookEventInfo => {
  return {
    desc: 'Object state change with metadata and both states (new and previous)',
    type: {
      type: 'hash',
      fields: {
        meta: {
          type: {
            type: 'hash',
            fields: {
              action: {
                type: 'string',
              },
              entity: {
                type: 'string',
              },
              company_id: {
                type: 'string',
              },
              correlation_id: {
                type: 'string',
              },
              entity_id: {
                type: 'string',
              },
              id: {
                type: 'string',
              },
              is_bulk_edit: {
                type: 'boolean',
              },
              timestamp: {
                type: 'string',
              },
              type: {
                type: 'string',
              },
              user_id: {
                type: 'string',
              },
              version: {
                type: 'string',
              },
              webhook_id: {
                type: 'string',
              },
              webhook_owner_id: {
                type: 'string',
              },
              attempt: {
                type: 'int',
              },
              host: {
                type: 'string',
              },
            },
          },
        },
        ...(dataType && { data: dataType }),
        ...(previousDataType && { previous: previousDataType }),
      },
    },
  };
};

export const createPipedriveGetDynamicTypeFunction = (
  dataType: TQoreAppActionOption
): TQoreGetDynamicTypeFunction<TCustomConnOptions> => {
  return (context) => {
    const action = context?.opts?.action as TPipedriveWebhookEventAction;

    if (action === 'change') {
      return getPipedriveEventInfoType(dataType, dataType).type;
    } else if (action === 'delete') {
      return getPipedriveEventInfoType(null, dataType).type;
    } else {
      return getPipedriveEventInfoType(dataType, null).type;
    }
  };
};

export const filterObjectByType = (
  obj: Record<string, any>,
  typeDefinition: TQoreAppActionOption
): Record<string, any> => {
  if (
    !obj ||
    !typeDefinition?.type ||
    (typeof typeDefinition.type !== 'object' && !('fields' in typeDefinition))
  ) {
    return obj;
  }

  const result: Record<string, any> = {};
  const fields = (typeDefinition.type as IQoreTypeObjectNonList).fields;

  for (const fieldName in fields) {
    if (obj.hasOwnProperty(fieldName)) {
      const fieldDef = fields[fieldName];
      const fieldDefType = fields[fieldName].type as TQoreTypeObject;

      if (
        typeof obj[fieldName] === 'object' &&
        obj[fieldName] !== null &&
        obj[fieldName].hasOwnProperty('value')
      ) {
        result[fieldName] = obj[fieldName].value;
      } else if (fieldDefType?.type === 'hash' && fieldDefType?.fields) {
        result[fieldName] = filterObjectByType(obj[fieldName], fieldDef);
      } else if (fieldDefType.type === 'list' && Array.isArray(obj[fieldName])) {
        const elementType = fieldDefType.element_type;
        result[fieldName] =
          typeof elementType === 'object' && elementType?.type === 'hash'
            ? obj[fieldName].map((item: any) => filterObjectByType(item, { type: elementType }))
            : [...obj[fieldName]];
      } else {
        result[fieldName] = obj[fieldName];
      }
    }
  }

  return result;
};

export const createGetPipedriveExampleEventDataFunction = (
  objectType: string,
  dataType: TQoreAppActionOption
) => {
  return async (
    context: TQoreAppActionFunctionContext<TCustomConnOptions>
  ): Promise<Record<string, any>> => {
    const action = context.opts?.action as TPipedriveWebhookEventAction;
    const token = context.conn_opts?.token;

    if (!token) {
      throw new Error(`Token is required to get pipedrive example event data`);
    }

    try {
      const records = await pipedriveApiClient<Record<string, any>[]>({
        method: 'GET',
        path: `v1/${objectType}`,
        token: token!,
        params: {
          limit: '1',
        },
        object: 'data',
      });

      const object = records[0];

      if (!object) {
        throw new Error('No data found');
      }

      const formatted = filterObjectByType(object, dataType);

      return {
        meta: {
          action,
          company_id: 1,
          correlation_id: 1,
          entity_id: object.id || 1,
          entity: objectType,
          id: object.id || 1,
          is_bulk_edit: false,
          timestamp: new Date().toISOString(),
          type: 'event',
          user_id: object.user_id || 1,
          version: '2.0',
          webhook_id: 1,
          webhook_owner_id: 1,
          attempt: 1,
          host: 'https://api.pipedrive.com',
        },
        data: action === 'delete' ? {} : formatted,
        previous: action === 'change' ? formatted : {},
      };
    } catch (error) {
      throw new Error(`Failed to get pipedrive ${objectType} example event data: ${error.message}`);
    }
  };
};
