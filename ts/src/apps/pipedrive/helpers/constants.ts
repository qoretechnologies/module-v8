import { isString } from 'lodash';

// Pipedrive custom fields use 40-character hexadecimal identifiers (similar to SHA-1 hashes)
export const isPipedriveCustomField = (fieldKey: string): boolean => {
  return isString(fieldKey) && /^[a-f0-9]{40}$/.test(fieldKey);
};
