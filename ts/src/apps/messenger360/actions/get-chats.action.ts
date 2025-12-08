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
        archived: { type: 'bool' },
        pinned: { type: 'bool' },
        muteExpiration: { type: 'number' },
        lastMessage: {
          type: {
            type: 'hash',
            fields: {
              id: {
                type: {
                  type: 'hash',
                  fields: {
                    fromMe: { type: 'bool' },
                    remote: { type: 'string' },
                    id: { type: 'string' },
                    self: { type: 'string' },
                    _serialized: { type: 'string' },
                  },
                },
              },
              viewed: { type: 'bool' },
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
              invis: { type: 'bool' },
              isNewMsg: { type: 'bool' },
              star: { type: 'bool' },
              kicNotified: { type: 'bool' },
              recvFresh: { type: 'bool' },
              isFromTemplate: { type: 'bool' },
              pollInvalidated: { type: 'bool' },
              isSentCagPollCreation: { type: 'bool' },
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
              isEventCanceled: { type: 'bool' },
              eventInvalidated: { type: 'bool' },
              isVcardOverMmsDocument: { type: 'bool' },
              isForwarded: { type: 'bool' },
              hasReaction: { type: 'bool' },
              viewMode: { type: 'string' },
              messageSecret: {
                type: {
                  type: 'hash',
                },
              },
              productHeaderImageRejected: { type: 'bool' },
              lastPlaybackProgress: { type: 'number' },
              isDynamicReplyButtonsMsg: { type: 'bool' },
              isCarouselCard: { type: 'bool' },
              parentMsgId: { type: 'string' },
              callSilenceReason: { type: 'string' },
              isVideoCall: { type: 'bool' },
              isMdHistoryMsg: { type: 'bool' },
              stickerSentTs: { type: 'number' },
              isAvatar: { type: 'bool' },
              lastUpdateFromServerTs: { type: 'number' },
              invokedBotWid: { type: 'string' },
              bizBotType: { type: 'string' },
              botResponseTargetId: { type: 'string' },
              botPluginType: { type: 'string' },
              botPluginReferenceIndex: { type: 'string' },
              botPluginSearchProvider: { type: 'string' },
              botPluginSearchUrl: { type: 'string' },
              botPluginSearchQuery: { type: 'string' },
              botPluginMaybeParent: { type: 'bool' },
              botReelPluginThumbnailCdnUrl: { type: 'string' },
              botMsgBodyType: { type: 'string' },
              requiresDirectConnection: { type: 'bool' },
              bizContentPlaceholderType: { type: 'string' },
              hostedBizEncStateMismatch: { type: 'bool' },
              senderOrRecipientAccountTypeHosted: { type: 'bool' },
              placeholderCreatedWhenAccountIsHosted: { type: 'bool' },
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
