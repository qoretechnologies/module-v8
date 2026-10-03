// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { GoogleMeetError } from '../constants';
import { createGoogleMeetClient } from './constants';

export const getConferenceIdByMeetingCode = async (
  meetingCode: string,
  token: string
): Promise<string | null> => {
  const meetClient = createGoogleMeetClient(token);
  const conferenceResponse = await meetClient.conferenceRecords.list({
    filter: `space.meeting_code="${meetingCode}"`,
  });

  if (conferenceResponse.data.conferenceRecords?.[0]?.name) {
    return conferenceResponse.data.conferenceRecords[0].name;
  }

  return null;
};

export const getGoogleMeetConferenceOption = async (
  options: { conference?: string } | undefined,
  token: string
) => {
  let conference = options?.conference;

  if (conference?.length === 12 && conference.split('-').length === 3) {
    const foundId = await getConferenceIdByMeetingCode(conference, token);

    if (!foundId) {
      throw new GoogleMeetError(`Invalid meeting code: ${conference}`);
    }

    conference = foundId;
  }

  return conference;
};
