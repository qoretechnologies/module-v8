import { Locales, Translation } from 'i18n/i18n-types';
import { capitalize, omit, reduce } from 'lodash';
import { OpenAPIV2 } from 'openapi-types';
import toTitleCase from 'to-title-case';
import {
  EQoreAppActionCode,
  IAllowedPathData,
  IQoreAppActionOption,
  IQoreAppActionWithEvent,
  IQorePartialAppActionWithSwaggerPath,
  IQoreTypeObject,
  TAllowedPaths,
  THttpMethod,
  TQoreAppActionWithEventOrWebhookEventInfo,
  TQoreAppActionWithWebhook,
  TQoreAppEventAction,
  TQoreAppNonEventAction,
  TQoreOptions,
  TQorePartialEventAction,
  TQorePartialNonEventAction,
  TQoreResponseType,
  TStringWithFirstUpperCaseCharacter,
} from '../../global/models/qore';
import { L } from '../../i18n/i18n-node';

export const createSwaggerPaths = (paths: TAllowedPaths): string[] => {
  const swaggerPaths: string[] = [];

  Object.entries(paths).forEach(([path]) => {
    const methods = Object.keys(paths[path]);
    if (methods.length === 0) {
      swaggerPaths.push(path);
    } else {
      methods.forEach((method) => {
        swaggerPaths.push(`${path}:${method.toUpperCase()}`);
      });
    }
  });

  return swaggerPaths;
};

type TAllowedPathWithData = {
  methods: Set<string>;
  actionData?: IAllowedPathData;
  processor?: IAllowedPathData['processor'];
};

