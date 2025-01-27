import { mapTriggersToApp } from '../../global/helpers';
import { IQoreAppWithActions } from '../../global/models/qore';
import { Locales } from '../../i18n/i18n-types';
import { SALESFORCE_APP_NAME, SALESFORCE_CONN_OPTIONS } from './constants';
import * as SALESFORCE_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: SALESFORCE_APP_NAME,
    actions: [...mapTriggersToApp(SALESFORCE_APP_NAME, SALESFORCE_TRIGGERS, locale)],
  }) satisfies Partial<IQoreAppWithActions<typeof SALESFORCE_CONN_OPTIONS>>;
