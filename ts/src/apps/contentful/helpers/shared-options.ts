import { TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getContentfulSpaceAllowedValues } from './get-space-allowed-values';
import { getContentfulEnvironmentAllowedValues } from './get-environment-allowed-values';
import { getContentfulContentTypeAllowedValues } from './get-content-type-allowed-values';

export const contentfulSpaceOption = {
  space_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulSpaceAllowedValues,
    on_change: ['refetch'],
  },
} satisfies TQoreOptions;

export const contentfulEnvironmentOption = {
  environment_id: {
    type: 'string',
    required: false,
    get_allowed_values: getContentfulEnvironmentAllowedValues,
    depends_on: ['space_id'],
    default_value: 'master',
  },
} satisfies TQoreOptions;

export const contentfulContentTypeOption = {
  content_type_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulContentTypeAllowedValues,
    depends_on: ['space_id'],
    on_change: ['refetch'],
  },
} satisfies TQoreOptions;

export const contentfulBaseOptions = {
  ...contentfulSpaceOption,
  ...contentfulEnvironmentOption,
} satisfies TQoreOptions;

export const contentfulBaseWithContentTypeOptions = {
  ...contentfulBaseOptions,
  ...contentfulContentTypeOption,
} satisfies TQoreOptions;
