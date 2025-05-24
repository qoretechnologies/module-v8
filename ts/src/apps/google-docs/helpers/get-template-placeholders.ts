import { docs_v1 } from '@googleapis/docs';
import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { createGoogleDocsClient } from './constants';

export const getGoogleDocsPlaceholdersWithIndex = (
  content: docs_v1.Schema$StructuralElement[] | undefined
): { placeholder: string; index: number }[] => {
  if (!content) {
    return [];
  }

  const found: { placeholder: string; index: number }[] = [];

  for (const element of content) {
    const elements = element.paragraph?.elements || [];
    for (const el of elements) {
      const text = el.textRun?.content;
      const startIndex = el.startIndex ?? undefined;
      if (text && startIndex !== undefined) {
        const matches = text.match(/{{[^{}]+}}/g);
        if (matches) {
          for (const match of matches) {
            const relativeIndex = text.indexOf(match);
            found.push({
              placeholder: match,
              index: startIndex + relativeIndex,
            });
          }
        }
      }
    }
  }

  return found;
};

export const getGoogleDocsTemplatePlaceholderAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, template_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['template_id'],
  });

  const client = createGoogleDocsClient(token);
  const document = await client.documents.get({
    documentId: template_id,
  });

  const placeholders = getGoogleDocsPlaceholdersWithIndex(document.data.body?.content);

  return placeholders.map((placeholder) => {
    const displayName = placeholder.placeholder.replace(/{{|}}/g, '');

    return {
      display_name: displayName,
      value: placeholder.placeholder,
      desc: `Placeholder: ${displayName}\nIndex: ${placeholder.index}`,
    };
  });
};
