import { Locales, Translation } from 'i18n/i18n-types';
import { capitalize, omit, reduce } from 'lodash';
import { OpenAPIV2 } from 'openapi-types';
import {
  IQoreAppActionOption,
  IQorePartialAppActionWithSwaggerPath,
  IQoreTypeObject,
  TQoreAppAction,
  TQoreOptions,
  TQorePartialAction,
  TQoreResponseType,
  TStringWithFirstUpperCaseCharacter,
} from '../../global/models/qore';
import { L } from '../../i18n/i18n-node';

// !IMPORTANT
// These fields need to be ommited from  each action, they are used for internal purposes
export const OMMITTED_FIELDS = ['_localizationGroup'] as const;

/*
 * This function builds actions from a swagger schema automatically
 * @param schema - the swagger schema
 * @param allowedPaths - the paths that are allowed
 * @returns IQorePartialAppActionWithSwaggerPath[]
 */
export const buildActionsFromSwaggerSchema = (
  schema: OpenAPIV2.Document,
  allowedPaths?: string[]
): IQorePartialAppActionWithSwaggerPath[] => {
  // Check if the schema was provided, return empty actions if not
  // If the allowedPaths are empty, return empty actions
  if (!schema || (allowedPaths && !allowedPaths.length)) {
    return [];
  }

  const allowedPathsWithMethods: Record<string, string[]> = {};
  allowedPaths.forEach((path: string) => {
    const [fullPath, method] = path.split(':');
    if (!allowedPathsWithMethods[fullPath]) {
      allowedPathsWithMethods[fullPath] = [];
    }
    if (method) allowedPathsWithMethods[fullPath].push(method.toLowerCase());
  });

  // We filter the paths to only include the ones that are allowed
  const filteredPaths = Object.entries(schema.paths).filter(([path]) => {
    if (!allowedPathsWithMethods.hasOwnProperty(path)) console.log(path);

    return allowedPaths?.length ? allowedPathsWithMethods.hasOwnProperty(path) : true;
  });

  const actions: IQorePartialAppActionWithSwaggerPath[] = [];

  filteredPaths.forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, data]) => {
      // Do not iterate if the method is "parameters" or method is not in allowed ones
      if (
        method === 'parameters' ||
        typeof data !== 'object' ||
        (allowedPathsWithMethods[path].length !== 0 &&
          !allowedPathsWithMethods[path].includes(method))
      ) {
        return;
      }

      // We need to cast the data to an OperationObject to access the properties
      // Because typescript is not smart enough to know that the data is an OperationObject after the check of `parameters`
      const dataWithoutParameters = data as OpenAPIV2.OperationObject;

      // Create the action object, we get the properties from the schema or use a fallback
      const action: IQorePartialAppActionWithSwaggerPath = {
        action: getPropertyOfSchemaData(
          dataWithoutParameters,
          'operationId',
          `${path}/${method}`.replace(/\//g, '_')
        ),
        swagger_path: `${path}/${method.toUpperCase()}`,
        display_name: getPropertyOfSchemaData(dataWithoutParameters, 'summary', ''),
        short_desc: getPropertyOfSchemaData(dataWithoutParameters, 'summary', ''),
        desc: getPropertyOfSchemaData(dataWithoutParameters, 'description', ''),
      };

      actions.push(action);
    });
  });

  return actions satisfies IQorePartialAppActionWithSwaggerPath[];
};

