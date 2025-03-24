import { createGetPipedriveObjectPropertyAllowedValuesFunction } from './constants';

export const getPipedriveDealChannelAllowedValues =
  createGetPipedriveObjectPropertyAllowedValuesFunction('/dealFields', 'channel');

export const getPipedriveDealOriginAllowedValues =
  createGetPipedriveObjectPropertyAllowedValuesFunction('/dealFields', 'origin');
