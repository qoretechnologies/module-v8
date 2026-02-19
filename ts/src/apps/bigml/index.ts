import { IQoreExistingAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers/index';
import { Locales } from '../../i18n/i18n-types';
import { BIG_ML_APP_MODULE, BIG_ML_APP_NAME } from './constants';

import * as BIG_ML_ACTIONS from './actions';
import * as BIG_ML_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: BIG_ML_APP_NAME,
    module: BIG_ML_APP_MODULE,
    actions: [
      ...mapActionsToApp(BIG_ML_APP_NAME, BIG_ML_ACTIONS, locale),
      ...mapTriggersToApp(BIG_ML_APP_NAME, BIG_ML_TRIGGERS, locale),
    ],
  }) satisfies IQoreExistingAppWithActions;
