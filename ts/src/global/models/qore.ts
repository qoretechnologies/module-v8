import { Locales } from 'i18n/i18n-types';
import { OpenAPIV2 } from 'openapi-types';
import { StrictRecord } from './utils';

export interface IQoreAppShared {
  display_name?: string;
  short_desc?: string;
  desc?: string;
}

export type THttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type TWebhookHttpMethod = 'POST' | 'PUT' | 'PATCH' | 'GET';
export type TRestGetAllowedValuesMethod = TWebhookHttpMethod;
export type TCustomConnOptions = Record<string, IQoreConnectionOption>;
export type TCustomFields<CustomConnOptions extends TCustomConnOptions = TCustomConnOptions> =
  Record<string, IQoreAppActionOption<TQoreType, unknown, CustomConnOptions>>;

export type TAllowedPaths<CustomConnOptions extends TCustomConnOptions = TCustomConnOptions> =
  Record<string, Partial<Record<THttpMethod, IAllowedPathData<CustomConnOptions>>>>;

export interface IAllowedPathData<CustomConnOptions extends TCustomConnOptions = TCustomConnOptions>
  extends Partial<Omit<IQoreBaseAppAction, 'action_code' | 'app'>> {
  processor?: (
    data: OpenAPIV2.OperationObject
  ) => Partial<Omit<IQoreBaseAppAction<CustomConnOptions>, 'action_code' | 'app'>>;
}

type TQoreRestContentEncoding = 'gzip' | 'bzip2' | 'deflate' | 'identity';

type TQoreRestData = 'auto' | 'json' | 'yaml' | 'rawxml' | 'xml' | 'url' | 'text' | 'bin';

type TQoreRestOauth2GrantType = 'authorization_code' | 'client_credentials' | 'password' | 'none';

export interface IQoreRestConnectionConfig {
  // Specifies the encoding to be used for message bodies when sending requests.
  // Possible values: "gzip", "bzip2", "deflate", "identity".
  content_encoding?: TQoreRestContentEncoding;

  // Specifies how the message body should be serialized.
  // Possible values include "auto" (default), "json", "yaml", "rawxml", "xml", "url", "text", "bin".
  data: TQoreRestData;

  // Set to true to disable automatic pings, which is useful for rate-limited, metered, or other connections
  // that should not be pinged regularly (default: false).
  disable_automatic_pings?: boolean;

  // A boolean flag indicating if additional characters should be percent-encoded in URLs.
  encode_chars?: boolean;

  // An optional object containing headers to be sent with every request. Keys represent header names, and
  // values represent the corresponding header values.
  headers?: Record<string, string>;

  // An optional object with arguments to be serialized as query parameters in the request to the OAuth2
  // authorization URL when using the "authorization_code" grant type.
  oauth2_auth_args?: Record<string, any>;

  // The OAuth2 authorization URL used for the "authorization_code" grant type. This is ignored if a token
  // is provided directly.
  oauth2_auth_url: string;

  // If set to true, OAuth2 tokens will be automatically refreshed when they expire (default: true).
  oauth2_auto_refresh?: boolean;

  // The OAuth2 client ID, required for certain OAuth2 flows (e.g., "authorization_code", "client_credentials").
  oauth2_client_id?: string;

  // The OAuth2 client secret, required alongside the client ID for certain OAuth2 flows.
  oauth2_client_secret?: string | 'auto';

  // The OAuth2 grant type being used. Possible values are "authorization_code", "client_credentials", "password".
  oauth2_grant_type: TQoreRestOauth2GrantType;

  // The OAuth2 redirect URL used for the "authorization_code" grant type.
  oauth2_redirect_url?: string;

  // An OAuth2 refresh token that complements the `token` option to allow for token renewal.
  oauth2_refresh_token?: string;

  // A list of OAuth2 scopes to request during authorization. Ignored if the `token` option is set.
  oauth2_scopes?: string[];

  // Extra arguments for OAuth2 token requests, which will be serialized as query parameters.
  oauth2_token_args?: Record<string, any>;

