// appsCatalogue.ts
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
import asana from '../apps/asana';
import esignature from '../apps/esignature';
import freshdesk from '../apps/freshdesk';
import github from '../apps/github';
import hubspot from '../apps/hubspot';
import jira from '../apps/jira';
import magento from '../apps/magento';
import netsuite from '../apps/netsuite';
import outlook from '../apps/outlook';
import pipedrive from '../apps/pipedrive';
import salesforce from '../apps/salesforce';
import serenity from '../apps/serenity';
import sharepoint from '../apps/sharepoint';
import stripe from '../apps/stripe';
import teams from '../apps/teams';
import zendesk from '../apps/zendesk';
import { Log } from '../decorators/Logger';
import { Locales } from '../i18n/i18n-types';
import { PiecesAppCatalogue } from '../pieces/piecesCatalogue';
import { Debugger, DebugLevels } from '../utils/Debugger';
import shopify from '../apps/shopify';
import mailchimp from '../apps/mailchimp';

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
  serenity,
  netsuite,
  zendesk,
  asana,
  esignature,
  github,
  jira,
  stripe,
  freshdesk,
  hubspot,
  sharepoint,
  outlook,
  teams,
  pipedrive,
  magento,
  shopify,
  mailchimp,
} as const;

const EXISTING_APPS = {
  salesforce,
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
