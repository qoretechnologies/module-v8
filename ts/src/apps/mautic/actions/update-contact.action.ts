import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { MAUTIC_APP_NAME, MauticError } from '../constants';
import { mauticClient } from '../client';
import { getMauticContactsAllowedValues } from '../helpers';
import { MauticContactResponseType, TMauticContact } from '../response-types';

const action = 'update_contact';

const options = {
  contact: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticContactsAllowedValues,
  },
  email: {
    type: 'string',
    required: false,
    preselected: true,
  },
  firstname: {
    type: 'string',
    required: false,
    preselected: true,
  },
  lastname: {
    type: 'string',
    required: false,
    preselected: true,
  },
  phone: {
    type: 'string',
    required: false,
    preselected: true,
  },
  mobile: {
    type: 'string',
    required: false,
  },
  company: {
    type: 'string',
    required: false,
  },
  position: {
    type: 'string',
    required: false,
  },
  address1: {
    type: 'string',
    required: false,
  },
  address2: {
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
  zipcode: {
    type: 'string',
    required: false,
  },
  country: {
    type: 'string',
    required: false,
  },
  website: {
    type: 'string',
    required: false,
  },
  tags: {
    type: { type: 'list', element_type: 'string' },
    required: false,
  },
  custom_fields: {
    type: 'hash',
    required: false,
  },
} satisfies TQoreOptions;

const updateContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MAUTIC_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { instance_url, username, password, contact } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['instance_url', 'username', 'password'],
      optionFields: ['contact'],
      ErrorClass: MauticError,
    });

    const {
      email,
      firstname,
      lastname,
      phone,
      mobile,
      company,
      position,
      address1,
      address2,
      city,
      state,
      zipcode,
      country,
      website,
      tags,
      custom_fields,
    } = obj || {};

    try {
      const response = await mauticClient.patch<{ contact: TMauticContact }>(
        `contacts/${contact}/edit`,
        {
          ...(email && { email }),
          ...(firstname && { firstname }),
          ...(lastname && { lastname }),
          ...(phone && { phone }),
          ...(mobile && { mobile }),
          ...(company && { company }),
          ...(position && { position }),
          ...(address1 && { address1 }),
          ...(address2 && { address2 }),
          ...(city && { city }),
          ...(state && { state }),
          ...(zipcode && { zipcode }),
          ...(country && { country }),
          ...(website && { website }),
          ...(tags?.length && { tags: tags.join(',') }),
          ...(custom_fields && custom_fields),
        },
        {
          connectionOptions: { instance_url, username, password },
        }
      );

      return response;
    } catch (error) {
      throw new MauticError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: MauticContactResponseType,
});

export default updateContact;
