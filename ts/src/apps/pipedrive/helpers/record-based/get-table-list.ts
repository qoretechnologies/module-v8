import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { PipedriveTables } from './constants';

export const getPipedriveTableList: TQoreGetTableListFunction = (_context) => {
  return [...PipedriveTables];
};
