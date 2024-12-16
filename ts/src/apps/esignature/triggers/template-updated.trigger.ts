import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { GetAccountIdConfig } from '../constants';

export default {
  action: 'template_updated',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: {
    accountId: { ...GetAccountIdConfig, required: true, type: 'softstring' },
  },
  webhook_register: async (context, url) => {
    const {
      conn_opts: { token, base_url },
      opts: { accountId },
    } = context;

    const { data } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          name: 'Template Webhook created by Qorus',
          urlToPublishTo: url,
          allowEnvelopePublish: 'true',
          enableLog: 'true',
          includeDocuments: 'true',
          includeCertificateOfCompletion: 'true',
          requireAcknowledgment: 'true',
          eventData: {
            version: 'restv2.1',
          },
          allUsers: 'true',
          configurationType: 'custom',
          deliveryMode: 'SIM',
          events: ['template-created', 'template-deleted', 'template-modified'],
        },
        path: `/restapi/v2.1/accounts/${accountId}/connect`,
      },
      {
        url: base_url,
        endpointId: 'ESignature',
      }
    );

    return { webhook: data };
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const {
      conn_opts: { token, base_url },
      opts: { accountId },
    } = context;
    const { webhook } = regInfo;

    await QorusRequest.deleteReq<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/restapi/v2.1/accounts/${accountId}/connect/${webhook.connectId}`,
      },
      {
        url: base_url,
        endpointId: 'ESignature',
      }
    );
  },
  get_example_event_data: () => ({
    event: 'template-created',
    apiVersion: 'v2.1',
    uri: '/restapi/v2.1/accounts/00000000-0000-0000-0000-000000000000/templates/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    retryCount: 0,
    configurationId: 12345678,
    generatedDateTime: '2025-01-01T00:00:00.0000000Z',
    data: {
      accountId: '00000000-0000-0000-0000-000000000000',
      userId: '11111111-1111-1111-1111-111111111111',
      templateId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      name: 'My New Template',
      created: '2025-01-01T00:00:00.000Z',
    },
  }),
  event_info: {
    desc: 'Template Updated Event Data',
    type: {
      type: 'hash',
      fields: {
        event: { type: 'string' },
        apiVersion: { type: 'string' },
        uri: { type: 'string' },
        retryCount: { type: 'number' },
        configurationId: { type: 'number' },
        generatedDateTime: { type: 'string' },
        data: {
          type: {
            type: 'hash',
            fields: {
              accountId: { type: 'string' },
              userId: { type: 'string' },
              templateId: { type: 'string' },
              name: { type: 'string' },
              created: { type: 'string' },
            },
          },
        },
      },
    },
  },
} satisfies TQorePartialEventAction;
