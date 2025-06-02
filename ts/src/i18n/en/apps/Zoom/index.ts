/* eslint-disable max-len */
const ZoomAppEn = {
  displayName: 'Zoom',
  shortDesc: 'Video conferencing and online meeting platform',
  longDesc:
    'Zoom is a video conferencing and online meeting platform that allows users to host and join virtual meetings, webinars, and video conferences. It offers features such as screen sharing, recording, and chat functionalities to enhance collaboration and communication among participants.',
  actions: {},
  triggers: {
    new_meeting: {
      displayName: 'New Meeting',
      shortDesc: 'Triggers when a Zoom meeting is created, started, or ended.',
      longDesc:
        'Monitors Zoom meetings and triggers when meetings are created, started (live), or ended (previous meetings) based on the selected event type. Returns meeting details including topic, duration, join URL, and meeting type.',
      options: {
        meeting_event_type: {
          displayName: 'Meeting Event Type',
          shortDesc: 'Type of meeting event to monitor',
          longDesc:
            'Specifies which type of meeting event should trigger this action. Choose "any" to trigger on all meeting creations, "live" for when meetings start, or "previous_meetings" for when meetings end.',
        },
      },
    },
    new_webinar: {
      displayName: 'New Webinar',
      shortDesc: 'Triggers when a new Zoom webinar is created.',
      longDesc:
        'Monitors Zoom webinars and triggers when new webinars are created. Returns webinar details including topic, duration, join URL, registration URL, and webinar type.',
    },
    new_meeting_summary: {
      displayName: 'New Meeting Summary',
      shortDesc: 'Triggers when a new Zoom meeting summary is created.',
      longDesc:
        'Monitors Zoom meeting summaries and triggers when new summaries are generated after meetings end. Returns summary details including meeting information, host details, and summary timestamps.',
    },
  },
};

export default ZoomAppEn;
