// This will be replaced by the real implementation
import freshdesk from '../apps/freshdesk';
import { Log } from '../decorators/Logger';
import { IQoreApp, IQoreAppWithActions, TQoreAppAction, TQoreApps } from '../global/models/qore';
import { Locales } from '../i18n/i18n-types';
import { PiecesAppCatalogue } from '../pieces/piecesCatalogue';
import { Debugger, DebugLevels } from '../utils/Debugger';

if (process.env.TS_DEBUG) {
  Debugger.level = DebugLevels.Verbose;
}

PiecesAppCatalogue.registerApps();

export interface IQoreApi {
  registerApp: (app: IQoreApp) => void;
  registerAction: (action: TQoreAppAction) => void;
}

class ActionsCatalogue {
  public readonly apps: TQoreApps = {};

  constructor(public locale: Locales = 'en') {}

  @Log('Initializing the Actions Catalogue')
  registerAppActions(api: IQoreApi) {
    // Initialize the Qorus Apps Catalogue, this will load all the apps
    this.initializeCatalogue();

    // Go through all the apps and register them
    Object.keys(this.apps).forEach((appName) => {
      const { actions, ...app }: IQoreAppWithActions = this.apps[appName];

      // Register the app
      api.registerApp(app);

      // Register the actions
      actions.forEach((action) => {
        console.dir(action, { depth: null });
        api.registerAction(action);
      });
    });
  }

  // Register all the apps here
  public initializeCatalogue() {
    Object.keys(PiecesAppCatalogue.apps).forEach((appName) => {
      this.apps[appName] = PiecesAppCatalogue.apps[appName];
    });

    // this.apps['zendesk'] = zendesk(this.locale);
    // this.apps['asana'] = asana(this.locale);
    // this.apps['esignature'] = esignature(this.locale);
    // this.apps['github'] = github(this.locale);
    // this.apps['jira'] = jira(this.locale);
    // this.apps['stripe'] = stripe(this.locale);
    // this.apps['netsuite'] = netsuite(this.locale);
    this.apps['freshdesk'] = freshdesk(this.locale);
  }

  public getOauth2ClientSecret(appName: string): string {
    return process.env[`${appName.toUpperCase()}_CLIENT_SECRET`] ?? 'auto';
  }
}

export const actionsCatalogue = new ActionsCatalogue();
