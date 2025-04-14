import { Locales, Translation } from 'i18n/i18n-types';
import { capitalize, get, omit, reduce } from 'lodash';
import { OpenAPIV2 } from 'openapi-types';
import toTitleCase from 'to-title-case';

import {
  EQoreAppActionCode,
  EQoreAppActionWebhookAuthType,
  IAllowedPathData,
  IQoreAppActionWithEvent,
  IQoreAppActionWithEventOrWebhook,
  IQoreAppActionWithSwaggerPath,
  IQorePartialAppActionWithSwaggerPath,
  QoreAppActionCodeToLocale,
  TAllowedPaths,
  TCustomConnOptions,
  THttpMethod,
  TQoreAppActionOption,
  TQoreAppActionWithEventOrWebhookEventInfo,
  TQoreAppActionWithWebhook,
  TQoreAppEventAction,
  TQoreAppNonEventAction,
  TQoreOptions,
  TQorePartialEventAction,
  TQorePartialNonEventAction,
  TQoreRequestDataConverterFunction,
  TQoreTypeObject,
  TStringWithFirstUpperCaseCharacter,
} from '@qoretechnologies/ts-toolkit';
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
  schemaPath?: string;
  actionNameModifier?: string;
  globalRequestDataConverter?: TQoreRequestDataConverterFunction<TCustomConnOptions, any>;
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
  schemaPath,
  app,
  locale = 'en',
  actionNameModifier = '',
  globalRequestDataConverter,
}: TBuildActionsFromSwaggerSchemaParams): IQorePartialAppActionWithSwaggerPath[] => {
  // Return empty actions if schema or allowedPaths is missing
  if (!schema || (allowedPaths && Object.keys(allowedPaths).length === 0)) {
    return [];
  }

  const actions: IQorePartialAppActionWithSwaggerPath[] = [];

  const allowedPathsWithMethods = new Map<string, TAllowedPathWithData | null>();
  if (allowedPaths) {
    Object.entries(allowedPaths).forEach(([fullPath, methods]) => {
      if (Object.keys(methods).length === 0) {
        allowedPathsWithMethods.set(fullPath, null);

        return;
      }

      const methodSet = new Set<string>();
      Object.entries(methods).forEach(([method]) => {
        methodSet.add(method.toLowerCase());
      });
      allowedPathsWithMethods.set(fullPath, { methods: methodSet });
    });
  }

  Object.entries(schema.paths).forEach(([path, methods]) => {
    const allowedPath = allowedPathsWithMethods.get(path);

    if (allowedPathsWithMethods.size > 0 && allowedPath === undefined) return;

    Object.entries(methods).forEach(([method, data]) => {
      if (method === 'parameters' || typeof data !== 'object') return;
      const methodKey = method.toLowerCase();

      const isMethodAllowed = !allowedPath?.methods || allowedPath.methods.has(methodKey);

      if (!isMethodAllowed) return;

      const pathData = allowedPaths?.[path]?.[method.toUpperCase() as THttpMethod];
      const dataWithoutParameters = data as OpenAPIV2.OperationObject;
      let actionData = allowedPath?.methods?.has(methodKey) ? pathData || {} : {};

      if (pathData?.processor) {
        actionData = { ...actionData, ...pathData.processor(dataWithoutParameters) };
      }

      let actionIdentifier = getPropertyOfSchemaData(
        dataWithoutParameters,
        'operationId',
        `${path}/${method}`.replace(/\//g, '_').replace(/^_/, '').replace(/[{}]/g, '')
      );

      if (actionNameModifier) {
        actionIdentifier = `${actionIdentifier}_${actionNameModifier}`;
      }

      const action: Omit<IQoreAppActionWithSwaggerPath, 'app'> = {
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
        ...(schemaPath && { swagger_schema: schemaPath }),
        ...actionData,
        ...(globalRequestDataConverter
          ? {
              request_data_converter: (request, ctx) => {
                const convertedRequest = globalRequestDataConverter(request, ctx);

                if (pathData?.request_data_converter) {
                  return pathData.request_data_converter(convertedRequest, ctx);
                }

                return convertedRequest;
              },
            }
          : {}),
      };
      actions.push(action);
    });
  });

  return actions satisfies Omit<IQoreAppActionWithSwaggerPath, 'app'>[];
};

export const getPropertyOfSchemaData = (
  data: OpenAPIV2.OperationObject,
  key: keyof OpenAPIV2.OperationObject,
  fallback?: string
) => {
  if (typeof data === 'object' && key in data) {
    return String(data[key])
      .replace(/\//g, '-')
      .replace(/[{}]/g, '')
      .replace(/__+/g, '_')
      .replace(/--+/g, '-');
  }

  return fallback || '';
};

export const getLocaleField = (
  app: string,
  locale: Locales,
  action: TQorePartialEventAction | TQorePartialNonEventAction,
  fieldName: 'display_name' | 'short_desc' | 'desc'
) => {
  const fieldValue = action[fieldName];
  if (fieldValue) {
    return fieldName === 'display_name' ? toTitleCase(fieldValue) : fieldValue;
  }

  const fieldNameToLocaleName = {
    display_name: 'displayName',
    short_desc: 'shortDesc',
    desc: 'longDesc',
  };

  const localeField = get(L[locale], [
    'apps',
    app,
    QoreAppActionCodeToLocale[action.action_code],
    action.action,
    fieldNameToLocaleName[fieldName],
  ])();

  if (localeField) {
    return localeField;
  }

  const fallbackValue = action.action.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');

  return fieldName === 'display_name' ? toTitleCase(fallbackValue) : capitalize(fallbackValue);
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
    ...action,
    display_name: getLocaleField(app, locale, action, 'display_name'),
    short_desc: getLocaleField(app, locale, action, 'short_desc'),
    desc: getLocaleField(app, locale, action, 'desc'),
    app,
    options:
      'options' in action && action.options
        ? fixOptions(action, action.options, app, locale)
        : undefined,
    ...(action?.override_options && {
      override_options: fixOptions(action, action.override_options, app, locale),
    }),
    response_type:
      'response_type' in action && action.response_type
        ? typeof action.response_type === 'string'
          ? action.response_type
          : fixResponseOrEventInfo(action.response_type, app, locale, action)
        : undefined,
  }));
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
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_/, '');
};

