

const DocusignESignatureAppEn = {
  displayName: 'Docusign eSignature',
  shortDesc: 'Collection of actions to interact with the Docusign eSignature API',
  longDesc: 'Collection of actions to interact with the Docusign eSignature API',
  actions: {
    Brands_GetBrands: {
      displayName: 'Get Brands',
    },
    Brands_PostBrands: {
      displayName: 'Create Brand',
    },
    Brands_DeleteBrands: {
      displayName: 'Delete Brand',
    },
    Envelopes_GetEnvelopes: {
      displayName: 'Get Envelopes',
    },
    Envelopes_PostEnvelopes: {
      displayName: 'Create Envelopes',
    },
    Envelopes_GetEnvelope: {
      displayName: 'Get Envelope',
    },
    Envelopes_PutEnvelope: {
      displayName: 'Update Envelope',
    },
    Documents_GetDocuments: {
      displayName: 'Get Documents',
    },
    Documents_PutDocuments: {
      displayName: 'Update Documents',
    },
    Documents_DeleteDocuments: {
      displayName: 'Delete Documents',
    },
    Documents_GetDocument: {
      displayName: 'Get Document',
    },
    Documents_PutDocument: {
      displayName: 'Update Document',
    },
    Recipients_GetRecipients: {
      displayName: 'Get Recipients',
    },
    Recipients_PutRecipients: {
      displayName: 'Update Recipients',
    },
    Recipients_PostRecipients: {
      displayName: 'Add Recipients',
    },
    Recipients_DeleteRecipients: {
      displayName: 'Delete Recipients',
    },
    Views_PostEnvelopeRecipientView: {
      displayName: 'Create Recipient View',
    },
  },
  triggers: {
    envelope_status_updated: {
      displayName: 'Envelope Status Updated',
      shortDesc: `Triggers whenever a DocuSign envelope's status or properties are updated, including events like it being sent, delivered, signed, completed, declined, voided, corrected, purged, or deleted.`,
      longDesc:
        'This trigger activates whenever there’s a change in a DocuSign envelope’s lifecycle. It listens for a variety of updates, such as when an envelope is sent to recipients, delivered, signed, completed, or declined. It also includes administrative events like envelopes being resent, corrected, purged, deleted, discarded, newly created, or removed. By setting up this trigger, you can stay informed of envelope progress and status changes, enabling timely follow-ups, record-keeping, or other automated actions in your workflow.',
      options: {
        accountId: {
          displayName: 'Default Account ID',
          shortDesc: 'The default account ID set when the connection is authorized',
          longDesc: 'The default account ID set when the connection is authorized',
        },
      },
      event_info: {
        desc: 'DocuSign envelope status update event data',
      },
    },
    template_updated: {
      displayName: 'Template Updated',
      shortDesc: `Triggers whenever a new DocuSign template is created, updated or deleted, allowing you to take immediate action in response to the new template.`,
      options: {
        accountId: {
          displayName: 'Default Account ID',
          shortDesc: 'The default account ID set when the connection is authorized',
          longDesc: 'The default account ID set when the connection is authorized',
        },
      },
      event_info: {
        desc: 'DocuSign template update event data',
      },
    },
  },
};

export default DocusignESignatureAppEn;
