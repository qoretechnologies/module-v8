import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as actions from './actions';
import { TEAMS_APP_LOGO, TEAMS_APP_NAME } from './constants';
import * as TEAMS_TRIGGERS from './triggers';

const TEAMS_ACTIONS = Object.values(actions);

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[TEAMS_APP_NAME].displayName(),
    short_desc: L[locale].apps[TEAMS_APP_NAME].shortDesc(),
    desc: L[locale].apps[TEAMS_APP_NAME].longDesc(),
    name: TEAMS_APP_NAME,
    actions: [
      ...mapActionsToApp(TEAMS_APP_NAME, TEAMS_ACTIONS, locale),
      ...mapTriggersToApp(TEAMS_APP_NAME, TEAMS_TRIGGERS, locale),
    ],
    logo: TEAMS_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://graph.microsoft.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      oauth2_token_url: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
      oauth2_scopes: [
        'Calendars.ReadWrite',
        'Channel.Create',
        'Channel.ReadBasic.All',
        'ChannelMember.ReadWrite.All',
        'ChannelMessage.Send',
        'Chat.ReadWrite',
        'Directory.ReadWrite.All',
        'Group.ReadWrite.All',
        'offline_access',
        'People.Read',
        'Team.ReadBasic.All',
        'TeamMember.ReadWrite.All',
        'User.Read',
        'User.ReadBasic.All',
        'ChannelMessage.Read.All',
        'Chat.ReadWrite.All',
      ],
      ping_method: 'GET',
      ping_path: '/v1.0/me',
    },
  }) satisfies TQoreAppWithActions;
