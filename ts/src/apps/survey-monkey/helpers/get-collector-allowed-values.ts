import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from './constants';

type SurveyMonkeyCollectorItem = {
  id: string;
  name: string;
  type?: string;
};

const mapCollectorToAllowedValue = (item: SurveyMonkeyCollectorItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: item.type ? `Type: ${item.type}` : undefined,
  };
};

export const getSurveyMonkeyCollectorAllowedValues: TQoreGetAllowedValuesFunction<any, string> =
  async (context) => {
    const { token, survey_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['survey_id'],
      ErrorClass: SurveyMonkeyError,
    });

    return await surveyMonkeyClient.fetchAllowedValues<SurveyMonkeyCollectorItem>({
      path: `surveys/${survey_id}/collectors`,
      token,
      itemsPath: 'data',
      mapItemToAllowedValue: mapCollectorToAllowedValue,
      maxResults: 500,
    });
  };
