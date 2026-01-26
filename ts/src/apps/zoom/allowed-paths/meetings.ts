import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import zoomMeetings from '../../../schemas/zoom/meetings.swagger.json';
import { ZOOM_APP_NAME } from '../constants';
import { getZoomMeetingIDAllowedValues } from '../helpers/get-meeting-id-allowed-values';
import { getZoomWebinarIdAllowedValues } from '../helpers/get-webinar-id-allowed-values';
import { ZoomTimezoneAllowedValues } from '../helpers/get-timezone-allowed-values';
import { getZoomMeetingTemplateIdAllowedValues } from '../helpers/get-meeting-template-allowed-values';
import { getZoomMeetingOccurrenceIdAllowedValues } from '../helpers/get-meeting-occurrence-id-allowed-values';
import { getZoomWebinarTemplateIdAllowedValues } from '../helpers/get-webinar-template-allowed-values';
import { getZoomWebinarOccurrenceIdAllowedValues } from '../helpers/get-webinar-occurrence-id-allowed-values';
import { getZoomWebinarTrackingSourceIdAllowedValues } from '../helpers/get-webinar-tracking-source-allowed-values';

export const ZOOM_MEETINGS_ALLOWED_PATHS = {
  '/users/{userId}/recordings': {
    GET: {
      override_options: {
        userId: {
          default_value: 'me',
        },
        meeting_id: {
          get_allowed_values: getZoomMeetingIDAllowedValues,
        },
      },
    },
  },

  // Meetings
  '/users/{userId}/meetings': {
    POST: {
      override_options: {
        userId: {
          default_value: 'me',
        },
        template_id: {
          get_allowed_values: getZoomMeetingTemplateIdAllowedValues,
        },
        timezone: {
          allowed_values: ZoomTimezoneAllowedValues,
        },
        topic: {
          required: true,
        },
      },
    },
    GET: {
      override_options: {
        userId: {
          default_value: 'me',
        },
        timezone: {
          allowed_values: ZoomTimezoneAllowedValues,
        },
      },
    },
  },
  '/meetings/{meetingId}': {
    GET: {
      override_options: {
        meetingId: {
          get_allowed_values: getZoomMeetingIDAllowedValues,
          on_change: ['refetch'],
        },
        occurrence_id: {
          depends_on: ['meetingId'],
          get_allowed_values: getZoomMeetingOccurrenceIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        meetingId: {
          get_allowed_values: getZoomMeetingIDAllowedValues,
          on_change: ['refetch'],
        },
        occurrence_id: {
          depends_on: ['meetingId'],
          get_allowed_values: getZoomMeetingOccurrenceIdAllowedValues,
        },
        template_id: {
          get_allowed_values: getZoomMeetingTemplateIdAllowedValues,
        },
        timezone: {
          allowed_values: ZoomTimezoneAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        meetingId: {
          get_allowed_values: getZoomMeetingIDAllowedValues,
          on_change: ['refetch'],
        },
        occurrence_id: {
          depends_on: ['meetingId'],
          get_allowed_values: getZoomMeetingOccurrenceIdAllowedValues,
        },
      },
    },
  },
  '/past_meetings/{meetingId}/participants': {
    GET: {
      override_options: {
        meetingId: {
          get_allowed_values: getZoomMeetingIDAllowedValues,
        },
      },
    },
  },
  '/meetings/{meetingId}/meeting_summary': {
    GET: {
      override_options: {
        meetingId: {
          get_allowed_values: getZoomMeetingIDAllowedValues,
        },
      },
    },
  },
  '/meetings/{meetingId}/recordings': {
    GET: {
      override_options: {
        meetingId: {
          get_allowed_values: getZoomMeetingIDAllowedValues,
        },
        include_fields: {
          allowed_values: [
            {
              value: 'download_access_token',
              display_name: 'Download Access Token',
            },
          ],
        },
        ttl: {
          depends_on: ['include_fields'],
        },
      },
    },
    DELETE: {
      override_options: {
        meetingId: {
          get_allowed_values: async (context) => {
            const [meetings, webinars] = await Promise.all([
              getZoomMeetingIDAllowedValues(context),
              getZoomWebinarIdAllowedValues(context),
            ]);

            return [...meetings, ...webinars];
          },
        },
      },
    },
  },
  '/meetings/{meetingId}/registrants': {
    GET: {
      override_options: {
        meetingId: {
          get_allowed_values: getZoomMeetingIDAllowedValues,
          on_change: ['refetch'],
        },
        occurrence_id: {
          depends_on: ['meetingId'],
          get_allowed_values: getZoomMeetingOccurrenceIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        meetingId: {
          get_allowed_values: getZoomMeetingIDAllowedValues,
          on_change: ['refetch'],
        },
        occurrence_ids: {
          get_element_allowed_values: getZoomMeetingOccurrenceIdAllowedValues,
          depends_on: ['meetingId'],
        },
      },
    },
  },

  // Webinars
  '/users/{userId}/webinars': {
    POST: {
      override_options: {
        userId: {
          default_value: 'me',
        },
        template_id: {
          get_allowed_values: getZoomWebinarTemplateIdAllowedValues,
        },
        timezone: {
          allowed_values: ZoomTimezoneAllowedValues,
        },
      },
    },
    GET: {
      override_options: {
        userId: {
          default_value: 'me',
        },
      },
    },
  },
  '/webinars/{webinarId}': {
    GET: {
      override_options: {
        webinarId: {
          get_allowed_values: getZoomWebinarIdAllowedValues,
          on_change: ['refetch'],
        },
        occurrence_id: {
          depends_on: ['webinarId'],
          get_allowed_values: getZoomWebinarOccurrenceIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        webinarId: {
          get_allowed_values: getZoomWebinarIdAllowedValues,
          on_change: ['refetch'],
        },
        occurrence_id: {
          depends_on: ['webinarId'],
          get_allowed_values: getZoomWebinarOccurrenceIdAllowedValues,
        },
        template_id: {
          get_allowed_values: getZoomWebinarTemplateIdAllowedValues,
        },
        timezone: {
          allowed_values: ZoomTimezoneAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        webinarId: {
          get_allowed_values: getZoomWebinarIdAllowedValues,
          on_change: ['refetch'],
        },
        occurrence_id: {
          depends_on: ['webinarId'],
          get_allowed_values: getZoomWebinarOccurrenceIdAllowedValues,
        },
      },
    },
  },
  '/past_webinars/{webinarId}/participants': {
    GET: {
      override_options: {
        webinarId: {
          get_allowed_values: getZoomWebinarIdAllowedValues,
        },
      },
    },
  },
  '/webinars/{webinarId}/registrants': {
    GET: {
      override_options: {
        webinarId: {
          get_allowed_values: getZoomWebinarIdAllowedValues,
          on_change: ['refetch'],
        },
        occurrence_id: {
          depends_on: ['webinarId'],
          get_allowed_values: getZoomWebinarOccurrenceIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        webinarId: {
          get_allowed_values: getZoomWebinarIdAllowedValues,
          on_change: ['refetch'],
        },
        occurrence_ids: {
          get_element_allowed_values: getZoomWebinarOccurrenceIdAllowedValues,
          depends_on: ['webinarId'],
        },
        source_id: {
          depends_on: ['webinarId'],
          get_allowed_values: getZoomWebinarTrackingSourceIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const ZOOM_MEETINGS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: zoomMeetings as unknown as OpenAPIV2.Document,
  allowedPaths: ZOOM_MEETINGS_ALLOWED_PATHS,
  schemaPath: 'meetings',
  app: ZOOM_APP_NAME,
});
