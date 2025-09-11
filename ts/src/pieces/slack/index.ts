import { OAuth2PropertyValue, PieceAuth, createPiece } from 'core/framework';
import { PieceCategory } from 'core/shared';
import { createCustomApiCallAction } from 'core/common';
import crypto from 'node:crypto';
import { requestActionDirectMessageAction } from './lib/actions/request-action-direct-message';
import { requestActionMessageAction } from './lib/actions/request-action-message';
import { slackSendDirectMessageAction } from './lib/actions/send-direct-message-action';
import { slackSendMessageAction } from './lib/actions/send-message-action';
import { newMessage } from './lib/triggers/new-message';
import { newReactionAdded } from './lib/triggers/new-reaction-added';
import { uploadFile } from './lib/actions/upload-file';
import { searchMessages } from './lib/actions/search-messages';
import { updateMessage } from './lib/actions/update-message';
import { findUserByEmailAction } from './lib/actions/find-user-by-email';
import { updateProfileAction } from './lib/actions/update-profile';
import { createChannelAction } from './lib/actions/create-channel';
import { channelCreated } from './lib/triggers/new-channel';
import { addReactionToMessageAction } from './lib/actions/add-reaction-to-message';
import { getChannelHistory } from './lib/actions/get-channel-history';

export const slackAuth = PieceAuth.OAuth2({
  description: '',
  authUrl: 'https://slack.com/oauth/v2/authorize',
  tokenUrl: 'https://slack.com/api/oauth.v2.access',
  required: true,
  url: 'https://slack.com/api',
  pingMethod: 'POST',
  pingPath: 'auth.test',
  scope: [
    'channels:read',
    'channels:manage',
    'channels:history',
    'channels:join',
    'chat:write',
    'chat:write.public',
    'groups:read',
    'groups:write',
    'reactions:read',
    'reactions:write',
    'mpim:read',
    'mpim:write',
    'im:write',
    'users:read',
    'users:read.email',
    'files:write',
    'files:read',
  ],
});

