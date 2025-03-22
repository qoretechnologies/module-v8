import { createGetPipedriveObjectPropertyAllowedValuesFunction } from './constants';

export const getPipedrivePersonLabelAllowedValues =
  createGetPipedriveObjectPropertyAllowedValuesFunction('/personFields', 'label');
