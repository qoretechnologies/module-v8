import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { FacebookAdsApi, Page } from 'facebook-nodejs-business-sdk';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FACEBOOK_PAGES_APP_NAME, FacebookPagesError } from '../constants';
import { getFacebookPageIdAllowedValues } from '../helpers/get-page-id-allowed-values';
import { FacebookPageFieldsAllowedValues } from '../helpers/get-page-fields-allowed-values';

const options = {
  page_id: {
    required: true,
    type: 'string',
    get_allowed_values: getFacebookPageIdAllowedValues,
  },
  fields: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    default_value: ['id', 'name', 'category', 'about', 'website', 'phone', 'emails', 'fan_count'],
    element_allowed_values: FacebookPageFieldsAllowedValues,
  },
} satisfies TQoreOptions;

const getPage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FACEBOOK_PAGES_APP_NAME,
  action: 'get_page',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, page_id } = getQoreContextRequiredValues<{
      token: string;
      page_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['page_id'],
      connectionFields: ['token'],
      ErrorClass: FacebookPagesError,
    });

    const fields = obj?.fields || [
      'id',
      'name',
      'category',
      'about',
      'website',
      'phone',
      'emails',
      'fan_count',
    ];

    try {
      let fb = FacebookAdsApi.init(token);
      const page = new Page(page_id);

      const pageInfo = await page.read(['id', 'name', 'access_token']);

      fb = FacebookAdsApi.init(pageInfo._data.access_token);
      const pageWithToken = new Page(page_id, undefined, undefined, fb);

      const pageData = await pageWithToken.read(fields);

      if (!pageData || !pageData._data) {
        throw new FacebookPagesError(`Page with ID ${page_id} not found`);
      }

      const formattedPage: Record<string, any> = { ...pageData._data };

      if (pageData._data.location) {
        formattedPage.location = {
          street: pageData._data.location.street || '',
          city: pageData._data.location.city || '',
          state: pageData._data.location.state || '',
          country: pageData._data.location.country || '',
          zip: pageData._data.location.zip || '',
          latitude: pageData._data.location.latitude || null,
          longitude: pageData._data.location.longitude || null,
        };
      }

      if (pageData._data.hours) {
        formattedPage.hours = pageData._data.hours;
      }

      if (pageData._data.picture?.data?.url) {
        formattedPage.profile_picture_url = pageData._data.picture.data.url;
      }

      if (pageData._data.cover?.source) {
        formattedPage.cover_photo_url = pageData._data.cover.source;
      }

      if (pageData._data.engagement) {
        formattedPage.engagement_count = pageData._data.engagement.count || 0;
        formattedPage.engagement_social_sentence = pageData._data.engagement.social_sentence || '';
      }

      return {
        page_id,
        page_data: formattedPage,
        fields_requested: fields,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof FacebookPagesError) {
        throw error;
      }
      throw new FacebookPagesError(`Failed to get page: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      page_id: {
        type: 'string',
        display_name: 'Page ID',
        short_desc: 'The ID of the page',
      },
      page_data: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
            category: { type: 'string' },
            category_list: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
            about: { type: 'string' },
            description: { type: 'string' },
            website: { type: 'string' },
            phone: { type: 'string' },
            emails: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            fan_count: { type: 'integer' },
            followers_count: { type: 'integer' },
            checkins: { type: 'integer' },
            talking_about_count: { type: 'integer' },
            were_here_count: { type: 'integer' },
            link: { type: 'string' },
            username: { type: 'string' },
            verification_status: { type: 'string' },
            is_verified: { type: 'boolean' },
            is_published: { type: 'boolean' },
            profile_picture_url: { type: 'string' },
            cover_photo_url: { type: 'string' },
            location: {
              type: {
                type: 'hash',
                fields: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  country: { type: 'string' },
                  zip: { type: 'string' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                },
              },
            },
            hours: {
              type: {
                type: 'hash',
              },
            },
            parking: {
              type: {
                type: 'hash',
                fields: {
                  lot: { type: 'boolean' },
                  street: { type: 'boolean' },
                  valet: { type: 'boolean' },
                },
              },
            },
            payment_options: {
              type: {
                type: 'hash',
                fields: {
                  amex: { type: 'boolean' },
                  cash_only: { type: 'boolean' },
                  discover: { type: 'boolean' },
                  mastercard: { type: 'boolean' },
                  visa: { type: 'boolean' },
                },
              },
            },
            engagement_count: { type: 'integer' },
            engagement_social_sentence: { type: 'string' },
            overall_star_rating: { type: 'number' },
            rating_count: { type: 'integer' },
            single_line_address: { type: 'string' },
            store_location_descriptor: { type: 'string' },
            store_number: { type: 'integer' },
            founded: { type: 'string' },
            company_overview: { type: 'string' },
            mission: { type: 'string' },
            products: { type: 'string' },
            general_info: { type: 'string' },
            bio: { type: 'string' },
            awards: { type: 'string' },
            personal_info: { type: 'string' },
            personal_interests: { type: 'string' },
            members: { type: 'string' },
            built: { type: 'string' },
            features: { type: 'string' },
            mpg: { type: 'string' },
            network: { type: 'string' },
            new_like_count: { type: 'integer' },
            unread_message_count: { type: 'integer' },
            unread_notif_count: { type: 'integer' },
            unseen_message_count: { type: 'integer' },
          },
        },
        display_name: 'Page Data',
        short_desc: 'The complete page data with requested fields',
      },
      fields_requested: {
        type: {
          type: 'list',
          element_type: 'string',
        },
        display_name: 'Fields Requested',
        short_desc: 'The fields that were requested for the page',
      },
      generated_at: {
        type: 'string',
        display_name: 'Generated At',
        short_desc: 'When this response was generated',
      },
    },
  },
});

export default getPage;