export const slack = createPiece({
  displayName: 'Slack',
  description: 'Channel-based messaging platform',
  minimumSupportedRelease: '0.20.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/slack.png',
  logo:
    'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuMS' +
    'wgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9Ikxh' +
    'eWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveG' +
    'xpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAyNzAgMjcwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAy' +
    'NzAgMjcwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0UwMUU1QTt9Cgkuc3' +
    'Qxe2ZpbGw6IzM2QzVGMDt9Cgkuc3Qye2ZpbGw6IzJFQjY3RDt9Cgkuc3Qze2ZpbGw6I0VDQjIyRTt9Cjwvc3R5bGU+CjxnPgoJPGc+CgkJ' +
    'PHBhdGggY2xhc3M9InN0MCIgZD0iTTk5LjQsMTUxLjJjMCw3LjEtNS44LDEyLjktMTIuOSwxMi45Yy03LjEsMC0xMi45LTUuOC0xMi45LT' +
    'EyLjljMC03LjEsNS44LTEyLjksMTIuOS0xMi45aDEyLjlWMTUxLjJ6Ii8+CgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTEwNS45LDE1MS4y' +
    'YzAtNy4xLDUuOC0xMi45LDEyLjktMTIuOXMxMi45LDUuOCwxMi45LDEyLjl2MzIuM2MwLDcuMS01LjgsMTIuOS0xMi45LDEyLjkKCQkJcy' +
    '0xMi45LTUuOC0xMi45LTEyLjlWMTUxLjJ6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTE4LjgsOTkuNGMtNy4x' +
    'LDAtMTIuOS01LjgtMTIuOS0xMi45YzAtNy4xLDUuOC0xMi45LDEyLjktMTIuOXMxMi45LDUuOCwxMi45LDEyLjl2MTIuOUgxMTguOHoiLz' +
    '4KCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTE4LjgsMTA1LjljNy4xLDAsMTIuOSw1LjgsMTIuOSwxMi45cy01LjgsMTIuOS0xMi45LDEy' +
    'LjlIODYuNWMtNy4xLDAtMTIuOS01LjgtMTIuOS0xMi45CgkJCXM1LjgtMTIuOSwxMi45LTEyLjlIMTE4Ljh6Ii8+Cgk8L2c+Cgk8Zz4KCQ' +
    'k8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMTcwLjYsMTE4LjhjMC03LjEsNS44LTEyLjksMTIuOS0xMi45YzcuMSwwLDEyLjksNS44LDEyLjks' +
    'MTIuOXMtNS44LDEyLjktMTIuOSwxMi45aC0xMi45VjExOC44eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xNjQuMSwxMTguOGMwLD' +
    'cuMS01LjgsMTIuOS0xMi45LDEyLjljLTcuMSwwLTEyLjktNS44LTEyLjktMTIuOVY4Ni41YzAtNy4xLDUuOC0xMi45LDEyLjktMTIuOQoJ' +
    'CQljNy4xLDAsMTIuOSw1LjgsMTIuOSwxMi45VjExOC44eiIvPgoJPC9nPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0MyIgZD0iTTE1MS4yLD' +
    'E3MC42YzcuMSwwLDEyLjksNS44LDEyLjksMTIuOWMwLDcuMS01LjgsMTIuOS0xMi45LDEyLjljLTcuMSwwLTEyLjktNS44LTEyLjktMTIu' +
    'OXYtMTIuOUgxNTEuMnoiLz4KCQk8cGF0aCBjbGFzcz0ic3QzIiBkPSJNMTUxLjIsMTY0LjFjLTcuMSwwLTEyLjktNS44LTEyLjktMTIuOW' +
    'MwLTcuMSw1LjgtMTIuOSwxMi45LTEyLjloMzIuM2M3LjEsMCwxMi45LDUuOCwxMi45LDEyLjkKCQkJYzAsNy4xLTUuOCwxMi45LTEyLjks' +
    'MTIuOUgxNTEuMnoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
  categories: [PieceCategory.COMMUNICATION],
  auth: slackAuth,
  events: {
    parseAndReply: ({ payload }) => {
      const payloadBody = payload.body as PayloadBody;
      if (payloadBody.challenge) {
        return {
          reply: {
            body: payloadBody['challenge'],
            headers: {},
          },
        };
      }

      return {
        event: payloadBody.event?.type,
        identifierValue: payloadBody.team_id,
      };
    },
    verify: ({ webhookSecret, payload }) => {
      // Construct the signature base string
      const timestamp = payload.headers['x-slack-request-timestamp'];
      const signature = payload.headers['x-slack-signature'];
      const signatureBaseString = `v0:${timestamp}:${payload.rawBody}`;
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(signatureBaseString);
      const computedSignature = `v0=${hmac.digest('hex')}`;

      return signature === computedSignature;
    },
  },
  authors: [
    'rita-gorokhod',
    'AdamSelene',
    'Abdallah-Alwarawreh',
    'kishanprmr',
    'MoShizzle',
    'AbdulTheActivePiecer',
    'khaledmashaly',
    'abuaboud',
  ],
  actions: [
    addReactionToMessageAction,
    slackSendDirectMessageAction,
    slackSendMessageAction,
    requestActionDirectMessageAction,
    requestActionMessageAction,
    uploadFile,
    searchMessages,
    findUserByEmailAction,
    updateMessage,
    createChannelAction,
    updateProfileAction,
    getChannelHistory,
    createCustomApiCallAction({
      baseUrl: () => {
        return 'https://slack.com/api';
      },
      auth: slackAuth,
      authMapping: async (auth) => {
        return {
          Authorization: `Bearer ${(auth as OAuth2PropertyValue).access_token}`,
        };
      },
    }),
  ],
  triggers: [newMessage, newReactionAdded, channelCreated],
  qoreConnectionModifiers: {
    options: {
      authed_user: {
        type: 'hash',
      },
    },
    set_options_post_auth_code: (context) => {
      if (!context?.conn_opts?.authed_user) return { authed_user: {} };

      return {
        authed_user: context.conn_opts.authed_user,
      };
    },
  },
  qoreRest: {
    oauth2_auth_args: {
      user_scope: [
        'channels:history',
        'channels:read',
        'channels:write',
        'chat:write',
        'groups:history',
        'im:history',
        'users:read',
        'users:read.email',
        'users.profile:read',
        'users.profile:write',
      ],
    },
  },
});

type PayloadBody = {
  challenge: string;
  event: {
    type: string;
  };
  team_id: string;
};
