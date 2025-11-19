import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedrivePersonData = {
  id: string;
  name: string;
  emails?: { value: string }[];
  phones?: { value: string }[];
  org_name?: string;
  owner_name?: string;
};

const mapPipedriveAttendee = (person: TPipedrivePersonData): IQoreAllowedValue<object> => ({
  display_name: person.name,
  value: { email_address: person.emails![0].value, person_id: person.id },
  desc:
    `Email: ${person.emails![0].value}\n\n` +
    (person.org_name ? `Organization: ${person.org_name}\n\n` : '') +
    (person.owner_name ? `Owner: ${person.owner_name}\n\n` : '') +
    (person.phones && person.phones.length > 0 ? `Phone: ${person.phones[0].value}\n\n` : ''),
});

export const getPipedriveAttendeeAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  object
> = async (context): Promise<IQoreAllowedValue<object>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive person allowed values');
  }

  const personsAllowedValues = await fetchPipedriveAllowedValues({
    token,
    mapItemToAllowedValue: mapPipedriveAttendee,
    path: '/persons',
    filterItems: (person) => Boolean(person.emails?.length),
  });

  return personsAllowedValues;
};
