import { assertNotNullOrUndefined } from 'core/shared';
import { slackSendMessage } from './utils';

export const requestAction = async (conversationId: string, context: any) => {
  const { actions } = context.propsValue;
  assertNotNullOrUndefined(actions, 'actions');

  if (!actions.length) {
    throw new Error(`Must have at least one button action`);
  }

  const actionTextToIds = actions.map((action: { title: string; url: string }) => {
    if (!action.title) {
      throw new Error(`Button text for the action cannot be empty`);
    }

    if (!action.url) {
      throw new Error(`Button URL for the action cannot be empty`);
    }

    return {
      actionId: encodeURI(action.title as string),
      actionText: action.title,
      url: action.url,
    };
  });

  const token = context.auth.access_token;
  const { text, username, profilePicture } = context.propsValue;

  assertNotNullOrUndefined(token, 'token');
  assertNotNullOrUndefined(text, 'text');

  const actionElements = actionTextToIds.map((action: any) => {
    const actionLink = action.url;

    return {
      type: 'button',
      text: {
        type: 'plain_text',
        text: action.actionText,
      },
      style: 'primary',
      url: actionLink,
    };
  });

  return await slackSendMessage({
    token,
    text: `${context.propsValue.text}`,
    username,
    profilePicture,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${context.propsValue.text}`,
        },
      },
      {
        type: 'actions',
        block_id: 'actions',
        elements: actionElements,
      },
    ],
    conversationId: conversationId,
  });
};
