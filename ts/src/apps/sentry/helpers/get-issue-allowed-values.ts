import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SentryError } from '../constants';
import { fetchSentryAllowedValues } from './constants';

type TSentryIssue = {
  id: string;
  shortId: string;
  title: string;
  culprit: string;
  level: string;
  status: string;
  firstSeen: string;
  lastSeen: string;
  count: string;
  userCount: number;
  project: {
    id: string;
    name: string;
    slug: string;
  };
};

const mapSentryIssueToAllowedValue = (issue: TSentryIssue): IQoreAllowedValue<string> => {
  const countParsed = parseInt(issue.count);
  const countFormatted = Number.isNaN(countParsed) ? '0' : countParsed.toLocaleString();
  
  return {
    value: issue.id,
    display_name: `${issue.shortId}: ${issue.title}`,
    desc: 
      `Project: ${issue.project.name}\n` +
      `Status: ${issue.status}\n` +
      `Level: ${issue.level}\n` +
      `Events: ${countFormatted}\n` +
      `Users Affected: ${issue.userCount}\n` +
      `First Seen: ${new Date(issue.firstSeen).toLocaleString()}\n` +
      `Last Seen: ${new Date(issue.lastSeen).toLocaleString()}\n` +
      `Culprit: ${issue.culprit || 'N/A'}`,
  };
};

export const getSentryIssueAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, organization, projectId } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'organization'],
    optionFields: ['projectId'],
    ErrorClass: SentryError,
  });

  return await fetchSentryAllowedValues<TSentryIssue>({
    token,
    path: `/api/0/projects/${organization}/${projectId}/issues/`,
    mapItemToAllowedValue: mapSentryIssueToAllowedValue,
  });
};
