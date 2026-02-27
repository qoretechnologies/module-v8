import {
  TCustomConnOptions,
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { GitHubError } from '../../constants';
import { createGitHubClient } from '../constants';
import {
  formatGitHubRecord,
  getGitHubTableKeys,
  needsRepoAndOwner,
  TGitHubTable,
} from './constants';
import { extractGitHubErrorMessage } from './extract-error';
import { GithubSearchOptions } from './options';

const MAX_PER_PAGE = 100;

export const searchGitHubRecords: TQoreSearchRecordsFunction<
  TCustomConnOptions,
  typeof GithubSearchOptions
> = async (context, _where, options) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: GitHubError,
  });

  const { table, owner, repo, orderBy, limit } = options || {};

  if (!table) {
    throw new GitHubError('Table option is required');
  }

  if (needsRepoAndOwner(table) && (!owner || !repo)) {
    throw new GitHubError(`Owner and Repo options are required to search ${table}`);
  }

  const fields = getGitHubTableKeys(table as TGitHubTable);
  const maxLimit = (limit as number) ?? Infinity;

  let recordsReturned = 0;
  let asyncIterable: AsyncIterable<any> | null = null;
  let asyncIterator: AsyncIterator<any> | null = null;
  let buffer: Record<string, any>[] = [];

  const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
    if (recordsReturned >= maxLimit) {
      return null;
    }

    try {
      if (!asyncIterable) {
        const client = await createGitHubClient(token);
        asyncIterable = createPaginationIterable(client, {
          tableName: table as TGitHubTable,
          owner,
          repo,
          orderBy: orderBy as { column: string; ascending?: boolean },
        });
        asyncIterator = asyncIterable[Symbol.asyncIterator]();
      }

      const records: Record<string, any>[] = [];
      const effectiveBlockSize = Math.min(blockSize, maxLimit - recordsReturned);

      while (buffer.length > 0 && records.length < effectiveBlockSize) {
        records.push(buffer.shift()!);
      }

      while (records.length < effectiveBlockSize && asyncIterator) {
        const { value, done } = await asyncIterator.next();

        if (done) {
          if (records.length === 0 && buffer.length === 0) {
            return null;
          }
          break;
        }

        const formattedRecords = value.data.map((record: any) =>
          formatGitHubRecord({ record, tableName: table as TGitHubTable, fields })
        );

        for (const record of formattedRecords) {
          if (records.length < effectiveBlockSize) {
            records.push(record);
          } else {
            buffer.push(record);
          }
        }
      }

      if (records.length === 0) {
        return null;
      }

      recordsReturned += records.length;

      return mapObjectToColumnFormat(records);
    } catch (error: any) {
      if (error instanceof GitHubError) {
        throw error;
      }
      throw new GitHubError(
        `Failed to search ${table} records: ${extractGitHubErrorMessage(error)}`
      );
    }
  };

  return get_records;
};

const createPaginationIterable = (
  client: any,
  options: {
    tableName: TGitHubTable;
    owner?: string;
    repo?: string;
    orderBy?: { column: string; ascending?: boolean };
  }
): AsyncIterable<any> => {
  const { tableName, owner, repo, orderBy } = options;

  const baseParams: any = {
    per_page: MAX_PER_PAGE,
  };

  if (orderBy?.column) {
    baseParams.sort = orderBy.column;
    baseParams.direction = orderBy.ascending === false ? 'desc' : 'asc';
  }

  switch (tableName) {
    case 'issues': {
      if (!owner || !repo) {
        throw new GitHubError('Owner and repo are required for issues');
      }

      return client.paginate.iterator('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        state: 'all',
        ...baseParams,
      });
    }

    case 'pulls': {
      if (!owner || !repo) {
        throw new GitHubError('Owner and repo are required for pull requests');
      }

      return client.paginate.iterator('GET /repos/{owner}/{repo}/pulls', {
        owner,
        repo,
        state: 'all',
        ...baseParams,
      });
    }

    case 'releases': {
      if (!owner || !repo) {
        throw new GitHubError('Owner and repo are required for releases');
      }

      return client.paginate.iterator('GET /repos/{owner}/{repo}/releases', {
        owner,
        repo,
        ...baseParams,
      });
    }

    default:
      throw new GitHubError(`Unsupported table name: ${tableName}`);
  }
};
