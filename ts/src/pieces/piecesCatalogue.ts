import {
  ActionContext,
  ActionRunner,
  DropdownState,
  DynamicProperties,
  InputPropertyMap,
  Piece,
  PieceAuthProperty,
  PropertyType,
  StaticPropsValue,
} from 'core/framework';
import { DynamicDropdownOptions } from 'core/framework/property/input/dropdown/dropdown-prop';
import { fixActionType, normalizeAppName, normalizeName } from 'global/helpers';
import {
  IQoreAllowedValue,
  IQoreAppActionOption,
  IQoreAppActionWithFunction,
  IQoreAppWithActions,
  IQoreRestConnectionConfig,
  TQoreAppActionFunction,
  TQoreAppActionFunctionContext,
  TQoreApps,
  TQoreGetAllowedValuesFunction,
  TQoreGetDependentOptionsFunction,
} from 'global/models/qore';
import { InputProperty } from '../core/framework/property/input';
import { DEFAULT_LOGO } from '../global/constants';
import { fixActionOptions } from '../global/helpers/index';
import { Locales } from '../i18n/i18n-types';
import { commonActionContext, piecePropTypeToQoreOptionTypeIndex } from './common/constants';
import { TMapPieceActionToAppActionOptions } from './common/models/pieces-catalogue';
import * as pieces from './index';
pieces satisfies Record<string, Piece>;

class _PiecesAppCatalogue {
  public readonly apps: TQoreApps = {};

  constructor(public locale: Locales = 'en') {}

  public registerApps(): void {
    const qoreApps = Object.entries(pieces).map(([pieceName, piece]) =>
      this.mapPieceToApp(pieceName, piece)
    );
    qoreApps.forEach((app) => (this.apps[app.name] = app));
  }

  private mapPieceToApp(pieceName: string, piece: Piece): IQoreAppWithActions {
    const appName = normalizeAppName(pieceName);
    const actions = Object.entries(piece.actions()).map(([actionName, action]) =>
      this.mapPieceActionToAppAction({ appName, actionName, action })
    );

    return {
      name: appName,
      actions: actions,
      rest: this.mapPieceAuthToAppRest(piece.auth),
      display_name: piece.displayName,
      short_desc: piece.description,
      desc: piece.description,
      logo: piece.logo || DEFAULT_LOGO,
      logo_file_name: `${appName}.svg`,
      logo_mime_type: 'image/svg+xml',
    };
  }

  // Mapping pieces auth options to qore rest connection config
  private mapPieceAuthToAppRest(auth: PieceAuthProperty): IQoreRestConnectionConfig {
    if (auth.type === PropertyType.OAUTH2) {
      return {
        data: 'auto',
        oauth2_grant_type: 'authorization_code',
        url: auth.url,
        ping_method: auth.pingMethod,
        ping_path: auth.pingPath,
        ping_headers: auth.pingHeaders,
        oauth2_auth_url: auth.authUrl,
        oauth2_token_url: auth.tokenUrl,
        oauth2_scopes: auth.scope,
        oauth2_auth_args: auth.extra,
        oauth2_token_use_basic_auth: auth.oauth2TokenUseBasicAuth,
      };
    }
  }

  private mapPieceActionToAppAction({
    appName,
    actionName,
    action,
  }: TMapPieceActionToAppActionOptions): IQoreAppActionWithFunction {
    const formattedActionName = normalizeName(actionName);
    const options = this.mapActionPropsToAppActionOptions(action.props);

    return {
      app: appName,
      action_code: 2,
      display_name: action.displayName,
      short_desc: action.description,
      desc: action.description,
      action: formattedActionName,
      api_function: this.mapPieceActionToAppActionFunction(action.run),
      options: fixActionOptions(options, appName, this.locale, appName),
      response_type: fixActionType(action.responseType, appName, this.locale, appName),
    };
  }

  private mapPieceActionToAppActionFunction(
    runFunction: ActionRunner<any, any>
  ): TQoreAppActionFunction {
    return (
      obj: Record<string, any>,
      _options: Record<string, any>,
      context: TQoreAppActionFunctionContext
    ): Promise<any> => {
      const actionContext = {
        propsValue: obj satisfies StaticPropsValue<InputPropertyMap>,
        auth: { access_token: context.conn_opts.token, ...context.opts },
        ...commonActionContext,
      } satisfies ActionContext;

      return runFunction(actionContext);
    };
  }

