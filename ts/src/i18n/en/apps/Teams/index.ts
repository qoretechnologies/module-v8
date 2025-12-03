

const TeamsAppEn = {
  displayName: 'Microsoft Teams',
  groups: ['Team Communication & Chat'],
  shortDesc: 'Collaborate with your team using channels, meetings, and messages',
  longDesc:
    'Microsoft Teams is a collaboration platform that enables messaging, file sharing, video meetings, and app integration within your organization.',
  actions: {
    'create-channel': {
      displayName: 'Create Channel',
      shortDesc: 'Create a new channel in a team',
      longDesc:
        'Create a new channel within a specified team where members can collaborate through conversations, files, and integrated apps.',
      options: {
        teamId: {
          displayName: 'Team ID',
          shortDesc: 'Unique identifier for the team',
          longDesc:
            'The unique identifier (GUID) for the team where the new channel will be created.',
        },
        displayName: {
          displayName: 'Channel Name',
          shortDesc: 'Name of the new channel',
          longDesc:
            'The display name for the new channel. Must be unique within the team and between 1-50 characters.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Description of the channel purpose',
          longDesc:
            'Optional description explaining the purpose or topic of the channel. Limited to 1024 characters.',
        },
        membershipType: {
          displayName: 'Membership Type',
          shortDesc: 'Channel privacy setting',
          longDesc:
            'Defines the privacy level of the channel. Options include "standard" (visible to all team members) or "private" (visible only to specific members).',
        },
      },
    },
    'create-meeting': {
      displayName: 'Create Meeting',
      shortDesc: 'Schedule a new Teams meeting',
      longDesc:
        'Schedule a new meeting in Microsoft Teams with specified participants, time, location, and other meeting details.',
      options: {
        subject: {
          displayName: 'Subject',
          shortDesc: 'Meeting title',
          longDesc:
            'The title or subject of the meeting that will appear in calendar invitations and the meeting list.',
        },
        startDateTime: {
          displayName: 'Start Time',
          shortDesc: 'Meeting start date and time',
          longDesc:
            'The date and time when the meeting begins in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).',
        },
        endDateTime: {
          displayName: 'End Time',
          shortDesc: 'Meeting end date and time',
          longDesc:
            'The date and time when the meeting ends in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).',
        },
        teamId: {
          displayName: 'Team ID',
          shortDesc: 'Associated team identifier',
          longDesc: 'Optional team identifier if the meeting is associated with a specific team.',
        },
        channelId: {
          displayName: 'Channel ID',
          shortDesc: 'Associated channel identifier',
          longDesc:
            'Optional channel identifier if the meeting is associated with a specific channel within a team.',
        },
        content: {
          displayName: 'Meeting Content',
          shortDesc: 'Meeting agenda or notes',
          longDesc:
            'Optional text describing the meeting agenda, preparation materials, or other relevant information.',
        },
        location: {
          displayName: 'Location',
          shortDesc: 'Physical or virtual meeting location',
          longDesc:
            'The physical location where the meeting will take place, or a custom virtual location description.',
        },
        attendees: {
          displayName: 'Attendees',
          shortDesc: 'Meeting participants',
          longDesc:
            'List of email addresses or user IDs for people who should be invited to the meeting.',
        },
        isOnlineMeeting: {
          displayName: 'Online Meeting',
          shortDesc: 'Enable Teams online meeting features',
          longDesc:
            'When set to true, creates a Teams online meeting with video conferencing capabilities and a join link.',
        },
        timeZone: {
          displayName: 'Time Zone',
          shortDesc: 'Meeting time zone',
          longDesc:
            'The time zone for the meeting start and end times, such as "Pacific Standard Time" or "UTC".',
        },
      },
    },
    'delete-meeting': {
      displayName: 'Delete Meeting',
      shortDesc: 'Cancel an existing meeting',
      longDesc:
        "Permanently cancels and removes a scheduled meeting from all participants' calendars.",
      options: {
        meetingId: {
          displayName: 'Meeting ID',
          shortDesc: 'Unique meeting identifier',
          longDesc: 'The unique identifier (GUID) of the meeting to be canceled.',
        },
        meetingSource: {
          displayName: 'Meeting Source',
          shortDesc: 'Origin of the meeting',
          longDesc: 'Specifies where the meeting was created, such as "private" or "team".',
        },
        teamId: {
          displayName: 'Team ID',
          shortDesc: 'Associated team identifier',
          longDesc: 'The team identifier if the meeting is associated with a specific team.',
        },
      },
    },
    'send-channel-message': {
      displayName: 'Send Channel Message',
      shortDesc: 'Post a message to a team channel',
      longDesc:
        'Send a new message to a specific channel within a team that all channel members can view and respond to.',
      options: {
        channelId: {
          displayName: 'Channel ID',
          shortDesc: 'Target channel identifier',
          longDesc: 'The unique identifier of the channel where the message will be posted.',
        },
        teamId: {
          displayName: 'Team ID',
          shortDesc: 'Team identifier',
          longDesc: 'The unique identifier of the team containing the target channel.',
        },
        message: {
          displayName: 'Message',
          shortDesc: 'Message content',
          longDesc: 'The text content of the message to be posted in the channel.',
        },
        contentType: {
          displayName: 'Content Type',
          shortDesc: 'Format of the message content',
          longDesc:
            'Specifies the format of the message content, such as "text" for plain text or "html" for formatted content.',
        },
      },
    },
    'send-chat-message': {
      displayName: 'Send Chat Message',
      shortDesc: 'Send a message to a chat conversation',
      longDesc:
        'Send a new message to a direct chat or group chat conversation outside of a team channel.',
      options: {
        chatId: {
          displayName: 'Chat ID',
          shortDesc: 'Target chat identifier',
          longDesc:
            'The unique identifier of the direct chat or group chat where the message will be sent.',
        },
        message: {
          displayName: 'Message',
          shortDesc: 'Message content',
          longDesc: 'The text content of the message to be sent in the chat.',
        },
        contentType: {
          displayName: 'Content Type',
          shortDesc: 'Format of the message content',
          longDesc:
            'Specifies the format of the message content, such as "text" for plain text or "html" for formatted content.',
        },
      },
    },
    'update-channel': {
      displayName: 'Update Channel',
      shortDesc: 'Modify an existing channel',
      longDesc: 'Update the properties or membership of an existing channel within a team.',
      options: {
        channelId: {
          displayName: 'Channel ID',
          shortDesc: 'Target channel identifier',
          longDesc: 'The unique identifier of the channel to be updated.',
        },
        teamId: {
          displayName: 'Team ID',
          shortDesc: 'Team identifier',
          longDesc: 'The unique identifier of the team containing the channel to be updated.',
        },
        displayName: {
          displayName: 'Channel Name',
          shortDesc: 'New channel name',
          longDesc:
            'The new display name for the channel. Must be unique within the team and between 1-50 characters.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'New channel description',
          longDesc:
            'Updated description explaining the purpose or topic of the channel. Limited to 1024 characters.',
        },
        addMembers: {
          displayName: 'Add Members',
          shortDesc: 'Users to add to the channel',
          longDesc:
            'List of user IDs to add as members to the channel. Only applicable for private channels.',
        },
        removeMembers: {
          displayName: 'Remove Members',
          shortDesc: 'Users to remove from the channel',
          longDesc:
            'List of user IDs to remove from the channel membership. Only applicable for private channels.',
        },
      },
    },
    'update-meeting': {
      displayName: 'Update Meeting',
      shortDesc: 'Modify an existing meeting',
      longDesc:
        'Update the details of a scheduled meeting, such as time, location, attendees, or other properties.',
      options: {
        meetingId: {
          displayName: 'Meeting ID',
          shortDesc: 'Target meeting identifier',
          longDesc: 'The unique identifier of the meeting to be updated.',
        },
        subject: {
          displayName: 'Subject',
          shortDesc: 'Updated meeting title',
          longDesc:
            'The new title or subject of the meeting that will appear in calendar invitations and the meeting list.',
        },
        startDateTime: {
          displayName: 'Start Time',
          shortDesc: 'Updated meeting start time',
          longDesc:
            'The new date and time when the meeting begins in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).',
        },
        endDateTime: {
          displayName: 'End Time',
          shortDesc: 'Updated meeting end time',
          longDesc:
            'The new date and time when the meeting ends in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).',
        },
        teamId: {
          displayName: 'Team ID',
          shortDesc: 'Associated team identifier',
          longDesc: 'Updated team identifier if the meeting is associated with a specific team.',
        },
        channelId: {
          displayName: 'Channel ID',
          shortDesc: 'Associated channel identifier',
          longDesc:
            'Updated channel identifier if the meeting is associated with a specific channel within a team.',
        },
        content: {
          displayName: 'Meeting Content',
          shortDesc: 'Updated meeting agenda or notes',
          longDesc:
            'Updated text describing the meeting agenda, preparation materials, or other relevant information.',
        },
        location: {
          displayName: 'Location',
          shortDesc: 'Updated meeting location',
          longDesc:
            'The new physical location where the meeting will take place, or a custom virtual location description.',
        },
        attendees: {
          displayName: 'Attendees',
          shortDesc: 'Updated meeting participants',
          longDesc:
            'Updated list of email addresses or user IDs for people who should be invited to the meeting.',
        },
        isOnlineMeeting: {
          displayName: 'Online Meeting',
          shortDesc: 'Enable/disable Teams online meeting features',
          longDesc:
            'When set to true, ensures the meeting has Teams online meeting capabilities with video conferencing and a join link.',
        },
        timeZone: {
          displayName: 'Time Zone',
          shortDesc: 'Updated meeting time zone',
          longDesc:
            'The new time zone for the meeting start and end times, such as "Pacific Standard Time" or "UTC".',
        },
      },
    },
  },
  triggers: {
    'new-channel-message': {
      displayName: 'New Channel Message',
      shortDesc: 'Trigger when a message is posted in a channel',
      longDesc:
        'This trigger fires when a new message is posted in a specified channel within a team.',
      options: {
        channelId: {
          displayName: 'Channel ID',
          shortDesc: 'Channel to monitor for messages',
          longDesc: 'The unique identifier of the channel to monitor for new messages.',
        },
        teamId: {
          displayName: 'Team ID',
          shortDesc: 'Team identifier',
          longDesc: 'The unique identifier of the team containing the channel to monitor.',
        },
      },
    },
    'new-chat-message': {
      displayName: 'New Chat Message',
      shortDesc: 'Trigger when a message is sent in a chat',
      longDesc:
        'This trigger fires when a new message is sent in a direct chat or group chat conversation.',
      options: {
        chatId: {
          displayName: 'Chat ID',
          shortDesc: 'Chat to monitor for messages',
          longDesc:
            'The unique identifier of the direct chat or group chat to monitor for new messages.',
        },
      },
    },
    'new-meeting': {
      displayName: 'New Meeting',
      shortDesc: 'Trigger when a meeting is created',
      longDesc:
        'This trigger fires when a new meeting is scheduled that matches the specified criteria.',
      options: {
        meetingSource: {
          displayName: 'Meeting Source',
          shortDesc: 'Origin of the meeting',
          longDesc:
            'Specifies which type of meetings to monitor, such as "private" or "team" meetings.',
        },
        teamId: {
          displayName: 'Team ID',
          shortDesc: 'Associated team identifier',
          longDesc: 'Optional filter to only trigger for meetings associated with a specific team.',
        },
      },
    },
  },
};

export default TeamsAppEn;
