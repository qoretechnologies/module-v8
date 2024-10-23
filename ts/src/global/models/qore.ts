import { Locales } from 'i18n/i18n-types';
import { StrictRecord } from './utils';

export interface IQoreAppShared {
  display_name?: string;
  short_desc?: string;
  desc?: string;
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

  // The OAuth2 token URL used to obtain access tokens. Ignored if the `token` option is set.
  oauth2_token_url: string;

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

  oauth2_token_use_basic_auth?: boolean;

  // The base path for the Swagger API.
  swagger_base_path?: string;
}

export interface IQoreConnectionOption<
  TypeName extends TQoreSimpleType = TQoreSimpleType,
  TypeValue = unknown,
> extends Omit<IQoreSharedObject<TypeName, TypeValue>, 'get_allowed_values' | 'required'> {
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
  url_template_options?: Array<keyof ModifierOptions>;
  set_options_post_auth?: (
    context: Omit<TQoreAppActionFunctionContext<ModifierOptions>, 'opts'>
  ) => Promise<Record<keyof ModifierOptions, any>>;
  /** maps connection options (normally required options) that map to Swagger path options; the key is the request
      option name, the value is the action option name; the value of the connection option will be used as the value
      of the given action option in each call where the option is present
  */
  conn_option_map?: object;
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

export interface IQoreBaseAppAction extends IQoreAppShared {
  app: string;
  action: string;
  action_code: 1 | 2; // What are other possible values?
}

export type TQoreAppActionFunctionContext<CustomConnOptions extends Record<string, any> = {}> = {
  conn_name?: string;
  conn_opts?: Partial<IQoreRestConnectionConfig> & CustomConnOptions;
  opts?: Record<string, any>;
};

export type TQoreAppActionFunction = (
  obj?: Record<string, any>,
  options?: Record<string, any>,
  context?: TQoreAppActionFunctionContext
) => any;

export type TQoreGetAllowedValuesFunction<TypeValue = unknown> = (
  context?: TQoreAppActionFunctionContext
) => IQoreAllowedValue<TypeValue>[] | Promise<IQoreAllowedValue<TypeValue>[]>;

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
export type TQoreListCompatibleType = 'list' | '*list';
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

export type TQoreSimpleType =
  | TQoreStringCompatibleType
  | TQoreNumberCompatibleType
  | TQoreHashCompatibleType
  | TQoreListCompatibleType
  | TQoreBooleanCompatibleType
  | TQoreNullableType
  | TQoreAnyType;

export type TQoreType = TQoreSimpleType | Record<string, IQoreTypeObject>;

export type GetConnectionOptionDefinitionFromQoreType<T extends TQoreType> =
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
              : T extends Record<string, IQoreTypeObject>
                ? IQoreAppActionOption<T, Record<string, any>>
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
              : T extends Record<string, IQoreTypeObject>
                ? IQoreAppActionOption<T, Record<string, any>>
                : never;

export type GetResponseDefinitionFromQoreType<T extends TQoreType> =
  T extends TQoreStringCompatibleType
    ? IQoreTypeObject<T, string>
    : T extends TQoreNumberCompatibleType
      ? IQoreTypeObject<T, number>
      : T extends TQoreHashCompatibleType
        ? IQoreTypeObject<T, Record<string, any>>
        : T extends TQoreBooleanCompatibleType
          ? IQoreTypeObject<T, boolean>
          : T extends TQoreListCompatibleType
            ? IQoreTypeObject<T, unknown[]>
            : T extends TQoreNullableType
              ? IQoreTypeObject<T, null>
              : T extends Record<string, IQoreTypeObject>
                ? IQoreAppActionOption<T, Record<string, any>> & { name: string }
                : never;

export interface IQoreAllowedValue<TypeValue = unknown> extends IQoreAppShared {
  value: TypeValue;
}

export type TQoreGetDependentOptionsFunction = (
  context?: TQoreAppActionFunctionContext
) => Record<string, IQoreAppActionOption> | Promise<Record<string, IQoreAppActionOption>>;

export interface IQoreSharedObject<TypeName extends TQoreType = TQoreType, TypeValue = unknown>
  extends IQoreAppShared {
  // either a string or a data object again
  type: TypeName;

  // whether the field is required
  required?: boolean;

  // (values must use the field's type) any example value to use when generating example data etc
  example_value?: TypeValue;

  // (values must use the field's type) the default value if none is provided by the user
  default_value?: TypeValue;

  // an array of objects providing the only values allowed for the field
  allowed_values?: IQoreAllowedValue<TypeValue>[];

  // a function that returns the allowed values for the field
  get_allowed_values?: TQoreGetAllowedValuesFunction<TypeValue>;

  // a function that returns dependent options for the field
  get_dependent_options?: TQoreGetDependentOptionsFunction;

  // the number of seconds to wait for the action to complete before timing out
  io_timeout_secs?: number;
}

export interface IQoreTypeObject<TypeName extends TQoreType = TQoreType, TypeValue = unknown>
  extends IQoreSharedObject<TypeName, TypeValue> {
  name: string; // the technical name of the field
  attr?: Record<string, any>; // an optional data object with any properties
}

export interface IQoreAppActionOption<TypeName extends TQoreType = TQoreType, TypeValue = unknown>
  extends IQoreSharedObject<TypeName, TypeValue> {
  loc?: string;
  ref_data?: string;
  sensitive?: boolean;
}

export interface IQoreAppActionWithoutFunction extends IQoreBaseAppAction {
  action_code: 1;
}

export type TQoreOptions = Record<string, IQoreAppActionOption>;
export type TQoreResponseType = Record<string, IQoreTypeObject>;

export interface IQoreAppActionWithFunction<Options = TQoreOptions, Response = TQoreResponseType>
  extends IQoreBaseAppAction {
  action_code: 2;
  api_function?: TQoreAppActionFunction;
  options?: StrictRecord<keyof Options, Options[keyof Options]>;
  response_type?: StrictRecord<keyof Response, Response[keyof Response]>;
  io_timeout_secs?: number;
}

export interface IQoreAppActionWithSwaggerPath extends IQoreBaseAppAction {
  action_code: 2;
  api_function?: never;
  swagger_path: string;
}

export interface IQorePartialAppActionWithSwaggerPath
  extends Omit<IQoreBaseAppAction, 'action_code' | 'app'> {
  api_function?: never;
  swagger_path: string;
}

export type TQoreAppAction<Options = TQoreOptions, Response = TQoreResponseType> =
  | IQoreAppActionWithFunction<Options, Response>
  | IQoreAppActionWithoutFunction
  | IQoreAppActionWithSwaggerPath;

export type TQorePartialAction<
  Options = Record<string, IQoreAppActionOption>,
  Response = Record<string, IQoreTypeObject>,
> = (
  | Omit<IQoreAppActionWithFunction<Options, Response>, 'action_code' | 'app'>
  | Omit<IQoreAppActionWithoutFunction, 'action_code' | 'app'>
  | IQorePartialAppActionWithSwaggerPath
) & {
  _localizationGroup?: string;
};

export interface IActionInitializationProps {
  locale: Locales;
}