  // Use basic authorization with the client secret only when making token requests
  oauth2_token_auth_secret_only?: boolean;

  // The OAuth2 token URL used to obtain access tokens. Ignored if the `token` option is set.
  oauth2_token_url: string;

  // Use basic authorization with the client ID and client secret when making token requests
  oauth2_token_use_basic_auth?: boolean;

  // The password for authentication. Not used in conjunction with OAuth2 configurations.
  password?: string;

  // The HTTP method to use for pings (e.g., "GET", "POST").
  ping_method?: string;

  // The HTTP URI path to use for pings
  ping_path?: string;

  // Headers to be sent with ping requests. Keys represent header names, and values represent the corresponding
  // header values.
  ping_headers?: Record<string, string>;

  // The message body to send with pings. The type of this body depends on the specific use case.
  ping_body?: any;

  // The proxy URL for connecting through a proxy server.
  proxy?: string;

  // A PEM-encoded string representing an X.509 client certificate.
  ssl_cert_data?: string;

  // A PEM-encoded string representing an X.509 client key.
  ssl_key_data?: string;

  // If set to true, server certificates will only be accepted if they pass verification.
  ssl_verify_cert?: boolean;

  // A bearer token to use for the connection. This token will be passed as the `Authorization: Bearer ...` header.
  // If set, any OAuth2 options are ignored.
  token?: string;

  // The type of token to use for the `Authorization` header (e.g., "Bearer"). Ignored if no `token` is provided.
  token_type?: string;

  // The URL to connect to. This is a required field and represents the endpoint for the connection.
  url: string;

  // The username for authentication. Not used in conjunction with OAuth2 configurations.
  username?: string;

  // The base path for the Swagger API.
  swagger_base_path?: string;
}

export interface IQoreConnectionOption<
  TypeName extends TQoreSimpleType = TQoreSimpleType,
  TypeValue = unknown,
> extends Omit<
    IQoreAppActionOption<TypeName, TypeValue>,
    'get_allowed_values' | 'get_dependent_options' | 'rest_get_allowed_values' | 'required'
  > {
  freeform?: boolean;
  sensitive?: boolean;
  subset_env_vars?: boolean;
}

export interface IQoreRestConnectionModifiers<
  ModifierOptions extends Record<string, IQoreConnectionOption> = Record<
    string,
    IQoreConnectionOption
  >,
> {
  options?: ModifierOptions;
  required_options?: string;
  url_template_options?: Array<string>;
  // code that can set additional connection option after the connection has been authorized
  set_options_post_auth?: (
    context: Omit<TQoreAppActionFunctionContext<ModifierOptions>, 'opts'>
  ) => Promise<TQoreMappedOptions<ModifierOptions>>;
  /** allows the REST URL to be changed when an option value is changed
   */
  connection_update_option?: {
    // the option name that the connection update depends on
    option: string;

    // the code called to return new URL
    code: (context: TQoreAppActionFunctionContext<ModifierOptions>) => string | void;
  };
  /** maps connection options (normally required options) that map to Swagger path options; the key is the request
      option name, the value is the action option name; the value of the connection option will be used as the value
      of the given action option in each call where the option is present
  */
  conn_option_map?: Record<keyof ModifierOptions, string>;
}

export type TFirstAppCharacter =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9;

export type TStringWithFirstUpperCaseCharacter = `${TFirstAppCharacter}${string}`;

export interface IQoreApp<
  RestModifierOptions extends Record<string, IQoreConnectionOption> = Record<
    string,
    IQoreConnectionOption
  >,
> extends IQoreAppShared {
  name: TStringWithFirstUpperCaseCharacter;
  logo: string;
  logo_file_name: string;
  logo_mime_type: string;
  rest?: IQoreRestConnectionConfig;
  rest_modifiers?: IQoreRestConnectionModifiers<RestModifierOptions>;

  swagger?: string;
  swagger_options?: object;
  swagger_paths?: string[];
  swagger_type_overrides?: object;
}

