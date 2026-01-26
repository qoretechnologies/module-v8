import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { callMondayAPI } from './constants';

type TMondayGroup = {
  id: string;
  title: string;
};

type TBoardGroupsResponseType = {
  data: {
    boards: {
      groups: TMondayGroup[];
    }[];
  };
};

const mapMondayGroup = (group: TMondayGroup): IQoreAllowedValue<string> => ({
  value: group.id,
  display_name: group.title,
  short_desc: `Group ID: ${group.id}\n\nTitle: ${group.title}`,
});

export const getMondayGroupIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const board_id = context?.opts?.board_id;

  if (!token) {
    throw new Error('token is required to get Monday group ID allowed values');
  }

  if (!board_id) {
    throw new Error('Board ID is required to fetch groups');
  }

  const query = `
    query GetBoardGroups($boardId: [ID!]!) {
      boards(ids: $boardId) {
        groups {
          id
          title
        }
      }
    }
  `;

  const response = await callMondayAPI<TBoardGroupsResponseType>({
    query,
    token,
    variables: {
      boardId: board_id,
    },
  });

  const groups = response.data?.boards?.[0]?.groups;
  if (!groups) {
    throw new Error('No groups returned from monday.com API');
  }

  return groups.map(mapMondayGroup);
};
