import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractHelpScoutErrorMessage, HelpScoutError } from '../constants';
import { fetchHelpScoutAllowedValues } from './constants';

type THelpScoutThread = {
  id: number;
  type: string;
  status: string;
  body: string;
  createdAt: string;
  createdBy: {
    first: string;
    last: string;
    email: string;
  };
};

const mapItemToAllowedValue = (item: THelpScoutThread): IQoreAllowedValue<number> => {
  const createdByName = item.createdBy
    ? `${item.createdBy.first || ''} ${item.createdBy.last || ''}`.trim()
    : 'Unknown';
  const preview = item.body ? item.body.substring(0, 50).replace(/\s+/g, ' ') : '';
  const displayName = `${item.type} by ${createdByName}`.trim() || `Thread #${item.id}`;

  return {
    value: item.id,
    display_name: displayName,
    desc: preview ? `${preview}...` : undefined,
  };
};

export const getHelpScoutThreadAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token, conversationId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['conversationId'],
      ErrorClass: HelpScoutError,
    });

    return await fetchHelpScoutAllowedValues({
      token,
      method: 'GET',
      object: 'threads',
      mapItemToAllowedValue,
      path: `conversations/${conversationId}/threads`,
    });
  } catch (error) {
    if (error instanceof HelpScoutError) {
      throw error;
    }

    throw new HelpScoutError(
      `Failed to fetch HelpScout thread allowed values: ${extractHelpScoutErrorMessage(error)}`
    );
  }
};
