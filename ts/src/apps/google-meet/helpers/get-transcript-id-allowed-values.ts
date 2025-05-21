import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GoogleMeetError } from '../constants';
import { createGoogleMeetClient, formatDate } from './constants';
import { getConferenceIdByMeetingCode } from './get-conference-id-by-meeting-code.helper';

export const getGoogleMeetConferenceTranscriptIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: GoogleMeetError,
  });

  let conference = context?.opts?.conference;

  if (!conference) return [];

  if (conference?.length === 10 && conference.split('-').length === 3) {
    const foundId = await getConferenceIdByMeetingCode(conference, token);

    if (!foundId) {
      throw new GoogleMeetError(`Invalid meeting code: ${conference}`);
    }

    conference = foundId;
  }

  try {
    const meetClient = createGoogleMeetClient(token);

    const response = await meetClient.conferenceRecords.transcripts.list({
      parent: conference,
      pageSize: 1000,
    });

    const transcripts = response.data.transcripts || [];

    if (!transcripts || transcripts.length === 0) {
      return [];
    }

    const allowedValues: IQoreAllowedValue<string>[] = transcripts.map((transcript) => {
      return {
        value: transcript.name!,
        display_name: `Transcript for ${formatDate(transcript.startTime)}`,
        desc:
          `ID: ${transcript.name}\n` +
          `Start Time: ${formatDate(transcript.startTime)}` +
          `End Time: ${formatDate(transcript.endTime)}`,
      };
    });

    return allowedValues;
  } catch (error) {
    throw new GoogleMeetError(`Failed to fetch conference IDs: ${error.message || error}`);
  }
};
