import { TQoreSearchRecordsWhereConditions } from '@qoretechnologies/ts-toolkit';
import { TZendeskTable } from './get-table-list';

export type TZendeskSearchResponse = {
  results: Array<Record<string, any>>;
  count: number;
  next_page: string | null;
  previous_page?: string | null;
};

export type TZendeskListResponse = {
  tickets?: Array<Record<string, any>>;
  users?: Array<Record<string, any>>;
  organizations?: Array<Record<string, any>>;
  next_page: string | null;
  previous_page?: string | null;
  count?: number;
};

export type TZendeskCustomObjectSearchResponse = {
  custom_object_records: Array<Record<string, any>>;
  meta: {
    has_more: boolean;
    after_cursor?: string;
    before_cursor?: string;
  };
  links?: {
    next?: string;
    prev?: string;
  };
};

export type TZendeskUpdateResponse = {
  ticket?: Record<string, any>;
  user?: Record<string, any>;
  organization?: Record<string, any>;
};

export type TGetRecordIdsOptions = {
  token: string;
  url: string;
  tableName: TZendeskTable;
  whereConditions?: TQoreSearchRecordsWhereConditions;
};

export const ZENDESK_PAGE_SIZE = 100;

export const ZENDESK_BULK_DELETE_LIMIT = 100;

export const ZENDESK_BULK_UPDATE_LIMIT = 100;

export const CUSTOM_OBJECT_STANDARD_FIELDS = [
  'name',
  'external_id',
  'created_at',
  'updated_at',
  'created_by_user',
  'updated_by_user',
];