export const normalizeAppName = (appName: string): TStringWithFirstUpperCaseCharacter => {
  return capitalize(normalizeName(appName)) as TStringWithFirstUpperCaseCharacter;
};

export const mapTriggersToApp = (
  app: keyof Translation['apps'],
  triggers: Record<string, TQorePartialEventAction> | TQorePartialEventAction[],
  locale: Locales
): TQoreAppEventAction[] => {
  const mappedTriggers = Object.entries(triggers).map(([_a, trigger]) => {
    const eventInfo: TQoreAppActionWithEventOrWebhookEventInfo | undefined = trigger?.event_info
      ? {
          ...trigger.event_info,
          type: fixResponseOrEventInfo(trigger.event_info.type, app, locale, trigger),
          desc:
            trigger.event_info.desc ||
            // @ts-expect-error no idea whats going on here, will fix later
            L[locale].apps[app].triggers[trigger.action].event_info.desc(),
        }
      : undefined;

    // Base trigger with common fields
    const baseAction = {
      ...omit(trigger, OMMITTED_FIELDS),
      action: trigger.action,
      action_code: EQoreAppActionCode.EVENT,
      display_name: getLocaleField(app, locale, trigger, 'display_name'),
      short_desc: getLocaleField(app, locale, trigger, 'short_desc'),
      desc: getLocaleField(app, locale, trigger, 'desc'),
      app,
      options: trigger?.options ? fixOptions(trigger, trigger.options, app, locale) : undefined,
      event_info: eventInfo || { desc: '', type: { type: 'hash' } },
    } satisfies IQoreAppActionWithEventOrWebhook;

    if ('event_function' in trigger) {
      return {
        ...baseAction,
        event_function: trigger.event_function,
      } satisfies IQoreAppActionWithEvent;
    }

    if ('webhook_method' in trigger) {
      return {
        ...baseAction,
        ...(trigger.webhook_auth === EQoreAppActionWebhookAuthType.AUTH_REQUIRE_AUTH
          ? {
              webhook_auth: EQoreAppActionWebhookAuthType.AUTH_REQUIRE_AUTH,
              webhook_perms: trigger.webhook_perms,
            }
          : {
              webhook_auth: EQoreAppActionWebhookAuthType.AUTH_NONE,
            }),
        webhook_method: trigger.webhook_method,
        webhook_register: trigger.webhook_register,
        webhook_deregister: trigger.webhook_deregister,
      } as TQoreAppActionWithWebhook;
    }
  });

  return mappedTriggers.filter((trigger) => trigger !== undefined);
};

