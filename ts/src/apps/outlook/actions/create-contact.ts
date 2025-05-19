import { Client } from '@microsoft/microsoft-graph-client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME } from '../constants';

const options = {
  givenName: {
    type: 'string',
    required: true,
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
    '@odata.context': { type: 'string' },
    '@odata.etag': { type: 'string' },
    id: { type: 'string' },
    createdDateTime: { type: 'string' },
    lastModifiedDateTime: { type: 'string' },
    changeKey: { type: 'string' },
    categories: {
      type: {
        type: 'list',
        element_type: {
          type: 'string',
        },
      },
    },
    parentFolderId: { type: 'string' },
    birthday: { type: 'string' },
    fileAs: { type: 'string' },
    displayName: { type: 'string' },
    givenName: { type: 'string' },
    initials: { type: 'string' },
    middleName: { type: 'string' },
    nickName: { type: 'string' },
    surname: { type: 'string' },
    title: { type: 'string' },
    yomiGivenName: { type: 'string' },
    yomiSurname: { type: 'string' },
    yomiCompanyName: { type: 'string' },
    generation: { type: 'string' },
    imAddresses: {
      type: {
        type: 'list',
        element_type: {
          type: 'string',
        },
      },
    },
    jobTitle: { type: 'string' },
    companyName: { type: 'string' },
    department: { type: 'string' },
    officeLocation: { type: 'string' },
    profession: { type: 'string' },
    businessHomePage: { type: 'string' },
    assistantName: { type: 'string' },
    manager: { type: 'string' },
    homePhones: {
      type: {
        type: 'list',
        element_type: {
          type: 'string',
        },
      },
    },
    mobilePhone: { type: 'string' },
    businessPhones: {
      type: {
        type: 'list',
        element_type: {
          type: 'string',
        },
      },
    },
    spouseName: { type: 'string' },
    personalNotes: { type: 'string' },
    children: {
      type: {
        type: 'list',
        element_type: {
          type: 'string',
        },
      },
    },
    emailAddresses: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            name: { type: 'string' },
            address: { type: 'string' },
          },
        },
      },
    },
    homeAddress: { type: 'hash' },
    businessAddress: { type: 'hash' },
    otherAddress: { type: 'hash' },
  },
} satisfies TQoreResponseType;

export const CreateOutlookContact = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'create-contact',
  app: OUTLOOK_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
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
    if (!givenName) missingValues.push('givenName');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to create Outlook contact`
      );
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    const formattedEmailAddresses = emailAddresses
      ? emailAddresses.map((email) => ({
          address: email.address,
          name: email.name || `${givenName} ${surname || ''}`.trim(),
        }))
      : undefined;

    const itemInput: Record<string, any> = {
      givenName,
      surname,
      ...(formattedEmailAddresses && { emailAddresses: formattedEmailAddresses }),
      ...(mobilePhone && { mobilePhone }),
      ...(jobTitle && { jobTitle }),
      ...(companyName && { companyName }),
      ...(department && { department }),
      ...(officeLocation && { officeLocation }),
      ...(businessPhones ? { businessPhones } : {}),
      ...(businessAddress ? { businessAddress } : {}),
    };

    Object.keys(itemInput).forEach((key) => {
      if (itemInput[key] === undefined) {
        delete itemInput[key];
      }
    });

    try {
      const result = await client.api('/me/contacts').post(itemInput);

      return result;
    } catch (error) {
      throw new Error(`Failed to create Outlook contact: ${error.message}`);
    }
  },
  options,
  response_type,
});
