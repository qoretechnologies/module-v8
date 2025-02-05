import { mapTriggersToApp } from '../../global/helpers';
import { IQoreExistingAppWithActions } from '@qoretechnologies/ts-toolkit';
import { Locales } from '../../i18n/i18n-types';
import { SALESFORCE_APP_MODULE, SALESFORCE_APP_NAME } from './constants';
import * as SALESFORCE_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: SALESFORCE_APP_NAME,
    module: SALESFORCE_APP_MODULE,
    actions: [...mapTriggersToApp(SALESFORCE_APP_NAME, SALESFORCE_TRIGGERS, locale)],
  }) satisfies IQoreExistingAppWithActions;
