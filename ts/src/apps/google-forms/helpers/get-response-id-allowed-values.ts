import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GoogleFormsError } from '../constants';
import { createGoogleFormsClient } from './constants';

export const getGoogleFormResponseIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const form_id = context?.opts?.form_id;

  if (!token) {
    throw new GoogleFormsError('Token is required to get Google Form response IDs');
  }

  if (!form_id) {
    throw new GoogleFormsError('Form ID is required to get response IDs');
  }

  try {
    const formsClient = createGoogleFormsClient(token);

    const response = await formsClient.forms.responses.list({
      formId: form_id,
      pageSize: 1000,
    });

    if (!response.data.responses) {
      return [];
    }

    const allowedValues: IQoreAllowedValue<string>[] = response.data.responses
      .filter((response) => response.responseId)
      .map((response) => {
        const timestamp = response.createTime
          ? new Date(response.createTime).toLocaleString()
          : 'Unknown time';

        const email = response.respondentEmail || 'Anonymous';

        return {
          value: response.responseId!,
          display_name: `Response ${response.responseId!.substring(0, 8)}... (${email})`,
          desc: `Response ID: ${response.responseId}\nRespondent: ${email}\nSubmitted: ${timestamp}`,
        };
      });

    return allowedValues;
  } catch (error: any) {
    throw new GoogleFormsError(`Failed to get Google Form response IDs: ${error.message || error}`);
  }
};
