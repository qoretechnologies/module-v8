import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { seatableClient, SeaTableSqlResponse } from '../client';
import { SEATABLE_APP_NAME, SeaTableError } from '../constants';

const action = 'run_sql';

const options = {
  sql: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const RunSql = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SEATABLE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      results: { type: 'any' },
      metadata: { type: 'any' },
    },
  },
  api_function: async (_obj, _opts, context) => {
    const { api_token, url, sql } = getQoreContextRequiredValues({
      context,
      connectionFields: ['api_token', 'url'],
      optionFields: ['sql'],
      ErrorClass: SeaTableError,
    });

    try {
      const response = await seatableClient.basePost<SeaTableSqlResponse>(
        'sql/',
        {
          sql,
          convert_keys: true,
        },
        { connectionOptions: { url, api_token } }
      );

      return {
        success: response?.success ?? true,
        results: response?.results || [],
        metadata: response?.metadata || [],
      };
    } catch (error) {
      if (error instanceof SeaTableError) {
        throw error;
      }
      throw new SeaTableError(`Failed to execute SQL query: ${error instanceof Error ? error.message : error}`);
    }
  },
});

export default RunSql;
