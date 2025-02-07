import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ESIGNATURE_APP_NAME, GetAccountIdConfig } from '../constants';

export const eSignatureEnvelopeStatusUpdatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ESIGNATURE_APP_NAME,
  action: 'envelope_status_updated',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: {
    accountId: { ...GetAccountIdConfig, required: true, type: 'softstring' },
  },
  webhook_register: async (context, url) => {
    const token = context?.conn_opts?.token;
    const base_uri = context?.conn_opts?.base_uri;
    const accountId = context?.opts?.accountId;

    const missingOptions = [];

    if (!token) missingOptions.push('token');
    if (!base_uri) missingOptions.push('base_uri');
    if (!accountId) missingOptions.push('accountId');

    if (missingOptions.length > 0) {
      throw new Error(
        `The following options are required to register Esignature envelope` +
          ` status update webhook: ${missingOptions.join(', ')}`
      );
    }

    const { data } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          name: 'Envelope Status Updated Webhook created by Qorus',
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
          envelopeEvents: ['Sent', 'Delivered', 'Signed', 'Completed', 'Declined', 'Voided'],
          events: [
            'envelope-resent',
            'envelope-corrected',
            'envelope-purge',
            'envelope-deleted',
            'envelope-discard',
            'envelope-created',
            'envelope-removed',
          ],
        },
        path: `/restapi/v2.1/accounts/${accountId}/connect`,
      },
      {
        url: `https://${base_uri}`,
        endpointId: 'Docusign',
      }
    );

    return { webhook: data };
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const token = context?.conn_opts?.token;
    const base_uri = context?.conn_opts?.base_uri;
    const accountId = context?.opts?.accountId;

    const missingOptions = [];

    if (!token) missingOptions.push('token');
    if (!base_uri) missingOptions.push('base_uri');
    if (!accountId) missingOptions.push('accountId');

    if (missingOptions.length > 0) {
      throw new Error(
        `The following options are required to de-register Esignature envelope` +
          ` status update webhook: ${missingOptions.join(', ')}`
      );
    }

    const { webhook } = regInfo;

    await QorusRequest.deleteReq<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/restapi/v2.1/accounts/${accountId}/connect/${webhook.connectId}`,
      },
      {
        url: `https://${base_uri}`,
        endpointId: 'Docusign',
      }
    );
  },
  get_example_event_data: () => ({
    event: 'envelope-created',
    apiVersion: 'v2.1',
    uri: '/restapi/v2.1/accounts/00000000-0000-0000-0000-000000000000/envelopes/11111111-1111-1111-1111-111111111111',
    retryCount: 0,
    configurationId: 12345678,
    generatedDateTime: '2025-01-01T00:00:00.0000000Z',
    data: {
      accountId: '00000000-0000-0000-0000-000000000000',
      userId: '22222222-2222-2222-2222-222222222222',
      envelopeId: '11111111-1111-1111-1111-111111111111',
      envelopeSummary: {
        status: 'sent',
        documentsUri: '/envelopes/11111111-1111-1111-1111-111111111111/documents',
        recipientsUri: '/envelopes/11111111-1111-1111-1111-111111111111/recipients',
        attachmentsUri: '/envelopes/11111111-1111-1111-1111-111111111111/attachments',
        envelopeUri: '/envelopes/11111111-1111-1111-1111-111111111111',
        emailSubject: 'Please sign the attached document',
        envelopeId: '11111111-1111-1111-1111-111111111111',
        signingLocation: 'online',
        customFieldsUri: '/envelopes/11111111-1111-1111-1111-111111111111/custom_fields',
        notificationUri: '/envelopes/11111111-1111-1111-1111-111111111111/notification',
        enableWetSign: 'true',
        allowMarkup: 'false',
        allowReassign: 'true',
        createdDateTime: '2025-01-01T00:00:00.000Z',
        lastModifiedDateTime: '2025-01-01T00:00:10.000Z',
        initialSentDateTime: '2025-01-01T00:00:20.000Z',
        sentDateTime: '2025-01-01T00:00:20.000Z',
        statusChangedDateTime: '2025-01-01T00:00:20.000Z',
        documentsCombinedUri: '/envelopes/11111111-1111-1111-1111-111111111111/documents/combined',
        certificateUri: '/envelopes/11111111-1111-1111-1111-111111111111/documents/certificate',
        templatesUri: '/envelopes/11111111-1111-1111-1111-111111111111/templates',
        expireEnabled: 'true',
        expireDateTime: '2025-04-01T00:00:20.000Z',
        expireAfter: '120',
        sender: {
          userName: 'John Doe',
          userId: '22222222-2222-2222-2222-222222222222',
          accountId: '00000000-0000-0000-0000-000000000000',
          email: 'john.doe@example.com',
          ipAddress: '203.0.113.42',
        },
        purgeState: 'unpurged',
        envelopeIdStamping: 'true',
        is21CFRPart11: 'false',
        signerCanSignOnMobile: 'true',
        autoNavigation: 'true',
        isSignatureProviderEnvelope: 'false',
        hasFormDataChanged: 'false',
        allowComments: 'true',
        hasComments: 'false',
        allowViewHistory: 'true',
        disableResponsiveDocument: 'false',
        envelopeMetadata: {
          allowAdvancedCorrect: 'true',
          enableSignWithNotary: 'false',
          allowCorrect: 'true',
        },
        anySigner: null,
        envelopeLocation: 'current_site',
        isDynamicEnvelope: 'false',
        burnDefaultTabData: 'false',
      },
    },
  }),
  event_info: {
    desc: 'Envelope Status Updated Event Data',
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
              envelopeId: { type: 'string' },
              envelopeSummary: {
                type: {
                  type: 'hash',
                  fields: {
                    status: { type: 'string' },
                    documentsUri: { type: 'string' },
                    recipientsUri: { type: 'string' },
                    attachmentsUri: { type: 'string' },
                    envelopeUri: { type: 'string' },
                    emailSubject: { type: 'string' },
                    envelopeId: { type: 'string' },
                    signingLocation: { type: 'string' },
                    customFieldsUri: { type: 'string' },
                    notificationUri: { type: 'string' },
                    enableWetSign: { type: 'string' },
                    allowMarkup: { type: 'string' },
                    allowReassign: { type: 'string' },
                    createdDateTime: { type: 'string' },
                    lastModifiedDateTime: { type: 'string' },
                    initialSentDateTime: { type: 'string' },
                    sentDateTime: { type: 'string' },
                    statusChangedDateTime: { type: 'string' },
                    documentsCombinedUri: { type: 'string' },
                    certificateUri: { type: 'string' },
                    templatesUri: { type: 'string' },
                    expireEnabled: { type: 'string' },
                    expireDateTime: { type: 'string' },
                    expireAfter: { type: 'string' },
                    sender: {
                      type: {
                        type: 'hash',
                        fields: {
                          userName: { type: 'string' },
                          userId: { type: 'string' },
                          accountId: { type: 'string' },
                          email: { type: 'string' },
                          ipAddress: { type: 'string' },
                        },
                      },
                    },
                    purgeState: { type: 'string' },
                    envelopeIdStamping: { type: 'string' },
                    is21CFRPart11: { type: 'string' },
                    signerCanSignOnMobile: { type: 'string' },
                    autoNavigation: { type: 'string' },
                    isSignatureProviderEnvelope: { type: 'string' },
                    hasFormDataChanged: { type: 'string' },
                    allowComments: { type: 'string' },
                    hasComments: { type: 'string' },
                    allowViewHistory: { type: 'string' },
                    disableResponsiveDocument: { type: 'string' },
                    envelopeMetadata: {
                      type: {
                        type: 'hash',
                        fields: {
                          allowAdvancedCorrect: { type: 'string' },
                          enableSignWithNotary: { type: 'string' },
                          allowCorrect: { type: 'string' },
                        },
                      },
                    },
                    anySigner: { type: 'string' },
                    envelopeLocation: { type: 'string' },
                    isDynamicEnvelope: { type: 'string' },
                    burnDefaultTabData: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default eSignatureEnvelopeStatusUpdatedTrigger;