export const fixResponseOrEventInfo = (
  type: TQoreTypeObject,
  appName: string,
  locale: Locales,
  action: TQorePartialEventAction | TQorePartialNonEventAction
): TQoreTypeObject => {
  const localeActionType = QoreAppActionCodeToLocale[action.action_code];
  const infoField =
    localeActionType === QoreAppActionCodeToLocale[EQoreAppActionCode.ACTION]
      ? 'response_type'
      : 'event_info';

  // Adjusted for new path structure
  const getLocalizedField = (field: string, path: string[]): string => {
    const localizationPath = ['apps', appName, localeActionType, action.action, infoField, ...path];
    const localization = get(L[locale], localizationPath);

    return localization[field]?.() || '';
  };

  const processCollection = (
    collection: Record<string, TQoreAppActionOption>,
    path: string[] = []
  ): Record<string, TQoreAppActionOption> => {
    return reduce(
      collection,
      (
        newCollection: Record<string, TQoreAppActionOption>,
        field: TQoreAppActionOption,
        key: string
      ): Record<string, TQoreAppActionOption> => {
        const currentPath = [...path, 'type', 'fields', key];
        let fieldType = undefined;

        if (typeof field.type === 'object' && field.type.type === 'hash' && field.type.fields) {
          const fields = processCollection(field.type.fields, [...currentPath]);
          fieldType = {
            ...field.type,
            fields,
          };
        }

        const updatedField = {
          ...field,
          ...(fieldType && { type: fieldType }),
          display_name: field.display_name || getLocalizedField('displayName', currentPath),
          short_desc: field.short_desc || getLocalizedField('shortDesc', currentPath),
          desc: field.desc || getLocalizedField('longDesc', currentPath),
        } as TQoreAppActionOption;

        return {
          ...newCollection,
          [key]: updatedField,
        };
      },
      {}
    );
  };

  if (type?.type !== 'hash' || !type.fields) {
    return type;
  }

  type.fields = processCollection(type.fields);

  return type;
};

export const fixOptions = (
  action: TQorePartialEventAction | TQorePartialNonEventAction,
  collection: TQoreOptions | Record<string, Partial<TQoreAppActionOption>>,
  appName: string,
  locale: Locales
): TQoreOptions => {
  const actionType = QoreAppActionCodeToLocale[action.action_code];
  const getLocalizedField = (field: string, path: string[]): string => {
    const localizationPath = ['apps', appName, actionType, action.action, 'options', ...path];
    const localization = get(L[locale], localizationPath);

    return localization[field]?.() || '';
  };

  const processCollection = (
    collection: TQoreOptions | Record<string, Partial<TQoreAppActionOption>>,
    path: string[] = []
  ): TQoreOptions => {
    return reduce(
      collection,
      (fixedOptions: TQoreOptions, option: TQoreAppActionOption, key: string): TQoreOptions => {
        const currentPath = [...path, key];
        let optionType = undefined;

        if (typeof option.type === 'object' && option.type.type === 'hash' && option.type.fields) {
          const fields = processCollection(option.type.fields, [...currentPath, 'type', 'fields']);
          optionType = {
            ...option.type,
            fields,
          };
        }

        if (
          typeof option.type === 'object' &&
          option.type.type === 'list' &&
          option.type.element_type &&
          typeof option.type.element_type === 'object' &&
          option.type.element_type.type === 'hash' &&
          option.type.element_type.fields
        ) {
          const elementFields = processCollection(option.type.element_type.fields, [
            ...currentPath,
            'type',
            'element_type',
            'fields',
          ]);
          optionType = {
            ...option.type,
            element_type: {
              ...option.type.element_type,
              fields: elementFields,
            },
          };
        }

        if (typeof option.get_dependent_options === 'function') {
          const original = option.get_dependent_options;
          option.get_dependent_options = async (context) => {
            const options = await original(context);

            return fixOptions(action, options, appName, locale);
          };
        }

        const updatedOption = {
          ...option,
          ...(optionType && { type: optionType }),
          display_name: option.display_name || getLocalizedField('displayName', currentPath),
          short_desc: option.short_desc || getLocalizedField('shortDesc', currentPath),
          desc: option.desc || getLocalizedField('longDesc', currentPath),
        } as TQoreAppActionOption;

        return {
          ...fixedOptions,
          [key]: updatedOption,
        };
      },
      {}
    );
  };

  return processCollection(collection);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};
