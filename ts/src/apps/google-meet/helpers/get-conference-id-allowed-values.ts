import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GoogleMeetError } from '../constants';
import { createGoogleMeetClient, formatDate } from './constants';

export const getGoogleMeetConferenceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new GoogleMeetError('Authentication token is required to get conference IDs');
  }

  try {
    const meetClient = createGoogleMeetClient(token);

    const response = await meetClient.conferenceRecords.list({
      pageSize: 100,
    });

    const conferences = response.data.conferenceRecords || [];

    if (!conferences || conferences.length === 0) {
      return [];
    }

    const allowedValues: IQoreAllowedValue<string>[] = conferences.map((conference) => {
      return {
        value: conference.name!,
        display_name: `Conference on ${formatDate(conference.startTime)}`,
        desc:
          `ID: ${conference.name}\n` +
          `Start Time: ${formatDate(conference.startTime)}` +
          `End Time: ${formatDate(conference.endTime)}` +
          `Space: ${conference.space}`,
      };
    });

    return allowedValues;
  } catch (error) {
    throw new GoogleMeetError(`Failed to fetch conference IDs: ${error.message || error}`);
  }
};
