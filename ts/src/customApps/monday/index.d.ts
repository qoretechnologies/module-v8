declare const MondayApp: import("@qoretechnologies/ts-toolkit").TQoreAppWithActions<((import("@qoretechnologies/ts-toolkit").IQoreAppActionWithSwaggerPath & import("@qoretechnologies/ts-toolkit").IQoreAppSharedNotLocalized) | (import("@qoretechnologies/ts-toolkit").IQoreAppActionWithFunction<{
    board_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: false;
        preselected: true;
        on_change: "refetch"[];
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
    };
    record_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
    };
}, import("@qoretechnologies/ts-toolkit").TQoreResponseType> & import("@qoretechnologies/ts-toolkit").IQoreAppSharedNotLocalized) | (import("@qoretechnologies/ts-toolkit").IQoreAppActionWithFunction<{
    board_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
        preselected: true;
        on_change: "refetch"[];
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
    };
    record_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
    };
    column_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
    };
}, import("@qoretechnologies/ts-toolkit").TQoreResponseType> & import("@qoretechnologies/ts-toolkit").IQoreAppSharedNotLocalized) | (import("@qoretechnologies/ts-toolkit").IQoreAppActionWithFunction<Partial<{
    column_values: {
        display_name: string;
        short_desc: string;
        desc: string;
        depends_on: string[];
        type: "hash";
        required: false;
    };
}> & {
    board_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
        preselected: true;
        on_change: "refetch"[];
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
        get_dependent_options: import("@qoretechnologies/ts-toolkit").TQoreGetDependentOptionsFunction;
    };
    group_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
    };
    item_name: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
    };
}, import("@qoretechnologies/ts-toolkit").TQoreResponseType> & import("@qoretechnologies/ts-toolkit").IQoreAppSharedNotLocalized) | (import("@qoretechnologies/ts-toolkit").IQoreAppActionWithFunction<{
    payload: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "hash";
        required: false;
    };
    actionName: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
    };
}, import("@qoretechnologies/ts-toolkit").TQoreResponseType> & import("@qoretechnologies/ts-toolkit").IQoreAppSharedNotLocalized) | (import("@qoretechnologies/ts-toolkit").IQoreAppActionWithFunction<{
    board_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: false;
        preselected: true;
        on_change: "refetch"[];
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
    };
    query_text: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
        required: true;
    };
    columnId: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: false;
        default_value: string;
        allowed_values_creatable: true;
        on_change: "refetch"[];
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
    };
    limit: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "number";
        required: false;
        default_value: number;
    };
    cursor: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: false;
    };
}, import("@qoretechnologies/ts-toolkit").TQoreResponseType> & import("@qoretechnologies/ts-toolkit").IQoreAppSharedNotLocalized) | (import("@qoretechnologies/ts-toolkit").IQoreAppActionWithFunction<Partial<{
    column_values: {
        display_name: string;
        short_desc: string;
        desc: string;
        depends_on: string[];
        type: "hash";
        required: false;
    };
}> & {
    board_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
        preselected: true;
        on_change: "refetch"[];
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
        get_dependent_options: import("@qoretechnologies/ts-toolkit").TQoreGetDependentOptionsFunction;
    };
    record_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
    };
}, import("@qoretechnologies/ts-toolkit").TQoreResponseType> & import("@qoretechnologies/ts-toolkit").IQoreAppSharedNotLocalized) | (import("@qoretechnologies/ts-toolkit").IQoreAppActionWithEvent<{
    board_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
    };
}> & import("@qoretechnologies/ts-toolkit").IQoreAppSharedNotLocalized) | (import("@qoretechnologies/ts-toolkit").IQoreAppActionWithWebhookWithoutPerms<{
    board_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
    };
}> & import("@qoretechnologies/ts-toolkit").IQoreAppSharedNotLocalized) | (import("@qoretechnologies/ts-toolkit").IQoreAppActionWithWebhookWithPerms<{
    board_id: {
        display_name: string;
        short_desc: string;
        desc: string;
        type: "string";
        required: true;
        allowed_values_creatable: true;
        get_allowed_values: import("@qoretechnologies/ts-toolkit").TQoreGetAllowedValuesFunction<import("@qoretechnologies/ts-toolkit").TCustomConnOptions, string>;
    };
}> & import("@qoretechnologies/ts-toolkit").IQoreAppSharedNotLocalized))[], Record<string, import("@qoretechnologies/ts-toolkit").IQoreConnectionOption>> & import("@qoretechnologies/ts-toolkit").IQoreAppSharedNotLocalized;
export default MondayApp;
