import { TQoreOptions, TQoreRequestDataConverterFunction } from '@qoretechnologies/ts-toolkit';
import {
  getMailchimpInterestCategoryIdAllowedValues,
  getMailchimpInterestIdAllowedValues,
} from './get-interest-id-allowed-values';
import { getMailchimpMergeFieldAllowedValues } from './get-merge-fields-allowed-values';
import { omit } from 'lodash';

export const MailchimpCommonMemberOptions = {
  interest_category_id: {
    type: 'string',
    required: false,
    depends_on: ['list_id'],
    get_allowed_values: getMailchimpInterestCategoryIdAllowedValues,
  },
  interests: {
    depends_on: ['list_id', 'interest_category_id'],
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getMailchimpInterestIdAllowedValues,
    element_allowed_values_creatable: true,
  },
  merge_fields: {
    required: false,
    depends_on: ['list_id'],
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          field: {
            type: 'string',
            get_allowed_values: getMailchimpMergeFieldAllowedValues,
            allowed_values_creatable: true,
            required: true,
          },
          value: {
            type: 'string',
            required: true,
          },
        },
      },
    },
  },
} satisfies TQoreOptions;

export const MailchimpMemberCreateRequestConverter: TQoreRequestDataConverterFunction = (
  request
) => {
  if (!request) return request;

  const { body, ...rest } = request;
  const interests = body?.interests;
  const merge_fields = body?.merge_fields;

  return {
    ...rest,
    ...(body && {
      body: {
        ...omit(body, ['interest_category_id', 'interests', 'merge_fields']),
        ...(interests?.length && {
          interests: interests.reduce((acc: Record<string, boolean>, interest: string) => {
            acc[interest] = true;

            return acc;
          }, {}),
        }),
        ...(merge_fields?.length && {
          merge_fields: merge_fields.reduce(
            (acc: Record<string, string>, field: { field: string; value: string }) => {
              acc[field.field] = field.value;

              return acc;
            },
            {}
          ),
        }),
      },
    }),
  };
};
