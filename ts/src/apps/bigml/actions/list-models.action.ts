import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BIG_ML_APP_NAME, BigMlError } from '../constants';
import { bigMlApiClient } from '../helpers/constants';
import { BigMlFilterOperatorAllowedValues } from '../helpers/get-filter-operator-allowed-values';
import {
  BigMlModelFilterableFieldAllowedValues,
  BigMlModelSortableFieldAllowedValues,
} from '../helpers/get-model-field-allowed-values';
import { BigMlModelResponseType } from '../response-types/model.response-type';

const action = 'list_models';

const options = {
  limit: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  offset: {
    type: 'number',
    required: false,
  },
  filter: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          allowed_values: BigMlModelFilterableFieldAllowedValues,
          required: true,
        },
        value: {
          type: 'softstring',
          required: true,
        },
        operator: {
          type: 'string',
          allowed_values: BigMlFilterOperatorAllowedValues,
          required: true,
        },
      },
    },
  },
  sort: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          allowed_values: BigMlModelSortableFieldAllowedValues,
          required: true,
        },
        order: {
          type: 'string',
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
          required: true,
        },
      },
    },
  },
} satisfies TQoreOptions;

const listModels = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BIG_ML_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, username } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'username'],
      ErrorClass: BigMlError,
    });

    const {
      limit = 20,
      offset = 0,
      sort = { order: 'desc', field: 'created' },
      filter,
    } = obj || {};

    try {
      const response = await bigMlApiClient({
        token,
        username,
        method: 'GET',
        params: {
          limit: limit.toString(),
          offset: offset.toString(),
          order_by: `${sort.order === 'asc' ? '' : '-'}${sort.field}`,
          ...(filter?.field && {
            [`${filter.field}${filter.operator || '__icontains'}`]: filter.value,
          }),
        },
        path: `model`,
        object: `objects`,
      });

      return response;
    } catch (error) {
      throw new BigMlError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: BigMlModelResponseType,
  },
});

export default listModels;