export interface IQoreAppWithActions<
  RestModifierOptions extends Record<string, IQoreConnectionOption> = Record<
    string,
    IQoreConnectionOption
  >,
> extends IQoreApp<RestModifierOptions> {
  actions: TQoreAppAction[];
}

export type TQoreApps = Record<string, IQoreAppWithActions>;

export enum EQoreAppActionCode {
  EVENT = 1,
  ACTION = 2,
}

export const QoreAppActionCodeToLocale: {
  [key in EQoreAppActionCode]: string;
} = {
  [EQoreAppActionCode.EVENT]: 'triggers',
  [EQoreAppActionCode.ACTION]: 'actions',
};

export interface IQoreBaseAppAction<
  CustomConnOptions extends TCustomConnOptions = TCustomConnOptions,
> extends IQoreAppShared {
  app: string;
  action: string;
  action_code: EQoreAppActionCode;
  override_options?: Record<string, TQoreAppActionOverrideOption<CustomConnOptions>>;
}

export type TQoreAppActionFunctionContext<
  CustomConnOptions extends TCustomConnOptions = TCustomConnOptions,
> = {
  conn_name?: string;
  conn_opts?: Partial<IQoreRestConnectionConfig> & TQoreMappedOptions<CustomConnOptions>;
  opts?: Record<string, any>;
};

export type TQoreAppActionFunction = (
  obj?: Record<string, any>,
  options?: Record<string, any>,
  context?: TQoreAppActionFunctionContext
) => any;

export type TQoreGetAllowedValuesFunction<
  CustomConnOptions extends TCustomConnOptions = TCustomConnOptions,
  TypeValue = unknown,
> = (
  context?: TQoreAppActionFunctionContext<CustomConnOptions>
) => IQoreAllowedValue<TypeValue>[] | Promise<IQoreAllowedValue<TypeValue>[]>;

export type TQoreGetDefaultValueFunction<
  CustomConnOptions extends TCustomConnOptions = TCustomConnOptions,
> = (context?: TQoreAppActionFunctionContext<CustomConnOptions>) => any | Promise<any>;

export type TQoreStringCompatibleType =
  | 'string'
  | '*string'
  | 'softstring'
  | '*string'
  | 'binary'
  | 'date'
  | 'base64binary'
  | 'base64urlbinary'
  | 'hexbinary'
  | 'softdate'
  | '*softstring'
  | '*softdate'
  | '*binary'
  | '*date'
  | '*base64binary'
  | '*base64urlbinary'
  | '*hexbinary'
  | 'byte'
  | '*byte'
  | 'softbyte'
  | '*softbyte'
  | 'ubyte'
  | '*ubyte'
  | 'softubyte'
  | '*softubyte';

export type TQoreNumberCompatibleType =
  | 'int'
  | '*number'
  | '*float'
  | '*double'
  | '*integer'
  | 'float'
  | 'number'
  | 'integer'
  | 'double'
  | 'softint'
  | 'softfloat'
  | 'softnumber'
  | '*softint'
  | '*softfloat'
  | '*softnumber'
  | '*int';
export type TQoreHashCompatibleType = 'hash' | '*hash' | '*data' | 'data';
export type TQoreListCompatibleType = 'list' | '*list' | 'softlist' | '*softlist';
export type TQoreBooleanCompatibleType =
  | 'boolean'
  | '*boolean'
  | 'softbool'
  | '*bool'
  | '*bool'
  | 'bool'
  | '*softbool';
export type TQoreNullableType = 'NULL' | 'nothing';
export type TQoreAnyType = 'all' | 'any' | 'auto';

export type TQoreSimpleType = TQoreSimpleTypeNonList | TQoreListCompatibleType;

export type TQoreSimpleTypeNonList =
  | TQoreStringCompatibleType
  | TQoreNumberCompatibleType
  | TQoreHashCompatibleType
  | TQoreBooleanCompatibleType
  | TQoreNullableType
  | TQoreAnyType;

