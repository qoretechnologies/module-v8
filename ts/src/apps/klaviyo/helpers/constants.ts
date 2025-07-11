import {
  CampaignsApi,
  EventsApi,
  ListsApi,
  OAuthBasicSession,
  ProfilesApi,
  SegmentsApi,
  TagsApi,
  MetricsApi,
} from 'klaviyo-api';
import { chain, get, isArray } from 'lodash';

export const getKlaviyoApis = (token: string) => {
  const session = new OAuthBasicSession(token);
  const profilesApi = new ProfilesApi(session);
  const campaignsApi = new CampaignsApi(session);
  const segmentsApi = new SegmentsApi(session);
  const tagsApi = new TagsApi(session);
  const listsApi = new ListsApi(session);
  const eventsApi = new EventsApi(session);
  const metricsApi = new MetricsApi(session);

  return {
    session,
    profilesApi,
    campaignsApi,
    segmentsApi,
    tagsApi,
    eventsApi,
    listsApi,
    metricsApi,
  };
};

export const buildKlaviyoFilterString = (
  filterObj: Record<string, string | string[]> | undefined,
  operators?: Record<string, string>
): string | null => {
  if (!filterObj) return null;

  return chain(filterObj)
    .toPairs()
    .filter(([_field, values]) => {
      if (typeof values === 'string') return values !== '';

      return isArray(values) && values.length > 0;
    })
    .map(([field, values]) => {
      let validValues: string[];

      if (typeof values === 'string') {
        validValues = [values];
      } else {
        validValues = values.filter((value: string) => value !== '');
      }

      if (validValues.length === 0) return null;

      const operator = operators?.[field] || 'any';

      const valueString =
        validValues.length === 1 ? JSON.stringify(validValues[0]) : JSON.stringify(validValues);

      return `${operator}(${field},${valueString})`;
    })
    .filter((filter) => filter !== null)
    .join(',')
    .value();
};

const ERROR_PATHS = {
  DETAIL: 'response.data.errors[0].detail',
} as const;

export const getKlaviyoErrorMessage = (error: any) => {
  return get(error, ERROR_PATHS.DETAIL) || String(error);
};
