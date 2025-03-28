import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export enum EMagentoTriggerCriteria {
  CREATED = 'created',
  UPDATED = 'updated',
}

export const magentoTriggerCriteria = {
  [EMagentoTriggerCriteria.CREATED]: {
    value: 'created',
    desc: 'Triggers when a new object is created',
    display_name: 'Object Created',
  },
  [EMagentoTriggerCriteria.UPDATED]: {
    value: 'updated',
    desc: 'Triggers when an existing object is updated',
    display_name: 'Object Updated',
  },
} as const satisfies Record<EMagentoTriggerCriteria, IQoreAllowedValue<string>>;
