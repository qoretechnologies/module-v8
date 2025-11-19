import { createGetPipedriveObjectPropertyAllowedValuesFunction } from './create-get-property-allowed-values';

export const getPipedriveOrganizationLabelAllowedValues =
  createGetPipedriveObjectPropertyAllowedValuesFunction('/organizationFields', 'label');
