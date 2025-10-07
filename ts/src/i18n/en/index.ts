import type { BaseTranslation } from '../i18n-types';
import ActiveCampaign from './apps/ActiveCampaign';
import AzureActiveDirectory from './apps/ActiveDirectory';
import Airtable from './apps/Airtable';
import AmazonCloudFront from './apps/AmazonCloudFront';
import AmazonCloudWatch from './apps/AmazonCloudWatch';
import AmazonEC2 from './apps/AmazonEc2';
import AmazonLambda from './apps/AmazonLambda';
import AmazonS3 from './apps/AmazonS3';
import AmazonSES from './apps/AmazonSES';
import AmazonSNS from './apps/AmazonSNS';
import AmazonSQS from './apps/AmazonSQS';
import Asana from './apps/Asana';
import Attio from './apps/Attio';
import AzureDevOps from './apps/AzureDevOps';
import BigMl from './apps/BigMl';
import Bitbucket from './apps/Bitbucket';
import Brevo from './apps/Brevo';
import BrowseAi from './apps/BrowseAi';
import BusinessCentral from './apps/BusinessCentral';
import Calendly from './apps/Calendly';
import Canva from './apps/Canva';
import Claude from './apps/Claude';
import ClickUp from './apps/ClickUp';
import Confluence from './apps/Confluence';
import DocusignESignature from './apps/DocusignESignature';
import Dropbox from './apps/Dropbox';
import Dynamics from './apps/Dynamics';
import FacebookPages from './apps/FacebookPages';
import Figma from './apps/Figma';
import Freshdesk from './apps/Freshdesk';
import Gemini from './apps/Gemini';
import Github from './apps/Github';
import GoogleChat from './apps/GoogleChat';
import GoogleContacts from './apps/GoogleContacts';
import GoogleDocs from './apps/GoogleDocs';
import GoogleDrive from './apps/GoogleDrive';
import GoogleForms from './apps/GoogleForms';
import GoogleMeet from './apps/GoogleMeet';
import GoogleSheets from './apps/GoogleSheets';
import GoogleTasks from './apps/GoogleTasks';
import Hubspot from './apps/Hubspot';
import HuggingFace from './apps/HuggingFace';
import Intercom from './apps/Intercom';
import Jira from './apps/Jira';
import Klaviyo from './apps/Klaviyo';
import LinkedIn from './apps/LinkedIn';
import LinkedInOrganizations from './apps/LinkedInOrganizations';
import Magento from './apps/Magento';
import Mailchimp from './apps/Mailchimp';
import Messenger360 from './apps/Messenger360';
import NetSuite from './apps/NetSuite';
import Notion from './apps/Notion';
import Odoo from './apps/Odoo';
import OpenRouter from './apps/Openrouter';
import Outlook from './apps/Outlook';
import Paddle from './apps/Paddle';
import Pipedrive from './apps/Pipedrive';
import Quickbooks from './apps/Quickbooks';
import Salesforce from './apps/Salesforce';
import Serenity from './apps/Serenity';
import SharePoint from './apps/SharePoint';
import Shopify from './apps/Shopify';
import Stripe from './apps/Stripe';
import Teams from './apps/Teams';
import Telegram from './apps/Telegram';
import Typeform from './apps/Typeform';
import Webflow from './apps/Webflow';
import Xero from './apps/Xero';
import YouTube from './apps/YouTube';
import Zendesk from './apps/Zendesk';
import Zoom from './apps/Zoom';
import PayPal from './apps/PayPal';
import Patreon from './apps/Patreon';
import Todoist from './apps/Todoist';
import Sentry from './apps/Sentry';

const en = {
  common: {},
  apps: {
    Sentry,
    Patreon,
    Asana,
    Todoist,
    AzureDevOps,
    AzureActiveDirectory,
    AmazonEC2,
    AmazonS3,
    AmazonLambda,
    AmazonCloudFront,
    AmazonCloudWatch,
    AmazonSNS,
    AmazonSES,
    Claude,
    AmazonSQS,
    LinkedIn,
    BrowseAi,
    BigMl,
    Calendly,
    ClickUp,
    Gemini,
    OpenRouter,
    GoogleDocs,
    GoogleMeet,
    GoogleForms,
    GoogleDrive,
    GoogleSheets,
    GoogleContacts,
    GoogleChat,
    BusinessCentral,
    Quickbooks,
    Attio,
    Airtable,
    Odoo,
    Intercom,
    Xero,
    Dynamics,
    Mailchimp,
    Notion,
    Jira,
    Stripe,
    Github,
    Typeform,
    DocusignESignature,
    Zendesk,
    Hubspot,
    Dropbox,
    NetSuite,
    Salesforce,
    Freshdesk,
    SharePoint,
    Klaviyo,
    Outlook,
    Teams,
    Serenity,
    Pipedrive,
    Magento,
    Shopify,
    Zoom,
    Confluence,
    Bitbucket,
    FacebookPages,
    Paddle,
    Messenger360,
    Webflow,
    ActiveCampaign,
    HuggingFace,
    YouTube,
    Canva,
    Figma,
    LinkedInOrganizations,
    Telegram,
    Brevo,
    GoogleTasks,
    PayPal,
    _testing: {
      triggers: {
        _testing: {
          options: {
            option1: {
              displayName: 'Option 1',
              shortDesc: 'Option 1 Short Description',
              longDesc: 'Option 1 Long Description',
            },
            option2: {
              displayName: 'Second Option',
              shortDesc: 'Second Option Short Description',
              longDesc: 'Second Option Long Description',
            },
          },
          event_info: {
            desc: 'Event data',
            type: {
              fields: {
                testTriggerInfo: {
                  displayName: 'Test Trigger Info',
                  shortDesc: 'Test Trigger Info Short Description',
                  longDesc: 'Test Trigger Info Long Description',
                  type: {
                    fields: {
                      testTriggerInfo1: {
                        displayName: 'Test Trigger Info 1',
                        shortDesc: 'Test Trigger Info 1 Short Description',
                        longDesc: 'Test Trigger Info 1 Long Description',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      actions: {
        test: {
          options: {
            option1: {
              displayName: 'Option 1',
              shortDesc: 'Option 1 Short Description',
              longDesc: 'Option 1 Long Description',
              type: {
                fields: {
                  subOption1: {
                    displayName: 'Sub Option 1 of option 1',
                    shortDesc: 'Sub Option 1 Short Description',
                    longDesc: 'Sub Option 1 Long Description',
                  },
                  subOption2: {
                    displayName: 'Sub Option 2 of option 1',
                    shortDesc: 'Sub Option 2 Short Description',
                    longDesc: 'Sub Option 2 Long Description',
                    type: {
                      fields: {
                        subSubOption1: {
                          displayName: 'Sub Sub Option 1',
                          shortDesc: 'Sub Sub Option 1 Short Description',
                          longDesc: 'Sub Sub Option 1 Long Description',
                        },
                      },
                    },
                  },
                  subOption3: {
                    displayName: 'Sub Option 3 of option 1',
                    shortDesc: 'Sub Option 3 Short Description',
                    longDesc: 'Sub Option 3 Long Description',
                    type: {
                      element_type: {
                        type: {
                          fields: {
                            subSubOption1: {
                              displayName: 'Sub Sub Option 1',
                              shortDesc: 'Sub Sub Option 1 Short Description',
                              longDesc: 'Sub Sub Option 1 Long Description',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            option2: {
              displayName: 'Second Option',
            },
          },
        },
      },
    },
  },
} satisfies BaseTranslation;

export default en;
