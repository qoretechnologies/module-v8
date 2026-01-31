import { TQoreRequestDataConverterFunction } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';

export const removeTrelloFieldsFromQuery = (
  fields: string[]
): TQoreRequestDataConverterFunction => {
  return (request) => {
    const { query, ...rest } = request;

    return {
      ...rest,
      query: omit(query, fields),
    };
  };
};
