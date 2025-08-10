import * as hub from '@huggingface/hub';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';

type HuggingFaceModel = {
  id: string;
  name: string;
  private: boolean;
  downloads: number;
  likes: number;
};

const mapHuggingFaceModelToAllowedValue = (item: HuggingFaceModel): IQoreAllowedValue<string> => {
  return {
    value: item.name,
    display_name: item.name,
    desc: `Private: ${item.private}\nDownloads: ${item.downloads}\nLikes: ${item.likes}`,
  };
};

const getHuggingFaceModelAllowedValuesFunction =
  (
    type: hub.PipelineType,
    tags?: string[]
  ): TQoreGetAllowedValuesFunction<TCustomConnOptions, string> =>
  async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
    });

    const models: hub.ModelEntry[] = [];

    for await (const model of hub.listModels({
      accessToken: token,
      limit: 1000,
      search: {
        task: type,
        ...(tags && { tags }),
      },
    })) {
      models.push(model);
    }

    return models.map(mapHuggingFaceModelToAllowedValue);
  };

export const getHuggingFaceSummarizationModelAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = getHuggingFaceModelAllowedValuesFunction('summarization');

export const getHuggingFaceQuestionAnsweringModelAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = getHuggingFaceModelAllowedValuesFunction('question-answering');

export const getHuggingFaceDocumentQuestionAnsweringModelAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = getHuggingFaceModelAllowedValuesFunction('document-question-answering');

export const getHuggingFaceVisualQuestionAnsweringModelAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = getHuggingFaceModelAllowedValuesFunction('visual-question-answering');

export const getHuggingFaceTextClassificationModelAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = getHuggingFaceModelAllowedValuesFunction('text-classification');

export const getHuggingFaceTranslationModelAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = getHuggingFaceModelAllowedValuesFunction('translation');

export const getHuggingFaceChatCompletionModelAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = getHuggingFaceModelAllowedValuesFunction('text-generation', ['conversational']);
