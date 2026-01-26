import {
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
  TQoreAppActionWithEventOrWebhookEventInfo,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { AttioError } from '../../constants';
import { attioApiClient } from '../../helpers/client';

export type TAttioObjectRecord = {
  id: {
    workspace_id: string;
    object_id: string;
    record_id: string;
  };
  values: {
    created_by: {
      created_by_actor: {
        type: string;
        id: string;
      };
    }[];
  };
};

export const getAttioObjectRecordEventEventInfo = (
  eventType: 'created' | 'updated' | 'deleted'
): TQoreAppActionWithEventOrWebhookEventInfo => ({
  desc: `Triggered when a record is ${eventType} in an Attio object.`,
  type: {
    type: 'hash',
    fields: {
      event_type: { type: 'string' },
      id: {
        type: {
          type: 'hash',
          fields: {
            workspace_id: { type: 'string' },
            object_id: { type: 'string' },
            record_id: { type: 'string' },
          },
        },
      },
      actor: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            id: { type: 'string' },
          },
        },
      },
    },
  },
});

export const createAttioObjectRecordExampleEventData =
  (
    eventType: 'created' | 'updated' | 'deleted'
  ): ((
    context: TQoreAppActionFunctionContext<TCustomConnOptions, TQoreOptions>
  ) => Promise<Record<string, any>>) =>
  async (context) => {
    const { token, object } = getQoreContextRequiredValues({
      context,
      optionFields: ['object'],
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    try {
      const records = await attioApiClient<TAttioObjectRecord[]>({
        path: `objects/${object}/records/query`,
        method: 'POST',
        object: 'data',
        token,
        body: {
          limit: 1,
        },
      });

      const record = records[0];

      if (!record) {
        throw new Error('No records found for the specified object');
      }

      return {
        event_type: `record.${eventType}`,
        id: {
          workspace_id: record.id.workspace_id,
          object_id: record.id.object_id,
          record_id: record.id.record_id,
        },
        actor: {
          type: record.values.created_by[0].created_by_actor.type,
          id: record.values.created_by[0].created_by_actor.id,
        },
      };
    } catch (error) {
      throw new AttioError(`Failed to get example event data ${error}`);
    }
  };
