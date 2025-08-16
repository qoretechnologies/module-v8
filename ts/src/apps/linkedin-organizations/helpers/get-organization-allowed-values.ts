import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { linkedInOrganizationsApiClient } from './constants';

type LinkedInOrganization = {
  id: string;
  organizationalPage: string;
  localizedDescription: string;
  localizedName: string;
  logoV2: {
    cropped: {
      downloadUrl: string;
    };
  };
};

const mapLinkedInOrganizationToAllowedValue =
  (field: 'id' | 'organizationalPage') =>
  (item: LinkedInOrganization): IQoreAllowedValue<string> => {
    return {
      value: item[field],
      display_name: item.localizedName,
      ...(item.localizedDescription && { description: item.localizedDescription }),
      ...(item.logoV2?.cropped?.downloadUrl && { image: item.logoV2.cropped.downloadUrl }),
    };
  };

export const createGetLinkedInOrganizationAllowedValuesFunction =
  (field: 'id' | 'organizationalPage'): TQoreGetAllowedValuesFunction<TCustomConnOptions, string> =>
  async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
    });

    try {
      const organizations = await linkedInOrganizationsApiClient<
        {
          key: {
            organization: string;
          };
        }[]
      >({
        token,
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
        path: `dmaOrganizationAcls?q=roleAssignee&state=(value:APPROVED)&start=0&count=100`,
        object: 'elements',
        method: 'GET',
      });

      const organizationIds = [
        ...new Set(
          organizations.map((org) => org.key.organization.replace('urn:li:organization:', ''))
        ),
      ];

      const response = await linkedInOrganizationsApiClient<{
        results: Record<string, any>;
      }>({
        token,
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
        path: `dmaOrganizations?ids=List(${organizationIds.join(',')})`,
        method: 'GET',
      });

      return Object.keys(response.results).map((key) =>
        mapLinkedInOrganizationToAllowedValue(field)(response.results[key])
      );
    } catch (error) {
      Debugger.log(`Error fetching LinkedIn organization allowed values`, error);

      return [];
    }
  };

export const getLinkedInOrganizationIdAllowedValues =
  createGetLinkedInOrganizationAllowedValuesFunction('id');

export const getLinkedInOrganizationPageAllowedValues =
  createGetLinkedInOrganizationAllowedValuesFunction('organizationalPage');
