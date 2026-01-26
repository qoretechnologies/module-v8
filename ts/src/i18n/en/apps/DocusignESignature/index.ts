const DocusignESignatureAppEn = {
  displayName: 'Docusign eSignature',
  groups: ['Document Signing & Contracts'],
  shortDesc: 'Collection of actions to interact with the Docusign eSignature API',
  longDesc: 'Collection of actions to interact with the Docusign eSignature API',
  actions: {
    Brands_GetBrands: {
      displayName: 'Get Brands',
      groups: ['Brands'],
    },
    Brands_PostBrands: {
      displayName: 'Create Brand',
      groups: ['Brands'],
    },
    Brands_DeleteBrands: {
      displayName: 'Delete Brand',
      groups: ['Brands'],
    },
    Envelopes_GetEnvelopes: {
      displayName: 'Get Envelopes',
      groups: ['Envelopes'],
    },
    Envelopes_PostEnvelopes: {
      displayName: 'Create Envelopes',
      groups: ['Envelopes'],
    },
    Envelopes_GetEnvelope: {
      displayName: 'Get Envelope',
      groups: ['Envelopes'],
    },
    Envelopes_PutEnvelope: {
      displayName: 'Update Envelope',
      groups: ['Envelopes'],
    },
    Documents_GetDocuments: {
      displayName: 'Get Documents',
      groups: ['Documents'],
    },
    Documents_PutDocuments: {
      displayName: 'Update Documents',
      groups: ['Documents'],
    },
    Documents_DeleteDocuments: {
      displayName: 'Delete Documents',
      groups: ['Documents'],
    },
    Documents_GetDocument: {
      displayName: 'Get Document',
      groups: ['Documents'],
    },
    Documents_PutDocument: {
      displayName: 'Update Document',
      groups: ['Documents'],
    },
    Recipients_GetRecipients: {
      displayName: 'Get Recipients',
      groups: ['Recipients'],
    },
    Recipients_PutRecipients: {
      displayName: 'Update Recipients',
      groups: ['Recipients'],
    },
    Recipients_PostRecipients: {
      displayName: 'Add Recipients',
      groups: ['Recipients'],
    },
    Recipients_DeleteRecipients: {
      displayName: 'Delete Recipients',
      groups: ['Recipients'],
    },
    Views_PostEnvelopeRecipientView: {
      displayName: 'Create Recipient View',
      groups: ['Views'],
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
