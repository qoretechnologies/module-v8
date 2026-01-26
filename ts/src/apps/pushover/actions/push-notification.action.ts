
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PUSHOVER_APP_NAME, PushoverError } from '../constants';
import { pushoverClient, PushoverResponse } from '../client';
import {
  getPushoverDeviceAllowedValues,
  PUSHOVER_MESSAGE_FORMATS,
  PUSHOVER_PRIORITIES,
  PUSHOVER_SOUNDS,
} from '../helpers';

const action = 'push_notification';

const options = {
  message: {
    required: true,
    type: 'string',
  },
  title: {
    required: false,
    type: 'string',
  },
  device: {
    required: false,
    type: 'string',
    get_allowed_values: getPushoverDeviceAllowedValues,
    allowed_values_creatable: true,
  },
  priority: {
    required: false,
    type: 'number',
    default_value: 0,
    preselected: true,
    allowed_values: PUSHOVER_PRIORITIES,
  },
  sound: {
    required: false,
    type: 'string',
    default_value: 'pushover',
    preselected: true,
    allowed_values: PUSHOVER_SOUNDS,
  },
  format: {
    required: false,
    type: 'string',
    default_value: 'plain',
    preselected: true,
    allowed_values: PUSHOVER_MESSAGE_FORMATS,
  },
  url: {
    required: false,
    type: 'string',
  },
  url_title: {
    required: false,
    type: 'string',
  },
  timestamp: {
    required: false,
    type: 'number',
  },
  ttl: {
    required: false,
    type: 'number',
  },
} satisfies TQoreOptions;

const pushNotification = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PUSHOVER_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, user, message } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'user'],
      optionFields: ['message'],
      ErrorClass: PushoverError,
    });

    const {
      title,
      device,
      priority = 0,
      sound = 'pushover',
      format = 'plain',
      url,
      url_title,
      timestamp,
      ttl,
    } = obj || {};

    // Build request body
    const body: Record<string, any> = {
      message,
    };

    // Add optional fields only if they have values
    if (title) {
      body.title = title;
    }
    if (device) {
      body.device = device;
    }
    if (priority !== 0) {
      body.priority = priority;
    }
    if (sound && sound !== 'pushover') {
      body.sound = sound;
    }
    if (format === 'html') {
      body.html = 1;
    }
    if (format === 'monospace') {
      body.monospace = 1;
    }
    if (url) {
      body.url = url;
    }
    if (url_title) {
      body.url_title = url_title;
    }
    if (timestamp) {
      body.timestamp = timestamp;
    }
    if (ttl) {
      body.ttl = ttl;
    }

    const response = await pushoverClient.postWithAuth<PushoverResponse>('/messages.json', body, {
      appToken: token,
      userKey: user,
    });

    return {
      success: true,
      request_id: response.request,
      message,
      title: title || null,
      priority,
      sound,
      device: device || 'all',
    };
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      request_id: { type: 'string' },
      message: { type: 'string' },
      title: { type: 'string' },
      priority: { type: 'number' },
      sound: { type: 'string' },
      device: { type: 'string' },
    },
  },
});

export default pushNotification;
