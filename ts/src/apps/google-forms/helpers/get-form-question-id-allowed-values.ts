import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { createGoogleFormsClient } from './constants';
import { GoogleFormsError } from '../constants';

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

    const items = formResponse.data.items ?? [];

    const allowedValues: IQoreAllowedValue<string>[] = items.flatMap((item) => {
      const group = item.questionGroupItem?.questions ?? [];
      if (group.length) {
        return group
          .filter((q) => !!q.questionId)
          .map((q) => ({
            value: q.questionId as string,
            display_name: `[${item.title ?? 'Untitled Section'}] - ${q.rowQuestion?.title ?? 'Untitled Question'}`,
            desc:
              `Required: ${q.required ? 'Yes' : 'No'}\n` +
              `Description: ${item.description ?? 'No Description'}\n`,
          }));
      }

      const q = item.questionItem?.question;
      if (!q?.questionId) return [];

      return {
        value: q.questionId,
        display_name: item.title ?? 'Untitled Question',
        desc:
          `Required: ${q.required ? 'Yes' : 'No'}\n` +
          `Description: ${item.description ?? 'No Description'}\n`,
      };
    });

    return allowedValues;
  } catch (error: any) {
    throw new GoogleFormsError(`Failed to get Google Form Question IDs: ${error.message ?? error}`);
  }
};
