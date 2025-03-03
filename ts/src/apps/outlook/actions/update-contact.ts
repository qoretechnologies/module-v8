import { Client } from '@microsoft/microsoft-graph-client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME } from '../constants';
import { getOutlookContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';

const options = {
  contactId: {
    type: 'string',
    get_allowed_values: getOutlookContactIdAllowedValues,
    required: true,
  },
  givenName: {
    type: 'string',
    required: false,
  },
  surname: {
    type: 'string',
    required: false,
  },
  emailAddresses: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          address: {
            type: 'string',
            required: true,
          },
          name: {
            type: 'string',
            required: false,
          },
        },
      },
    },
  },
  businessPhones: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'string',
      },
    },
  },
  mobilePhone: {
    type: 'string',
    required: false,
  },
  jobTitle: {
    type: 'string',
    required: false,
  },
  companyName: {
    type: 'string',
    required: false,
  },
  department: {
    type: 'string',
    required: false,
  },
  officeLocation: {
    type: 'string',
    required: false,
  },
  businessAddress: {
    type: {
      type: 'hash',
      fields: {
        street: {
          type: 'string',
          required: false,
        },
        city: {
          type: 'string',
          required: false,
        },
        state: {
          type: 'string',
          required: false,
        },
        countryOrRegion: {
          type: 'string',
          required: false,
        },
        postalCode: {
          type: 'string',
          required: false,
        },
      },
    },
    required: false,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    displayName: { type: 'string' },
    givenName: { type: 'string' },
    surname: { type: 'string' },
    emailAddresses: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            address: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
    businessPhones: {
      type: {
        type: 'list',
        element_type: { type: 'string' },
      },
    },
    mobilePhone: { type: 'string' },
    jobTitle: { type: 'string' },
    companyName: { type: 'string' },
    department: { type: 'string' },
    officeLocation: { type: 'string' },
    businessAddress: {
      type: {
        type: 'hash',
        fields: {
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          countryOrRegion: { type: 'string' },
          postalCode: { type: 'string' },
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const UpdateOutlookContact = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'update-contact',
  app: OUTLOOK_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const contactId = data?.contactId;
    const givenName = data?.givenName;
    const surname = data?.surname;
    const emailAddresses = data?.emailAddresses;
    const businessPhones = data?.businessPhones;
    const mobilePhone = data?.mobilePhone;
    const jobTitle = data?.jobTitle;
    const companyName = data?.companyName;
    const department = data?.department;
    const officeLocation = data?.officeLocation;
    const businessAddress = data?.businessAddress;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!contactId) missingValues.push('contactId');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to update Outlook contact`
      );
    }

    const hasUpdates =
      givenName !== undefined ||
      surname !== undefined ||
      emailAddresses !== undefined ||
      businessPhones !== undefined ||
      mobilePhone !== undefined ||
      jobTitle !== undefined ||
      companyName !== undefined ||
      department !== undefined ||
      officeLocation !== undefined ||
      businessAddress !== undefined;

    if (!hasUpdates) {
      throw new Error('At least one field to update must be provided');
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    const formattedEmailAddresses = emailAddresses
      ? (emailAddresses as { address: string; name?: string }[]).map((email) => ({
          address: email.address,
          name: email.name || `${givenName || ''} ${surname || ''}`.trim(),
        }))
      : undefined;

    const updateInput = {
      ...(givenName !== undefined && { givenName }),
      ...(surname !== undefined && { surname }),
      ...(formattedEmailAddresses !== undefined && { emailAddresses: formattedEmailAddresses }),
      ...(businessPhones !== undefined && { businessPhones }),
      ...(mobilePhone !== undefined && { mobilePhone }),
      ...(jobTitle !== undefined && { jobTitle }),
      ...(companyName !== undefined && { companyName }),
      ...(department !== undefined && { department }),
      ...(officeLocation !== undefined && { officeLocation }),
      ...(businessAddress !== undefined && { businessAddress }),
    };

    try {
      await client.api(`/me/contacts/${contactId}`).patch(updateInput);

      const updatedContact = await client.api(`/me/contacts/${contactId}`).get();

      return updatedContact;
    } catch (error) {
      throw new Error(`Failed to update Outlook contact: ${error.message}`);
    }
  },
  options,
  response_type,
});
