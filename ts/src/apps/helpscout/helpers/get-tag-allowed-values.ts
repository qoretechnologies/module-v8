import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractHelpScoutErrorMessage, HelpScoutError } from '../constants';
import { fetchHelpScoutAllowedValues } from './constants';

type THelpScoutTag = {
  id: number;
  name: string;
  slug: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  ticketCount: number;
};

const mapItemToAllowedValue = (item: THelpScoutTag): IQoreAllowedValue<number> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: `Slug: ${item.slug}\nTicket Count: ${item.ticketCount}`,
  };
};

export const getHelpScoutTagAllowedValues: TQoreGetAllowedValuesFunction<
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
      object: 'tags',
      mapItemToAllowedValue,
      path: `tags`,
    });
  } catch (error) {
    if (error instanceof HelpScoutError) {
      throw error;
    }

    throw new HelpScoutError(
      `Failed to fetch HelpScout tag allowed values: ${extractHelpScoutErrorMessage(error)}`
    );
  }
};
