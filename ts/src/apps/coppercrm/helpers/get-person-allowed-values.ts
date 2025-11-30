import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CopperCrmError } from '../constants';
import { fetchCopperCrmAllowedValues } from './constants';

type CopperCrmPerson = {
  id: number;
  name: string;
  emails?: Array<{
    email: string;
    category: string;
  }>;
  company_name?: string;
  title?: string;
};

const mapPersonToAllowedValue = (person: CopperCrmPerson): IQoreAllowedValue<number> => {
  const descParts = [];

  if (person.title) {
    descParts.push(`Title: ${person.title}`);
  }

  if (person.company_name) {
    descParts.push(`Company: ${person.company_name}`);
  }

  if (person.emails && person.emails.length > 0) {
    const primaryEmail = person.emails[0].email;
    descParts.push(`Email: ${primaryEmail}`);
  }

  return {
    value: person.id,
    display_name: person.name,
    ...(descParts.length > 0 && { desc: descParts.join('\n') }),
  };
};

export const getCopperCrmPersonAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token, email } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'email'],
      ErrorClass: CopperCrmError,
    });

    return await fetchCopperCrmAllowedValues({
      token,
      email,
      mapItemToAllowedValue: mapPersonToAllowedValue,
      path: 'people/search',
    });
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM person allowed values: ${error}`);
  }
};
