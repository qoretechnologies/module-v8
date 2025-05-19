import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GoogleFormsError } from '../constants';
import { createGoogleFormsClient } from './constants';

export const getGoogleFormQuestionIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { form_id, token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['form_id'],
  });

  try {
    const formsClient = createGoogleFormsClient(token);

    const formResponse = await formsClient.forms.get({
      formId: form_id,
      fields: 'items',
    });

    const questions =
      formResponse.data.items?.filter(
        (item) => item.questionItem?.question?.questionId || item.questionGroupItem
      ) || [];

    if (!questions.length) {
      return [];
    }

    const allowedValues: IQoreAllowedValue<string>[] = questions.flatMap((question) => {
      if (question.questionGroupItem?.questions) {
        return question.questionGroupItem.questions.map((item) => ({
          display_name: `[${question.title}] - ${item.rowQuestion?.title || 'Untitled Question'}`,
          value: item.questionId!,
          desc:
            `Required: ${item.required ? 'Yes' : 'No'}\n` +
            `Description: ${question.description || 'No Description'}\n`,
        }));
      }

      const qItem = question.questionItem?.question;

      return {
        value: qItem!.questionId!,
        display_name: question.title || 'Untitled Question',
        desc:
          `Required: ${qItem?.required ? 'Yes' : 'No'}\n` +
          `Description: ${question.description || 'No Description'}\n`,
      };
    });

    return allowedValues;
  } catch (error: any) {
    throw new GoogleFormsError(`Failed to get Google Form Question IDs: ${error.message || error}`);
  }
};
