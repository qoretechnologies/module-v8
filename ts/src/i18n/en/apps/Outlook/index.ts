

const OutlookAppEn = {
  displayName: 'Microsoft Outlook',
  shortDesc: 'Get access to your calendar events, contacts, and emails in Microsoft Outlook.',
  longDesc:
    'Microsoft Outlook is a personal information manager software system from Microsoft, available as a part of the Microsoft Office suite. Primarily an email application, it also includes a calendar, task manager, contact manager, note taking, journal, and web browsing. Connect your Outlook account to create and manage contacts, calendar events, and send emails.',
  actions: {
    'manage-email': {
      displayName: 'Manage Email',
      shortDesc: 'Delete or move an email message to another folder.',
      longDesc:
        'Performs operations on an existing email message, allowing you to either delete it permanently or move it to another folder in your Outlook mailbox.',
      options: {
        messageId: {
          displayName: 'Message ID',
          shortDesc: 'ID of the email message',
          longDesc: 'The unique identifier of the email message to be moved or deleted.',
        },
        action: {
          displayName: 'Action',
          shortDesc: 'Action to perform on the email',
          longDesc: 'Specify whether to delete the email permanently or move it to another folder.',
        },
        targetFolderId: {
          displayName: 'Target Folder ID',
          shortDesc: 'ID of the target folder',
          longDesc:
            'The ID of the folder where you want to move the email. This field is required only when the action is set to "move".',
        },
      },
    },
    'search-emails': {
      displayName: 'Search Emails',
      shortDesc:
        'Search for emails using various filter criteria including advanced attachment filters.',
      longDesc:
        'Search and retrieve emails from Outlook based on dates, senders, recipients, subject, body content, and detailed attachment properties like names, patterns, MIME types, and sizes.',
      options: {
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort emails by a specific field',
          longDesc:
            'Sort the email results by a specific field. The default is to sort by received date in descending order.',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Select the field by which to sort the email results.',
              },
              order: {
                displayName: 'Sort Order',
                shortDesc: 'Order of sorting',
                longDesc:
                  'Choose the order in which to sort the results. Options include Ascending and Descending.',
              },
            },
          },
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of emails to return',
          longDesc: 'Sets the maximum number of email results to return. Default is 50.',
        },
        startDateTime: {
          displayName: 'Start Date',
          shortDesc: 'Filter emails received on or after this date',
          longDesc: 'Only include emails that were received on or after this date and time.',
        },
        endDateTime: {
          displayName: 'End Date',
          shortDesc: 'Filter emails received on or before this date',
          longDesc: 'Only include emails that were received on or before this date and time.',
        },
        fromSender: {
          displayName: 'From Sender',
          shortDesc: 'Filter emails from a specific sender',
          longDesc: 'Only include emails from this specific sender email address.',
        },
        toRecipient: {
          displayName: 'To Recipient',
          shortDesc: 'Filter emails sent to a specific recipient',
          longDesc: 'Only include emails sent to this specific recipient email address.',
        },
        subject: {
          displayName: 'Subject',
          shortDesc: 'Filter emails by subject line text',
          longDesc: 'Only include emails with this text in the subject line.',
        },
        hasAttachments: {
          displayName: 'Has Attachments',
          shortDesc: 'Filter emails with or without attachments',
          longDesc:
            'When set to true, only include emails that have attachments. When false, only include emails without attachments.',
        },
        isRead: {
          displayName: 'Is Read',
          shortDesc: 'Filter read or unread emails',
          longDesc:
            'When set to true, only include emails that have been read. When false, only include unread emails.',
        },
        attachmentNames: {
          displayName: 'Attachment Names',
          shortDesc: 'Filter emails by specific attachment names',
          longDesc: 'Only include emails that have attachments with these filenames.',
        },
        bodyContains: {
          displayName: 'Body Contains',
          shortDesc: 'Filter emails by body content',
          longDesc: 'Only include emails that contain this text in the body content.',
        },
        includeAttachments: {
          displayName: 'Include Attachments',
          shortDesc: 'Include attachment content in results',
          longDesc:
            'When set to true, the content of email attachments will be included in the results. This may increase response size significantly.',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'Email folder to search in',
          longDesc: 'The email folder to search in. Defaults to Inbox if not specified.',
        },
        attachmentFilenamePattern: {
          displayName: 'Attachment Filename Pattern',
          shortDesc: 'Filter by attachment filename pattern (regex)',
          longDesc:
            'Filter emails by a regular expression pattern that matches attachment filenames. Example: ".*\\.pdf$" would match all PDF files.',
        },
        attachmentMimeTypes: {
          displayName: 'Attachment MIME Types',
          shortDesc: 'Filter by attachment MIME types',
          longDesc:
            'Only include emails with attachments matching these MIME types (e.g., "application/pdf", "image/jpeg").',
        },
        attachmentMinSize: {
          displayName: 'Attachment Minimum Size',
          shortDesc: 'Filter by attachment minimum size in bytes',
          longDesc:
            'Only include emails with attachments larger than or equal to this size in bytes.',
        },
        attachmentMaxSize: {
          displayName: 'Attachment Maximum Size',
          shortDesc: 'Filter by attachment maximum size in bytes',
          longDesc:
            'Only include emails with attachments smaller than or equal to this size in bytes.',
        },
      },
    },
    'create-contact': {
      displayName: 'Create Contact',
      shortDesc: 'Create a new contact in your Outlook contacts.',
      longDesc:
        'Create a new contact with details such as name, email, phone numbers, and job information in your Microsoft Outlook contacts.',
      options: {
        givenName: {
          displayName: 'First Name',
          shortDesc: "The contact's first name.",
          longDesc: 'Enter the first name or given name of the contact.',
        },
        surname: {
          displayName: 'Last Name',
          shortDesc: "The contact's last name.",
          longDesc: 'Enter the last name or surname of the contact.',
        },
        emailAddresses: {
          displayName: 'Email Addresses',
          shortDesc: 'Email addresses for the contact.',
          longDesc: 'Enter one or more email addresses for the contact.',
          type: {
            element_type: {
              fields: {
                address: {
                  displayName: 'Email Address',
                  shortDesc: 'The email address of the contact.',
                  longDesc: 'Enter a valid email address for the contact.',
                },
                name: {
                  displayName: 'Display Name',
                  shortDesc: 'The display name for this email address.',
                  longDesc: 'Enter how you want the name to appear for this email address.',
                },
              },
            },
          },
        },
        businessPhones: {
          displayName: 'Business Phones',
          shortDesc: 'Business phone numbers for the contact.',
          longDesc: 'Enter one or more business phone numbers for the contact.',
        },
        mobilePhone: {
          displayName: 'Mobile Phone',
          shortDesc: "The contact's mobile phone number.",
          longDesc: 'Enter the mobile or cell phone number for the contact.',
        },
        jobTitle: {
          displayName: 'Job Title',
          shortDesc: "The contact's job title.",
          longDesc: 'Enter the professional title or role of the contact.',
        },
        companyName: {
          displayName: 'Company Name',
          shortDesc: "The name of the contact's company.",
          longDesc: 'Enter the organization or company where the contact works.',
        },
        department: {
          displayName: 'Department',
          shortDesc: "The contact's department.",
          longDesc: 'Enter the department or division within the company where the contact works.',
        },
        officeLocation: {
          displayName: 'Office Location',
          shortDesc: "The contact's office location.",
          longDesc: 'Enter the physical location or office where the contact works.',
        },
        businessAddress: {
          displayName: 'Business Address',
          shortDesc: "The contact's business address.",
          longDesc: 'Enter the full business address details for the contact.',
          type: {
            fields: {
              street: {
                displayName: 'Street',
                shortDesc: 'Street address.',
                longDesc: 'Enter the street address including building number and street name.',
              },
              city: {
                displayName: 'City',
                shortDesc: 'City name.',
                longDesc: 'Enter the city or town for the business address.',
              },
              state: {
                displayName: 'State/Province',
                shortDesc: 'State or province.',
                longDesc: 'Enter the state, province, or region for the business address.',
              },
              countryOrRegion: {
                displayName: 'Country/Region',
                shortDesc: 'Country or region.',
                longDesc: 'Enter the country or region for the business address.',
              },
              postalCode: {
                displayName: 'Postal Code',
                shortDesc: 'Postal or zip code.',
                longDesc: 'Enter the postal code or zip code for the business address.',
              },
            },
          },
        },
      },
    },
    'update-contact': {
      displayName: 'Update Contact',
      shortDesc: 'Update an existing contact in your Outlook contacts.',
      longDesc:
        'Modify details of an existing contact in your Microsoft Outlook contacts, such as name, email, phone numbers, or job information.',
      options: {
        contactId: {
          displayName: 'Contact ID',
          shortDesc: 'The unique identifier for the contact.',
          longDesc: 'Select the unique identifier of the contact you want to update.',
        },
        givenName: {
          displayName: 'First Name',
          shortDesc: "The contact's first name.",
          longDesc: 'Update the first name or given name of the contact.',
        },
        surname: {
          displayName: 'Last Name',
          shortDesc: "The contact's last name.",
          longDesc: 'Update the last name or surname of the contact.',
        },
        emailAddresses: {
          displayName: 'Email Addresses',
          shortDesc: 'Email addresses for the contact.',
          longDesc: 'Update one or more email addresses for the contact.',
          type: {
            element_type: {
              fields: {
                address: {
                  displayName: 'Email Address',
                  shortDesc: 'The email address of the contact.',
                  longDesc: 'Enter a valid email address for the contact.',
                },
                name: {
                  displayName: 'Display Name',
                  shortDesc: 'The display name for this email address.',
                  longDesc: 'Enter how you want the name to appear for this email address.',
                },
              },
            },
          },
        },
        businessPhones: {
          displayName: 'Business Phones',
          shortDesc: 'Business phone numbers for the contact.',
          longDesc: 'Update one or more business phone numbers for the contact.',
        },
        mobilePhone: {
          displayName: 'Mobile Phone',
          shortDesc: "The contact's mobile phone number.",
          longDesc: 'Update the mobile or cell phone number for the contact.',
        },
        jobTitle: {
          displayName: 'Job Title',
          shortDesc: "The contact's job title.",
          longDesc: 'Update the professional title or role of the contact.',
        },
        companyName: {
          displayName: 'Company Name',
          shortDesc: "The name of the contact's company.",
          longDesc: 'Update the organization or company where the contact works.',
        },
        department: {
          displayName: 'Department',
          shortDesc: "The contact's department.",
          longDesc: 'Update the department or division within the company where the contact works.',
        },
        officeLocation: {
          displayName: 'Office Location',
          shortDesc: "The contact's office location.",
          longDesc: 'Update the physical location or office where the contact works.',
        },
        businessAddress: {
          displayName: 'Business Address',
          shortDesc: "The contact's business address.",
          longDesc: 'Update the full business address details for the contact.',
          type: {
            fields: {
              street: {
                displayName: 'Street',
                shortDesc: 'Street address.',
                longDesc: 'Update the street address including building number and street name.',
              },
              city: {
                displayName: 'City',
                shortDesc: 'City name.',
                longDesc: 'Update the city or town for the business address.',
              },
              state: {
                displayName: 'State/Province',
                shortDesc: 'State or province.',
                longDesc: 'Update the state, province, or region for the business address.',
              },
              countryOrRegion: {
                displayName: 'Country/Region',
                shortDesc: 'Country or region.',
                longDesc: 'Update the country or region for the business address.',
              },
              postalCode: {
                displayName: 'Postal Code',
                shortDesc: 'Postal or zip code.',
                longDesc: 'Update the postal code or zip code for the business address.',
              },
            },
          },
        },
      },
    },
    'delete-contact': {
      displayName: 'Delete Contact',
      shortDesc: 'Delete a contact from your Outlook contacts.',
      longDesc: 'Permanently remove a contact from your Microsoft Outlook contacts.',
      options: {
        contactId: {
          displayName: 'Contact ID',
          shortDesc: 'The unique identifier for the contact.',
          longDesc: 'Select the unique identifier of the contact to be deleted.',
        },
      },
    },
    'create-event': {
      displayName: 'Create Event',
      shortDesc: 'Create a new event in your Outlook calendar.',
      longDesc:
        'Create a new event or meeting in your Microsoft Outlook calendar with details such as title, start and end times, location, and attendees.',
      options: {
        calendarId: {
          displayName: 'Calendar ID',
          shortDesc: 'The calendar where the event will be created.',
          longDesc: 'Select the calendar where you want to create the new event.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'The title or subject of the event.',
          longDesc: 'Enter a title or subject for the event that will appear in your calendar.',
        },
        start: {
          displayName: 'Start Time',
          shortDesc: 'When the event begins.',
          longDesc: 'Enter the date and time when the event will start.',
        },
        timezone: {
          displayName: 'Time Zone',
          shortDesc: 'The time zone for the event times.',
          longDesc: 'Select the time zone that applies to the start and end times of the event.',
        },
        end: {
          displayName: 'End Time',
          shortDesc: 'When the event ends.',
          longDesc:
            'Enter the date and time when the event will end. If not specified, defaults to 1 hour after start time.',
        },
        location: {
          displayName: 'Location',
          shortDesc: 'Where the event will take place.',
          longDesc: 'Enter the physical location or virtual meeting place for the event.',
        },
        attendees: {
          displayName: 'Attendees',
          shortDesc: 'People invited to the event.',
          longDesc: 'Add one or more attendees to invite to the event.',
          type: {
            element_type: {
              fields: {
                emailAddress: {
                  displayName: 'Email Address',
                  shortDesc: "The attendee's email address.",
                  longDesc: 'Enter the email address of the person you want to invite.',
                },
                type: {
                  displayName: 'Attendee Type',
                  shortDesc: 'Required or optional attendee.',
                  longDesc: 'Specify whether this person is a required or optional attendee.',
                },
              },
            },
          },
        },
        body: {
          displayName: 'Body',
          shortDesc: 'The body content of the event.',
          longDesc:
            'Enter the description or details of the event that attendees will see in the invitation.',
        },
        bodyContentType: {
          displayName: 'Body Content Type',
          shortDesc: 'Format of the body content.',
          longDesc: 'Select whether the body content is plain text or HTML formatted.',
        },
        isOnlineMeeting: {
          displayName: 'Online Meeting',
          shortDesc: 'Whether this is an online meeting.',
          longDesc:
            'Enable this option to make this event an online meeting and generate a meeting link.',
        },
      },
    },
    'delete-event': {
      displayName: 'Delete Event',
      shortDesc: 'Delete an event from your Outlook calendar.',
      longDesc: 'Permanently remove an event or meeting from your Microsoft Outlook calendar.',
      options: {
        calendarId: {
          displayName: 'Calendar ID',
          shortDesc: 'The calendar containing the event.',
          longDesc: 'Select the calendar that contains the event you want to delete.',
        },
        eventId: {
          displayName: 'Event ID',
          shortDesc: 'The unique identifier for the event.',
          longDesc: 'Select the unique identifier of the event to be deleted.',
        },
      },
    },
    'list-contacts': {
      displayName: 'List Contacts',
      shortDesc: 'Retrieve a list of contacts from your Outlook contacts.',
      longDesc:
        'Get a list of contacts from your Microsoft Outlook contacts with optional filtering and limit.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'The maximum number of contacts to retrieve.',
          longDesc: 'Specify the maximum number of contacts to retrieve from the Outlook account.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter contacts by name or email.',
          longDesc:
            'Enter text to filter contacts by name or email address. Only contacts matching the filter will be returned.',
        },
      },
    },
    'list-events': {
      displayName: 'List Events',
      shortDesc: 'Retrieve a list of events from your Outlook calendar.',
      longDesc:
        'Get a list of events from your Microsoft Outlook calendar with optional filtering by date range and limit.',
      options: {
        calendarId: {
          displayName: 'Calendar ID',
          shortDesc: 'The calendar to retrieve events from.',
          longDesc: 'Select the calendar from which you want to retrieve events.',
        },
        startDateTime: {
          displayName: 'Start Date and Time',
          shortDesc: 'The start date and time for filtering events.',
          longDesc: 'Enter a date and time to retrieve events that start on or after this time.',
        },
        endDateTime: {
          displayName: 'End Date and Time',
          shortDesc: 'The end date and time for filtering events.',
          longDesc: 'Enter a date and time to retrieve events that end on or before this time.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'The maximum number of events to retrieve.',
          longDesc: 'Specify the maximum number of events to retrieve from the Outlook calendar.',
        },
      },
    },
    'send-email': {
      displayName: 'Send Email',
      shortDesc: 'Send an email from your Outlook account.',
      longDesc:
        'Compose and send an email message from your Microsoft Outlook account to one or more recipients.',
      options: {
        toRecipients: {
          displayName: 'To Recipients',
          shortDesc: 'The primary recipients of the email.',
          longDesc: 'Enter one or more email addresses for the primary recipients of the email.',
          type: {
            element_type: {
              fields: {
                emailAddress: {
                  displayName: 'Email Address',
                  shortDesc: "Recipient's email address.",
                  longDesc: 'Enter the email address of the recipient.',
                },
                name: {
                  displayName: 'Display Name',
                  shortDesc: "Recipient's display name.",
                  longDesc: 'Optionally enter a display name for the recipient.',
                },
              },
            },
          },
        },
        ccRecipients: {
          displayName: 'CC Recipients',
          shortDesc: 'The carbon copy recipients of the email.',
          longDesc:
            'Optionally enter one or more email addresses for recipients to be copied on the email.',
          type: {
            element_type: {
              fields: {
                emailAddress: {
                  displayName: 'Email Address',
                  shortDesc: "CC recipient's email address.",
                  longDesc: 'Enter the email address of the CC recipient.',
                },
                name: {
                  displayName: 'Display Name',
                  shortDesc: "CC recipient's display name.",
                  longDesc: 'Optionally enter a display name for the CC recipient.',
                },
              },
            },
          },
        },
        bccRecipients: {
          displayName: 'BCC Recipients',
          shortDesc: 'The blind carbon copy recipients of the email.',
          longDesc:
            'Optionally enter one or more email addresses for recipients to be blind copied on the email.',
          type: {
            element_type: {
              fields: {
                emailAddress: {
                  displayName: 'Email Address',
                  shortDesc: "BCC recipient's email address.",
                  longDesc: 'Enter the email address of the BCC recipient.',
                },
                name: {
                  displayName: 'Display Name',
                  shortDesc: "BCC recipient's display name.",
                  longDesc: 'Optionally enter a display name for the BCC recipient.',
                },
              },
            },
          },
        },
        subject: {
          displayName: 'Subject',
          shortDesc: 'The subject line of the email.',
          longDesc: "Enter the subject line that will appear in the recipient's inbox.",
        },
        body: {
          displayName: 'Body',
          shortDesc: 'The content of the email.',
          longDesc: 'Enter the main message content of the email.',
        },
        bodyContentType: {
          displayName: 'Body Content Type',
          shortDesc: 'Format of the email body.',
          longDesc: 'Select whether the email body is plain text or HTML formatted.',
        },
        saveToSentItems: {
          displayName: 'Save to Sent Items',
          shortDesc: 'Whether to save a copy in Sent Items.',
          longDesc: 'Choose whether to save a copy of the email in your Sent Items folder.',
        },
        attachments: {
          displayName: 'Attachments',
          shortDesc: 'Files to attach to the email.',
          longDesc:
            'Optionally attach files to the email. You can add one or more files to be sent with the email.',
        },
      },
    },
  },
  triggers: {
    'new-email-with-attachment': {
      displayName: 'New Email with Attachment',
      shortDesc:
        'Triggers when an email with attachments is received, processing each matching attachment individually.',
      longDesc:
        'Monitors an Outlook mailbox for new emails with attachments. When an email with attachments is received, each attachment that matches the specified filters will trigger a separate event. This allows for processing individual attachments from emails while maintaining the full email context.',
      options: {
        senderFilter: {
          displayName: 'Sender Filter',
          shortDesc: 'Only process emails from this sender',
          longDesc:
            'If specified, only emails from this exact sender email address will be processed. Leave empty to process emails from any sender.',
        },
        subjectFilter: {
          displayName: 'Subject Filter',
          shortDesc: 'Only process emails with this text in the subject',
          longDesc:
            'If specified, only emails containing this text in the subject line will be processed. Leave empty to process emails with any subject.',
        },
        filenameFilters: {
          displayName: 'Filename Filters',
          shortDesc: 'Only process attachments with matching filenames',
          longDesc:
            'A list of text strings to match against attachment filenames. If provided, only attachments with filenames containing any of these strings will be processed. Matching is case-insensitive. Leave empty to process all attachments regardless of filename.',
        },
        mimeTypeFilters: {
          displayName: 'MIME Type Filters',
          shortDesc: 'Only process attachments with matching MIME types',
          longDesc:
            'A list of MIME type strings to match against attachment content types. If provided, only attachments with content types containing any of these strings will be processed. For example, use "pdf" to match PDF files, "image/" to match all images, or "spreadsheet" to match Excel files. Matching is case-insensitive. Leave empty to process all attachments regardless of MIME type.',
        },
        action: {
          displayName: 'Email Action',
          shortDesc: 'Action to perform on the email after processing its attachments',
          longDesc:
            'Specify what should happen to the email after all matching attachments have been processed. Options include: None (leave the email as is), Delete (permanently remove the email), or Move (relocate the email to another folder).',
        },
        targetFolderId: {
          displayName: 'Target Folder',
          shortDesc: 'Destination folder for emails when using Move action',
          longDesc:
            'If the Email Action is set to "Move", specify the folder where the email should be moved after all attachments have been processed. This option is only used when Move is selected.',
        },
      },
      event_info: {
        desc: 'Contains the email data along with information about a single matching attachment.',
      },
    },
    'new-contact': {
      displayName: 'New Contact',
      shortDesc: 'Triggered when a new contact is created in Outlook.',
      longDesc:
        'This trigger is activated whenever a new contact is added to your Microsoft Outlook contacts.',
    },
    'new-email': {
      displayName: 'New Email Trigger',
      shortDesc: 'Triggers when a new email is received in your Outlook inbox',
      longDesc:
        'Monitors your Outlook inbox and triggers when new emails arrive. Supports filtering by sender, subject, or attachments, and can optionally delete or move processed emails.',
      options: {
        senderFilter: {
          displayName: 'Sender Filter',
          shortDesc: 'Filter emails by sender address',
          longDesc:
            'Only trigger for emails from this specific sender email address. Leave empty to trigger for all senders.',
        },
        subjectFilter: {
          displayName: 'Subject Filter',
          shortDesc: 'Filter emails by subject content',
          longDesc:
            'Only trigger for emails containing this text in the subject line. Leave empty to match any subject.',
        },
        hasAttachments: {
          displayName: 'Has Attachments',
          shortDesc: 'Filter by attachment presence',
          longDesc:
            'Filter emails based on whether they have attachments. Set to true to only trigger for emails with attachments, false for emails without attachments, or leave empty to trigger for both.',
        },
        includeAttachmentData: {
          displayName: 'Include Attachment Data',
          shortDesc: 'Include attachment content in trigger data',
          longDesc:
            'When enabled, the trigger will fetch and include the actual attachment content in the trigger data. This may increase processing time for large attachments.',
        },
        action: {
          displayName: 'Email Action',
          shortDesc: 'Action to perform after triggering',
          longDesc:
            'Optional action to perform on emails after the trigger runs. Choose "None" to leave emails unchanged, "Delete" to remove the email, or "Move" to relocate the email to another folder.',
        },
        targetFolderId: {
          displayName: 'Target Folder',
          shortDesc: 'Destination folder for moved emails',
          longDesc:
            'The folder where emails will be moved if the "Move" action is selected. Only required when action is set to "Move".',
        },
      },
      event_info: {
        desc: 'Data from the received email, including metadata and content',
      },
    },
    'new-event': {
      displayName: 'New Event',
      shortDesc: 'Triggered when a new event is created in an Outlook calendar.',
      longDesc:
        'This trigger is activated whenever a new event or meeting is created in your Microsoft Outlook calendar.',
      options: {
        calendarId: {
          displayName: 'Calendar ID',
          shortDesc: 'The calendar to monitor for new events.',
          longDesc:
            'Optionally select a specific calendar to monitor. If not specified, all calendars will be monitored.',
        },
      },
    },
  },
};

export default OutlookAppEn;
