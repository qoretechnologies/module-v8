import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { Comment } from 'facebook-nodejs-business-sdk';

export const FacebookCommentFieldsAllowedValues = Object.keys(Comment.Fields).map(
  (field): IQoreAllowedValue<string> => ({
    value: field,
    display_name: field,
  })
);
