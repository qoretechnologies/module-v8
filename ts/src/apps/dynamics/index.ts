import { IQoreExistingAppWithActions } from '@qoretechnologies/ts-toolkit';
import { Locales } from '../../i18n/i18n-types';
import { DYNAMICS_APP_MODULE, DYNAMICS_APP_NAME } from './constants';

import { mapTriggersToApp } from '../../global/helpers';
import * as DYNAMICS_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: DYNAMICS_APP_NAME,
    module: DYNAMICS_APP_MODULE,
    actions: [...mapTriggersToApp(DYNAMICS_APP_NAME, DYNAMICS_TRIGGERS, locale)],
  }) satisfies IQoreExistingAppWithActions;
