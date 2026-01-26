import {
  IQoreApp,
  IQoreExistingApp,
  IQoreExistingAppWithActions,
  TQoreAppAction,
  TQoreApps,
  TQoreAppWithActions,
  TQoreExistingApps,
  TQoreRecordBasedApp,
} from '@qoretechnologies/ts-toolkit';
import fs from 'fs';
import { omit } from 'lodash';
import path from 'path';
import activeCampaign from '../apps/active-campaign';
import activeDirectory from '../apps/active-directory';
import airtable from '../apps/airtable';
import amazonCloudfront from '../apps/amazon-cloudfront';
import amazonCloudWatch from '../apps/amazon-cloudwatch';
import amazonEc2 from '../apps/amazon-ec2';
import amazonLambda from '../apps/amazon-lambda';
import amazonS3 from '../apps/amazon-s3';
import amazonSes from '../apps/amazon-ses';
import amazonSns from '../apps/amazon-sns';
import amazonSqs from '../apps/amazon-sqs';
import asana from '../apps/asana';
import attio from '../apps/attio';
import azureDevops from '../apps/azure-devops';
import bamboohr from '../apps/bamboohr';
import baserow from '../apps/baserow';
import bigml from '../apps/bigml';
import bitbucket from '../apps/bitbucket';
import brevo from '../apps/brevo';
import browserAi from '../apps/browse-ai';
import businessCentral from '../apps/business-central';
import calendly from '../apps/calendly';
import canva from '../apps/canva';
import claude from '../apps/claude';
import clickup from '../apps/clickup';
import confluence from '../apps/confluence';
import coppercrm from '../apps/coppercrm';
import craft from '../apps/craft';
import dynamics from '../apps/dynamics';
import esignature from '../apps/esignature';
import facebookPages from '../apps/facebook-pages';
import figma from '../apps/figma';
import firebase from '../apps/firebase';
import firestore from '../apps/firestore';
import freshdesk from '../apps/freshdesk';
import gemini from '../apps/gemini';
import github from '../apps/github';
import gitlab from '../apps/gitlab';
import googleAnalytics from '../apps/google-analytics';
import googleChat from '../apps/google-chat';
import googleContacts from '../apps/google-contacts';
import googleDocs from '../apps/google-docs';
import googleDrive from '../apps/google-drive';
import googleForms from '../apps/google-forms';
import googleMeet from '../apps/google-meet';
import googleSheets from '../apps/google-sheets';
import googleTasks from '../apps/google-tasks';
import hubspot from '../apps/hubspot';
import huggingFace from '../apps/hugging-face';
import intercom from '../apps/intercom';
import jira from '../apps/jira';
import klaviyo from '../apps/klaviyo';
import linkedin from '../apps/linkedin';
import linkedinOrganizations from '../apps/linkedin-organizations';
import magento from '../apps/magento';
import mailchimp from '../apps/mailchimp';
import mautic from '../apps/mautic';
import messenger360 from '../apps/messenger360';
import monday from '../apps/monday';
import netsuite from '../apps/netsuite';
import nocodb from '../apps/nocodb';
import notion from '../apps/notion';
import odoo from '../apps/odoo';
import openrouter from '../apps/openrouter';
import openWeatherMap from '../apps/open-weather-map';
import outlook from '../apps/outlook';
import paddle from '../apps/paddle';
import patreon from '../apps/patreon';
import paypal from '../apps/paypal';
import pipedrive from '../apps/pipedrive';
import pushover from '../apps/pushover';
import quickbooks from '../apps/quickbooks';
import salesforce from '../apps/salesforce';
import seatable from '../apps/seatable';
import sentry from '../apps/sentry';
import serenity from '../apps/serenity';
import sharepoint from '../apps/sharepoint';
import shopify from '../apps/shopify';
import stripe from '../apps/stripe';
import supabase from '../apps/supabase';
import teams from '../apps/teams';
import telegram from '../apps/telegram';
import todoist from '../apps/todoist';
import twilio from '../apps/twilio';
import typeform from '../apps/typeform';
import webflow from '../apps/webflow';
import xero from '../apps/xero';
import youtube from '../apps/youtube';
import zendesk from '../apps/zendesk';
import zohocrm from '../apps/zohocrm';
import zoom from '../apps/zoom';
import { Log } from '../decorators/Logger';
import L from '../i18n/i18n-node';
import { Locales } from '../i18n/i18n-types';
import { Debugger, DebugLevels } from '../utils/Debugger';
import sendgrid from '../apps/sendgrid';
import helpscout from '../apps/helpscout';
import dropbox from '../apps/dropbox';
import front from '../apps/front';
import slack from '../apps/slack';
import surveyMonkey from '../apps/survey-monkey';
import trello from '../apps/trello';

if (process.env.TS_DEBUG) {
  Debugger.level = DebugLevels.Verbose;
}

export interface IQoreApi {
  registerApp: (app: IQoreApp) => void;
  registerExistingApp: (app: IQoreExistingApp) => void;
  registerAction: (action: TQoreAppAction) => void;
}

