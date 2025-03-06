import { Client } from '@microsoft/microsoft-graph-client';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getTeamsAttendeesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to get attendees allowed values');
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  try {
    try {
      const peopleResponse = await client.api('/me/people').top(20).get();

      for (const person of peopleResponse.value) {
        if (person.scoredEmailAddresses && person.scoredEmailAddresses.length > 0) {
          const email = person.scoredEmailAddresses[0].address;
          const details = [];
          if (person.jobTitle) details.push(person.jobTitle);
          if (person.department) details.push(person.department);
          if (person.companyName) details.push(person.companyName);

          allowedValues.push({
            display_name: `${person.displayName}`,
            value: email,
            short_desc: `Email: ${email}`,
            desc: `Job Title: ${person.jobTitle}\n\nDepartment: ${person.department}\n\nCompany: ${person.companyName}`,
          });
        }
      }
    } catch (peopleError) {
      throw new Error(`Failed to get attendees allowed values: ${peopleError.message}`);
    }

    return allowedValues;
  } catch (error) {
    throw new Error(`Failed to get attendees allowed values: ${error.message}`);
  }
};
