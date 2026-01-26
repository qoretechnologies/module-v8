import { TQoreAppActionOption, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getTeamsTeamIdAllowedValues } from '../helpers/get-team-id-allowed-values';

export const TeamsMeetingSourceOption = {
  type: 'string',
  default_value: 'personal',
  on_change: ['refetch'],
  get_dependent_options: (context) => {
    const meetingSource = context?.opts?.meetingSource || 'personal';

    if (meetingSource === 'team') {
      return {
        teamId: { type: 'string', required: true, get_allowed_values: getTeamsTeamIdAllowedValues },
      };
    }

    return {} as TQoreOptions;
  },
  allowed_values: [
    {
      display_name: 'Personal',
      value: 'personal',
    },
    {
      display_name: 'Team',
      value: 'team',
    },
  ],
} satisfies TQoreAppActionOption;
