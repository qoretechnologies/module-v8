import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './constants';

type TPipedrivePersonData = {
  id: string;
  name: string;
  email?: { value: string }[];
  phone?: { value: string }[];
  org_name?: string;
  owner_name?: string;
};

const mapPipedrivePerson = (person: TPipedrivePersonData): IQoreAllowedValue<string> => ({
  display_name: person.name,
  value: person.id,
  desc:
    (person.org_name ? `Organization: ${person.org_name}\n\n` : '') +
    (person.owner_name ? `Owner: ${person.owner_name}\n\n` : '') +
    (person.email && person.email.length > 0 ? `Email: ${person.email[0].value}\n\n` : '') +
    (person.phone && person.phone.length > 0 ? `Phone: ${person.phone[0].value}\n\n` : ''),
});

export const getPipedrivePersonIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive person allowed values');
  }

  const persons = await fetchPipedriveAllowedValues<TPipedrivePersonData>({
    token,
    mapItemToAllowedValue: mapPipedrivePerson,
    path: '/persons',
  });

  return persons;
};
