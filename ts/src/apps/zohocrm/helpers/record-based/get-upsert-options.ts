// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { ZohoCrmError } from '../../constants';
import { getZohoCRMModuleFieldAllowedValues } from '../get-field-allowed-values';

export const ZohoCrmUpsertOptions = {
  duplicate_check_fields: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: async (context) => {
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
    },
    required: false,
  },
} satisfies TQoreCrudOptions;
