import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { Post } from 'facebook-nodejs-business-sdk';

export const FacebookPostFieldsAllowedValues = Object.keys(Post.Fields).map(
  (field): IQoreAllowedValue<string> => ({
    value: field,
    display_name: field,
  })
);
