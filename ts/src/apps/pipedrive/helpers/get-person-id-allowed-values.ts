import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedrivePersonData = {
  id: number;
  name: string;
  emails?: { value: string }[];
  phones?: { value: string }[];
};

const mapPipedrivePerson = (person: TPipedrivePersonData): IQoreAllowedValue<number> => ({
  display_name: person.name,
  value: person.id,
  desc:
    (person.emails?.length ? `Email: ${person.emails[0].value}\n\n` : '') +
    (person.phones?.length ? `Phone: ${person.phones[0].value}\n\n` : ''),
});

export const getPipedrivePersonIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context): Promise<IQoreAllowedValue<number>[]> => {
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