const NEW_APPS = {
  activeCampaign,
  activeDirectory,
  airtable,
  amazonEc2,
  amazonS3,
  amazonSes,
  amazonLambda,
  amazonCloudfront,
  amazonCloudWatch,
  amazonSns,
  amazonSqs,
  asana,
  attio,
  azureDevops,
  bamboohr,
  baserow,
  bigml,
  bitbucket,
  brevo,
  browserAi,
  calendly,
  canva,
  claude,
  clickup,
  confluence,
  coppercrm,
  craft,
  dropbox,
  esignature,
  facebookPages,
  figma,
  firebase,
  firestore,
  freshdesk,
  gemini,
  github,
  gitlab,
  googleAnalytics,
  googleChat,
  googleContacts,
  googleDocs,
  googleDrive,
  googleForms,
  googleMeet,
  googleSheets,
  googleTasks,
  helpscout,
  hubspot,
  huggingFace,
  intercom,
  jira,
  klaviyo,
  linkedin,
  linkedinOrganizations,
  magento,
  mailchimp,
  mautic,
  messenger360,
  monday,
  netsuite,
  nocodb,
  notion,
  odoo,
  openrouter,
  openWeatherMap,
  outlook,
  paddle,
  patreon,
  paypal,
  pipedrive,
  pushover,
  quickbooks,
  seatable,
  sendgrid,
  sentry,
  serenity,
  sharepoint,
  shopify,
  stripe,
  supabase,
  teams,
  telegram,
  todoist,
  trello,
  twilio,
  typeform,
  webflow,
  xero,
  youtube,
  zendesk,
  zohocrm,
  zoom,
  front,
  slack,
  surveyMonkey,
} as const;

const EXISTING_APPS = {
  salesforce,
  dynamics,
  businessCentral,
} as const;

const CUSTOM_APPS: Record<string, TQoreAppWithActions> = {};

/* Get all the default exports from the folders inside this folder */
const appsDir = path.resolve(path.join(__dirname, '..', 'customApps'));

const importIndexFilesFromDir = (dir: string) => {
  fs.readdirSync(dir).forEach((subDir) => {
    const fullPath = path.join(dir, subDir);
    const indexPath = path.join(fullPath, 'index.js');

    if (fs.statSync(fullPath).isDirectory() && fs.existsSync(indexPath)) {
      CUSTOM_APPS[subDir] = require(indexPath).default;
    }
  });
};

// Load our custom apps
importIndexFilesFromDir(appsDir);
// Load user defined custom apps
if (process.env.CUSTOM_APPS_DIR) {
  importIndexFilesFromDir(path.resolve(process.env.CUSTOM_APPS_DIR));
}

export class ActionsCatalogue {
  public readonly apps: TQoreApps = {};
  public readonly existingApps: TQoreExistingApps = {};

  constructor(public locale: Locales = 'en') {}

  @Log('Initializing the Actions Catalogue')
  registerAppActions(api: IQoreApi) {
    this.initializeCatalogue();

    // Register new apps
    this.registerAppCollection(
      this.apps,
      (app) => api.registerApp(app),
      (action) => api.registerAction(action)
    );

    // Register existing apps
    this.registerAppCollection(
      this.existingApps,
      (app) => api.registerExistingApp(app),
      (action) => api.registerAction(action)
    );
  }

  registerCustomApp(api: IQoreApi, appFolder: string) {
    const appPath = path.resolve(appsDir, appFolder);
    const indexPath = path.join(appPath, 'index.js');

    if (fs.existsSync(indexPath)) {
      const app: TQoreAppWithActions = require(indexPath).default;

      this.registerAppCollection(
        { [appFolder]: app },
        (app) => api.registerApp(app),
        (action) => api.registerAction(action)
      );
    } else {
      throw new Error(`Custom app ${appFolder} not found`);
    }
  }

  private registerAppCollection<
    T extends TQoreAppWithActions | IQoreExistingAppWithActions | TQoreRecordBasedApp,
  >(
    collection: Record<string, T>,
    registerAppFn: (app: Omit<T, 'actions'>) => void,
    registerActionFn: (action: TQoreAppAction) => void
  ) {
    Object.keys(collection).forEach((appName) => {
      const collectionApp = collection[appName] as T;
      const app = omit(collectionApp, 'actions');

      let actions: TQoreAppAction[] = [];

      if ('actions' in collectionApp) {
        actions = collectionApp.actions;
      }

      registerAppFn(app);
      actions.forEach(registerActionFn);
    });
  }

  public initializeCatalogue() {
    Object.entries(NEW_APPS).forEach(
      ([appName, getApp]: [string, (locale: Locales) => TQoreAppWithActions]) => {
        const app = getApp(this.locale);
        const localeGroups = (L[this.locale].apps as any)[app.name]?.groups;
        const localeConnectionMessage = (L[this.locale].apps as any)[app.name]?.connectionMessage;
        const connectionMessageTitle = localeConnectionMessage
          ? localeConnectionMessage.title()
          : undefined;
        const connectionMessageContent = localeConnectionMessage
          ? localeConnectionMessage.content()
          : undefined;

        const groups = localeGroups
          ? Object.values(localeGroups).map((fn: any) => fn())
          : ['Other'];

        this.apps[appName] = {
          ...app,
          groups,
          ...(connectionMessageTitle &&
            connectionMessageContent && {
              rest_modifiers: {
                ...(app.rest_modifiers || {}),
                messages: [
                  {
                    intent: 'info',
                    title: connectionMessageTitle,
                    content: connectionMessageContent,
                  },
                ],
              },
            }),
        };
      }
    );

    Object.entries(CUSTOM_APPS).forEach(([appName, customApp]) => {
      this.apps[appName] = customApp;
    });

    Object.entries(EXISTING_APPS).forEach(([appName, getApp]) => {
      this.existingApps[appName] = getApp(this.locale);
    });
  }

  public getOauth2ClientSecret(appName: string): string {
    return process.env[`${appName.toUpperCase()}_CLIENT_SECRET`] ?? 'auto';
  }
}

export const actionsCatalogue = new ActionsCatalogue();
