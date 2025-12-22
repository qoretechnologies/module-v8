import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractHelpScoutErrorMessage, HelpScoutError } from '../constants';
import { fetchHelpScoutAllowedValues } from './constants';

type THelpScoutMailbox = {
  id: number;
  name: string;
  slug: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

const mapItemToAllowedValue = (item: THelpScoutMailbox): IQoreAllowedValue<number> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: `Email: ${item.email}\nSlug: ${item.slug}`,
  };
};

export const getHelpScoutMailboxAllowedValues: TQoreGetAllowedValuesFunction<
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
      object: 'mailboxes',
      mapItemToAllowedValue,
      path: `mailboxes`,
    });
  } catch (error) {
    if (error instanceof HelpScoutError) {
      throw error;
    }

    throw new HelpScoutError(
      `Failed to fetch HelpScout mailbox allowed values: ${extractHelpScoutErrorMessage(error)}`
    );
  }
};
