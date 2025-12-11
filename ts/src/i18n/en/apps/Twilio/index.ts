const TwilioAppEn = {
  displayName: 'Twilio',
  groups: ['Messaging & Real-time Communication'],
  connectionMessage: {
    title: 'Credentials Instruction',
    content: `To connect your Twilio account, you'll need your Account SID and Auth Token. You can find these credentials in your Twilio Console under the "Account Info" section on Account Dashboard. https://www.twilio.com/console`,
  },
  shortDesc: 'Connect with Twilio to send SMS, make calls, and manage communications',
  longDesc:
    'Integrate with Twilio to send SMS messages, make voice calls, and manage your communications infrastructure. This integration allows you to automate messaging workflows, handle incoming calls and messages, and build powerful communication features into your applications.',
  actions: {
    create_message: {
      groups: ['Messaging'],
      displayName: 'Create a Message',
      shortDesc: 'Send a new SMS or MMS message',
      longDesc:
        'Create and send a new SMS or MMS message using Twilio. You can send text messages, include media attachments, schedule messages, and configure delivery options. This action supports both standard messaging and messaging services.',
      options: {
        to: {
          displayName: 'To',
          shortDesc: 'The destination phone number',
          longDesc:
            'The phone number to send the message to in E.164 format (e.g., +15551234567). For WhatsApp messages, use the format whatsapp:+15551234567.',
        },
        from: {
          displayName: 'From',
          shortDesc: 'The sender phone number or messaging service SID',
          longDesc:
            'A Twilio phone number in E.164 format, a Messaging Service SID, or a short code. This number must be enabled for the type of message you wish to send.',
        },
        body: {
          displayName: 'Body',
          shortDesc: 'The text content of the message',
          longDesc:
            'The text of the message you want to send, limited to 1600 characters. For SMS messages longer than 160 characters, the message will be sent as multiple segments.',
        },
        mediaUrl: {
          displayName: 'Media URLs',
          shortDesc: 'URLs of media to include in the message',
          longDesc:
            'A list of publicly accessible URLs of media files to send with the message. Supported for MMS messages. You can include up to 10 media files.',
        },
        messagingServiceSid: {
          displayName: 'Messaging Service SID',
          shortDesc: 'The SID of the Messaging Service to use',
          longDesc:
            'The SID of the Messaging Service to use for the message. When set, the from parameter can be omitted, and Twilio will select an appropriate phone number from the Messaging Service pool.',
        },
        statusCallback: {
          displayName: 'Status Callback URL',
          shortDesc: 'URL to receive message status updates',
          longDesc:
            'The URL Twilio will POST to each time the status of the message changes. This allows you to track the delivery status of your messages.',
        },
        maxPrice: {
          displayName: 'Max Price',
          shortDesc: 'Maximum acceptable price for the message',
          longDesc:
            'The maximum total price in USD acceptable for the message to be sent. If the cost exceeds this value, the message will fail.',
        },
        validityPeriod: {
          displayName: 'Validity Period',
          shortDesc: 'How long the message is valid for delivery',
          longDesc:
            'The number of seconds that the message can remain in the queue. After this time, if the message has not been delivered, it will fail. Maximum is 14400 seconds (4 hours).',
        },
        scheduleType: {
          displayName: 'Schedule Type',
          shortDesc: 'The type of message scheduling',
          longDesc:
            'Set to "fixed" to schedule the message to be sent at a specific time. Requires the Send At parameter to be set.',
        },
        sendAt: {
          displayName: 'Send At',
          shortDesc: 'When to send the scheduled message',
          longDesc:
            'The time when the scheduled message should be sent, in ISO 8601 format. This parameter is required when Schedule Type is set to "fixed".',
        },
      },
    },
    list_messages: {
      groups: ['Messaging'],
      displayName: 'List Messages',
      shortDesc: 'Retrieve a list of messages',
      longDesc:
        'Retrieve a list of messages from your Twilio account. You can filter messages by recipient, sender, date range, and other criteria. Results are returned in reverse chronological order.',
      options: {
        to: {
          displayName: 'To',
          shortDesc: 'Filter by recipient phone number',
          longDesc:
            'Only return messages sent to this phone number. The phone number should be in E.164 format.',
        },
        from: {
          displayName: 'From',
          shortDesc: 'Filter by sender phone number',
          longDesc:
            'Only return messages sent from this phone number or alphanumeric sender ID. The phone number should be in E.164 format.',
        },
        dateSentAfter: {
          displayName: 'Date Sent After',
          shortDesc: 'Filter by minimum send date',
          longDesc:
            'Only return messages sent on or after this date. Provide the date in ISO 8601 format.',
        },
        dateSentBefore: {
          displayName: 'Date Sent Before',
          shortDesc: 'Filter by maximum send date',
          longDesc:
            'Only return messages sent on or before this date. Provide the date in ISO 8601 format.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of messages to return',
          longDesc:
            'The maximum number of message records to return. The default is 50 and the maximum is 1000.',
        },
        pageSize: {
          displayName: 'Page Size',
          shortDesc: 'Number of messages per page',
          longDesc:
            'The number of message records to return per page. The default is 50 and the maximum is 1000.',
        },
      },
    },
    get_message: {
      groups: ['Messaging'],
      displayName: 'Get a Message',
      shortDesc: 'Retrieve details of a specific message',
      longDesc:
        'Fetch detailed information about a specific message using its unique SID (String Identifier). This returns all available information about the message including status, content, pricing, and timestamps.',
      options: {
        messageSid: {
          displayName: 'Message SID',
          shortDesc: 'The unique identifier of the message',
          longDesc:
            'The unique string identifier (SID) of the message to retrieve. Message SIDs start with "SM" or "MM".',
        },
      },
    },
    delete_message: {
      groups: ['Messaging'],
      displayName: 'Delete a Message',
      shortDesc: 'Delete a message from your account',
      longDesc:
        'Permanently delete a message record from your Twilio account. This action cannot be undone. Note that deleting a message record does not redact the message content from Twilio logs.',
      options: {
        messageSid: {
          displayName: 'Message SID',
          shortDesc: 'The unique identifier of the message to delete',
          longDesc:
            'The unique string identifier (SID) of the message to delete. Message SIDs start with "SM" or "MM".',
        },
      },
    },
    list_message_media: {
      groups: ['Messaging'],
      displayName: 'List Message Media',
      shortDesc: 'Retrieve media attached to a message',
      longDesc:
        'Retrieve a list of all media files attached to a specific message. This is useful for accessing MMS attachments or media sent via WhatsApp or other channels.',
      options: {
        messageSid: {
          displayName: 'Message SID',
          shortDesc: 'The unique identifier of the message',
          longDesc:
            'The unique string identifier (SID) of the message whose media you want to retrieve. Message SIDs start with "SM" or "MM".',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of media items to return',
          longDesc:
            'The maximum number of media records to return. The default is 50 and the maximum is 1000.',
        },
        pageSize: {
          displayName: 'Page Size',
          shortDesc: 'Number of media items per page',
          longDesc:
            'The number of media records to return per page. The default is 50 and the maximum is 1000.',
        },
      },
    },
    create_call: {
      groups: ['Voice'],
      displayName: 'Create a Call',
      shortDesc: 'Initiate an outbound phone call',
      longDesc:
        'Initiate an outbound phone call using Twilio. You can provide TwiML instructions via URL or directly, configure call recording, answering machine detection, and set up status callbacks to track call progress.',
      options: {
        to: {
          displayName: 'To',
          shortDesc: 'The phone number to call',
          longDesc:
            'The phone number, SIP address, or client identifier to call. Phone numbers must be in E.164 format (e.g., +15551234567).',
        },
        from: {
          displayName: 'From',
          shortDesc: 'The caller ID to display',
          longDesc:
            'The Twilio phone number or client identifier to use as the caller ID. If calling a phone number, this must also be a phone number.',
        },
        url: {
          displayName: 'TwiML URL',
          shortDesc: 'URL that returns TwiML instructions',
          longDesc:
            'The URL that Twilio will fetch TwiML instructions from when the call connects. This URL should return valid TwiML to control the call flow.',
        },
        twiml: {
          displayName: 'TwiML',
          shortDesc: 'TwiML instructions for the call',
          longDesc:
            'TwiML instructions to execute when the call connects. If both TwiML and URL are provided, TwiML takes precedence. Maximum 4000 characters.',
        },
        method: {
          displayName: 'HTTP Method',
          shortDesc: 'HTTP method for fetching TwiML',
          longDesc:
            'The HTTP method to use when requesting the URL. Can be GET or POST. Defaults to POST.',
        },
        statusCallback: {
          displayName: 'Status Callback URL',
          shortDesc: 'URL to receive call status updates',
          longDesc:
            'The URL Twilio will POST to when the call status changes. You can specify which events trigger callbacks using Status Callback Events.',
        },
        statusCallbackEvent: {
          displayName: 'Status Callback Events',
          shortDesc: 'Events that trigger status callbacks',
          longDesc:
            'The call progress events that will trigger a POST to the Status Callback URL. Options include: initiated, ringing, answered, and completed.',
        },
        statusCallbackMethod: {
          displayName: 'Status Callback Method',
          shortDesc: 'HTTP method for status callbacks',
          longDesc:
            'The HTTP method to use when POSTing to the Status Callback URL. Can be GET or POST. Defaults to POST.',
        },
        timeout: {
          displayName: 'Timeout',
          shortDesc: 'Seconds to wait for answer',
          longDesc:
            'The number of seconds to wait for the call to be answered before timing out. Default is 60 seconds, maximum is 600 seconds.',
        },
        record: {
          displayName: 'Record',
          shortDesc: 'Whether to record the call',
          longDesc:
            'Set to true to record the entire call. The recording will be available after the call completes.',
        },
        recordingChannels: {
          displayName: 'Recording Channels',
          shortDesc: 'Number of channels in the recording',
          longDesc:
            'The number of channels in the final recording. "mono" records both legs in a single channel, "dual" records each leg separately.',
        },
        recordingStatusCallback: {
          displayName: 'Recording Status Callback',
          shortDesc: 'URL to notify when recording is available',
          longDesc:
            'The URL Twilio will POST to when the recording is available. This allows you to process or store recordings immediately.',
        },
        machineDetection: {
          displayName: 'Machine Detection',
          shortDesc: 'Enable answering machine detection',
          longDesc:
            'Enable answering machine detection. "Enable" returns AnsweredBy immediately, "DetectMessageEnd" waits for the beep to leave a message.',
        },
        machineDetectionTimeout: {
          displayName: 'Machine Detection Timeout',
          shortDesc: 'Seconds to wait for detection',
          longDesc:
            'The number of seconds to attempt answering machine detection before timing out. Default is 30 seconds.',
        },
        sendDigits: {
          displayName: 'Send Digits',
          shortDesc: 'DTMF tones to send after connection',
          longDesc:
            'A string of keys to dial after connecting. Valid characters: 0-9, A-D, #, *, w (0.5s pause), W (1s pause). For example: "W1234#".',
        },
        timeLimit: {
          displayName: 'Time Limit',
          shortDesc: 'Maximum call duration in seconds',
          longDesc:
            'The maximum duration of the call in seconds. The call will be automatically ended after this time.',
        },
      },
    },
    create_call_with_tts: {
      groups: ['Voice'],
      displayName: 'Create Call with Text-to-Speech',
      shortDesc: 'Make a call with automated voice message',
      longDesc:
        'Initiate an outbound phone call with an automated text-to-speech message. This simplified action automatically generates TwiML based on your inputs, allowing you to quickly create calls with voice messages without writing TwiML code manually. You can customize the voice, language, record the call, and optionally transcribe recordings.',
      options: {
        to: {
          displayName: 'To',
          shortDesc: 'The phone number to call',
          longDesc:
            'The phone number to call in E.164 format (e.g., +15551234567). You can also call SIP addresses or Twilio client identifiers.',
        },
        from: {
          displayName: 'From',
          shortDesc: 'Your Twilio phone number',
          longDesc:
            'The Twilio phone number to use as the caller ID. This must be a phone number you own in your Twilio account.',
        },
        message: {
          displayName: 'Message',
          shortDesc: 'The text message to speak',
          longDesc:
            "The text message that will be spoken when the call is answered. This will be converted to speech using Twilio's text-to-speech engine.",
        },
        voice: {
          displayName: 'Voice',
          shortDesc: 'The voice to use for text-to-speech',
          longDesc:
            "The voice to use for text-to-speech. Choose from various voices with different languages, genders, and quality levels (Standard, Neural, Generative). If not specified, uses your account's default voice.",
        },
        language: {
          displayName: 'Language',
          shortDesc: 'The language for text-to-speech',
          longDesc:
            'The language and locale for text-to-speech. This should match the language of your message text. If not specified, defaults to en-US (English, United States).',
        },
        record: {
          displayName: 'Record Call',
          shortDesc: 'Whether to record the call',
          longDesc:
            'Set to true to record the entire call. The recording will be available after the call completes and can be retrieved using the List Recordings action.',
        },
        transcribe: {
          displayName: 'Transcribe Recording',
          shortDesc: 'Whether to transcribe the recording',
          longDesc:
            'Set to true to automatically transcribe the call recording. This requires the Record Call option to be enabled. The transcription will be available after processing.',
        },
        transcriptionCallback: {
          displayName: 'Transcription Callback URL',
          shortDesc: 'URL to receive transcription results',
          longDesc:
            'The URL Twilio will POST to when the transcription is complete. This allows you to process or store transcriptions immediately after they are available.',
        },
        sendDigits: {
          displayName: 'Send Digits',
          shortDesc: 'DTMF tones to send after connection',
          longDesc:
            'A string of keys to dial after the call connects. Useful for navigating phone menus automatically. Valid characters: 0-9, #, *, w (wait 0.5 seconds). For example: "w123#" waits 0.5 seconds then dials 123#.',
        },
        statusCallback: {
          displayName: 'Status Callback URL',
          shortDesc: 'URL to receive call status updates',
          longDesc:
            'The URL Twilio will POST to when the call status changes. Use this to track call progress and completion.',
        },
        timeout: {
          displayName: 'Timeout',
          shortDesc: 'Seconds to wait for answer',
          longDesc:
            'The number of seconds to wait for the call to be answered before timing out. Default is 60 seconds, maximum is 600 seconds.',
        },
        machineDetection: {
          displayName: 'Machine Detection',
          shortDesc: 'Enable answering machine detection',
          longDesc:
            'Enable answering machine detection to determine if a human or machine answered the call. "Enable" returns the result immediately, "DetectMessageEnd" waits for the voicemail beep before playing your message.',
        },
      },
    },
    list_calls: {
      groups: ['Voice'],
      displayName: 'List Calls',
      shortDesc: 'Retrieve a list of calls',
      longDesc:
        'Retrieve a list of calls from your Twilio account. You can filter calls by participant phone numbers, status, date range, and other criteria. Results are returned in reverse chronological order.',
      options: {
        to: {
          displayName: 'To',
          shortDesc: 'Filter by recipient phone number',
          longDesc:
            'Only return calls made to this phone number, SIP address, or client identifier.',
        },
        from: {
          displayName: 'From',
          shortDesc: 'Filter by caller phone number',
          longDesc: 'Only return calls from this phone number, SIP address, or client identifier.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Filter by call status',
          longDesc:
            'Only return calls with this status. Options include: queued, ringing, in-progress, canceled, completed, failed, busy, or no-answer.',
        },
        startTimeAfter: {
          displayName: 'Start Time After',
          shortDesc: 'Filter by minimum start time',
          longDesc:
            'Only return calls that started on or after this date and time. Provide the date in ISO 8601 format.',
        },
        startTimeBefore: {
          displayName: 'Start Time Before',
          shortDesc: 'Filter by maximum start time',
          longDesc:
            'Only return calls that started on or before this date and time. Provide the date in ISO 8601 format.',
        },
        endTimeAfter: {
          displayName: 'End Time After',
          shortDesc: 'Filter by minimum end time',
          longDesc:
            'Only return calls that ended on or after this date and time. Provide the date in ISO 8601 format.',
        },
        endTimeBefore: {
          displayName: 'End Time Before',
          shortDesc: 'Filter by maximum end time',
          longDesc:
            'Only return calls that ended on or before this date and time. Provide the date in ISO 8601 format.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of calls to return',
          longDesc:
            'The maximum number of call records to return. The default is 50 and the maximum is 1000.',
        },
        pageSize: {
          displayName: 'Page Size',
          shortDesc: 'Number of calls per page',
          longDesc:
            'The number of call records to return per page. The default is 50 and the maximum is 1000.',
        },
      },
    },
    get_call: {
      groups: ['Voice'],
      displayName: 'Get a Call',
      shortDesc: 'Retrieve details of a specific call',
      longDesc:
        'Fetch detailed information about a specific call using its unique SID. This returns all available information about the call including status, duration, pricing, and timestamps.',
      options: {
        callSid: {
          displayName: 'Call SID',
          shortDesc: 'The unique identifier of the call',
          longDesc:
            'The unique string identifier (SID) of the call to retrieve. Call SIDs start with "CA".',
        },
      },
    },
    delete_call: {
      groups: ['Voice'],
      displayName: 'Delete a Call',
      shortDesc: 'Delete a call record from your account',
      longDesc:
        'Permanently delete a call record from your Twilio account. This action cannot be undone. Note that deleting a call record does not redact the call data from Twilio logs.',
      options: {
        callSid: {
          displayName: 'Call SID',
          shortDesc: 'The unique identifier of the call to delete',
          longDesc:
            'The unique string identifier (SID) of the call to delete. Call SIDs start with "CA".',
        },
      },
    },
    create_execution: {
      groups: ['Studio'],
      displayName: 'Create an Execution',
      shortDesc: 'Start a Studio Flow execution',
      longDesc:
        'Create and start a new execution of a Studio Flow. This triggers the flow to run with the specified contact information and optional parameters that can be accessed within the flow.',
      options: {
        flowSid: {
          displayName: 'Flow SID',
          shortDesc: 'The unique identifier of the Studio Flow',
          longDesc: 'The SID of the Studio Flow to execute. Flow SIDs start with "FW".',
        },
        to: {
          displayName: 'To',
          shortDesc: 'The contact phone number',
          longDesc:
            'The contact phone number to start the Flow execution with. Available in the flow as contact.channel.address.',
        },
        from: {
          displayName: 'From',
          shortDesc: 'The Twilio phone number',
          longDesc:
            'The Twilio phone number to send messages or make calls from during the execution. Available as flow.channel.address. Can also be a Messaging Service SID.',
        },
        parameters: {
          displayName: 'Parameters',
          shortDesc: 'JSON data for the flow context',
          longDesc:
            "JSON data that will be added to the flow's context and accessible as variables. For example: a JSON object with name property becomes available as flow.data.name in the flow.",
        },
      },
    },
    list_executions: {
      groups: ['Studio'],
      displayName: 'List Executions',
      shortDesc: 'Retrieve executions for a Studio Flow',
      longDesc:
        'Retrieve a list of executions for a specific Studio Flow. You can filter executions by date range to find specific execution instances.',
      options: {
        flowSid: {
          displayName: 'Flow SID',
          shortDesc: 'The unique identifier of the Studio Flow',
          longDesc:
            'The SID of the Studio Flow whose executions you want to list. Flow SIDs start with "FW".',
        },
        dateCreatedFrom: {
          displayName: 'Date Created From',
          shortDesc: 'Filter by minimum creation date',
          longDesc:
            'Only return executions created on or after this date and time, in ISO 8601 format.',
        },
        dateCreatedTo: {
          displayName: 'Date Created To',
          shortDesc: 'Filter by maximum creation date',
          longDesc: 'Only return executions created before this date and time, in ISO 8601 format.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of executions to return',
          longDesc:
            'The maximum number of execution records to return. The default is 50 and the maximum is 1000.',
        },
        pageSize: {
          displayName: 'Page Size',
          shortDesc: 'Number of executions per page',
          longDesc:
            'The number of execution records to return per page. The default is 50 and the maximum is 1000.',
        },
      },
    },
    get_execution: {
      groups: ['Studio'],
      displayName: 'Get an Execution',
      shortDesc: 'Retrieve details of a specific execution',
      longDesc:
        'Fetch detailed information about a specific Studio Flow execution including its current state, context data, and status.',
      options: {
        flowSid: {
          displayName: 'Flow SID',
          shortDesc: 'The unique identifier of the Studio Flow',
          longDesc:
            'The SID of the Studio Flow that contains the execution. Flow SIDs start with "FW".',
        },
        executionSid: {
          displayName: 'Execution SID',
          shortDesc: 'The unique identifier of the execution',
          longDesc:
            'The unique string identifier (SID) of the execution to retrieve. Execution SIDs start with "FN".',
        },
      },
    },
    update_execution: {
      groups: ['Studio'],
      displayName: 'Update an Execution',
      shortDesc: 'Update the status of an execution',
      longDesc:
        'Update the status of a Studio Flow execution. This is typically used to end an active execution early.',
      options: {
        flowSid: {
          displayName: 'Flow SID',
          shortDesc: 'The unique identifier of the Studio Flow',
          longDesc:
            'The SID of the Studio Flow that contains the execution. Flow SIDs start with "FW".',
        },
        executionSid: {
          displayName: 'Execution SID',
          shortDesc: 'The unique identifier of the execution',
          longDesc:
            'The unique string identifier (SID) of the execution to update. Execution SIDs start with "FN".',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'The new status for the execution',
          longDesc:
            'The status to set for the execution. Set to "ended" to terminate an active execution.',
        },
      },
    },
    delete_execution: {
      groups: ['Studio'],
      displayName: 'Delete an Execution',
      shortDesc: 'Delete an execution record',
      longDesc:
        'Permanently delete an execution record from your Twilio account. This action cannot be undone.',
      options: {
        flowSid: {
          displayName: 'Flow SID',
          shortDesc: 'The unique identifier of the Studio Flow',
          longDesc:
            'The SID of the Studio Flow that contains the execution. Flow SIDs start with "FW".',
        },
        executionSid: {
          displayName: 'Execution SID',
          shortDesc: 'The unique identifier of the execution to delete',
          longDesc:
            'The unique string identifier (SID) of the execution to delete. Execution SIDs start with "FN".',
        },
      },
    },
    list_recordings: {
      groups: ['Voice'],
      displayName: 'List Recordings',
      shortDesc: 'Retrieve a list of call recordings',
      longDesc:
        'Retrieve a list of call recordings from your Twilio account. You can filter recordings by call SID, conference SID, date range, and include soft-deleted recordings.',
      options: {
        callSid: {
          displayName: 'Call SID',
          shortDesc: 'Filter by call SID',
          longDesc:
            'Only return recordings associated with this specific call. The Call SID should start with "CA".',
        },
        conferenceSid: {
          displayName: 'Conference SID',
          shortDesc: 'Filter by conference SID',
          longDesc:
            'Only return recordings associated with this specific conference. The Conference SID should start with "CF".',
        },
        dateCreatedAfter: {
          displayName: 'Date Created After',
          shortDesc: 'Filter by minimum creation date',
          longDesc:
            'Only return recordings created on or after this date. Provide the date in ISO 8601 format.',
        },
        dateCreatedBefore: {
          displayName: 'Date Created Before',
          shortDesc: 'Filter by maximum creation date',
          longDesc:
            'Only return recordings created on or before this date. Provide the date in ISO 8601 format.',
        },
        includeSoftDeleted: {
          displayName: 'Include Soft Deleted',
          shortDesc: 'Include soft-deleted recordings',
          longDesc:
            'Whether to include soft-deleted recordings. Recording metadata is retained for 40 days after deletion.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of recordings to return',
          longDesc:
            'The maximum number of recording records to return. The default is 50 and the maximum is 1000.',
        },
        pageSize: {
          displayName: 'Page Size',
          shortDesc: 'Number of recordings per page',
          longDesc:
            'The number of recording records to return per page. The default is 50 and the maximum is 1000.',
        },
      },
    },
    get_recording: {
      groups: ['Voice'],
      displayName: 'Get a Recording',
      shortDesc: 'Retrieve details of a specific recording',
      longDesc:
        'Fetch detailed information about a specific call recording including duration, status, pricing, media URL, and encryption details.',
      options: {
        recordingSid: {
          displayName: 'Recording SID',
          shortDesc: 'The unique identifier of the recording',
          longDesc:
            'The unique string identifier (SID) of the recording to retrieve. Recording SIDs start with "RE".',
        },
      },
    },
    list_transcriptions: {
      groups: ['Voice'],
      displayName: 'List Transcriptions',
      shortDesc: 'Retrieve transcriptions for a recording',
      longDesc:
        'Retrieve a list of transcriptions for a specific call recording. Transcriptions convert the audio from recordings into text.',
      options: {
        recordingSid: {
          displayName: 'Recording SID',
          shortDesc: 'The unique identifier of the recording',
          longDesc:
            'The SID of the recording whose transcriptions you want to list. Recording SIDs start with "RE".',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of transcriptions to return',
          longDesc:
            'The maximum number of transcription records to return. The default is 50 and the maximum is 1000.',
        },
        pageSize: {
          displayName: 'Page Size',
          shortDesc: 'Number of transcriptions per page',
          longDesc:
            'The number of transcription records to return per page. The default is 50 and the maximum is 1000.',
        },
      },
    },
    get_transcription: {
      groups: ['Voice'],
      displayName: 'Get a Transcription',
      shortDesc: 'Retrieve a specific transcription with text',
      longDesc:
        'Fetch detailed information about a specific transcription including the full transcribed text from the recording. This returns the transcriptionText field containing the actual transcription content.',
      options: {
        recordingSid: {
          displayName: 'Recording SID',
          shortDesc: 'The unique identifier of the recording',
          longDesc:
            'The SID of the recording that contains the transcription. Recording SIDs start with "RE".',
        },
        transcriptionSid: {
          displayName: 'Transcription SID',
          shortDesc: 'The unique identifier of the transcription',
          longDesc:
            'The unique string identifier (SID) of the transcription to retrieve. Transcription SIDs start with "TR".',
        },
      },
    },
  },
  triggers: {
    new_message: {
      groups: ['Messaging'],
      displayName: 'New Message',
      shortDesc: 'Triggers when a new SMS or MMS message is received',
      longDesc:
        'Monitors your Twilio account for new incoming or outgoing messages. You can filter messages by recipient or sender phone number. The trigger fires whenever a new message is detected that matches your filters.',
      options: {
        to: {
          displayName: 'To',
          shortDesc: 'Filter by recipient phone number',
          longDesc:
            'Only trigger for messages sent to this phone number. The phone number should be in E.164 format (e.g., +15551234567). Leave empty to trigger for all recipients.',
        },
        from: {
          displayName: 'From',
          shortDesc: 'Filter by sender phone number',
          longDesc:
            'Only trigger for messages sent from this phone number or alphanumeric sender ID. The phone number should be in E.164 format (e.g., +15551234567). Leave empty to trigger for all senders.',
        },
      },
    },
    new_recording: {
      groups: ['Voice'],
      displayName: 'New Recording',
      shortDesc: 'Triggers when a new call recording is created',
      longDesc:
        'Monitors your Twilio account for new call recordings. You can filter recordings by specific call SID or conference SID. The trigger fires whenever a new recording is detected that matches your filters.',
      options: {
        callSid: {
          displayName: 'Call SID',
          shortDesc: 'Filter by call SID',
          longDesc:
            'Only trigger for recordings associated with this specific call. The Call SID should start with "CA". Leave empty to trigger for all calls.',
        },
        conferenceSid: {
          displayName: 'Conference SID',
          shortDesc: 'Filter by conference SID',
          longDesc:
            'Only trigger for recordings associated with this specific conference. The Conference SID should start with "CF". Leave empty to trigger for all conferences.',
        },
      },
    },
    new_transcription: {
      groups: ['Voice'],
      displayName: 'New Transcription',
      shortDesc: 'Triggers when a new recording transcription is created',
      longDesc:
        'Monitors your Twilio account for new transcriptions by checking the latest recordings. You can filter by specific call SID or conference SID. The trigger fires whenever a new transcription is detected for recordings that match your filters.',
      options: {
        callSid: {
          displayName: 'Call SID',
          shortDesc: 'Filter by call SID',
          longDesc:
            'Only trigger for transcriptions from recordings associated with this specific call. The Call SID should start with "CA". Leave empty to trigger for all calls.',
        },
        conferenceSid: {
          displayName: 'Conference SID',
          shortDesc: 'Filter by conference SID',
          longDesc:
            'Only trigger for transcriptions from recordings associated with this specific conference. The Conference SID should start with "CF". Leave empty to trigger for all conferences.',
        },
      },
    },
  },
};

export default TwilioAppEn;
