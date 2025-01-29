import { IQoreAllowedValue } from '../../../global/models/qore';

export const FreshdeskAgentTicketScopeAllowedValues = [
  {
    value: '1',
    display_name: 'Global Access',
  },
  {
    value: '2',
    display_name: 'Group Access',
  },
  {
    value: '3',
    display_name: 'Restricted Access',
  },
] satisfies IQoreAllowedValue[];
