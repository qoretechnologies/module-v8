import {
  IQoreApp,
  IQoreExistingApp,
  IQoreExistingAppWithActions,
  TQoreAppAction,
  TQoreApps,
  TQoreAppWithActions,
  TQoreExistingApps,
} from '@qoretechnologies/ts-toolkit';
import fs from 'fs';
import path from 'path';
import activeCampaign from '../apps/active-campaign';
import airtable from '../apps/airtable';
import asana from '../apps/asana';
import attio from '../apps/attio';
import bigml from '../apps/bigml';
import bitbucket from '../apps/bitbucket';
import browserAi from '../apps/browse-ai';
import businessCentral from '../apps/business-central';
import calendly from '../apps/calendly';
import claude from '../apps/claude';
import clickup from '../apps/clickup';
import confluence from '../apps/confluence';
import dynamics from '../apps/dynamics';
import esignature from '../apps/esignature';
import facebookPages from '../apps/facebook-pages';
import freshdesk from '../apps/freshdesk';
import gemini from '../apps/gemini';
import github from '../apps/github';
import googleChat from '../apps/google-chat';
import googleContacts from '../apps/google-contacts';
import googleDocs from '../apps/google-docs';
import googleDrive from '../apps/google-drive';
import googleForms from '../apps/google-forms';
import googleMeet from '../apps/google-meet';
import googleSheets from '../apps/google-sheets';
import hubspot from '../apps/hubspot';
import intercom from '../apps/intercom';
import jira from '../apps/jira';
import klaviyo from '../apps/klaviyo';
import magento from '../apps/magento';
import mailchimp from '../apps/mailchimp';
import messenger360 from '../apps/messenger360';
import netsuite from '../apps/netsuite';
import odoo from '../apps/odoo';
import openrouter from '../apps/openrouter';
import outlook from '../apps/outlook';
import paddle from '../apps/paddle';
import pipedrive from '../apps/pipedrive';
import quickbooks from '../apps/quickbooks';
import salesforce from '../apps/salesforce';
import serenity from '../apps/serenity';
import sharepoint from '../apps/sharepoint';
import shopify from '../apps/shopify';
import stripe from '../apps/stripe';
import teams from '../apps/teams';
import typeform from '../apps/typeform';
import webflow from '../apps/webflow';
import xero from '../apps/xero';
import zendesk from '../apps/zendesk';
import zoom from '../apps/zoom';
import { Log } from '../decorators/Logger';
import { Locales } from '../i18n/i18n-types';
import { PiecesAppCatalogue } from '../pieces/piecesCatalogue';
import { Debugger, DebugLevels } from '../utils/Debugger';

if (process.env.TS_DEBUG) {
  Debugger.level = DebugLevels.Verbose;
}

PiecesAppCatalogue.registerApps();

export interface IQoreApi {
  registerApp: (app: IQoreApp) => void;
  registerExistingApp: (app: IQoreExistingApp) => void;
  registerAction: (action: TQoreAppAction) => void;
}

const NEW_APPS = {
  activeCampaign,
  airtable,
  asana,
  attio,
  bigml,
  bitbucket,
  browserAi,
  businessCentral,
  calendly,
  claude,
  clickup,
  confluence,
  esignature,
  facebookPages,
  freshdesk,
  gemini,
  github,
  googleChat,
  googleContacts,
  googleDocs,
  googleDrive,
  googleForms,
  googleMeet,
  googleSheets,
  hubspot,
  intercom,
  jira,
  klaviyo,
  magento,
  mailchimp,
  messenger360,
  netsuite,
  odoo,
  openrouter,
  outlook,
  paddle,
  pipedrive,
  quickbooks,
  serenity,
  sharepoint,
  shopify,
  stripe,
  teams,
  typeform,
  webflow,
  xero,
  zendesk,
  zoom,
} as const;

const EXISTING_APPS = {
  salesforce,
  dynamics,
} as const;

const CUSTOM_APPS: Record<string, TQoreAppWithActions> = {};

/* Get all the default exports from the folders inside this folder */
const appsDir = path.resolve(path.join(__dirname, '..', 'customApps'));

function importIndexFilesFromDir(dir: string) {
  fs.readdirSync(dir).forEach((subDir) => {
    const fullPath = path.join(dir, subDir);
    const indexPath = path.join(fullPath, 'index.js');

    if (fs.statSync(fullPath).isDirectory() && fs.existsSync(indexPath)) {
      CUSTOM_APPS[subDir] = require(indexPath).default;
    }
  });
}

// Load our custom apps
importIndexFilesFromDir(appsDir);
// Load user defined custom apps
if (process.env.CUSTOM_APPS_DIR) {
  importIndexFilesFromDir(path.resolve(process.env.CUSTOM_APPS_DIR || ''));
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

  private registerAppCollection<T extends TQoreAppWithActions | IQoreExistingAppWithActions>(
    collection: Record<string, T>,
    registerAppFn: (app: Omit<T, 'actions'>) => void,
    registerActionFn: (action: TQoreAppAction) => void
  ) {
    Object.keys(collection).forEach((appName) => {
      const { actions, ...app } = collection[appName] as T;
      registerAppFn(app);
      actions.forEach(registerActionFn);
    });
  }

  public initializeCatalogue() {
    Object.entries(PiecesAppCatalogue.apps).forEach(([appName, appDef]) => {
      this.apps[appName] = appDef;
    });

    Object.entries(NEW_APPS).forEach(([appName, getApp]) => {
      this.apps[appName] = getApp(this.locale);
    });

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
