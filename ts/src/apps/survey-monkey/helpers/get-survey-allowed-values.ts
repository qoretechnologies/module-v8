import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from './constants';

type SurveyMonkeySurveyItem = {
  id: string;
  title: string;
  nickname?: string;
};

const mapSurveyToAllowedValue = (item: SurveyMonkeySurveyItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.title,
    desc: `Nickname: ${item.nickname || 'N/A'}`,
  };
};

export const getSurveyMonkeySurveyAllowedValues: TQoreGetAllowedValuesFunction<
  any,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: SurveyMonkeyError,
  });

  return await surveyMonkeyClient.fetchAllowedValues<SurveyMonkeySurveyItem>({
    path: 'surveys',
    token,
    itemsPath: 'data',
    mapItemToAllowedValue: mapSurveyToAllowedValue,
    maxResults: 500,
  });
};
