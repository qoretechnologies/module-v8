import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractFrontErrorMessage, FrontError } from '../constants';
import { fetchFrontAllowedValues } from './constants';

type TFrontConversation = {
  id: string;
  subject: string;
  status: string;
  assignee?: {
    email: string;
  };
};

const mapItemToAllowedValue = (item: TFrontConversation): IQoreAllowedValue<string> => {
  const displayName = item.subject || `Conversation #${item.id}`;
  const assigneeInfo = item.assignee?.email ? ` (${item.assignee.email})` : '';
  const desc = `Status: ${item.status || 'N/A'}${assigneeInfo}`;

  return {
    value: item.id,
    display_name: displayName,
    desc,
  };
};

export const getFrontConversationAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    return await fetchFrontAllowedValues({
      token,
      method: 'GET',
      mapItemToAllowedValue,
      path: 'conversations',
    });
  } catch (error) {
    if (error instanceof FrontError) {
      throw error;
    }

    throw new FrontError(
      `Failed to fetch Front conversation allowed values: ${extractFrontErrorMessage(error)}`
    );
  }
};
