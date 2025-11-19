import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedriveNoteData = {
  id: string;
  content: string;
  add_time: string;
  user: {
    email: string;
    name: string;
  };
};

const mapPipedriveNote = (note: TPipedriveNoteData): IQoreAllowedValue<string> => ({
  display_name: note.content.substring(0, 50) + (note.content.length > 50 ? '...' : ''),
  value: note.id,
  desc:
    `Content: ${note.content}\n\n` +
    `Added at: ${note.add_time}\n\n` +
    `User: ${note.user.name} (${note.user.email})`,
});

export const getPipedriveNoteIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive note allowed values');
  }

  const notes = await fetchPipedriveAllowedValues<TPipedriveNoteData>({
    token,
    mapItemToAllowedValue: mapPipedriveNote,
    path: 'v1/notes',
  });

  return notes;
};
