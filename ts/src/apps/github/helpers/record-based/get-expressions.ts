import { TQoreSearchRecordsExpressions } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { GITHUB_APP_NAME } from '../../constants';

export const getGitHubExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(GITHUB_APP_NAME, {}, locale);
};
