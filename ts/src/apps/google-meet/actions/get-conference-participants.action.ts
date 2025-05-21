import { meet_v2 } from '@googleapis/meet';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_MEET_APP_NAME, GoogleMeetError } from '../constants';
import { createGoogleMeetClient, formatDate } from '../helpers/constants';
import { getConferenceIdByMeetingCode } from '../helpers/get-conference-id-by-meeting-code.helper';
import { getGoogleMeetConferenceIdAllowedValues } from '../helpers/get-conference-id-allowed-values';

const options = {
  conference: {
    type: 'string',
    get_allowed_values: getGoogleMeetConferenceIdAllowedValues,
    allowed_values_creatable: true,
    preselected: true,
    required: true,
  },
  search: {
    type: 'string',
    preselected: true,
    required: false,
  },
  include_time_spent: {
    type: 'boolean',
    preselected: true,
    required: false,
    default_value: true,
  },
} satisfies TQoreOptions;

const getConferenceParticipants = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_MEET_APP_NAME,
  action: 'get_conference_participants',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues<{
      token: string;
      search?: string;
      include_time_spent?: boolean;
    }>({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GoogleMeetError,
    });

    const meetClient = createGoogleMeetClient(token);
    let conference = obj?.conference;
    const search = obj?.search;
    const include_time_spent = obj?.include_time_spent !== false;

    if (conference?.length === 10 && conference.split('-').length === 3) {
      const foundId = await getConferenceIdByMeetingCode(conference, token);

      if (!foundId) {
        throw new GoogleMeetError(`Invalid meeting code: ${conference}`);
      }

      conference = foundId;
    }

    try {
      const conferenceResponse = await meetClient.conferenceRecords.get({
        name: conference,
      });

      const conferenceData = conferenceResponse.data;
      const conferenceStartTime = new Date(conferenceData.startTime || new Date()).getTime();
      const conferenceEndTime = new Date(conferenceData.endTime || new Date()).getTime();
      const conferenceDuration = Math.floor((conferenceEndTime - conferenceStartTime) / 1000);

      let pageToken: string | undefined = undefined;
      let allParticipants: meet_v2.Schema$Participant[] = [];

      do {
        const participantsResponse: { data: meet_v2.Schema$ListParticipantsResponse } =
          await meetClient.conferenceRecords.participants.list({
            parent: conference,
            pageSize: 100,
            pageToken,
          });

        const participants = participantsResponse.data.participants || [];
        allParticipants = [...allParticipants, ...participants];

        pageToken = participantsResponse.data.nextPageToken || undefined;
      } while (pageToken);

      if (search) {
        const searchLower = search.toLowerCase();
        allParticipants = allParticipants.filter((participant) => {
          const displayName = getParticipantName(participant).toLowerCase();

          return displayName.includes(searchLower);
        });
      }

      const participantsWithDetails = await Promise.all(
        allParticipants.map(async (participant) => {
          let attendanceDetails = null;

          if (include_time_spent) {
            let attendancePageToken: string | undefined = undefined;
            let allAttendancePeriods: meet_v2.Schema$ParticipantSession[] = [];
            let totalDurationSeconds = 0;

            try {
              do {
                const attendanceResponse: { data: meet_v2.Schema$ListParticipantSessionsResponse } =
                  await meetClient.conferenceRecords.participants.participantSessions.list({
                    parent: participant.name!,
                    pageSize: 1000,
                    pageToken: attendancePageToken,
                  });

                const attendancePeriods = attendanceResponse.data.participantSessions || [];
                allAttendancePeriods = [...allAttendancePeriods, ...attendancePeriods];

                attendancePageToken = attendanceResponse.data.nextPageToken || undefined;
              } while (attendancePageToken);

              totalDurationSeconds = allAttendancePeriods.reduce((total, period) => {
                const startTime = new Date(period.startTime || '').getTime();
                const endTime = new Date(period.endTime || '').getTime();

                return total + Math.floor((endTime - startTime) / 1000);
              }, 0);

              const attendancePercentage =
                conferenceDuration > 0
                  ? Math.min(100, Math.round((totalDurationSeconds / conferenceDuration) * 100))
                  : 0;

              attendanceDetails = {
                attendance_periods: allAttendancePeriods.map((period) => ({
                  start_time: formatDate(period.startTime || ''),
                  end_time: formatDate(period.endTime || ''),
                  duration_seconds: calculateDuration(period.startTime, period.endTime),
                })),
                total_time_seconds: totalDurationSeconds,
                attendance_percentage: attendancePercentage,
                first_join_time:
                  allAttendancePeriods.length > 0
                    ? formatDate(allAttendancePeriods[0].startTime || '')
                    : '',
                last_leave_time:
                  allAttendancePeriods.length > 0
                    ? formatDate(
                        allAttendancePeriods[allAttendancePeriods.length - 1].endTime || ''
                      )
                    : '',
              };
            } catch (error) {
              console.error(
                `Error fetching attendance for participant ${participant.name}:`,
                error
              );
            }
          }

          return {
            id: participant.name || '',
            type: getParticipantType(participant),
            display_name: getParticipantName(participant),
            ...(include_time_spent && attendanceDetails && attendanceDetails),
          };
        })
      );

      return participantsWithDetails.sort((a, b) => {
        if (include_time_spent) {
          return (b.attendance_percentage || 0) - (a.attendance_percentage || 0);
        }

        return a.display_name.localeCompare(b.display_name);
      });
    } catch (error) {
      throw new GoogleMeetError(`Failed to get meeting participants: ${error.message}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        type: { type: 'string' },
        display_name: { type: 'string' },
        attendance_periods: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                start_time: { type: 'string' },
                end_time: { type: 'string' },
                duration_seconds: { type: 'number' },
              },
            },
          },
        },
        total_time_seconds: { type: 'number' },
        attendance_percentage: { type: 'number' },
        first_join_time: { type: 'string' },
        last_leave_time: { type: 'string' },
      },
    },
  },
});

const calculateDuration = (startTime?: string | null, endTime?: string | null): number => {
  if (!startTime || !endTime) return 0;

  try {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    return Math.floor((end - start) / 1000);
  } catch (error) {
    return 0;
  }
};

const getParticipantName = (participant: meet_v2.Schema$Participant): string => {
  return (
    participant.signedinUser?.displayName ||
    participant.phoneUser?.displayName ||
    participant.anonymousUser?.displayName ||
    'Unknown Participant'
  );
};

const getParticipantType = (participant: meet_v2.Schema$Participant): string => {
  if (participant.signedinUser) return 'signed_in';
  if (participant.phoneUser) return 'phone';
  if (participant.anonymousUser) return 'anonymous';

  return 'unknown';
};

export default getConferenceParticipants;
