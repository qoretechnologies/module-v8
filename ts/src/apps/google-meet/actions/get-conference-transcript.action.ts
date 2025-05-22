import { meet_v2 } from '@googleapis/meet';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_MEET_APP_NAME, GoogleMeetError } from '../constants';
import { createGoogleMeetClient, formatDate } from '../helpers/constants';
import { getGoogleMeetConferenceIdAllowedValues } from '../helpers/get-conference-id-allowed-values';
import { getGoogleMeetConferenceTranscriptIdAllowedValues } from '../helpers/get-transcript-id-allowed-values';

type TranscriptEntry = {
  text: string;
  timestamp: string;
  speaker: string;
  start_time: string;
  end_time: string;
};

const options = {
  conference: {
    type: 'string',
    preselected: true,
    on_change: ['refetch'],
    get_allowed_values: getGoogleMeetConferenceIdAllowedValues,
    allowed_values_creatable: true,
    required: false,
  },
  transcript: {
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleMeetConferenceTranscriptIdAllowedValues,
    required: true,
  },
} satisfies TQoreOptions;

const getConferenceTranscript = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_MEET_APP_NAME,
  action: 'get_conference_transcript',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, transcript } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['transcript'],
      connectionFields: ['token'],
      ErrorClass: GoogleMeetError,
    });

    const meetClient = createGoogleMeetClient(token);

    try {
      const transcriptResponse = await meetClient.conferenceRecords.transcripts.get({
        name: transcript,
      });

      const transcriptParts = transcript.split('/');
      const conferenceId = transcriptParts.slice(0, -2).join('/');

      const participantsResponse = await meetClient.conferenceRecords.participants.list({
        parent: conferenceId,
      });

      const rawParticipants = participantsResponse.data.participants ?? [];

      const participants = rawParticipants.reduce<Record<string, string>>((acc, p) => {
        if (p.name) {
          acc[p.name] = getParticipantName(p);
        }

        return acc;
      }, {});

      const result = {
        start_time: formatDate(transcriptResponse.data.startTime || ''),
        end_time: formatDate(transcriptResponse.data.endTime || ''),
        participants: rawParticipants.map((p) => ({
          id: p.name,
          name: getParticipantName(p),
        })),
        transcript: [] as Array<{
          text: string;
          timestamp: string;
          speaker: string;
          start_time: string;
          end_time: string;
        }>,
      };

      let pageToken: string | undefined = undefined;
      let allTranscriptEntries: meet_v2.Schema$TranscriptEntry[] = [];
      do {
        const entriesResponse: { data: meet_v2.Schema$ListTranscriptEntriesResponse } =
          await meetClient.conferenceRecords.transcripts.entries.list({
            parent: transcript,
            pageSize: 1000,
            pageToken,
          });

        const transcriptEntries = entriesResponse.data.transcriptEntries || [];
        allTranscriptEntries = [...allTranscriptEntries, ...transcriptEntries];

        pageToken = entriesResponse.data.nextPageToken || undefined;
      } while (pageToken);

      let lastSpeaker: string | null = null;
      let currentEntry: TranscriptEntry | null = null;

      allTranscriptEntries.forEach((entry) => {
        if (!entry.text) return;

        const timestamp = entry.startTime ? entry.startTime : '';
        const speaker = participants?.[entry.participant!] || 'Unknown Participant';
        const text = entry.text.trim();
        const startTime = entry.startTime || '';
        const endTime = entry.endTime || '';
        const meetingStartTime = transcriptResponse.data.startTime || '';

        const formattedStartTime = formatTimestamp(startTime, meetingStartTime);
        const formattedEndTime = formatTimestamp(endTime, meetingStartTime);

        if (lastSpeaker === speaker && currentEntry) {
          currentEntry.text += ' ' + text;

          if (endTime) {
            currentEntry.end_time = formattedEndTime;
          }

          return;
        }

        if (currentEntry) {
          result.transcript.push(currentEntry);
        }

        currentEntry = {
          text,
          timestamp,
          speaker,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
        };

        lastSpeaker = speaker;
      });

      if (currentEntry) {
        result.transcript.push(currentEntry);
      }

      return result;
    } catch (error) {
      throw new GoogleMeetError(`Failed to get meeting transcript: ${error.message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      start_time: { type: 'string' },
      end_time: { type: 'string' },
      transcript: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              text: { type: 'string' },
              timestamp: { type: 'string' },
              speaker: { type: 'string' },
              start_time: { type: 'string' },
              end_time: { type: 'string' },
            },
          },
        },
      },
      participants: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

const getParticipantName = (participant: meet_v2.Schema$Participant): string => {
  return (
    participant.signedinUser?.displayName ||
    participant.phoneUser?.displayName ||
    participant.anonymousUser?.displayName ||
    'Unknown Participant'
  );
};

const formatTimestamp = (timestamp: string, meetingStartTime: string): string => {
  if (!timestamp || !meetingStartTime) return '';

  try {
    const date = new Date(timestamp);
    const startDate = new Date(meetingStartTime);

    const diffInMs = date.getTime() - startDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);

    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    if (hours > 0) {
      return (
        `${hours.toString().padStart(2, '0')}` +
        `:${minutes.toString().padStart(2, '0')}` +
        `:${seconds.toString().padStart(2, '0')}`
      );
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } catch (error) {
    return '';
  }
};

export default getConferenceTranscript;
