import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const hubspotListSortAllowedValues = [
  {
    value: 'HS_FOLDER_NAME',
    display_name: 'Folder Name',
    desc: 'The name of the folder containing the list',
  },
  {
    value: 'HS_LIST_NAME',
    display_name: 'List Name',
    desc: 'The name of the list',
  },
  {
    value: 'HS_LIST_REFERENCE_COUNT',
    display_name: 'List Reference Count',
    desc: 'Number of times this list is referenced or used by other objects',
  },
  {
    value: 'HS_LIST_SIZE',
    display_name: 'List Size',
    desc: 'Total number of records in the list',
  },
  {
    value: 'HS_UPDATED_AT',
    display_name: 'Updated At',
    desc: 'Timestamp when the list was last updated',
  },
  {
    value: 'HS_DEFINITION_UPDATED_AT',
    display_name: 'Definition Updated At',
    desc: 'Timestamp when the list definition/criteria was last updated',
  },
  {
    value: 'HS_LIST_ID',
    display_name: 'List ID',
    desc: 'Unique identifier for the list',
  },
  {
    value: 'HS_CREATED_BY_USER_ID',
    display_name: 'Created By User ID',
    desc: 'ID of the user who created the list',
  },
  {
    value: 'HS_CREATED_AT',
    display_name: 'Created At',
    desc: 'Timestamp when the list was created',
  },
] satisfies IQoreAllowedValue<string>[];