export const getPropertyOfSchemaData = (
  data: OpenAPIV2.OperationObject,
  key: keyof OpenAPIV2.OperationObject,
  fallback?: string
) => {
  if (typeof data === 'object' && key in data) {
    return String(data[key]).replace(/\//g, '-');
  }

  return fallback || '';
};

/*
 * This function maps the actions to the app and adds missing metadata using translations
 * @param app - the name of the app
 * @param actions - the actions to map
 * @param locale - the locale
 * @returns IQoreAppActionWithFunction[]
 */
export const mapActionsToApp = (
  app: keyof Translation['apps'],
  actions: Record<string, TQorePartialAction> | TQorePartialAction[],
  locale: Locales
): TQoreAppAction[] => {
  return Object.entries(actions).map(([_a, action]) => ({
    ...omit(action, OMMITTED_FIELDS),

    display_name:
      action.display_name ||
      // @ts-expect-error no idea whats going on here, will fix later
      L[locale].apps[app].actions[action.action as unknown].displayName() ||
      capitalize(action.action.replace(/_/g, ' ')),

    short_desc:
      action.short_desc ||
      // @ts-expect-error no idea whats going on here, will fix later
      L[locale].apps[app].actions[action.action as unknown].shortDesc() ||
      capitalize(action.action.replace(/_/g, ' ')),

    desc:
      action.desc ||
      // @ts-expect-error no idea whats going on here, will fix later
      L[locale].apps[app].actions[action.action as unknown].longDesc() ||
      capitalize(action.action.replace(/_/g, ' ')),
    app,
    action_code: 2,

    options:
      'options' in action
        ? fixActionOptions(action.options, app, locale, action._localizationGroup)
        : undefined,
    response_type:
      'response_type' in action
        ? fixActionType(action.response_type, app, locale, action._localizationGroup)
        : undefined,
  }));
};

export const fixActionType = (
  collection: TQoreResponseType,
  appName: string,
  locale: Locales,
  localeGroup: string
): TQoreResponseType => {
  return reduce(
    collection,
    (newCollection: TQoreResponseType, type: IQoreTypeObject, key: string): TQoreResponseType => {
      return {
        ...newCollection,
        [key]: {
          ...type,
          type:
            typeof type.type === 'object'
              ? fixActionType(type.type, appName, locale, localeGroup)
              : type.type,
          display_name:
            // @ts-expect-error no idea whats going on here, will fix later
            type.display_name || L[locale].apps[appName].actions[localeGroup][key].displayName(),
          short_desc:
            // @ts-expect-error no idea whats going on here, will fix later
            type.short_desc || L[locale].apps[appName].actions[localeGroup][key].shortDesc(),
          // @ts-expect-error no idea whats going on here, will fix later
          desc: type.desc || L[locale].apps[appName].actions[localeGroup][key].longDesc(),
        },
      };
    },
    {}
  );
};

export const fixActionOptions = (
  collection: TQoreOptions,
  appName: string,
  locale: Locales,
  localeGroup: string
): TQoreOptions => {
  return reduce(
    collection,
    (newCollection: TQoreOptions, option: IQoreAppActionOption, key: string): TQoreOptions => {
      return {
        ...newCollection,
        [key]: {
          ...option,
          type:
            typeof option.type === 'object'
              ? fixActionType(option.type, appName, locale, localeGroup)
              : option.type,
          display_name:
            // @ts-expect-error no idea whats going on here, will fix later
            option.display_name || L[locale].apps[appName].actions[localeGroup][key].displayName(),
          short_desc:
            // @ts-expect-error no idea whats going on here, will fix later
            option.short_desc || L[locale].apps[appName].actions[localeGroup][key].shortDesc(),
          // @ts-expect-error no idea whats going on here, will fix later
          desc: option.desc || L[locale].apps[appName].actions[localeGroup][key].longDesc(),
        },
      };
    },
    {}
  );
};

/*
 * This function normalizes the given app name by
 * converting it to lowercase,
 * replacing spaces with underscores,
 * and removing any non-alphanumeric characters.
 *
 * @param appName - The app name to be normalized.
 * @returns The normalized app name.
 */
export const normalizeName = (appName: string): string => {
  return appName
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[-\s]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

export const normalizeAppName = (appName: string): TStringWithFirstUpperCaseCharacter => {
  return capitalize(normalizeName(appName)) as TStringWithFirstUpperCaseCharacter;
};