type TBuildActionsFromSwaggerSchemaParams = {
  schema: OpenAPIV2.Document;
  allowedPaths?: TAllowedPaths;
  app?: string;
  locale?: Locales;
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
export const buildActionsFromSwaggerSchema = ({
  schema,
  allowedPaths,
  app,
  locale = 'en',
}: TBuildActionsFromSwaggerSchemaParams): IQorePartialAppActionWithSwaggerPath[] => {
  // Return empty actions if schema or allowedPaths is missing
  if (!schema || (allowedPaths && Object.keys(allowedPaths).length === 0)) {
    return [];
  }

  const actions: IQorePartialAppActionWithSwaggerPath[] = [];

  const allowedPathsWithMethods = new Map<string, TAllowedPathWithData>();
  Object.entries(allowedPaths).forEach(([fullPath, methods]) => {
    if (Object.keys(methods).length === 0) {
      allowedPathsWithMethods.set(fullPath, { methods: null });

      return;
    }

    const methodSet = new Set<string>();
    Object.entries(methods).forEach(([method]) => {
      methodSet.add(method.toLowerCase());
    });
    allowedPathsWithMethods.set(fullPath, { methods: methodSet });
  });

  Object.entries(schema.paths).forEach(([path, methods]) => {
    const allowedPath = allowedPathsWithMethods.get(path);

    if (allowedPathsWithMethods.size > 0 && !allowedPath) return;

    Object.entries(methods).forEach(([method, data]) => {
      if (method === 'parameters' || typeof data !== 'object') return;
      const methodKey = method.toLowerCase();

      const isMethodAllowed = !allowedPath?.methods || allowedPath.methods.has(methodKey);

      if (!isMethodAllowed) return;

      const pathData = allowedPaths[path][method.toUpperCase() as THttpMethod];
      const dataWithoutParameters = data as OpenAPIV2.OperationObject;
      let actionData = allowedPath?.methods?.has(methodKey) ? pathData || {} : {};

      if (pathData?.processor) {
        actionData = { ...actionData, ...pathData.processor(dataWithoutParameters) };
      }

      const actionIdentifier = getPropertyOfSchemaData(
        dataWithoutParameters,
        'operationId',
        `${path}/${method}`.replace(/\//g, '_')
      );

      const action: IQorePartialAppActionWithSwaggerPath = {
        action: actionIdentifier,
        action_code: EQoreAppActionCode.ACTION,
        swagger_path: `${path}/${method.toUpperCase()}`,
        display_name:
          // @ts-expect-error no idea whats going on here, will fix later
          L[locale].apps[app].actions[actionIdentifier as unknown].displayName() ||
          getPropertyOfSchemaData(dataWithoutParameters, 'summary', ''),
        short_desc:
          // @ts-expect-error no idea whats going on here, will fix later
          L[locale].apps[app].actions[actionIdentifier as unknown].shortDesc() ||
          getPropertyOfSchemaData(dataWithoutParameters, 'summary', ''),
        desc:
          // @ts-expect-error no idea whats going on here, will fix later
          L[locale].apps[app].actions[actionIdentifier as unknown].longDesc() ||
          getPropertyOfSchemaData(dataWithoutParameters, 'description', ''),
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
  actions: Record<string, TQorePartialNonEventAction> | TQorePartialNonEventAction[],
  locale: Locales
): TQoreAppNonEventAction[] => {
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

export const mapTriggersToApp = (
  app: keyof Translation['apps'],
  triggers: Record<string, TQorePartialEventAction> | TQorePartialEventAction[],
  locale: Locales
): TQoreAppEventAction[] => {
  return Object.entries(triggers).map(([_a, trigger]) => {
    const eventInfo: TQoreAppActionWithEventOrWebhookEventInfo =
      'event_info' in trigger
        ? {
            ...trigger.event_info,
            type: fixTriggerEventInfoType(trigger.event_info.type, app, locale, trigger.action),
            desc:
              trigger.event_info.desc ||
              // @ts-expect-error no idea whats going on here, will fix later
              L[locale].apps[app].triggers[trigger.action].event_info.desc(),
          }
        : undefined;

    // Base action with common fields
    const baseAction = {
      ...omit(trigger, OMMITTED_FIELDS),
      display_name: trigger.display_name
        ? toTitleCase(trigger.display_name)
        : // @ts-expect-error no idea whats going on here, will fix later
          L[locale].apps[app].triggers[trigger.action].displayName() ||
          toTitleCase(trigger.action.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')),
      short_desc: trigger.short_desc
        ? trigger.short_desc
        : // @ts-expect-error no idea whats going on here, will fix later
          L[locale].apps[app].triggers[trigger.action].shortDesc() ||
          capitalize(trigger.action.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')),
      desc: trigger.desc
        ? trigger.desc
        : // @ts-expect-error no idea whats going on here, will fix later
          L[locale].apps[app].triggers[trigger.action].longDesc() ||
          capitalize(trigger.action.replace(/_/g, ' ')),
      app,
      action_code: EQoreAppActionCode.EVENT,
      // options:
      //   'options' in trigger
      //     ? fixActionOptions(trigger.options, app, locale, trigger._localizationGroup)
      //     : undefined,
      event_info: eventInfo,
    };

    if ('event_function' in trigger) {
      return {
        ...baseAction,
        event_function: trigger.event_function,
      } as IQoreAppActionWithEvent;
    }

    if ('webhook_method' in trigger) {
      return {
        ...baseAction,
        webhook_method: trigger.webhook_method,
        webhook_register: trigger.webhook_register,
        webhook_deregister: trigger.webhook_deregister,
        webhook_auth: trigger.webhook_auth,
        webhook_perms: trigger.webhook_perms,
      } as TQoreAppActionWithWebhook;
    }
  });
};

export const fixTriggerEventInfoType = (
  collection: TQoreAppActionWithEventOrWebhookEventInfo['type'],
  appName: string,
  locale: Locales,
  triggerName: string
): TQoreAppActionWithEventOrWebhookEventInfo['type'] => {
  const getLocalizedField = (field: string, path: string[]): string => {
    try {
      const localization = path.reduce(
        (obj, key) => obj[key],
        // @ts-expect-error no idea whats going on here, will fix later
        L[locale].apps[appName].triggers[triggerName].event_info.type
      );

      return localization[field]();
    } catch {
      return '';
    }
  };

  const processCollection = (
    collection: TQoreAppActionWithEventOrWebhookEventInfo['type'],
    path: string[] = []
  ): TQoreAppActionWithEventOrWebhookEventInfo['type'] => {
    return reduce(
      collection,
      (
        newCollection: TQoreAppActionWithEventOrWebhookEventInfo['type'],
        type: IQoreTypeObject,
        key: string
      ): TQoreAppActionWithEventOrWebhookEventInfo['type'] => {
        const currentPath = [...path, key];

        const updatedType = {
          ...type,
          type:
            typeof type.type === 'object' ? processCollection(type.type, currentPath) : type.type,
          display_name: type.display_name || getLocalizedField('displayName', currentPath),
          short_desc: type.short_desc || getLocalizedField('shortDesc', currentPath),
          desc: type.desc || getLocalizedField('desc', currentPath),
        };

        return {
          ...newCollection,
          [key]: updatedType,
        };
      },
      {}
    );
  };

  return processCollection(collection);
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
