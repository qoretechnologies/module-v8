import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from './constants';

type SurveyMonkeySurveyFolderItem = {
  id: string;
  title: string;
};

const mapSurveyFolderToAllowedValue = (item: SurveyMonkeySurveyFolderItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.title,
  };
};

export const getSurveyMonkeySurveyFolderAllowedValues: TQoreGetAllowedValuesFunction<any, string> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: SurveyMonkeyError,
  });

  return await surveyMonkeyClient.fetchAllowedValues<SurveyMonkeySurveyFolderItem>({
    path: 'survey_folders',
    token,
    itemsPath: 'data',
    mapItemToAllowedValue: mapSurveyFolderToAllowedValue,
    maxResults: 500,
  });
};