export type TQoreType = TQoreSimpleType | TQoreTypeObject;

// Mapping between string literals and their corresponding TypeScript types
export type TQoreTypeMapping = {
  string: string;
  number: number;
  hash: Record<string, any>;
  list: unknown[];
  boolean: boolean;
  [key: string]: any;
};

// Type to extract the type of each option using the mapping
export type TQoreOptionType<Option> = Option extends { type: keyof TQoreTypeMapping }
  ? TQoreTypeMapping[Option['type']]
  : never;

// Mapped type to map over the keys of the options object and apply the OptionType type
export type TQoreOptionsType<Options> = {
  [OptionKey in keyof Options]: TQoreOptionType<Options[OptionKey]>;
};

export type TQoreMappedOptions<T extends TQoreOptions> = TQoreOptionsType<T>;

export type GetConnectionOptionDefinitionFromQoreType<T extends TQoreType> =
  T extends TQoreStringCompatibleType
    ? IQoreConnectionOption<T, string>
    : T extends TQoreNumberCompatibleType
      ? IQoreConnectionOption<T, number>
      : T extends TQoreHashCompatibleType
        ? IQoreConnectionOption<T, Record<string, any>>
        : T extends TQoreBooleanCompatibleType
          ? IQoreConnectionOption<T, boolean>
          : T extends TQoreListCompatibleType
            ? IQoreConnectionOption<T, unknown[]>
            : T extends TQoreNullableType
              ? IQoreConnectionOption<T, null>
              : T extends object
                ? IQoreConnectionOption
                : never;

export type GetOptionDefinitionFromQoreType<T extends TQoreType> =
  T extends TQoreStringCompatibleType
    ? IQoreAppActionOption<T, string>
    : T extends TQoreNumberCompatibleType
      ? IQoreAppActionOption<T, number>
      : T extends TQoreHashCompatibleType
        ? IQoreAppActionOption<T, Record<string, any>>
        : T extends TQoreBooleanCompatibleType
          ? IQoreAppActionOption<T, boolean>
          : T extends TQoreListCompatibleType
            ? IQoreAppActionOption<T, unknown[]>
            : T extends TQoreNullableType
              ? IQoreAppActionOption<T, null>
              : T extends object
                ? IQoreAppActionOption
                : never;

export type GetResponseDefinitionFromQoreType<T extends TQoreType> =
  T extends TQoreStringCompatibleType
    ? IQoreAppActionOption<T, string>
    : T extends TQoreNumberCompatibleType
      ? IQoreAppActionOption<T, number>
      : T extends TQoreHashCompatibleType
        ? IQoreAppActionOption<T, Record<string, any>>
        : T extends TQoreBooleanCompatibleType
          ? IQoreAppActionOption<T, boolean>
          : T extends TQoreListCompatibleType
            ? IQoreAppActionOption<T, unknown[]>
            : T extends TQoreNullableType
              ? IQoreAppActionOption<T, null>
              : T extends object
                ? IQoreAppActionOption
                : never;

export interface IQoreAllowedValue<TypeValue = unknown> extends IQoreAppShared {
  value: TypeValue;
}

export type TQoreGetDependentOptionsFunction = (
  context?: TQoreAppActionFunctionContext
) => Record<string, IQoreAppActionOption> | Promise<Record<string, IQoreAppActionOption>>;

export interface IQoreRestGetAllowedValues {
  // The HTTP method for the call
  method: TWebhookHttpMethod;

  // The REST request path
  path: string;

  // Any REST body
  body?: Record<string, any>;

  // Any REST headers
  headers?: Record<string, any>;

  // Location of the values in the result in dot notation (ex: 'body.envelopes.envelopeId')
  values: string;

  // Location of the display names in the result in dot notation (ex: 'body.envelopes.envelopeName')
  display_names?: string;

  // Location of descriptions in the result in dot notation (ex: 'body.envelopes.description')
  /** Descriptions are long, markdown-formatted string descriptions
   */
  descriptions?: string;

