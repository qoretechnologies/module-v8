import {
  IQoreAllowedValue,
  TQoreGetAllowedValuesFunction,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';

export enum EHubspotTriggerCriteria {
  CREATED = 'created',
  UPDATED = 'updated',
}

export const hubspotTriggerCriteria = {
  [EHubspotTriggerCriteria.CREATED]: {
    value: 'created',
    desc: 'Triggers when a new object is created',
    display_name: 'Object Created',
  },
  [EHubspotTriggerCriteria.UPDATED]: {
    value: 'updated',
    desc: 'Triggers when an existing object is updated',
    display_name: 'Object Updated',
  },
} as const satisfies Record<EHubspotTriggerCriteria, IQoreAllowedValue<string>>;

export const getHubspotTriggerOptions = (
  getPropertiesAllowedValues: TQoreGetAllowedValuesFunction
): TQoreOptions => {
  return {
    activationCriteria: {
      type: 'string',
      required: true,
      default_value: hubspotTriggerCriteria[EHubspotTriggerCriteria.CREATED].value,
      allowed_values: Object.values(hubspotTriggerCriteria),
    },
    additionalProperties: {
      type: {
        type: 'list',
        element_type: 'string',
        required: false,
      },
      allowed_values_creatable: true,
      get_allowed_values: getPropertiesAllowedValues,
    },
  };
};
