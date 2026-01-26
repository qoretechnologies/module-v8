import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { ZohoCrmError } from '../../constants';
import { extractZohoCrmErrorMessage } from '../extract-error';
import { getZohoCRMModuleFieldAllowedValues } from '../get-field-allowed-values';

export const ZohoCrmUpsertOptions = {
  duplicate_check_fields: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: async (context) => {
      try {
        const { table } = getQoreContextRequiredValues({
          context,
          optionFields: ['table'],
          ErrorClass: ZohoCrmError,
        });

        const allowedValues = await getZohoCRMModuleFieldAllowedValues({
          ...context,
          opts: { module: table },
        });

        return allowedValues;
      } catch (error) {
        Debugger.log(
          `Error fetching allowed values for duplicate_check_fields: ${extractZohoCrmErrorMessage(error)}`
        );

        return [];
      }
    },
    required: false,
  },
} satisfies TQoreCrudOptions;
