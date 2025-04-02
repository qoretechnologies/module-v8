import {
  EQoreAppActionCode,
  IQoreAllowedValue,
  IQoreAppActionWithFunction,
  IQoreRestConnectionConfig,
  TCustomConnOptions,
  TQoreAnyType,
  TQoreAppActionFunction,
  TQoreAppActionFunctionContext,
  TQoreAppActionOption,
  TQoreApps,
  TQoreAppWithActions,
  TQoreFile,
  TQoreGetAllowedValuesFunction,
  TQoreGetDefaultValueFunction,
  TQoreGetDependentOptionsFunction,
  TQoreOptions,
  TQorePartialNonEventAction,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import {
  ActionContext,
  ActionRunner,
  DropdownState,
  DynamicProperties,
  Piece,
  PieceAuthProperty,
  PropertyType,
} from 'core/framework';
import { DynamicDropdownOptions } from 'core/framework/property/input/dropdown/dropdown-prop';
import {
  fixOptions,
  fixResponseOrEventInfo,
  mapTriggersToApp,
  normalizeAppName,
  normalizeName,
} from 'global/helpers';
import { InputProperty } from '../core/framework/property/input';
import { DEFAULT_LOGO } from '../global/constants';
import { Locales } from '../i18n/i18n-types';
import { commonActionContext, piecePropTypeToQoreOptionTypeIndex } from './common/constants';
import { TMapPieceActionToAppActionOptions } from './common/models/pieces-catalogue';
import * as pieces from './index';
pieces satisfies Record<string, Piece>;

type TDependentOptionsFunction = (
  context: TQoreAppActionFunctionContext
) => Promise<Record<string, TQoreAppActionOption>>;

class _PiecesAppCatalogue {
  public readonly apps: TQoreApps = {};

  constructor(public locale: Locales = 'en') {}

  public registerApps(): void {
    const qoreApps = Object.entries(pieces).map(([pieceName, piece]) =>
      this.mapPieceToApp(pieceName, piece)
    );
    qoreApps.forEach((app) => (this.apps[app.name] = app));
  }

  private mapPieceToApp(pieceName: string, piece: Piece): TQoreAppWithActions {
    const appName = normalizeAppName(pieceName);
    const actions = Object.entries(piece.actions()).map(([actionName, action]) =>
      this.mapPieceActionToAppAction({ appName, actionName, action })
    );

    // @ts-expect-error - dynamically defined names are not recognized
    const qoreTriggers = mapTriggersToApp(appName, piece.qoreTriggers || [], this.locale);
    const appRest = piece.auth ? this.mapPieceAuthToAppRest(piece.auth) : undefined;
    const qoreRestConfig = {
      data: 'auto',
      ...appRest,
      ...piece.qoreRest,
    } as IQoreRestConnectionConfig;

    return {
      name: appName,
      actions: [...actions, ...qoreTriggers],
      rest: qoreRestConfig,
      ...(piece.qoreConnectionModifiers && { rest_modifiers: piece.qoreConnectionModifiers }),
      display_name: piece.displayName,
      short_desc: piece.description,
      desc: piece.description,
      logo: piece.logo || DEFAULT_LOGO,
      logo_file_name: `${appName}.svg`,
      logo_mime_type: 'image/svg+xml',
    };
  }

  // Mapping pieces auth options to qore rest connection config
  private mapPieceAuthToAppRest(auth: PieceAuthProperty): IQoreRestConnectionConfig | undefined {
    if (auth.type === PropertyType.OAUTH2) {
      return {
        data: 'auto',
        oauth2_grant_type: 'authorization_code',
        url: auth.url!,
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

    const baseAction = {
      action_code: EQoreAppActionCode.ACTION,
      display_name: action.displayName,
      short_desc: action.description,
      desc: action.description,
      action: formattedActionName,
      api_function: this.mapPieceActionToAppActionFunction(action.run, action.props),
    } satisfies TQorePartialNonEventAction;

    let responseType = undefined;

    if (typeof action.responseType === 'string') {
      responseType = action.responseType;
    } else if (action.responseType) {
      responseType = fixResponseOrEventInfo(action.responseType, appName, this.locale, baseAction);
    }

    return {
      ...baseAction,
      app: appName,
      options: fixOptions(baseAction, options, appName, this.locale),
      response_type: responseType,
    };
  }

  private mapPieceActionToAppActionFunction(
    runFunction: ActionRunner<any, any>,
    props: Record<string, InputProperty>
  ): TQoreAppActionFunction {
    return async (
      obj: Record<string, any> | undefined,
      _options: TQoreOptions | undefined,
      context: TQoreAppActionFunctionContext
    ): Promise<any> => {
      const actionContext = {
        propsValue: obj || {},
        auth: {
          ...context.opts,
          ...context.conn_opts,
          access_token: context?.conn_opts?.token,
          data: { ...context.opts, ...context.conn_opts },
        },
        ...commonActionContext,
      } satisfies ActionContext;

      for (const key in obj) {
        if (key in props) {
          const prop = props[key];
          if (prop.type === PropertyType.FILE) {
            const value = obj[key] as TQoreFile;
            const convertedFile = `data:${value.mime_type};base64,${value.content}`;
            obj[key] = convertedFile;
          }

          if (prop.defaultProcessors && prop.defaultProcessors.length > 0) {
            await Promise.all(
              prop.defaultProcessors.map(
                async (processor) => (obj[key] = await processor(prop, obj[key]))
              )
            );
          }
        }
      }

      return runFunction(actionContext);
    };
  }

  private mapActionPropsToAppActionOptions(
    props: Record<string, InputProperty>
  ): Record<string, TQoreAppActionOption> {
    const options: Record<string, TQoreAppActionOption> = {};

    for (const key in props) {
      // Skip info props - these property shouldn't contain a value and used in pieces as info block
      if (key === 'info') {
        // Add info prop to a different field in action
        continue;
      }

      // Skip dynamic props - because they are put into get_dependent_options function for "parent" option
      if (props[key].type === PropertyType.DYNAMIC && props[key]?.refreshers?.length) {
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
  ): TDependentOptionsFunction[] | undefined {
    const functions = [];
    for (const propKey in props) {
      const prop = props[propKey];

      // Getting the dynamic props and checking if they are dependent on the current prop
      // In case they are dependent, we collect them
      if (prop.type === PropertyType.DYNAMIC && prop.refreshers?.includes(key) && 'props' in prop) {
        functions.push(this.mapPropsFunctionToDependentOptionsFunction(prop, propKey, prop.props));
      }
    }

    return functions.length ? functions : undefined;
  }

  private mapPropsFunctionToDependentOptionsFunction(
    prop: InputProperty,
    propKey: string,
    func: DynamicProperties<true>['props']
  ): TDependentOptionsFunction {
    return async (
      context: TQoreAppActionFunctionContext
    ): Promise<Record<string, TQoreAppActionOption>> => {
      const pieceContext = {
        auth: { access_token: context?.conn_opts?.token, ...context.opts },
        ...context.opts,
      };
      const options: Record<string, TQoreAppActionOption> = {};
      const pieceOptions = await func(pieceContext, commonActionContext);
      for (const key in pieceOptions) {
        const pieceOption = pieceOptions[key];
        // Mapping the received options to qore options
        const qoreOption: TQoreAppActionOption = this.mapActionPropToAppActionOption(pieceOption);
        if (qoreOption.type) {
          options[key] = qoreOption;
        }
      }

      const mainProp = this.mapActionPropToAppActionOption(prop);

      return {
        [propKey]: {
          ...mainProp,
          ...(typeof mainProp.example_value === 'object' && {
            example_value: mainProp.example_value,
          }),
          ...(typeof mainProp.default_value === 'object' && {
            default_value: mainProp.default_value,
          }),
          ...(mainProp?.get_allowed_values && {
            get_allowed_values: mainProp.get_allowed_values as TQoreGetAllowedValuesFunction<
              TCustomConnOptions,
              any
            >,
          }),
          ...(mainProp?.get_default_value && {
            get_default_value: mainProp.get_default_value as TQoreGetDefaultValueFunction<
              TCustomConnOptions,
              any
            >,
          }),
          ...(mainProp?.allowed_values && {
            allowed_values: mainProp.allowed_values as IQoreAllowedValue<any>[],
          }),
          type: {
            type: 'hash',
            fields: options,
          },
        },
      };
    };
  }

  private mapActionPropToAppActionOption(
    prop: InputProperty,
    getDependentOptionsFunctions?: TDependentOptionsFunction[]
  ): TQoreAppActionOption {
    let allowed_values: IQoreAllowedValue[] | undefined = undefined;
    let get_allowed_values: TQoreGetAllowedValuesFunction | undefined = undefined;
    let get_dependent_options: TQoreGetDependentOptionsFunction | undefined = undefined;
    let depends_on: string[] | undefined = undefined;
    const description = prop.description || prop.displayName;

    // Checking if the prop has allowed values or get allowed values function
    if (typeof prop === 'object' && 'options' in prop) {
      if (typeof prop.options === 'object') {
        allowed_values = this.mapPieceAllowedValuesToQoreAllowedValues(
          prop.options as DropdownState<any>
        );
      } else if (typeof prop.options === 'function') {
        get_allowed_values = this.mapPieceGetOptionsToQoreGetAllowedValues(
          prop.options as DynamicDropdownOptions<any>
        );
      }
    }

    // Checking if the prop has dependent or dynamic options
    if (getDependentOptionsFunctions) {
      get_dependent_options = this.mapDynamicOptionsFunctionsToQoreGetDependentOptions(
        getDependentOptionsFunctions
      );
    }

    let type = piecePropTypeToQoreOptionTypeIndex[prop.type];

    if (type === 'list') {
      const fields: Record<string, TQoreAppActionOption> = {};

      if ('properties' in prop && typeof prop.properties === 'object') {
        for (const [key, element] of Object.entries(prop.properties)) {
          fields[key] = this.mapActionPropToAppActionOption(element);
        }
      }

      type = {
        type: 'list',
        ...(Object.keys(fields).length > 0
          ? {
              element_type: {
                type: 'hash',
                fields,
              },
            }
          : {
              element_type: 'softstring',
            }),
      } satisfies TQoreTypeObject;
    }

    if (prop.type === PropertyType.DYNAMIC && prop?.refreshers?.length) {
      depends_on = prop.refreshers;
    }

    return {
      display_name: prop.displayName,
      short_desc: description || prop.displayName,
      desc: description || prop.displayName,
      type: type as TQoreAnyType,
      get_allowed_values,
      get_dependent_options,
      allowed_values,
      required: prop.required,
      required_groups: prop.requiredGroups,
      on_change: prop.onChange,
      default_value: prop.defaultValue,
      example_value: prop.defaultValue,
      ...(depends_on && { depends_on }),
    };
  }

  private mapDynamicOptionsFunctionsToQoreGetDependentOptions(
    functions: TDependentOptionsFunction[]
  ): TQoreGetDependentOptionsFunction {
    return async (
      context: TQoreAppActionFunctionContext
    ): Promise<Record<string, TQoreAppActionOption>> => {
      const options: Record<string, TQoreAppActionOption> = {};

      // Going through all the dynamic options functions and getting the options
      for (const func of functions) {
        const pieceOptions = await func(context);
        for (const key in pieceOptions) {
          options[key] = pieceOptions[key];
        }
      }

      return options;
    };
  }

  private mapPieceAllowedValuesToQoreAllowedValues(
    options: DropdownState<any>
  ): IQoreAllowedValue[] | undefined {
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
      const auth = { access_token: context?.conn_opts?.token };
      const options = await getOptions({ auth, ...context.opts });

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
