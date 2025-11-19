import { createGetPipedriveObjectPropertyAllowedValuesFunction } from './create-get-property-allowed-values';

export const getPipedriveDealChannelAllowedValues =
  createGetPipedriveObjectPropertyAllowedValuesFunction('/dealFields', 'channel');

export const getPipedriveDealOriginAllowedValues =
  createGetPipedriveObjectPropertyAllowedValuesFunction('/dealFields', 'origin');
