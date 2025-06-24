import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MESSENGER360_APP_NAME, Messenger360Error } from '../constants';
import { fetch360MessengerData } from '../helpers/constants';

const getChats = QoreAppCreator.createLocalizedAction({
  app: MESSENGER360_APP_NAME,
  action: 'get_chats',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: Messenger360Error,
    });

    try {
      const data = await fetch360MessengerData<Record<string, any>[]>({
        token,
        path: '/client/getChats',
        dataPath: 'data.chats',
      });

      return data.map((chat) => ({
        ...chat,
        lastMessage: chat.lastMessage?._data || chat.lastMessage,
      }));
    } catch (error) {
      throw new Messenger360Error(`Failed to get chats: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: {
          type: {
            type: 'hash',
            fields: {
              server: { type: 'string' },
              user: { type: 'string' },
              _serialized: { type: 'string' },
            },
          },
        },
        name: { type: 'string' },
        unreadCount: { type: 'number' },
        timestamp: { type: 'number' },
        archived: { type: 'boolean' },
        pinned: { type: 'boolean' },
        muteExpiration: { type: 'number' },
        lastMessage: {
          type: {
            type: 'hash',
            fields: {
              id: {
                type: {
                  type: 'hash',
                  fields: {
                    fromMe: { type: 'boolean' },
                    remote: { type: 'string' },
                    id: { type: 'string' },
                    self: { type: 'string' },
                    _serialized: { type: 'string' },
                  },
                },
              },
              viewed: { type: 'boolean' },
              body: { type: 'string' },
              type: { type: 'string' },
              t: { type: 'number' },
              notifyName: { type: 'string' },
              from: {
                type: {
                  type: 'hash',
                  fields: {
                    server: { type: 'string' },
                    user: { type: 'string' },
                    _serialized: { type: 'string' },
                  },
                },
              },
              to: {
                type: {
                  type: 'hash',
                  fields: {
                    server: { type: 'string' },
                    user: { type: 'string' },
                    _serialized: { type: 'string' },
                  },
                },
              },
              author: {
                type: {
                  type: 'hash',
                  fields: {
                    server: { type: 'string' },
                    user: { type: 'string' },
                    _serialized: { type: 'string' },
                  },
                },
              },
              ack: { type: 'number' },
              invis: { type: 'boolean' },
              isNewMsg: { type: 'boolean' },
              star: { type: 'boolean' },
              kicNotified: { type: 'boolean' },
              recvFresh: { type: 'boolean' },
              isFromTemplate: { type: 'boolean' },
              pollInvalidated: { type: 'boolean' },
              isSentCagPollCreation: { type: 'boolean' },
              latestEditMsgKey: { type: 'string' },
              latestEditSenderTimestampMs: { type: 'string' },
              mentionedJidList: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              groupMentions: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              isEventCanceled: { type: 'boolean' },
              eventInvalidated: { type: 'boolean' },
              isVcardOverMmsDocument: { type: 'boolean' },
              isForwarded: { type: 'boolean' },
              hasReaction: { type: 'boolean' },
              viewMode: { type: 'string' },
              messageSecret: {
                type: {
                  type: 'hash',
                },
              },
              productHeaderImageRejected: { type: 'boolean' },
              lastPlaybackProgress: { type: 'number' },
              isDynamicReplyButtonsMsg: { type: 'boolean' },
              isCarouselCard: { type: 'boolean' },
              parentMsgId: { type: 'string' },
              callSilenceReason: { type: 'string' },
              isVideoCall: { type: 'boolean' },
              isMdHistoryMsg: { type: 'boolean' },
              stickerSentTs: { type: 'number' },
              isAvatar: { type: 'boolean' },
              lastUpdateFromServerTs: { type: 'number' },
              invokedBotWid: { type: 'string' },
              bizBotType: { type: 'string' },
              botResponseTargetId: { type: 'string' },
              botPluginType: { type: 'string' },
              botPluginReferenceIndex: { type: 'string' },
              botPluginSearchProvider: { type: 'string' },
              botPluginSearchUrl: { type: 'string' },
              botPluginSearchQuery: { type: 'string' },
              botPluginMaybeParent: { type: 'boolean' },
              botReelPluginThumbnailCdnUrl: { type: 'string' },
              botMsgBodyType: { type: 'string' },
              requiresDirectConnection: { type: 'boolean' },
              bizContentPlaceholderType: { type: 'string' },
              hostedBizEncStateMismatch: { type: 'boolean' },
              senderOrRecipientAccountTypeHosted: { type: 'boolean' },
              placeholderCreatedWhenAccountIsHosted: { type: 'boolean' },
              links: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
});

export default getChats;
