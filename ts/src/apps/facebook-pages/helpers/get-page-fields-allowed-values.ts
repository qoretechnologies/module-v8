import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { Page } from 'facebook-nodejs-business-sdk';

export const FacebookPageFieldsAllowedValues = Object.keys(Page.Fields).map(
  (field): IQoreAllowedValue<string> => ({
    value: field,
    display_name: field,
  })
);