  // Location of the short descriptions in the result in dot notation (ex: 'body.envelopes.shortDesc')
  /** Short descs are short, plain-text string descriptions
   */
  short_descs?: string;
}

export interface IQoreSharedObject<TypeValue = unknown> extends IQoreAppShared {
  // whether the field is required
  required?: boolean;
  //if fields of this type should be preselected; will set the corresponding UI flag
  preselected?: boolean;
  // (values must be of the correct type) the default value if none is provided by the user
  default_value?: TypeValue;
}

export interface IQoreTypeObjectNonList<TypeValue = unknown>
  extends Omit<IQoreSharedObject<TypeValue>, 'type'> {
  // Type has to be a string
  type: TQoreSimpleTypeNonList;
  // the technical name of the field
  name?: string;
  // an optional object with the fields of the object
  fields?: Record<string, IQoreAppActionOption>;
}

export type TQoreTypeObject<TypeValue = unknown> =
  | IQoreTypeObjectNonList<TypeValue>
  | IQoreTypeObjectList<TypeValue>;

export interface IQoreTypeObjectList<TypeValue = unknown>
  extends Omit<IQoreSharedObject<TypeValue>, 'type'> {
  // Type has to be a string
  type: TQoreListCompatibleType;
  // the technical name of the field
  name?: string;
  // description of a list type; only valid if \c type is "list" or "softlist"
  element_type?: TQoreType;
  // an optional object with the fields of the object
  fields?: Record<string, IQoreAppActionOption>;
}

export interface IQoreAppActionOption<
  TypeName extends TQoreType = TQoreType,
  TypeValue = unknown,
  CustomConnOptions extends TCustomConnOptions = TCustomConnOptions,
> extends IQoreSharedObject<TypeValue> {
  // either a string or a data object again
  type: TypeName;
  // (values must use the field's type) any example value to use when generating example data etc
  example_value?: TypeValue;
  // an array of objects providing the only values allowed for the field
  allowed_values?: IQoreAllowedValue<TypeValue>[];
  // a function that returns the allowed values for the field
  /** Mutually-exclusive with 'rest_get_allowed_values'
   */
  get_allowed_values?: TQoreGetAllowedValuesFunction<CustomConnOptions, TypeValue>;
  // a function that returns dependent options for the field
  get_dependent_options?: TQoreGetDependentOptionsFunction;
  // an object that describes a REST call to return allowed values
  /** Mutually-exclusive with 'get_allowed_values'
   */
  rest_get_allowed_values?: IQoreRestGetAllowedValues;
  // if true, then allowed_values can be extended with any user-provided value
  allowed_values_creatable?: boolean;
  // options that this option depends on
  depends_on?: string[];
  // a function that returns the default value for the field
  get_default_value?: TQoreGetDefaultValueFunction<CustomConnOptions>;
  attr?: Record<string, any>; // an optional data object with any properties
  sensitive?: boolean;
  required_groups?: string[];
}

export type TQoreAppActionOverrideOption<
  CustomConnOptions extends TCustomConnOptions = TCustomConnOptions,
  TypeName extends TQoreType = TQoreType,
  TypeValue = unknown,
> = Partial<IQoreAppActionOption<TypeName, TypeValue, CustomConnOptions>>;

export enum EQoreAppActionWebhookAuthType {
  AUTH_NONE = 0,
  AUTH_REQUIRE_AUTH = 1,
}

export interface IQoreAppActionWithEventOrWebhook extends IQoreBaseAppAction {
  action_code: EQoreAppActionCode.EVENT;
  event_info: TQoreAppActionWithEventOrWebhookEventInfo;
  options?: TQoreOptions;
  get_example_event_data?: (context: TQoreAppActionFunctionContext) => object;
}

export type TQoreAppActionWithEventOrWebhookEventInfo = {
  id?: string;
  desc: string;
  type: TQoreTypeObject;
};

export interface IQoreAppActionWithWebhookBase<
  CustomConnOptions extends TCustomConnOptions = TCustomConnOptions,
