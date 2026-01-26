import { IQoreExistingAppWithActions } from '@qoretechnologies/ts-toolkit';
import { Locales } from '../../i18n/i18n-types';
import { BUSINESS_CENTRAL_APP_MODULE, BUSINESS_CENTRAL_APP_NAME } from './constants';

import { mapTriggersToApp } from '../../global/helpers';
import * as BUSINESS_CENTRAL_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: BUSINESS_CENTRAL_APP_NAME,
    module: BUSINESS_CENTRAL_APP_MODULE,
    actions: [...mapTriggersToApp(BUSINESS_CENTRAL_APP_NAME, BUSINESS_CENTRAL_TRIGGERS, locale)],
  }) satisfies IQoreExistingAppWithActions;
