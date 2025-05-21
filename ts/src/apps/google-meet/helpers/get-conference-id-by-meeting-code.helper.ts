import { createGoogleMeetClient } from './constants';

export const getConferenceIdByMeetingCode = async (
  meetingCode: string,
  token: string
): Promise<string | null> => {
  const meetClient = createGoogleMeetClient(token);

  try {
    const conferenceResponse = await meetClient.conferenceRecords.list({
      filter: `space.meeting_code="${meetingCode}"`,
    });

    if (conferenceResponse.data.conferenceRecords?.[0]?.name) {
      return conferenceResponse.data.conferenceRecords[0].name;
    }

    return null;
  } catch (error) {
    console.error('Error fetching conference ID:', error);

    return null;
  }
};
