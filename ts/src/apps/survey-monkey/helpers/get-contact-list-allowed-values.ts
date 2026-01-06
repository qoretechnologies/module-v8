import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from './constants';

type SurveyMonkeyContactListItem = {
  id: string;
  name: string;
};

const mapContactListToAllowedValue = (item: SurveyMonkeyContactListItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
  };
};

export const getSurveyMonkeyContactListAllowedValues: TQoreGetAllowedValuesFunction<any, string> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: SurveyMonkeyError,
  });

  return await surveyMonkeyClient.fetchAllowedValues<SurveyMonkeyContactListItem>({
    path: 'contact_lists',
    token,
    itemsPath: 'data',
    mapItemToAllowedValue: mapContactListToAllowedValue,
    maxResults: 500,
  });
};
