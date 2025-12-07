import {
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
  TQoreAppActionWithEventOrWebhookEventInfo,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { AttioError } from '../../constants';
import { attioApiClient } from '../../helpers/client';

export type TAttioListEntry = {
  id: {
    workspace_id: string;
    list_id: string;
    entry_id: string;
  };
  parent_object: string;
  parent_record_id: string;
  entry_values: {
    created_by: {
      created_by_actor: {
        type: string;
        id: string;
      };
    }[];
  };
};

type TAttioObject = { id: { object_id: string } };

export const getAttioListEntryEventEventInfo = (
  eventType: 'created' | 'updated' | 'deleted'
): TQoreAppActionWithEventOrWebhookEventInfo => ({
  desc: `Triggered when an entry is ${eventType} in an Attio list.`,
  type: {
    type: 'hash',
    fields: {
      event_type: { type: 'string' },
      id: {
        type: {
          type: 'hash',
          fields: {
            workspace_id: { type: 'string' },
            list_id: { type: 'string' },
            entry_id: { type: 'string' },
          },
        },
      },
      parent_object_id: { type: 'string' },
      parent_record_id: { type: 'string' },
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

export const createAttioListEntryExampleEventData =
  (
    eventType: 'created' | 'updated' | 'deleted'
  ): ((
    context: TQoreAppActionFunctionContext<TCustomConnOptions, TQoreOptions>
  ) => Promise<Record<string, any>>) =>
  async (context) => {
    const { token, list } = getQoreContextRequiredValues({
      context,
      optionFields: ['list'],
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    try {
      const entries = await attioApiClient<TAttioListEntry[]>({
        path: `lists/${list}/entries/query`,
        method: 'POST',
        object: 'data',
        token,
        body: {
          limit: 1,
        },
      });

      const entry = entries[0];

      if (!entry) {
        throw new Error('No entries found for the specified list');
      }

      const object = await attioApiClient<TAttioObject>({
        path: `objects/${entry.parent_object}`,
        object: 'data',
        method: 'GET',
        token,
      });

      return {
        event_type: `list-entry.${eventType}`,
        id: {
          workspace_id: entry.id.workspace_id,
          list_id: entry.id.list_id,
          entry_id: entry.id.entry_id,
        },
        parent_object_id: object.id.object_id || entry.parent_object,
        parent_record_id: entry.parent_record_id,
        actor: {
          type: entry.entry_values.created_by[0].created_by_actor.type,
          id: entry.entry_values.created_by[0].created_by_actor.id,
        },
      };
    } catch (error) {
      throw new AttioError(`Failed to get example event data ${error}`);
    }
  };
