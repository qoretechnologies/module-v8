import { createGetPipedriveObjectPropertyAllowedValuesFunction } from './constants';

export const getPipedriveOrganizationLabelAllowedValues =
  createGetPipedriveObjectPropertyAllowedValuesFunction('/organizationFields', 'label');