  private mapActionPropsToAppActionOptions(
    props: Record<string, InputProperty>
  ): Record<string, IQoreAppActionOption> {
    const options: Record<string, IQoreAppActionOption> = {};

    for (const key in props) {
      // Skip info props - these property shouldn't contain a value and used in pieces as info block
      if (key === 'info') {
        // Add info prop to a different field in action
        continue;
      }
      // Skip dynamic props - because they are put into get_dependent_options function for "parent" option
      if (props[key].type === PropertyType.DYNAMIC) {
        // Dynamic props are handled differently
        continue;
      }

      const value = props[key];
      // Getting dynamic options async calls to put into single get_dependent_options function and map the result
      const functions = this.getDynamicOptionsFunctions(key, props);
      options[key] = this.mapActionPropToAppActionOption(value, functions);
    }

    return options;
  }

  private getDynamicOptionsFunctions(
    key: string,
    props: Record<string, InputProperty>
  ): DynamicProperties<true>['props'][] | undefined {
    const functions: DynamicProperties<true>['props'][] = [];
    for (const propKey in props) {
      const prop = props[propKey];

      // Getting the dynamic props and checking if they are dependent on the current prop
      // In case they are dependent, we collect them
      if (prop.type === PropertyType.DYNAMIC && prop.refreshers?.includes(key) && 'props' in prop) {
        functions.push(prop.props);
      }
    }

    return functions.length ? functions : undefined;
  }

  private mapActionPropToAppActionOption(
    prop: InputProperty,
    getDependentOptionsFunctions?: DynamicProperties<true>['props'][]
  ): IQoreAppActionOption {
    let allowed_values: IQoreAllowedValue[] | undefined = undefined;
    let get_allowed_values: TQoreGetAllowedValuesFunction | undefined = undefined;
    let get_dependent_options: TQoreGetDependentOptionsFunction | undefined = undefined;
    const description = prop.description || prop.displayName;

    // Checking if the prop has allowed get allowed values function
    if (typeof prop === 'object' && 'options' in prop) {
      allowed_values = this.mapPieceAllowedValuesToQoreAllowedValues(
        prop.options as DropdownState<any>
      );
      get_allowed_values = this.mapPieceGetOptionsToQoreGetAllowedValues(
        prop.options as DynamicDropdownOptions<any>
      );
    }

    // Checking if the prop has dependent or dynamic options
    if (getDependentOptionsFunctions) {
      get_dependent_options = this.mapDynamicOptionsFunctionsToQoreGetDependentOptions(
        getDependentOptionsFunctions
      );
    }

    return {
      display_name: prop.displayName,
      short_desc: description || prop.displayName,
      desc: description || prop.displayName,
      type: piecePropTypeToQoreOptionTypeIndex[prop.type],
      get_allowed_values,
      get_dependent_options,
      allowed_values,
      required: prop.required,
      default_value: prop.defaultValue,
      example_value: prop.defaultValue,
    };
  }

  private mapDynamicOptionsFunctionsToQoreGetDependentOptions(
    functions: DynamicProperties<true>['props'][]
  ): TQoreGetDependentOptionsFunction {
    return async (
      context: TQoreAppActionFunctionContext
    ): Promise<Record<string, IQoreAppActionOption>> => {
      const pieceContext = {
        auth: { access_token: context.conn_opts.token, ...context.opts },
        ...context.opts,
      };
      const options: Record<string, IQoreAppActionOption> = {};

      // Going through all the dynamic options functions and getting the options
      for (const func of functions) {
        const pieceOptions = await func(pieceContext, commonActionContext);
        for (const key in pieceOptions) {
          const pieceOption = pieceOptions[key];
          // Mapping the received options to qore options
          const qoreOption: IQoreAppActionOption = this.mapActionPropToAppActionOption(pieceOption);
          options[key] = qoreOption;
        }
      }

      return options;
    };
  }

  private mapPieceAllowedValuesToQoreAllowedValues(
    options: DropdownState<any>
  ): IQoreAllowedValue[] {
    if ('options' in options) {
      return options.options.map((option) => ({
        value: option.value,
        desc: option.label,
        short_desc: option.label,
        display_name: option.label,
      }));
    }
  }

  private mapPieceGetOptionsToQoreGetAllowedValues(
    getOptions: DynamicDropdownOptions<any>
  ): TQoreGetAllowedValuesFunction {
    return async (context: TQoreAppActionFunctionContext): Promise<IQoreAllowedValue[]> => {
      const auth = { access_token: context.conn_opts.token };
      const options = await getOptions({ auth });

      return options.options.map((option) => ({
        value: option.value,
        desc: option.label,
        short_desc: option.label,
        display_name: option.label,
      }));
    };
  }
}

export const PiecesAppCatalogue = new _PiecesAppCatalogue();
