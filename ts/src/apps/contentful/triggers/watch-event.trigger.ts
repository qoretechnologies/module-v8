import { EQoreAppActionCode, QoreAppCreator, QorusRequest, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CONTENTFUL_APP_NAME, CONTENTFUL_API_URL, ContentfulError } from '../constants';
import { contentfulBaseOptions } from '../helpers/shared-options';

const action = 'watch_event';

const EVENT_TYPE_ALLOWED_VALUES = [
  { value: 'Entry.create', display_name: 'Entry Created' },
  { value: 'Entry.save', display_name: 'Entry Saved' },
  { value: 'Entry.auto_save', display_name: 'Entry Auto-Saved' },
  { value: 'Entry.archive', display_name: 'Entry Archived' },
  { value: 'Entry.unarchive', display_name: 'Entry Unarchived' },
  { value: 'Entry.publish', display_name: 'Entry Published' },
  { value: 'Entry.unpublish', display_name: 'Entry Unpublished' },
  { value: 'Entry.delete', display_name: 'Entry Deleted' },
  { value: 'Asset.create', display_name: 'Asset Created' },
  { value: 'Asset.save', display_name: 'Asset Saved' },
  { value: 'Asset.auto_save', display_name: 'Asset Auto-Saved' },
  { value: 'Asset.archive', display_name: 'Asset Archived' },
  { value: 'Asset.unarchive', display_name: 'Asset Unarchived' },
  { value: 'Asset.publish', display_name: 'Asset Published' },
  { value: 'Asset.unpublish', display_name: 'Asset Unpublished' },
  { value: 'Asset.delete', display_name: 'Asset Deleted' },
  { value: 'ContentType.create', display_name: 'Content Type Created' },
  { value: 'ContentType.save', display_name: 'Content Type Saved' },
  { value: 'ContentType.publish', display_name: 'Content Type Published' },
  { value: 'ContentType.unpublish', display_name: 'Content Type Unpublished' },
  { value: 'ContentType.delete', display_name: 'Content Type Deleted' },
];

const options = {
  ...contentfulBaseOptions,
  event_types: {
    type: { type: 'list', element_type: 'string' },
    required: true,
    element_allowed_values: EVENT_TYPE_ALLOWED_VALUES,
  },
} satisfies TQoreOptions;

const WatchEvent = QoreAppCreator.createLocalizedTrigger({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  webhook_method: 'POST',

  webhook_register: async (context, url) => {
    const { access_token, space_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_token'],
      optionFields: ['space_id'],
      ErrorClass: ContentfulError,
    });

    const eventTypes = (context.opts?.event_types as string[]) || ['Entry.create'];

    try {
      const response = await QorusRequest.post<{ data: { sys: { id: string } } }>(
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: `Qore Webhook - ${eventTypes.join(', ')}`,
            url,
            topics: eventTypes.map((t) => `${t}.*`),
            filters: [],
          },
          path: `/spaces/${space_id}/webhook_definitions`,
        },
        { url: CONTENTFUL_API_URL, endpointId: CONTENTFUL_APP_NAME }
      );

      const webhookId = response?.data?.sys?.id;
      if (!webhookId) {
        throw new Error('No webhook ID returned');
      }

      return { webhook: { id: webhookId } };
    } catch (error) {
      throw new ContentfulError(`Failed to register webhook: ${error}`);
    }
  },

  webhook_deregister: async (context, _url, regInfo: { webhook: { id: string } }) => {
    const { access_token, space_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_token'],
      optionFields: ['space_id'],
      ErrorClass: ContentfulError,
    });

    const webhookId = regInfo?.webhook?.id;
    if (!webhookId) {
      throw new ContentfulError('Invalid webhook information for deregistration');
    }

    try {
      await QorusRequest.deleteReq<unknown>(
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          path: `/spaces/${space_id}/webhook_definitions/${webhookId}`,
        },
        { url: CONTENTFUL_API_URL, endpointId: CONTENTFUL_APP_NAME }
      );
    } catch (error) {
      throw new ContentfulError(`Failed to deregister webhook: ${error}`);
    }
  },

  get_example_event_data: async () => {
    return {
      sys: {
        type: 'Entry',
        id: 'example-entry-id',
        space: { sys: { id: 'example-space-id' } },
        environment: { sys: { id: 'master' } },
        contentType: { sys: { id: 'blogPost' } },
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      fields: {
        title: { 'en-US': 'Example Entry' },
        body: { 'en-US': 'This is an example entry body.' },
      },
    };
  },

  event_info: {
    desc: 'Contentful Webhook Event Info',
    type: {
      type: 'hash',
      fields: {
        sys: {
          type: 'hash',
          short_desc: 'System metadata of the affected resource',
        },
        fields: {
          type: 'hash',
          short_desc: 'Resource fields (locale-wrapped)',
        },
      },
    },
  },
});

export default WatchEvent;
