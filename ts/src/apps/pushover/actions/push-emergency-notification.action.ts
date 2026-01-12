
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PUSHOVER_APP_NAME, PushoverError } from '../constants';
import { pushoverClient, PushoverResponse } from '../client';
import {
  getPushoverDeviceAllowedValues,
  PUSHOVER_MESSAGE_FORMATS,
  PUSHOVER_SOUNDS,
} from '../helpers';

const action = 'push_emergency_notification';

const options = {
  message: {
    required: true,
    type: 'string',
  },
  title: {
    required: false,
    type: 'string',
  },
  retry: {
    required: true,
    type: 'number',
    default_value: 60,
  },
  expire: {
    required: true,
    type: 'number',
    default_value: 3600,
  },
  device: {
    required: false,
    type: 'string',
    get_allowed_values: getPushoverDeviceAllowedValues,
    allowed_values_creatable: true,
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
  callback: {
    required: false,
    type: 'string',
  },
  tags: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

interface EmergencyNotificationResponse extends PushoverResponse {
  receipt: string;
}

const pushEmergencyNotification = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PUSHOVER_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, user, message, retry, expire } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'user'],
      optionFields: ['message', 'retry', 'expire'],
      ErrorClass: PushoverError,
    });

    // Validate retry (minimum 30 seconds)
    if (retry < 30) {
      throw new PushoverError('Retry interval must be at least 30 seconds');
    }

    // Validate expire (maximum 10800 seconds = 3 hours)
    if (expire > 10800) {
      throw new PushoverError('Expiration time cannot exceed 10800 seconds (3 hours)');
    }

    const { title, device, sound = 'pushover', format = 'plain', url, url_title, callback, tags } =
      obj || {};

    // Build request body
    const body: Record<string, any> = {
      message,
      priority: 2, // Emergency priority
      retry,
      expire,
    };

    // Add optional fields only if they have values
    if (title) {
      body.title = title;
    }
    if (device) {
      body.device = device;
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
    if (callback) {
      body.callback = callback;
    }
    if (tags) {
      body.tags = tags;
    }

    const response = await pushoverClient.postWithAuth<EmergencyNotificationResponse>(
      '/messages.json',
      body,
      {
        appToken: token,
        userKey: user,
      }
    );

    return {
      success: true,
      request_id: response.request,
      receipt: response.receipt,
      message,
      title: title || null,
      retry,
      expire,
      device: device || 'all',
    };
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      request_id: { type: 'string' },
      receipt: { type: 'string' },
      message: { type: 'string' },
      title: { type: 'string' },
      retry: { type: 'number' },
      expire: { type: 'number' },
      device: { type: 'string' },
    },
  },
});

export default pushEmergencyNotification;
