import {
  IActionOptions,
  IActionResponse,
  TActionData,
  TActionResponse,
} from 'global/models/actions';
import { EQoreAppActionCode, TQorePartialAction } from '../global/models/qore';
import { L } from '../i18n/i18n-node';

const options = {
  token: {
    display_name: L.en.apps.Zendesk.actions.attachments.token.displayName(),
    short_desc: L.en.apps.Zendesk.actions.attachments.token.shortDesc(),
    desc: L.en.apps.Zendesk.actions.attachments.token.longDesc(),
    type: 'string',
    required: true,
    example_value: '123',
  },
  userId: {
    example_value: 123,
    display_name: L.en.apps.Zendesk.actions.attachments.token.displayName(),
    short_desc: L.en.apps.Zendesk.actions.attachments.token.shortDesc(),
    desc: L.en.apps.Zendesk.actions.attachments.token.longDesc(),
    type: 'int',
  },
} satisfies IActionOptions;

const response_type = {
  channel: {
    type: {
      id: {
        display_name: 'test',
        name: 'Channel ID',
        short_desc: 'test',
        desc: 'test',
        type: 'int',
      },
    },
    display_name: 'dname',
    short_desc: 'sdesc',
    desc: 'desc',
    name: 'channel',
  },
} satisfies IActionResponse;

// Defining a function to delete attachment
const deleteAttachment = async ({
  token,
}: TActionData<typeof options>): Promise<TActionResponse<typeof response_type>> => {
  try {
    return {
      channel: {
        id: token,
      },
    };
  } catch (error) {
    console.error('Error deleting attachment:', error);
    throw error;
  }
};

export default {
  action: 'delete-attachment',
  action_code: EQoreAppActionCode.ACTION,
  api_function: deleteAttachment,
  options,

  override_options: {
    token: {
      required: true,
      short_desc: 'Token of the attachment to delete',
      get_allowed_values: (context) => {
        console.log(context);
        return [{ value: 123 }];
      },
    },
  },
  response_type,
  _localizationGroup: 'attachments',
} satisfies TQorePartialAction<typeof options, typeof response_type>;
