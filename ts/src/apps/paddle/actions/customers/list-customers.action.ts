import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';
import { getPaddleCustomerIdAllowedValues } from '../../helpers/get-customer-id-allowed-values';
import { PaddleCustomerOrderByFieldsAllowedValues } from '../../helpers/get-customer-order-by-fields-allowed-values';
import { PaddleStatusAllowedValues } from '../../helpers/get-status-allowed-values';
import { Status } from '@paddle/paddle-node-sdk';

const options = {
  after: {
    required: false,
    type: 'string',
  },
  email: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
  id: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getPaddleCustomerIdAllowedValues,
  },
  order: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          allowed_values: PaddleCustomerOrderByFieldsAllowedValues,
          required: true,
        },
        direction: {
          type: 'string',
          preselected: true,
          allowed_values: [
            { value: 'ASC', display_name: 'Ascending' },
            { value: 'DESC', display_name: 'Descending' },
          ],
        },
      },
    },
  },
  per_page: {
    type: 'integer',
    default_value: 50,
    required: false,
  },
  search: {
    type: 'string',
    required: false,
    preselected: true,
  },
  status: {
    type: 'string',
    required: false,
    allowed_values: PaddleStatusAllowedValues,
  },
} satisfies TQoreOptions;

const listCustomers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'list_customers',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const after = obj?.after;
    const email = obj?.email;
    const id = obj?.id;
    const search = obj?.search;
    const status = obj?.status as Status | undefined;
    const perPage = obj?.per_page ? Math.min(obj.per_page, 200) : 50;
    const sortOrder = obj?.order?.direction || 'DESC';
    const sortField = obj?.order?.field || 'created_at';

    try {
      const client = createPaddleClient(token, instance_type);

      const customerCollection = client.customers.list({
        ...(after && { after }),
        ...(email && { email }),
        ...(id && { id }),
        ...(search && { search }),
        ...(status && { status: [status] }),
        perPage,
        orderBy: `${sortField}[${sortOrder}]`,
      });

      return await customerCollection.next();
    } catch (error) {
      throw new PaddleError(`Failed to list customers: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string' },
        marketingConsent: { type: 'boolean' },
        status: { type: 'string' },
        customData: { type: 'hash' },
        locale: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  } satisfies TQoreResponseType,
});

export default listCustomers;
