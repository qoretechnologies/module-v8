import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { LINKED_IN_ORGANIZATIONS_APP_NAME, LinkedInOrganizationsError } from '../constants';
import { linkedInOrganizationsApiClient } from '../helpers/constants';
import { getLinkedInOrganizationPageAllowedValues } from '../helpers/get-organization-allowed-values';

const action = 'get_follower_statistics';

type TLinkedInFollowerStatisticsResponse = {
  elements: Array<{
    value: {
      totalCount: {
        long: number;
      };
    };
    dimension: {
      value: {
        urn: string;
        staffRangeCount: string;
      };
    };
  }>;
};

type TLinkedInDimension = {
  name: {
    localized: {
      en_US: string;
    };
  };
  id: string;
};

type TLinkedInGeo = {
  defaultLocalizedName: {
    value: string;
  };
};

const options = {
  organization: {
    type: 'string',
    required: true,
    get_allowed_values: getLinkedInOrganizationPageAllowedValues,
  },
  dimensionType: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'JOB_FUNCTION', display_name: 'Job Function' },
      { value: 'INDUSTRY', display_name: 'Industry' },
      { value: 'SENIORITY', display_name: 'Seniority' },
      { value: 'REGION_GEO', display_name: 'Region Geo' },
      { value: 'STAFF_COUNT_RANGE', display_name: 'Staff Count Range' },
      { value: 'COUNTRY_GEO', display_name: 'Country Geo' },
    ],
  },
  timeRange: {
    type: {
      type: 'hash',
      fields: {
        start: { type: 'date', required: true },
        end: { type: 'date', required: true },
      },
      required: false,
    },
  },
} satisfies TQoreOptions;

const LinkedInDimensionTypeToApiPathMap: Record<
  string,
  { path: string; urnReplace: string; keyName: string; valueKey: 'urn' | 'staffRangeCount' }
> = {
  JOB_FUNCTION: {
    path: 'dmaFunctions',
    urnReplace: 'urn:li:function:',
    keyName: 'jobFunction',
    valueKey: 'urn',
  },
  INDUSTRY: {
    path: 'dmaStandardizedIndustries',
    urnReplace: 'urn:li:industry:',
    keyName: 'industry',
    valueKey: 'urn',
  },
  SENIORITY: {
    path: 'dmaStandardizedSeniorities',
    urnReplace: 'urn:li:seniority:',
    keyName: 'seniority',
    valueKey: 'urn',
  },
  REGION_GEO: {
    path: 'dmaRegionGEOs',
    urnReplace: 'urn:li:geo:',
    keyName: 'regionGeo',
    valueKey: 'urn',
  },
  COUNTRY_GEO: {
    path: 'dmaCountryGEOs',
    urnReplace: 'urn:li:geo:',
    keyName: 'countryGeo',
    valueKey: 'urn',
  },
  STAFF_COUNT_RANGE: {
    path: 'dmaStaffCountRanges',
    urnReplace: '',
    keyName: 'staffCountRange',
    valueKey: 'staffRangeCount',
  },
};

const getOrganizationFollowerStatistics = QoreAppCreator.createLocalizedAction<typeof options>({
  app: LINKED_IN_ORGANIZATIONS_APP_NAME,
  action,
  options,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, organization, dimensionType } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['organization', 'dimensionType'],
      ErrorClass: LinkedInOrganizationsError,
    });

    const { timeRange } = obj || {};
    let timeRangeParam: string | undefined;

    if (timeRange) {
      const start = new Date(timeRange.start).getTime();
      const end = new Date(timeRange.end).getTime();

      timeRangeParam = `timeRange=(end:${end},start:${start})`;
    }

    try {
      const statistics = await linkedInOrganizationsApiClient<TLinkedInFollowerStatisticsResponse>({
        token,
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
        path:
          `dmaOrganizationalPageEdgeAnalytics` +
          `?q=dimension` +
          `&organizationalPage=${encodeURIComponent(organization)}` +
          `&dimensionType=${encodeURIComponent(dimensionType)}` +
          `&analyticsType=FOLLOWER` +
          (timeRangeParam ? `&${timeRangeParam}` : ''),
        method: 'GET',
      });

      const dimensionTypes: Record<string, string> = await getDimensionTypes(
        dimensionType,
        token,
        statistics
      );

      return statistics.elements.map((item) => ({
        [LinkedInDimensionTypeToApiPathMap[dimensionType].keyName]:
          dimensionTypes[
            item.dimension.value[LinkedInDimensionTypeToApiPathMap[dimensionType].valueKey].replace(
              LinkedInDimensionTypeToApiPathMap[dimensionType].urnReplace,
              ''
            )
          ] || 'Unknown',
        followers: item.value.totalCount.long,
      }));
    } catch (error) {
      throw new LinkedInOrganizationsError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
});

export default getOrganizationFollowerStatistics;

const getDimensionTypes = async (
  type: string,
  token: string,
  statistics?: TLinkedInFollowerStatisticsResponse
): Promise<Record<string, string>> => {
  if (['JOB_FUNCTION', 'INDUSTRY', 'SENIORITY'].includes(type)) {
    const dimensionTypesResponse = await linkedInOrganizationsApiClient<TLinkedInDimension[]>({
      token,
      headers: {
        'X-Restli-Protocol-Version': '2.0.0',
      },
      path: LinkedInDimensionTypeToApiPathMap[type].path,
      params: {
        count: '500',
      },
      object: 'elements',
      method: 'GET',
    });

    const dimensionTypes = dimensionTypesResponse.reduce(
      (acc, item) => {
        acc[item.id] = item.name.localized.en_US;

        return acc;
      },
      {} as Record<string, string>
    );

    return dimensionTypes;
  }

  if (type === 'STAFF_COUNT_RANGE') {
    const staffCountRanges = statistics?.elements.reduce(
      (acc, item) => {
        acc[item.dimension.value.staffRangeCount] = humanizeNameTitle(
          item.dimension.value.staffRangeCount
        );

        return acc;
      },
      {} as Record<string, string>
    );

    return staffCountRanges || {};
  }

  if (['REGION_GEO', 'COUNTRY_GEO'].includes(type)) {
    const geoIds =
      statistics?.elements.map((item) => {
        return item.dimension.value.urn.replace('urn:li:geo:', '');
      }) || [];

    const geosResponse = await linkedInOrganizationsApiClient<Record<string, TLinkedInGeo>>({
      token,
      headers: {
        'X-Restli-Protocol-Version': '2.0.0',
      },
      path: `dmaGeo?ids=List(${geoIds.join(',')})`,
      object: 'results',
      method: 'GET',
    });

    const geoNames: Record<string, string> = {};

    Object.keys(geosResponse).forEach((geo) => {
      geoNames[geo] = geosResponse[geo].defaultLocalizedName.value;
    });

    return geoNames;
  }

  return {};
};
