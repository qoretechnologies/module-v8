import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { GitHubTables } from './constants';

export const getGitHubTableList: TQoreGetTableListFunction = (_context) => {
  return [...GitHubTables];
};
