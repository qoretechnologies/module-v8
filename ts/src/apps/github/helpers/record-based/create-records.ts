import { TCustomConnOptions, TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  delay,
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { GitHubError } from '../../constants';
import { createGitHubClient } from '../constants';
import {
  formatGitHubRecord,
  getGitHubTableKeys,
  needsRepoAndOwner,
  TGitHubTable,
} from './constants';
import {
  extractGitHubErrorMessage,
  extractRateLimitInfo,
  getTimeUntilReset,
  isRateLimitError,
  shouldRetryAfterDelay,
} from './extract-error';
import { GithubCreateOptions } from './options';

const MAX_WAIT_SECONDS = 300;
const INITIAL_RETRY_DELAY_MS = 1000;
const RETRY_BACKOFF_MULTIPLIER = 1.5;
const MAX_RETRIES = 10;

export const createGitHubRecords: TQoreCreateRecordsFunction<
  TCustomConnOptions,
  typeof GithubCreateOptions
> = async (context, records, options) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: GitHubError,
  });

  const { table, owner, repo } = options || {};

  if (!table) {
    throw new GitHubError('Table option is required');
  }

  if (needsRepoAndOwner(table) && (!owner || !repo)) {
    throw new GitHubError(`Owner and Repo options are required to create records for ${table}`);
  }

  const recordsArray = mapColumnFormatToObject(records);
  const createdRecords: Record<string, any>[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  const fields = getGitHubTableKeys(table as TGitHubTable);

  for (let i = 0; i < recordsArray.length; i++) {
    const record = recordsArray[i];

    const recordFields: Record<string, any> = {};

    Object.keys(record).forEach((key) => {
      const field = record[key] as any;
      if (field != null && (!Array.isArray(field) || field.length > 0)) {
        recordFields[key] = record[key];
      }
    });

    try {
      const result = await createGitHubRecord({
        record: {
          ...recordFields,
          ...(needsRepoAndOwner(table) && { owner, repo }),
        },
        token,
        tableName: table as TGitHubTable,
      });

      createdRecords.push(
        formatGitHubRecord({ record: result.data, tableName: table as TGitHubTable, fields })
      );
    } catch (error: any) {
      const errorMsg = extractGitHubErrorMessage(error);
      errors.push({ index: i, error: errorMsg });
      Debugger.log(`Failed to create record ${i + 1}: ${errorMsg}`);

      if (isRateLimitError(error) && !shouldRetryAfterDelay(error, MAX_WAIT_SECONDS)) {
        const rateLimitInfo = extractRateLimitInfo(error);
        const timeUntilReset = rateLimitInfo ? getTimeUntilReset(rateLimitInfo.reset) : 'unknown';

        throw new GitHubError(
          `Rate limit exceeded. ${createdRecords.length} of ${recordsArray.length} records created. ` +
            `Time until reset: ${timeUntilReset} seconds (exceeds ${MAX_WAIT_SECONDS}s limit). ` +
            `Remaining records were not created.`
        );
      }
    }
  }

  if (createdRecords.length === 0) {
    const errorSummary = errors.map((e) => `Record ${e.index + 1}: ${e.error}`).join('\n');
    throw new GitHubError(`Failed to create any records:\n${errorSummary}`);
  }

  if (errors.length > 0) {
    const errorSummary = errors.map((e) => `Record ${e.index + 1}: ${e.error}`).join('\n');
    Debugger.log(
      `Created ${createdRecords.length} of ${recordsArray.length} records. Errors:\n${errorSummary}`
    );
  }

  return mapObjectToColumnFormat(createdRecords);
};

const createGitHubRecord = async (options: {
  record: any;
  token: string;
  tableName: TGitHubTable;
}): Promise<{ data: Record<string, any> }> => {
  const { record, token, tableName } = options;
  const client = await createGitHubClient(token);

  let delayAmount = INITIAL_RETRY_DELAY_MS;
  const totalStartTime = Date.now();

  const createRecord = async () => {
    switch (tableName) {
      case 'issues':
        return await client.rest.issues.create(record);
      case 'pulls':
        return await client.rest.pulls.create(record);
      case 'releases':
        return await client.rest.repos.createRelease(record);
      case 'repositories':
        return await client.rest.repos.createForAuthenticatedUser(record);
      default:
        throw new GitHubError(`Unsupported table name: ${tableName}`);
    }
  };

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await createRecord();
    } catch (error: any) {
      if (!isRateLimitError(error)) {
        throw new GitHubError(
          `Failed to create ${tableName} record: ${extractGitHubErrorMessage(error)}`
        );
      }

      const rateLimitInfo = extractRateLimitInfo(error);
      const retryAfterHeader = error.response?.headers?.['retry-after'];

      let waitTimeMs: number;

      if (retryAfterHeader) {
        waitTimeMs = parseInt(retryAfterHeader, 10) * 1000;
      } else if (rateLimitInfo) {
        const timeUntilReset = getTimeUntilReset(rateLimitInfo.reset);
        waitTimeMs = Math.min(timeUntilReset * 1000, delayAmount);
      } else {
        waitTimeMs = delayAmount;
      }

      const totalElapsedSeconds = Math.floor((Date.now() - totalStartTime) / 1000);
      const totalWaitSeconds = Math.floor(waitTimeMs / 1000);
      const projectedTotalSeconds = totalElapsedSeconds + totalWaitSeconds;

      if (projectedTotalSeconds > MAX_WAIT_SECONDS) {
        throw new GitHubError(
          `Rate limit exceeded. Would need to wait ${totalWaitSeconds}s (total ${projectedTotalSeconds}s), ` +
            `which exceeds ${MAX_WAIT_SECONDS}s limit.`
        );
      }

      const status = error.response?.status;
      Debugger.log(
        `Rate limit hit (status ${status}). Waiting ${waitTimeMs}ms before retry #${attempt + 1}/${MAX_RETRIES}...`
      );

      await delay(waitTimeMs);
      delayAmount *= RETRY_BACKOFF_MULTIPLIER;
    }
  }

  throw new GitHubError(
    `Failed to create ${tableName} record after ${MAX_RETRIES} retries due to persistent rate limits.`
  );
};
