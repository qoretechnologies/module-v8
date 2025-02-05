import { IQoreRestGetAllowedValues } from '@qoretechnologies/ts-toolkit';

export const getEsignatureEnvelopeIdAllowedValues = {
  method: 'GET',
  path: 'envelopes?from_date=2010-01-01',
  values: 'body.envelopes.envelopeId',
  display_names: 'body.envelopes.emailSubject',
  short_descs: 'body.envelopes.envelopeId',
} satisfies IQoreRestGetAllowedValues;
