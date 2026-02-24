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
  TQoreAppActionOverrideOption,
  TQoreAppActionWithEventOrWebhookEventInfo,
  TQoreAppActionWithWebhook,
  TQoreAppEventAction,
  TQoreAppNonEventAction,
  TQoreOptions,
  TQorePartialEventAction,
  TQorePartialNonEventAction,
  TQoreRequestDataConverterFunction,
  TQoreResponseDataConverterFunction,
  TQoreSearchRecordsExpressionDefinition,
  TQoreCrudOptions,
  TQoreSearchRecordsExpressions,
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
  globalResponseDataConverter?: TQoreResponseDataConverterFunction<TCustomConnOptions, any>;
  globalOptionsOverride?: Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;
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
  globalResponseDataConverter,
  globalOptionsOverride,
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
        ...(globalOptionsOverride
          ? {
              override_options: {
                ...globalOptionsOverride,
                ...actionData.override_options,
              },
            }
          : {}),
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
        ...(globalResponseDataConverter
          ? {
              response_data_converter: (request, ctx) => {
                const convertedRequest = globalResponseDataConverter(request, ctx);

                if (pathData?.response_data_converter) {
                  return pathData.response_data_converter(convertedRequest, ctx);
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
  fieldName: 'display_name' | 'short_desc' | 'desc' | 'groups'
) => {
  const fieldValue = action[fieldName];
  if (fieldValue) {
    return fieldName === 'display_name' ? toTitleCase(fieldValue as string) : fieldValue;
  }

  const fieldNameToLocaleName = {
    display_name: 'displayName',
    short_desc: 'shortDesc',
    desc: 'longDesc',
    groups: 'groups',
  };

  const localeFieldFunc = get(L[locale], [
    'apps',
    app,
    QoreAppActionCodeToLocale[action.action_code],
    action.action,
    fieldNameToLocaleName[fieldName],
  ]);

  const keys = Object.keys(localeFieldFunc);
  const isArrayLike =
    typeof localeFieldFunc === 'function' &&
    keys.length > 0 &&
    keys.every((k) => !isNaN(Number(k)));

  let localeField: any;

  if (isArrayLike) {
    localeField = Object.keys(localeFieldFunc)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => localeFieldFunc[k]);
  } else if (typeof localeFieldFunc === 'function') {
    localeField = localeFieldFunc();
  } else {
    localeField = localeFieldFunc;
  }

  if (localeField) {
    return localeField;
  }

  if (fieldName === 'groups') {
    return undefined;
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
  return Object.entries(actions).map(([_a, action]) => {
    const localeGroups = getLocaleField(app, locale, action, 'groups');
    const groups = localeGroups ? Object.values(localeGroups).map((fn: any) => fn()) : undefined;

    return {
      ...action,
      display_name: getLocaleField(app, locale, action, 'display_name'),
      short_desc: getLocaleField(app, locale, action, 'short_desc'),
      desc: getLocaleField(app, locale, action, 'desc'),
      ...(groups?.length && { groups }),
      app,
      options:
        'options' in action && action.options
          ? fixOptions(action, action.options, app, locale)
          : undefined,
      ...(action.override_options && {
        override_options: fixOptions(action, action.override_options, app, locale),
      }),
      response_type:
        'response_type' in action && action.response_type
          ? typeof action.response_type === 'string'
            ? action.response_type
            : fixResponseOrEventInfo(action.response_type, app, locale, action)
          : undefined,
    };
  });
};

export const mapExpressionsToApp = (
  app: keyof Translation['apps'],
  expressions: Record<
    string,
    Omit<TQoreSearchRecordsExpressionDefinition, 'display_name' | 'short_desc' | 'desc'>
  >,
  locale: Locales
): TQoreSearchRecordsExpressions => {
  const localeExpressions: TQoreSearchRecordsExpressions = {};

  Object.entries(expressions).forEach(([key, expression]) => {
    localeExpressions[key] = {
      ...expression,
      args: expression.args.map((arg, index) => {
        const argLocale = get(L[locale], ['apps', app, 'expressions', key, 'args'])?.[index];
        if (!argLocale) return arg;

        return {
          ...arg,
          display_name: get(argLocale, 'displayName')(),
          short_desc: get(argLocale, 'shortDesc')(),
          desc: get(argLocale, 'longDesc')(),
        };
      }),
      display_name: get(L[locale], ['apps', app, 'expressions', key, 'displayName'])(),
      short_desc: get(L[locale], ['apps', app, 'expressions', key, 'shortDesc'])(),
      desc: get(L[locale], ['apps', app, 'expressions', key, 'longDesc'])(),
    };
  });

  return localeExpressions;
};

export type TQoreCrudOptionType = 'searchOptions' | 'createOptions' | 'upsertOptions';

export const mapCrudOptionsToApp = (
  app: keyof Translation['apps'],
  options: TQoreCrudOptions,
  crudType: TQoreCrudOptionType,
  locale: Locales
): TQoreCrudOptions => {
  const getLocalizedField = (field: string, path: string[]): string => {
    const localizationPath = ['apps', app, crudType, ...path];
    const localization = get(L[locale], localizationPath);

    return localization?.[field]?.() || '';
  };

  const processOptions = (
    collection: TQoreCrudOptions,
    path: string[] = []
  ): TQoreCrudOptions => {
    return reduce<TQoreCrudOptions, Record<string, any>>(
      collection,
      (result, option, key) => {
        const currentPath = [...path, key];
        let optionType: Record<string, any> | undefined;

        if (typeof option.type === 'object' && option.type.type === 'hash' && option.type.fields) {
          const fields = processOptions(
            option.type.fields as TQoreCrudOptions,
            [...currentPath, 'type', 'fields']
          );
          optionType = { ...option.type, fields };
        }

        if (
          typeof option.type === 'object' &&
          option.type.type === 'list' &&
          option.type.element_type &&
          typeof option.type.element_type === 'object' &&
          option.type.element_type.type === 'hash' &&
          option.type.element_type.fields
        ) {
          const elementFields = processOptions(
            option.type.element_type.fields as TQoreCrudOptions,
            [...currentPath, 'type', 'element_type', 'fields']
          );
          optionType = {
            ...option.type,
            element_type: { ...option.type.element_type, fields: elementFields },
          };
        }

        return {
          ...result,
          [key]: {
            ...option,
            ...(optionType && { type: optionType }),
            display_name: option.display_name || getLocalizedField('displayName', currentPath),
            short_desc: option.short_desc || getLocalizedField('shortDesc', currentPath),
            desc: option.desc || getLocalizedField('longDesc', currentPath),
          },
        };
      },
      {}
    ) as TQoreCrudOptions;
  };

  return processOptions(options);
};

export const mapObjectToColumnFormat = <T extends Record<string, any>>(
  data: T[]
): Record<keyof T, Array<T[keyof T]>> => {
  const columnFormat = {} as Record<keyof T, Array<T[keyof T]>>;

  if (data.length > 0) {
    const columns = Object.keys(data[0]) as Array<keyof T>;

    columns.forEach((col) => {
      columnFormat[col] = [];
    });

    data.forEach((row) => {
      columns.forEach((col) => {
        columnFormat[col].push(row[col]);
      });
    });
  }

  return columnFormat;
};

export const mapColumnFormatToObject = <T extends Record<string, any>>(
  columnFormat: Record<keyof T, Array<T[keyof T]>>
): T[] => {
  const columns = Object.keys(columnFormat) as Array<keyof T>;

  if (columns.length === 0) {
    return [];
  }

  const rowCount = columnFormat[columns[0]]?.length ?? 0;

  const data: T[] = [];

  for (let i = 0; i < rowCount; i++) {
    const row = {} as T;

    columns.forEach((col) => {
      row[col] = columnFormat[col][i];
    });

    data.push(row);
  }

  return data;
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

/**
 * Converts a normalized name to Title Case human-readable format
 *
 * @param normalizedName - The normalized name to be humanized
 * @returns The human-readable name in Title Case
 */
export const humanizeNameTitle = (normalizedName: string): string => {
  return normalizedName
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export const normalizeAppName = (appName: string): TStringWithFirstUpperCaseCharacter => {
  return capitalize(normalizeName(appName)) as TStringWithFirstUpperCaseCharacter;
};

export const mapTriggersToApp = (
  app: keyof Translation['apps'],
  triggers: Record<string, TQorePartialEventAction<any>> | TQorePartialEventAction<any>[],
  locale: Locales
): TQoreAppEventAction[] => {
  const mappedTriggers = Object.entries(triggers).map(([_a, trigger]) => {
    const eventInfo: TQoreAppActionWithEventOrWebhookEventInfo | undefined = trigger.event_info
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
    const localeGroups = getLocaleField(app, locale, trigger, 'groups');
    const groups = localeGroups ? Object.values(localeGroups).map((fn: any) => fn()) : undefined;

    const baseAction = {
      ...omit(trigger, OMMITTED_FIELDS),
      action: trigger.action,
      action_code: EQoreAppActionCode.EVENT,
      display_name: getLocaleField(app, locale, trigger, 'display_name'),
      short_desc: getLocaleField(app, locale, trigger, 'short_desc'),
      desc: getLocaleField(app, locale, trigger, 'desc'),
      ...(groups && { groups }),
      app,
      options: trigger.options ? fixOptions(trigger, trigger.options, app, locale) : undefined,
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
      collection as TQoreOptions,
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

        const group = getLocalizedField('group', currentPath);
        const updatedOption = {
          ...option,
          ...(optionType && { type: optionType }),
          display_name: option.display_name || getLocalizedField('displayName', currentPath),
          short_desc: option.short_desc || getLocalizedField('shortDesc', currentPath),
          desc: option.desc || getLocalizedField('longDesc', currentPath),
          ...(group && { group }),
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

type ErrorConstructor = new (message: string) => Error;

type TOptions = Record<string, any>;
type TQoreAppActionFunctionContext<
  TConn extends Record<string, any> = Record<string, any>,
  TOpts extends TOptions = TOptions,
> = {
  opts?: TOpts;
  conn_opts?: TConn;
};

export const getQoreContextRequiredValues = <
  ReturnTypeOverride extends Record<string, any> | undefined = undefined,
  TConn extends Record<string, any> = Record<string, any>,
  TOpts extends TOptions = TOptions,
  OptKeys extends keyof TOpts = keyof TOpts,
  ConnKeys extends keyof TConn = keyof TConn,
>(options: {
  context: TQoreAppActionFunctionContext<TConn, TOpts> | undefined;
  optionFields?: readonly OptKeys[];
  connectionFields?: readonly ConnKeys[];
  ErrorClass?: ErrorConstructor;
}): ReturnTypeOverride extends undefined
  ? { [K in OptKeys | ConnKeys]: any }
  : ReturnTypeOverride => {
  const {
    context,
    optionFields = [] as readonly OptKeys[],
    connectionFields = [] as readonly ConnKeys[],
    ErrorClass = Error,
  } = options;

  if (!context) throw new ErrorClass('No context provided');

  const missingOptions: OptKeys[] = [];
  const missingConnections: ConnKeys[] = [];
  const result = {} as ReturnTypeOverride extends undefined
    ? { [K in OptKeys | ConnKeys]: any }
    : ReturnTypeOverride;
  if (optionFields.length === 0 && connectionFields.length === 0) {
    return result;
  }
  optionFields.forEach((field) => {
    const value = context?.opts?.[field];
    if (value === undefined || value === null || value === '') {
      missingOptions.push(field);
    } else {
      (result as any)[field] = value;
    }
  });
  connectionFields.forEach((field) => {
    const value = context?.conn_opts?.[field];
    if (value === undefined || value === null || value === '') {
      missingConnections.push(field);
    } else {
      (result as any)[field] = value;
    }
  });
  const missingFields = [...missingOptions, ...missingConnections];
  if (missingFields.length > 0) {
    throw new ErrorClass(
      `Missing required values:\n` +
        (missingOptions.length ? `Options: ${missingOptions.join(', ')}\n` : '') +
        (missingConnections.length ? `Connection options: ${missingConnections.join(', ')}` : '')
    );
  }

  return result;
};

export const formatDateReadable = (
  dateString: string,
  options: {
    includeTime?: boolean;
    format?: 'short' | 'medium' | 'long';
    showRelative?: boolean;
  } = {}
): string => {
  const { includeTime = true, format = 'medium', showRelative = false } = options;

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string while formatting date');
    }

    if (showRelative) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const timeString = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      if (targetDate.getTime() === today.getTime()) {
        return `Today at ${timeString}`;
      } else if (targetDate.getTime() === yesterday.getTime()) {
        return `Yesterday at ${timeString}`;
      }
    }

    let dateOptions: Intl.DateTimeFormatOptions;

    switch (format) {
      case 'short':
        dateOptions = {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
        };
        break;
      case 'long':
        dateOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
        break;
      case 'medium':
      default:
        dateOptions = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        };
    }

    if (includeTime) {
      dateOptions.hour = 'numeric';
      dateOptions.minute = '2-digit';
      dateOptions.hour12 = true;
    }

    return date.toLocaleString('en-US', dateOptions);
  } catch (error) {
    console.error('Error formatting date:', error);

    return 'Invalid date';
  }
};
export * from './QoreApiClient';
export * from './strip-record-type-functions';
