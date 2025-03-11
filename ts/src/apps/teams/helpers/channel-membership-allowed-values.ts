import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const TeamsChannelMembershipAllowedValues: IQoreAllowedValue<string>[] = [
  {
    display_name: 'Standard',
    value: 'standard',
    short_desc: 'Standard channel',
  },
  {
    display_name: 'Private',
    value: 'private',
    short_desc: 'Private channel',
  },
  {
    display_name: 'Shared',
    value: 'shared',
    short_desc: 'Shared channel',
  },
];
