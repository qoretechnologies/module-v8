import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreMappedOptions,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CONTACTS_APP_NAME, GoogleContactsError } from '../constants';
import { createGooglePeopleClient } from '../helpers/constants';
import { people_v1 } from '@googleapis/people';

const options = {
  first_name: {
    type: 'string',
    required: true,
  },
  middle_name: {
    type: 'string',
    required: false,
    preselected: true,
  },
  last_name: {
    type: 'string',
    required: true,
  },
  name_prefix: {
    type: 'string',
    required: false,
  },
  name_suffix: {
    type: 'string',
    required: false,
  },
  job_title: {
    type: 'string',
    required: false,
  },
  company: {
    type: 'string',
    required: false,
  },
  email: {
    type: 'string',
    required: false,
    preselected: true,
  },
  email_type: {
    type: 'string',
    required: false,
    default_value: 'other',
    allowed_values: [
      { value: 'home', display_name: 'Home' },
      { value: 'work', display_name: 'Work' },
      { value: 'other', display_name: 'Other' },
    ],
    preselected: true,
  },
  phone_number: {
    type: 'string',
    required: false,
  },
  phone_type: {
    type: 'string',
    required: false,
    default_value: 'other',
    allowed_values: [
      { value: 'home', display_name: 'Home' },
      { value: 'work', display_name: 'Work' },
      { value: 'mobile', display_name: 'Mobile' },
      { value: 'main', display_name: 'Main' },
      { value: 'homeFax', display_name: 'Home Fax' },
      { value: 'workFax', display_name: 'Work Fax' },
      { value: 'pager', display_name: 'Pager' },
      { value: 'other', display_name: 'Other' },
    ],
  },
  additional_phone_numbers: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          number: {
            type: 'string',
            required: true,
          },
          type: {
            type: 'string',
            required: false,
            default_value: 'other',
            allowed_values: [
              { value: 'home', display_name: 'Home' },
              { value: 'work', display_name: 'Work' },
              { value: 'mobile', display_name: 'Mobile' },
              { value: 'main', display_name: 'Main' },
              { value: 'homeFax', display_name: 'Home Fax' },
              { value: 'workFax', display_name: 'Work Fax' },
              { value: 'pager', display_name: 'Pager' },
              { value: 'other', display_name: 'Other' },
            ],
          },
        },
      },
    },
    required: false,
  },
  address: {
    type: {
      type: 'hash',
      fields: {
        street: {
          type: 'string',
          required: false,
        },
        po_box: {
          type: 'string',
          required: false,
        },
        neighbourhood: {
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
        zip: {
          type: 'string',
          required: false,
        },
        country: {
          type: 'string',
          required: false,
        },
        type: {
          type: 'string',
          required: false,
          default_value: 'other',
          allowed_values: [
            { value: 'home', display_name: 'Home' },
            { value: 'work', display_name: 'Work' },
            { value: 'other', display_name: 'Other' },
          ],
        },
      },
    },
    required: false,
  },
  birthday: {
    type: 'date',
    required: false,
  },
  url: {
    type: 'string',
    required: false,
  },
  related_person: {
    type: 'string',
    required: false,
  },
  relationship_type: {
    type: 'string',
    required: false,
    default_value: 'other',
    allowed_values: [
      { value: 'spouse', display_name: 'Spouse' },
      { value: 'child', display_name: 'Child' },
      { value: 'mother', display_name: 'Mother' },
      { value: 'father', display_name: 'Father' },
      { value: 'parent', display_name: 'Parent' },
      { value: 'brother', display_name: 'Brother' },
      { value: 'sister', display_name: 'Sister' },
      { value: 'friend', display_name: 'Friend' },
      { value: 'relative', display_name: 'Relative' },
      { value: 'domesticPartner', display_name: 'Domestic Partner' },
      { value: 'manager', display_name: 'Manager' },
      { value: 'assistant', display_name: 'Assistant' },
      { value: 'referredBy', display_name: 'Referred By' },
      { value: 'partner', display_name: 'Partner' },
      { value: 'other', display_name: 'Other' },
    ],
  },
  custom_fields: {
    type: 'hash',
    required: false,
  },
  notes: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const createContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CONTACTS_APP_NAME,
  action: 'create_contact',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues<
      TQoreMappedOptions<typeof options> & { token: string }
    >({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GoogleContactsError,
    });

    const contactData = obj || {};

    try {
      const client = createGooglePeopleClient(token);

      const person: people_v1.Schema$Person = {};

      if (
        contactData.first_name ||
        contactData.last_name ||
        contactData.middle_name ||
        contactData.name_prefix ||
        contactData.name_suffix
      ) {
        person.names = [
          {
            ...(contactData.first_name && { givenName: contactData.first_name }),
            ...(contactData.last_name && { familyName: contactData.last_name }),
            ...(contactData.middle_name && { middleName: contactData.middle_name }),
            ...(contactData.name_prefix && { honorificPrefix: contactData.name_prefix }),
            ...(contactData.name_suffix && { honorificSuffix: contactData.name_suffix }),
          },
        ];
      }

      if (contactData.email) {
        person.emailAddresses = [
          {
            value: contactData.email,
            type: contactData.email_type || 'other',
          },
        ];
      }

      const phoneNumbers = [];
      if (contactData.phone_number) {
        phoneNumbers.push({
          value: contactData.phone_number,
          type: contactData.phone_type || 'other',
        });
      }

      if (contactData.additional_phone_numbers) {
        contactData.additional_phone_numbers.forEach((phone) => {
          phoneNumbers.push({
            value: phone.number,
            type: phone.type || 'other',
          });
        });
      }

      if (phoneNumbers.length > 0) {
        person.phoneNumbers = phoneNumbers;
      }

      if (contactData.job_title || contactData.company) {
        person.organizations = [
          {
            ...(contactData.company && { name: contactData.company }),
            ...(contactData.job_title && { title: contactData.job_title }),
            type: 'work',
          },
        ];
      }

      if (
        contactData.address &&
        Object.keys(contactData.address).some(
          (key) => contactData.address?.[key as keyof typeof contactData.address]
        )
      ) {
        const addr = contactData.address;
        person.addresses = [
          {
            ...(addr.street && { streetAddress: addr.street }),
            ...(addr.po_box && { poBox: addr.po_box }),
            ...(addr.neighbourhood && { extendedAddress: addr.neighbourhood }),
            ...(addr.city && { city: addr.city }),
            ...(addr.state && { region: addr.state }),
            ...(addr.zip && { postalCode: addr.zip }),
            ...(addr.country && { country: addr.country }),
            type: addr.type || 'other',
          },
        ];
      }

      if (contactData.birthday) {
        const date = new Date(contactData.birthday);
        person.birthdays = [
          {
            date: {
              year: date.getFullYear(),
              month: date.getMonth() + 1,
              day: date.getDate(),
            },
          },
        ];
      }

      if (contactData.url) {
        person.urls = [
          {
            value: contactData.url,
            type: 'other',
          },
        ];
      }

      if (contactData.related_person) {
        person.relations = [
          {
            person: contactData.related_person,
            type: contactData.relationship_type || 'other',
          },
        ];
      }

      if (contactData.custom_fields && Object.keys(contactData.custom_fields).length > 0) {
        person.userDefined = Object.entries(contactData.custom_fields).map(([key, value]) => ({
          key,
          value: String(value),
        }));
      }

      if (contactData.notes) {
        person.biographies = [
          {
            value: contactData.notes,
            contentType: 'TEXT_PLAIN',
          },
        ];
      }

      const response = await client.people.createContact({
        requestBody: person,
      });

      const createdContact = response.data;
      const primaryName = createdContact.names?.[0];
      const displayName =
        primaryName?.displayName ||
        `${primaryName?.givenName || ''} ${primaryName?.familyName || ''}`.trim() ||
        'Unnamed Contact';

      return {
        resourceName: createdContact.resourceName,
        etag: createdContact.etag,
        displayName,
        firstName: primaryName?.givenName,
        lastName: primaryName?.familyName,
        email: createdContact.emailAddresses?.[0]?.value,
        phone: createdContact.phoneNumbers?.[0]?.value,
        company: createdContact.organizations?.[0]?.name,
        jobTitle: createdContact.organizations?.[0]?.title,
      };
    } catch (error) {
      throw new GoogleContactsError(`Failed to create contact: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      resourceName: { type: 'string' },
      etag: { type: 'string' },
      displayName: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      company: { type: 'string' },
      jobTitle: { type: 'string' },
    },
  } satisfies TQoreResponseType,
});

export default createContact;
