import { Locales, Translation } from 'i18n/i18n-types';
import { capitalize, omit, reduce } from 'lodash';
import { OpenAPIV2 } from 'openapi-types';
import toTitleCase from 'to-title-case';
import {
  EQoreAppActionCode,
  IAllowedPathObject,
  IQoreAppActionOption,
  IQorePartialAppActionWithSwaggerPath,
  IQoreTypeObject,
  TAllowedPath,
  TAllowedPathString,
  TQoreAppAction,
  TQoreOptions,
  TQorePartialAction,
  TQoreResponseType,
  TStringWithFirstUpperCaseCharacter,
  ValidatedPathElement,
} from '../../global/models/qore';
import { L } from '../../i18n/i18n-node';

/**
 * Creates an array of allowed paths.
 *
 * @template T - A tuple of strings representing the allowed paths.
 * @param {...{ [K in keyof T]: TAllowedPath<T[K]> }} paths - The paths to be allowed.
 * @returns {T} An array of allowed paths.
 */
export const createAllowedPaths = <T extends readonly (string | IAllowedPathObject)[]>(paths: {
  [K in keyof T]: ValidatedPathElement<T[K]>;
}): T => {
  return paths;
};

export const createSwaggerPaths = <T extends readonly (string | IAllowedPathObject)[]>(paths: {
  [K in keyof T]: ValidatedPathElement<T[K]>;
}): TAllowedPathString[] => {
  return paths.map((path) => (typeof path === 'string' ? path : path.path));
};

type TAllowedPathWithData = {
  methods: Set<string>;
  actionData?: Omit<IAllowedPathObject, 'path'>;
  processor?: IAllowedPathObject['processor'];
};

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
  allowedPaths?: (TAllowedPath<string> | IAllowedPathObject)[]
): IQorePartialAppActionWithSwaggerPath[] => {
  // Check if the schema was provided, return empty actions if not
  // If the allowedPaths are empty, return empty actions
  if (!schema || (allowedPaths && !allowedPaths.length)) {
    return [];
  }

  const actions: IQorePartialAppActionWithSwaggerPath[] = [];

  const allowedPathsWithMethods = new Map<string, TAllowedPathWithData>();
  allowedPaths.forEach((allowedPath: TAllowedPath<string> | IAllowedPathObject) => {
    let fullPath: string;
    let method: string | undefined;
    let actionData: Omit<IAllowedPathObject, 'path'> = {};
    let processor: IAllowedPathObject['processor'] | undefined;

    if (typeof allowedPath === 'object') {
      ({ path: fullPath, processor, ...actionData } = allowedPath);
      [fullPath, method] = allowedPath.path.split(':');
    } else {
      [fullPath, method] = allowedPath.split(':');
    }

    if (!allowedPathsWithMethods.has(fullPath)) {
      allowedPathsWithMethods.set(fullPath, { methods: new Set(), actionData, processor });
    }

    if (method) {
      allowedPathsWithMethods.get(fullPath).methods.add(method.toLowerCase());
    }
  });

  Object.entries(schema.paths).forEach(([path, methods]) => {
    if (allowedPathsWithMethods.size > 0 && !allowedPathsWithMethods.has(path)) return;
    const allowedPath = allowedPathsWithMethods.get(path);
    const allowedMethods = allowedPath?.methods;

    Object.entries(methods).forEach(([method, data]) => {
      if (method === 'parameters' || typeof data !== 'object') return;
      if (allowedMethods && allowedMethods.size > 0 && !allowedMethods.has(method.toLowerCase()))
        return;
      // We need to cast the data to an OperationObject to access the properties
      // Because typescript is not smart enough to know that the data is an OperationObject
      // after the check of `parameters`
      const dataWithoutParameters = data as OpenAPIV2.OperationObject;
      let actionData = allowedPath?.actionData;

      if (allowedPath?.processor) {
        actionData = { ...actionData, ...allowedPath.processor(dataWithoutParameters) };
      }
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
        ...actionData,
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

    display_name: action.display_name
      ? toTitleCase(action.display_name)
      : // @ts-expect-error no idea whats going on here, will fix later
        L[locale].apps[app].actions[action.action as unknown].displayName() ||
        toTitleCase(action.action.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')),

    short_desc:
      action.short_desc ||
      // @ts-expect-error no idea whats going on here, will fix later
      L[locale].apps[app].actions[action.action as unknown].shortDesc() ||
      capitalize(action.action.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')),

    desc:
      action.desc ||
      // @ts-expect-error no idea whats going on here, will fix later
      L[locale].apps[app].actions[action.action as unknown].longDesc() ||
      capitalize(action.action.replace(/_/g, ' ')),
    app,
    action_code: EQoreAppActionCode.ACTION,

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
