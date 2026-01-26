import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIREBASE_APP_NAME, FirebaseError, getFirebaseErrorMessage } from '../constants';
import { firebaseApiClient, FIREBASE_FCM_URL } from '../helpers/constants';
import { getFirebaseProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';

const options = {
  project_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirebaseProjectIdAllowedValues,
  },
  token_or_topic: {
    required: true,
    type: 'string',
  },
  title: {
    required: true,
    type: 'string',
  },
  body: {
    required: true,
    type: 'string',
  },
  image: {
    required: false,
    type: 'string',
  },
  data: {
    required: false,
    type: 'hash',
  },
  priority: {
    required: false,
    type: 'string',
    default_value: 'high',
    allowed_values: [
      { value: 'high', display_name: 'High' },
      { value: 'normal', display_name: 'Normal' },
    ],
  },
} satisfies TQoreOptions;

const sendPushNotification = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIREBASE_APP_NAME,
  action: 'send_push_notification',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id, token_or_topic, title, body } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id', 'token_or_topic', 'title', 'body'],
      connectionFields: ['token'],
      ErrorClass: FirebaseError,
    });

    const { image, data, priority = 'high' } = obj || {};

    try {
      const isTopicNotification = token_or_topic.startsWith('/topics/');

      const message: any = {
        notification: {
          title,
          body,
          ...(image && { image }),
        },
        ...(data && { data }),
        android: {
          priority,
        },
        apns: {
          headers: {
            'apns-priority': priority === 'high' ? '10' : '5',
          },
        },
      };

      if (isTopicNotification) {
        message.topic = token_or_topic.replace('/topics/', '');
      } else {
        message.token = token_or_topic;
      }

      const response = await firebaseApiClient<{ name: string }>({
        token,
        path: `/v1/projects/${project_id}/messages:send`,
        method: 'POST',
        body: {
          message,
        },
        baseUrl: FIREBASE_FCM_URL,
      });

      return {
        message_id: response.name,
        project_id,
        target: token_or_topic,
        target_type: isTopicNotification ? 'topic' : 'token',
        title,
        body,
        priority,
      };
    } catch (error) {
      throw new FirebaseError(`Failed to send push notification: ${getFirebaseErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      message_id: { type: 'string' },
      project_id: { type: 'string' },
      target: { type: 'string' },
      target_type: { type: 'string' },
      title: { type: 'string' },
      body: { type: 'string' },
      priority: { type: 'string' },
    },
  },
});

export default sendPushNotification;
