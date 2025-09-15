/* eslint-disable max-len */
const AmazonSESAppEn = {
  displayName: 'Amazon SES',
  shortDesc: 'Send emails and manage email identities with Amazon Simple Email Service.',
  longDesc:
    "The Amazon SES integration provides comprehensive email sending capabilities, identity verification, and delivery monitoring. Manage your email campaigns, verify domains and email addresses, track sending statistics, and monitor bounces and complaints through Amazon's reliable email infrastructure.",
  actions: {
    send_email: {
      displayName: 'Send Email',
      shortDesc: 'Send an email through Amazon SES with full customization options.',
      longDesc:
        'Send emails with support for HTML and text content, CC/BCC recipients, reply-to addresses, custom tags for tracking, and advanced delivery options. Includes comprehensive validation and error handling for reliable email delivery.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region where your SES service is configured.',
          longDesc:
            'Select the AWS region where your Amazon SES service is set up. Different regions may have different verified identities and sending limits.',
        },
        from_email: {
          displayName: 'From Email Address',
          shortDesc: 'The verified email address to send from.',
          longDesc:
            'The sender email address that must be verified in your Amazon SES account. This address will appear in the From field of the email.',
        },
        to_emails: {
          displayName: 'To Email Addresses',
          shortDesc: 'Comma-separated list of recipient email addresses.',
          longDesc:
            'One or more email addresses to send the message to. Multiple addresses should be separated by commas. All addresses must be valid email formats.',
        },
        cc_emails: {
          displayName: 'CC Email Addresses',
          shortDesc: 'Comma-separated list of CC recipient email addresses.',
          longDesc:
            'Optional carbon copy recipients who will receive a copy of the email. Multiple addresses should be separated by commas.',
        },
        bcc_emails: {
          displayName: 'BCC Email Addresses',
          shortDesc: 'Comma-separated list of BCC recipient email addresses.',
          longDesc:
            'Optional blind carbon copy recipients who will receive a copy without other recipients knowing. Multiple addresses should be separated by commas.',
        },
        reply_to_addresses: {
          displayName: 'Reply-To Addresses',
          shortDesc: 'Comma-separated list of reply-to email addresses.',
          longDesc:
            'Optional email addresses that replies should be sent to instead of the from address. Multiple addresses should be separated by commas.',
        },
        subject: {
          displayName: 'Email Subject',
          shortDesc: 'The subject line of the email.',
          longDesc:
            "The subject line that will appear in the recipient's email client. Should be descriptive and engaging.",
        },
        body_text: {
          displayName: 'Text Body',
          shortDesc: 'Plain text version of the email content.',
          longDesc:
            'The plain text content of the email. Either text body or HTML body must be provided. Text version ensures compatibility with all email clients.',
        },
        body_html: {
          displayName: 'HTML Body',
          shortDesc: 'HTML version of the email content.',
          longDesc:
            'The HTML content of the email with formatting, links, and styling. Either text body or HTML body must be provided.',
        },
        charset: {
          displayName: 'Character Encoding',
          shortDesc: 'Character encoding for the email content.',
          longDesc:
            'The character encoding used for the email subject and body. UTF-8 is recommended for international character support.',
        },
        return_path: {
          displayName: 'Return Path',
          shortDesc: 'Email address for bounce notifications.',
          longDesc:
            'Optional email address where bounce notifications will be sent. Must be a verified address in your SES account.',
        },
        configuration_set: {
          displayName: 'Configuration Set',
          shortDesc: 'SES configuration set name for tracking.',
          longDesc:
            'Optional configuration set name to use for this email. Configuration sets allow you to publish email sending events to other AWS services.',
        },
        tags: {
          displayName: 'Email Tags',
          shortDesc: 'Key-value pairs for email categorization and tracking.',
          longDesc:
            'Optional tags to categorize and track your emails. Tags can be used for reporting and analytics in your SES dashboard.',
          type: {
            fields: {
              name: {
                displayName: 'Tag Name',
                shortDesc: 'The name of the tag.',
                longDesc: 'A descriptive name for the tag that will be used for categorization.',
              },
              value: {
                displayName: 'Tag Value',
                shortDesc: 'The value of the tag.',
                longDesc: 'The value associated with this tag name.',
              },
            },
          },
        },
      },
    },
    verify_email_address: {
      displayName: 'Verify Email Address',
      shortDesc: 'Verify an email address for sending through Amazon SES.',
      longDesc:
        'Initiate the verification process for an email address or domain. Amazon SES will send a verification email that must be clicked to complete the verification process.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region where your SES service is configured.',
          longDesc:
            'Select the AWS region where you want to verify the email address. The verified identity will be available in this region.',
        },
        email_address: {
          displayName: 'Email Address to Verify',
          shortDesc: 'The email address you want to verify for sending.',
          longDesc:
            'The email address that you want to verify as a sending identity. Amazon SES will send a verification email to this address.',
        },
      },
    },
    get_send_statistics: {
      displayName: 'Get Send Statistics',
      shortDesc: 'Retrieve detailed sending statistics from Amazon SES.',
      longDesc:
        'Get comprehensive sending statistics including delivery attempts, bounces, complaints, and rejection rates. Data is provided in time-series format with calculated percentages and summaries.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region to retrieve statistics from.',
          longDesc:
            'Select the AWS region where you want to retrieve sending statistics. Statistics are region-specific.',
        },
      },
    },
  },
  triggers: {
    new_bounce: {
      displayName: 'New Email Bounce',
      shortDesc: 'Triggers when an email bounces back from a recipient.',
      longDesc:
        'Monitors for email bounces and triggers when emails are rejected by recipient mail servers. Provides detailed bounce information including bounce type, recipient details, and diagnostic codes.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region to monitor for bounces.',
          longDesc:
            'Select the AWS region where your SES service is configured to monitor for bounce events.',
        },
      },
    },
    new_complaint: {
      displayName: 'New Email Complaint',
      shortDesc: 'Triggers when a recipient marks your email as spam.',
      longDesc:
        'Monitors for spam complaints and triggers when recipients mark your emails as spam or unwanted. Helps maintain good sender reputation by tracking complaint rates.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region to monitor for complaints.',
          longDesc:
            'Select the AWS region where your SES service is configured to monitor for complaint events.',
        },
      },
    },
    new_verified_identity: {
      displayName: 'New Verified Identity',
      shortDesc: 'Triggers when a new email address or domain is verified.',
      longDesc:
        'Monitors for newly verified email addresses and domains in your SES account. Triggers when the verification process is completed for new sending identities.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region to monitor for new verified identities.',
          longDesc:
            'Select the AWS region where your SES service is configured to monitor for new verified identities.',
        },
      },
    },
  },
};

export default AmazonSESAppEn;
