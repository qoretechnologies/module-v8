import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { formatDateReadable, getQoreContextRequiredValues } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { linkedInOrganizationsApiClient } from './constants';

type LinkedInOrganizationPost = {
  id: string;
  visibility: string;
  commentary: string;
  publishedAt: number;
};

const mapLinkedInPostToAllowedValue =
  (field: 'id') =>
  (item: LinkedInOrganizationPost): IQoreAllowedValue<string> => {
    const title =
      item.commentary?.length > 50 ? item.commentary.substring(0, 50) + '...' : item.commentary;

    return {
      value: item[field],
      display_name: title || 'No Title',
      desc:
        `Visibility: ${item.visibility}\n` +
        `Published At: ${formatDateReadable(new Date(item.publishedAt).toISOString())}`,
    };
  };

export const createGetLinkedInOrganizationPostAllowedValuesFunction =
  (field: 'id'): TQoreGetAllowedValuesFunction<TCustomConnOptions, string> =>
  async (context) => {
    const { token, organization } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['organization'],
    });

    try {
      const posts = await linkedInOrganizationsApiClient<{
        elements: Array<{ id: string }>;
        metadata: {
          paginationCursorMetdata: {
            nextPaginationCursor: string;
          };
        };
      }>({
        token,
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
        path:
          `dmaFeedContentsExternal?q=postsByAuthor` +
          `&author=urn%3Ali%3Aorganization%3A${organization}` +
          `&maxPaginationCount=100`,
        method: 'GET',
      });

      const postIds = posts.elements.map((post) => encodeURIComponent(post.id));

      const postData = await linkedInOrganizationsApiClient<{
        results: Record<string, any>;
      }>({
        token,
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
        path: `dmaPosts?ids=List(${postIds.join(',')})`,
        method: 'GET',
      });

      return Object.keys(postData.results).map((key) =>
        mapLinkedInPostToAllowedValue(field)(postData.results[key])
      );
    } catch (error) {
      Debugger.log(`Error fetching LinkedIn organization allowed values`, error);

      return [];
    }
  };

export const getLinkedInOrganizationPostIdAllowedValues =
  createGetLinkedInOrganizationPostAllowedValuesFunction('id');
