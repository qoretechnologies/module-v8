import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { delay, getQoreContextRequiredValues } from '../../../global/helpers';
import { NotionError } from '../constants';
import { createNotionClient, NOTION_FETCH_DELAY } from './constants';

export const getNotionUserAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: NotionError,
  });

  try {
    const client = createNotionClient(token);
    const allUsers: IQoreAllowedValue<string>[] = [];
    let nextCursor: string | undefined = undefined;

    do {
      const response = await client.users.list({
        start_cursor: nextCursor,
        page_size: 100,
      });

      const users = response.results;

      allUsers.push(
        ...users.map((user) => ({
          value: user.id,
          display_name: user.name || `User ${user.id}`,
        }))
      );

      nextCursor = response.next_cursor || undefined;

      if (nextCursor) {
        await delay(NOTION_FETCH_DELAY);
      }
    } while (nextCursor);

    return allUsers;
  } catch (error) {
    throw new NotionError(`Failed to fetch users: ${error.message || error}`);
  }
};
