import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from './constants';

type SurveyMonkeyContactItem = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
};

const mapContactToAllowedValue = (item: SurveyMonkeyContactItem): IQoreAllowedValue<string> => {
  const displayParts: string[] = [];

  if (item.first_name || item.last_name) {
    displayParts.push([item.first_name, item.last_name].filter(Boolean).join(' '));
  }

  if (item.email) {
    displayParts.push(item.email);
  }

  return {
    value: item.id,
    display_name: displayParts.length > 0 ? displayParts.join(' - ') : item.id,
  };
};

export const getSurveyMonkeyContactAllowedValues: TQoreGetAllowedValuesFunction<any, string> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: SurveyMonkeyError,
  });

  return await surveyMonkeyClient.fetchAllowedValues<SurveyMonkeyContactItem>({
    path: 'contacts',
    token,
    itemsPath: 'data',
    mapItemToAllowedValue: mapContactToAllowedValue,
    maxResults: 500,
  });
};
