import {
  IQoreApp,
  IQoreExistingApp,
  IQoreExistingAppWithActions,
  TQoreAppAction,
  TQoreApps,
  TQoreAppWithActions,
  TQoreCrudOptions,
  TQoreExistingApps,
  TQoreRecordBasedApp,
} from '@qoretechnologies/ts-toolkit';
import fs from 'fs';
import { omit } from 'lodash';
import path from 'path';
import businessCentral from '../apps/business-central';
import dynamics from '../apps/dynamics';
import salesforce from '../apps/salesforce';
import { Log } from '../decorators/Logger';
import { mapCrudOptionsToApp, TQoreCrudOptionType } from '../global/helpers';
import L from '../i18n/i18n-node';
import { Locales } from '../i18n/i18n-types';
import { Debugger, DebugLevels } from '../utils/Debugger';

if (process.env.TS_DEBUG) {
  Debugger.level = DebugLevels.Verbose;
}

export interface IQoreApi {
  registerApp: (app: IQoreApp) => void;
  registerExistingApp: (app: IQoreExistingApp) => void;
  registerAction: (action: TQoreAppAction) => void;
}

// Curated list of the app directories that make up NEW_APPS. These apps are
// loaded lazily by path on demand (loadAppFromPath) instead of being imported
// eagerly; this list is the lazy equivalent of the former NEW_APPS object and
// must be kept in sync with it (it deliberately excludes work-in-progress app
// directories that are not part of the catalogue).
const NEW_APP_DIRS: readonly string[] = [
  'active-campaign',
  'active-directory',
  'airtable',
  'amazon-cloudfront',
  'amazon-cloudwatch',
  'amazon-ec2',
  'amazon-lambda',
  'amazon-s3',
  'amazon-ses',
  'amazon-sns',
  'amazon-sqs',
  'asana',
  'attio',
  'azure-devops',
  'bamboohr',
  'baserow',
  'bigml',
  'bitbucket',
  'brevo',
  'browse-ai',
  'calendly',
  'canva',
  'clickup',
  'confluence',
  'contentful',
  'coppercrm',
  'craft',
  'dropbox',
  'esignature',
  'facebook-pages',
  'figma',
  'firebase',
  'firestore',
  'freshdesk',
  'front',
  'github',
  'gitlab',
  'google-ads',
  'google-analytics',
  'google-chat',
  'google-contacts',
  'google-docs',
  'google-drive',
  'google-forms',
  'google-meet',
  'google-sheets',
  'google-tasks',
  'helpscout',
  'hubspot',
  'intercom',
  'jira',
  'klaviyo',
  'linkedin',
  'linkedin-organizations',
  'magento',
  'mailchimp',
  'mautic',
  'messenger360',
  'monday',
  'netsuite',
  'nocodb',
  'notion',
  'odoo',
  'open-weather-map',
  'openrouter',
  'outlook',
  'paddle',
  'patreon',
  'paypal',
  'pipedrive',
  'pushover',
  'quickbooks',
  'seatable',
  'sendgrid',
  'sentry',
  'serenity',
  'sharepoint',
  'shopify',
  'slack',
  'stripe',
  'supabase',
  'survey-monkey',
  'teams',
  'telegram',
  'todoist',
  'trello',
  'twilio',
  'typeform',
  'webflow',
  'xero',
  'youtube',
  'zendesk',
  'zohocrm',
  'zoom',
];

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
    // NEW-style apps are no longer loaded eagerly here: they are registered as
    // pending from the build-time manifest (see scripts/gen-app-manifest) and
    // loaded on demand via loadAppFromPath(), so only the apps actually used
    // are ever parsed/instantiated.  Only the small "custom" and "existing"
    // app sets are initialized up front.
    Object.entries(CUSTOM_APPS).forEach(([appName, customApp]) => {
      this.apps[appName] = customApp;
    });

    Object.entries(EXISTING_APPS).forEach(([appName, getApp]) => {
      this.existingApps[appName] = getApp(this.locale);
    });
  }

  /** Apply locale groups, CRUD options and connection messages to a single
      NEW-style app (a locale-function export), producing the fully mapped app
      definition.  Extracted from the former eager initializeCatalogue() loop. */
  private processNewApp(
    getApp: (locale: Locales) => TQoreAppWithActions
  ): TQoreAppWithActions {
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

    const crudOptionTypes: { key: string; localeKey: TQoreCrudOptionType }[] = [
      { key: 'search_options', localeKey: 'searchOptions' },
      { key: 'create_options', localeKey: 'createOptions' },
      { key: 'upsert_options', localeKey: 'upsertOptions' },
    ];

    const mappedCrudOptions: Record<string, TQoreCrudOptions> = {};
    for (const { key, localeKey } of crudOptionTypes) {
      const options = (app as unknown as Record<string, unknown>)[key] as
        | TQoreCrudOptions
        | undefined;
      if (options) {
        mappedCrudOptions[key] = mapCrudOptionsToApp(
          app.name as keyof typeof L.en.apps,
          options,
          localeKey,
          this.locale
        );
      }
    }

    return {
      ...app,
      ...mappedCrudOptions,
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

  /** Load a single NEW-style app from its directory on demand and register its
      actions.  Called from the Qore side (initApp) for apps that were
      registered pending from the manifest, so only used apps are ever loaded
      (and only then is the app's SDK pulled in). */
  loadAppFromPath(api: IQoreApi, appPath: string): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(appPath);
    const getApp = mod && (mod.default || mod);
    if (typeof getApp !== 'function') {
      throw new Error(`App at ${appPath} does not export a locale function`);
    }
    const app = this.processNewApp(getApp);
    this.apps[app.name] = app;
    this.registerAppCollection(
      { [app.name]: app },
      (a) => api.registerApp(a),
      (action) => api.registerAction(action)
    );
    // return the app name so the Qore side can build a dir <-> name map
    return app.name;
  }

  // Returns the curated list of NEW_APPS directory names so the Qore side can
  // load exactly the catalogue's apps (and not unrelated/WIP directories).
  public getNewAppDirs(): readonly string[] {
    return NEW_APP_DIRS;
  }

  public getOauth2ClientSecret(appName: string): string {
    return process.env[`${appName.toUpperCase()}_CLIENT_SECRET`] ?? 'auto';
  }
}

export const actionsCatalogue = new ActionsCatalogue();
