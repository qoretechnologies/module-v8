import { TQoreRequestDataConverterFunction } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';

export const removeTrelloSelectionFields = (
  fields: string[]
): TQoreRequestDataConverterFunction => {
  return (request) => {
    const result = { ...request };
    // Native schema adapters place synthetic options in query or body according to the operation type.
    // These selectors are UI context, not Trello wire fields; retain the real request fields in either case.
    for (const location of ['query', 'body'] as const) {
      const value = result[location];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const remaining = omit(value, fields);
        if (Object.keys(remaining).length) {
          result[location] = remaining;
        } else {
          delete result[location];
        }
      }
    }
    return result;
  };
};
