import { Client } from '@notionhq/client';
import {
  IQoreAllowedValue,
  TQoreGetAllowedValuesFunction,
} from '../../../../../global/models/qore';

export const getNotionDatabaseIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
  } = context;

  const notion = new Client({
    auth: token,
    notionVersion: '2022-02-22',
  });

  const databases: IQoreAllowedValue[] = [];

  const response = await notion.search({
    filter: {
      property: 'object',
      value: 'database',
    },
  });

  response.results.forEach((database) => {
    const title = 'title' in database ? database.title[0].plain_text : 'Untitled';

    databases.push({
      value: database.id,
      display_name: title,
    });
  });

  return databases;
};
