const DocusignESignatureAppEn = {
  displayName: 'Docusign eSignature',
  groups: ['Document Signing & Contracts'],
  shortDesc: 'Collection of actions to interact with the Docusign eSignature API',
  longDesc: 'Collection of actions to interact with the Docusign eSignature API',
  actions: {
    Brands_GetBrands: {
      displayName: 'Get brands',
      groups: ['Brands'],
    },
    Brands_PostBrands: {
      displayName: 'Create brand',
      groups: ['Brands'],
    },
    Brands_DeleteBrands: {
      displayName: 'Delete brand',
      groups: ['Brands'],
    },
    Envelopes_GetEnvelopes: {
      displayName: 'Get envelopes',
      groups: ['Envelopes'],
    },
    Envelopes_PostEnvelopes: {
      displayName: 'Create envelopes',
      groups: ['Envelopes'],
    },
    Envelopes_GetEnvelope: {
      displayName: 'Get envelope',
      groups: ['Envelopes'],
    },
    Envelopes_PutEnvelope: {
      displayName: 'Update envelope',
      groups: ['Envelopes'],
    },
    Documents_GetDocuments: {
      displayName: 'Get documents',
      groups: ['Documents'],
    },
    Documents_PutDocuments: {
      displayName: 'Update documents',
      groups: ['Documents'],
    },
    Documents_DeleteDocuments: {
      displayName: 'Delete documents',
      groups: ['Documents'],
    },
    Documents_GetDocument: {
      displayName: 'Get document',
      groups: ['Documents'],
    },
    Documents_PutDocument: {
      displayName: 'Update document',
      groups: ['Documents'],
    },
    Recipients_GetRecipients: {
      displayName: 'Get recipients',
      groups: ['Recipients'],
    },
    Recipients_PutRecipients: {
      displayName: 'Update recipients',
      groups: ['Recipients'],
    },
    Recipients_PostRecipients: {
      displayName: 'Add recipients',
      groups: ['Recipients'],
    },
    Recipients_DeleteRecipients: {
      displayName: 'Delete recipients',
      groups: ['Recipients'],
    },
    Views_PostEnvelopeRecipientView: {
      displayName: 'Create recipient view',
      groups: ['Views'],
    },
  },
  triggers: {
    envelope_status_updated: {
      displayName: 'Envelope status updated',
      shortDesc: `Triggers whenever a DocuSign envelope's status or properties are updated, including events like it being sent, delivered, signed, completed, declined, voided, corrected, purged, or deleted.`,
      longDesc:
        'This trigger activates whenever there’s a change in a DocuSign envelope’s lifecycle. It listens for a variety of updates, such as when an envelope is sent to recipients, delivered, signed, completed, or declined. It also includes administrative events like envelopes being resent, corrected, purged, deleted, discarded, newly created, or removed. By setting up this trigger, you can stay informed of envelope progress and status changes, enabling timely follow-ups, record-keeping, or other automated actions in your workflow.',
      options: {
        accountId: {
          displayName: 'Default account ID',
          shortDesc: 'The default account ID set when the connection is authorized',
          longDesc: 'The default account ID set when the connection is authorized',
        },
      },
      event_info: {
        desc: 'DocuSign envelope status update event data',
      },
    },
    template_updated: {
      displayName: 'Template updated',
      shortDesc: `Triggers whenever a new DocuSign template is created, updated or deleted, allowing you to take immediate action in response to the new template.`,
      options: {
        accountId: {
          displayName: 'Default account ID',
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
