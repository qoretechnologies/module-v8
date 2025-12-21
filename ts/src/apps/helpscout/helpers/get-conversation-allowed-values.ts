import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractHelpScoutErrorMessage, HelpScoutError } from '../constants';
import { fetchHelpScoutAllowedValues } from './constants';

type THelpScoutConversation = {
  id: number;
  number: number;
  subject: string;
  status: string;
  state: string;
  mailboxId: number;
  createdAt: string;
  preview: string;
};

const mapItemToAllowedValue = (item: THelpScoutConversation): IQoreAllowedValue<number> => {
  const displayName = `#${item.number}: ${item.subject || 'No Subject'}`;
  const desc = `Status: ${item.status}\nState: ${item.state}\nPreview: ${item.preview?.substring(0, 100) || 'N/A'}...`;

  return {
    value: item.id,
    display_name: displayName,
    desc,
  };
};

export const getHelpScoutConversationAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    return await fetchHelpScoutAllowedValues({
      token,
      method: 'GET',
      object: 'conversations',
      mapItemToAllowedValue,
      path: `conversations`,
    });
  } catch (error) {
    if (error instanceof HelpScoutError) {
      throw error;
    }

    throw new HelpScoutError(
      `Failed to fetch HelpScout conversation allowed values: ${extractHelpScoutErrorMessage(error)}`
    );
  }
};
