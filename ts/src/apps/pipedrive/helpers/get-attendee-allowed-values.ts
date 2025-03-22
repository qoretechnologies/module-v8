import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import {
  fetchPipedriveData,
  PIPEDRIVE_ALLOWED_VALUES_FETCH_DELAY,
  PIPEDRIVE_ALLOWED_VALUES_TIMEOUT,
} from './constants';

type TPipedrivePersonData = {
  id: string;
  name: string;
  email?: { value: string }[];
  phone?: { value: string }[];
  org_name?: string;
  owner_name?: string;
};

const mapPipedriveAttendee = (person: TPipedrivePersonData): IQoreAllowedValue<object> => ({
  display_name: person.name,
  value: { email_address: person.email![0].value, person_id: person.id },
  desc:
    `Email: ${person.email![0].value}\n\n` +
    (person.org_name ? `Organization: ${person.org_name}\n\n` : '') +
    (person.owner_name ? `Owner: ${person.owner_name}\n\n` : '') +
    (person.phone && person.phone.length > 0 ? `Phone: ${person.phone[0].value}\n\n` : ''),
});

const fetchPipedrivePersons = async (token: string): Promise<TPipedrivePersonData[]> => {
  const persons: TPipedrivePersonData[] = [];
  const startTime = Date.now();
  let start = 0;
  const limit = 500;

  try {
    let hasMore = true;

    while (hasMore) {
      if (Date.now() - startTime > PIPEDRIVE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Pipedrive allowed values`);

        break;
      }

      const { data, hasMore: more } = await fetchPipedriveData<TPipedrivePersonData>({
        path: '/persons',
        token,
        limit,
        offset: start,
      });

      persons.push(...data);

      hasMore = more;
      start += data.length;

      if (hasMore) {
        await delay(PIPEDRIVE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }
  } catch (error) {
    Debugger.log(`Failed to fetch Pipedrive allowed values: ${error}`);
  } finally {
    return persons;
  }
};

export const getPipedriveAttendeeAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  object
> = async (context): Promise<IQoreAllowedValue<object>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive person allowed values');
  }

  const persons = await fetchPipedrivePersons(token);

  const personsAllowedValues: IQoreAllowedValue<object>[] = [];

  persons.forEach((person) => {
    if (!person?.email?.length) return;

    const email = person.email.filter((email) => email.value);

    if (!email.length) return;

    personsAllowedValues.push(mapPipedriveAttendee({ ...person, email }));
  });

  return personsAllowedValues;
};
