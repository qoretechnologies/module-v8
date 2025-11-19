import { createGetPipedriveObjectPropertyAllowedValuesFunction } from './create-get-property-allowed-values';

export const getPipedrivePersonLabelAllowedValues =
  createGetPipedriveObjectPropertyAllowedValuesFunction('/personFields', 'label');
