import {
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PipedriveError } from '../../constants';
import { mapPipedriveFieldsToQoreOptions } from '../get-object-fields';

export const PipedriveProductRequiredFields = ['name'];

export const PipedriveProductFields = {
  name: {
    type: 'string',
    required: true,
    desc: 'The name of the product. Cannot be an empty string',
  },
  code: {
    type: 'string',
    desc: 'The product code',
  },
  description: {
    type: 'string',
    desc: 'The product description',
  },
  unit: {
    type: 'string',
    desc: 'The unit in which this product is sold',
  },
  tax: {
    type: 'number',
    desc: 'The tax percentage',
  },
  category: {
    type: 'number',
    desc: 'The category of the product',
  },
  owner_id: {
    type: 'integer',
    desc: 'The ID of the user who will be marked as the owner of this product. When omitted, the authorized user ID will be used',
  },
  is_linkable: {
    type: 'bool',
    desc: 'Whether this product can be added to a deal or not',
  },
  visible_to: {
    type: 'number',
    desc: 'The visibility of the product. If omitted, the visibility will be set to the default visibility setting of this item type for the authorized user',
  },
  prices: {
    type: 'list',
    desc: 'An array of objects, each containing: currency (string), price (number), cost (number, optional), direct_cost (number, optional). Note that there can only be one price per product per currency',
  },
  billing_frequency: {
    type: 'string',
    desc: 'How often a customer is billed for access to a service or product. Available in Growth and above plans',
  },
  billing_frequency_cycles: {
    type: 'integer',
    desc: 'The number of times the billing frequency repeats for a product in a deal. Available in Growth and above plans. Must be a positive integer less or equal to 208',
  },
} satisfies Record<string, TQoreAppActionOption>;

export const getPipedriveProductRecordType: TQoreGetDynamicTypeFunction = async (
  context
): Promise<TQoreTypeObject> => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: PipedriveError,
  });

  try {
    const qoreOptions = await mapPipedriveFieldsToQoreOptions({
      token,
      predefinedFields: PipedriveProductFields,
      pathToObjectFields: '/productFields',
      requiredFields: PipedriveProductRequiredFields,
    });

    return {
      type: 'hash',
      fields: qoreOptions,
    };
  } catch (error) {
    throw new PipedriveError(
      `Failed to get Pipedrive product record type: ${error.message || error}`
    );
  }
};