> extends IQoreAppActionWithEventOrWebhook {
  webhook_method: TWebhookHttpMethod;
  webhook_auth?: EQoreAppActionWebhookAuthType;
  webhook_register: TWebhookRegisterFunction<CustomConnOptions>;
  webhook_deregister: TWebhookDeregisterFunction<CustomConnOptions>;
}

export type TWebhookRegisterFunction<
  CustomConnOptions extends TCustomConnOptions = TCustomConnOptions,
> = (
  context: TQoreAppActionFunctionContext<CustomConnOptions>,
  url: string
) => Promise<Record<string, any> | void>;

export type TWebhookDeregisterFunction<
  CustomConnOptions extends TCustomConnOptions = TCustomConnOptions,
> = (
  context: TQoreAppActionFunctionContext<CustomConnOptions>,
  url: string,
  regInfo: Record<string, any>
) => Promise<void>;

export interface IQoreAppActionWithWebhookWithoutPerms extends IQoreAppActionWithWebhookBase {
  webhook_auth?: EQoreAppActionWebhookAuthType.AUTH_NONE;
  webhook_perms?: never;
}

export interface IQoreAppActionWithWebhookWithPerms extends IQoreAppActionWithWebhookBase {
  webhook_auth?: EQoreAppActionWebhookAuthType.AUTH_REQUIRE_AUTH;
  webhook_perms?: string[];
}

export type TQoreAppActionWithWebhook =
  | IQoreAppActionWithWebhookWithoutPerms
  | IQoreAppActionWithWebhookWithPerms;

export interface IQoreAppActionWithEvent extends IQoreAppActionWithEventOrWebhook {
  event_function: (
    context: TQoreAppActionFunctionContext,
    update: (event_data: Record<string, any>) => void,
    should_stop: () => boolean
  ) => void;
}

export type TQoreOptions = Record<string, IQoreAppActionOption>;
export type TQoreResponseType = string | TQoreTypeObject;

export interface IQoreAppActionWithFunction<Options = TQoreOptions, _Response = TQoreResponseType>
  extends IQoreBaseAppAction {
  action_code: EQoreAppActionCode.ACTION;
  api_function?: TQoreAppActionFunction;
  options?: StrictRecord<keyof Options, Options[keyof Options]>;
  response_type?: TQoreResponseType;
  io_timeout_secs?: number;
}

export interface IQoreAppActionWithSwaggerPath extends IQoreBaseAppAction {
  action_code: EQoreAppActionCode.ACTION;

  swagger_path: string;
}

export interface IQorePartialAppActionWithSwaggerPath extends Omit<IQoreBaseAppAction, 'app'> {
  swagger_path: string;
  action_code: EQoreAppActionCode.ACTION;
}

export type TQoreAppNonEventAction<Options = TQoreOptions, Response = TQoreResponseType> =
  | IQoreAppActionWithFunction<Options, Response>
  | IQoreAppActionWithSwaggerPath;
export type TQoreAppEventAction = IQoreAppActionWithEvent | TQoreAppActionWithWebhook;

export type TQoreAppAction<Options = TQoreOptions, Response = TQoreResponseType> =
  | TQoreAppNonEventAction<Options, Response>
  | TQoreAppEventAction;

export type TQorePartialNonEventAction<
  Options = Record<string, IQoreAppActionOption>,
  Response = Record<string, TQoreTypeObject>,
> =
  | Omit<IQoreAppActionWithFunction<Options, Response>, 'app'>
  | IQorePartialAppActionWithSwaggerPath;

export type TQorePartialEventAction =
  | Omit<TQoreAppActionWithWebhook, 'app'>
  | Omit<IQoreAppActionWithEvent, 'app'>;

export type TQorePartialAction<
  Options = Record<string, IQoreAppActionOption>,
  Response = Record<string, TQoreTypeObject>,
> = TQorePartialNonEventAction<Options, Response> | TQorePartialEventAction;

export interface IActionInitializationProps {
  locale: Locales;
}
