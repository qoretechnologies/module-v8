// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { enums, services } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
} from '../helpers/constants';
import { getGoogleAdsConversionActionAllowedValues } from '../helpers/get-conversion-action-allowed-values';

const action = 'upload_conversion_adjustment';

const options = {
  ...CUSTOMER_ID_OPTION,
  conversion_action_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsConversionActionAllowedValues,
    depends_on: ['customer_id'],
  },
  adjustment_type: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'RESTATEMENT', display_name: 'Restatement' },
      { value: 'RETRACTION', display_name: 'Retraction' },
    ],
  },
  order_id: {
    type: 'string',
    required: false,
  },
  gclid: {
    type: 'string',
    required: false,
  },
  adjustment_date_time: {
    type: 'string',
    required: true,
  },
  adjusted_value: {
    type: 'float',
    required: false,
  },
  currency_code: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const adjustmentTypeMap: Record<string, number> = {
  RESTATEMENT: enums.ConversionAdjustmentType.RESTATEMENT,
  RETRACTION: enums.ConversionAdjustmentType.RETRACTION,
};

const uploadConversionAdjustment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any, [
      'conversion_action_id',
      'adjustment_type',
      'adjustment_date_time',
    ]);

    const {
      conversion_action_id,
      adjustment_type,
      order_id,
      gclid,
      adjustment_date_time,
      adjusted_value,
      currency_code,
    } = obj || {};

    if (!conversion_action_id || !adjustment_type || !adjustment_date_time) {
      throw new GoogleAdsError(
        'conversion_action_id, adjustment_type, and adjustment_date_time are required'
      );
    }

    if (!order_id && !gclid) {
      throw new GoogleAdsError('Either order_id or gclid is required to identify the conversion');
    }

    if (
      adjustment_type === 'RESTATEMENT' &&
      (adjusted_value === undefined || adjusted_value === null)
    ) {
      throw new GoogleAdsError('adjusted_value is required for RESTATEMENT adjustments');
    }

    const customerId = String(customer.credentials.customer_id).replace(/-/g, '');
    const conversionAction = `customers/${customerId}/conversionActions/${conversion_action_id}`;

    try {
      const adjustment: services.IConversionAdjustment = {
        conversion_action: conversionAction,
        adjustment_type: adjustmentTypeMap[adjustment_type],
        adjustment_date_time,
        ...(order_id ? { order_id } : {}),
        ...(gclid
          ? {
              gclid_date_time_pair: {
                gclid,
              },
            }
          : {}),
        ...(adjustment_type === 'RESTATEMENT' &&
        adjusted_value !== undefined &&
        adjusted_value !== null
          ? {
              restatement_value: {
                adjusted_value,
                ...(currency_code ? { currency_code } : {}),
              },
            }
          : {}),
      };

      const response = await customer.conversionAdjustmentUploads.uploadConversionAdjustments({
        customer_id: customerId,
        conversion_adjustments: [adjustment],
        partial_failure: true,
      } as services.UploadConversionAdjustmentsRequest);

      const results = response.results || [];
      const hasPartialFailure = !!response.partial_failure_error;

      return {
        success: results.length > 0 && !hasPartialFailure,
        uploaded_adjustments: results.length,
        conversion_action: conversionAction,
        adjustment_type,
        adjustment_date_time,
        ...(order_id ? { order_id } : {}),
        ...(gclid ? { gclid } : {}),
        ...(hasPartialFailure
          ? { partial_failure_error: response.partial_failure_error?.message ?? 'Unknown error' }
          : {}),
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to upload conversion adjustment: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      uploaded_adjustments: { type: 'integer' },
      conversion_action: { type: 'string' },
      adjustment_type: { type: 'string' },
      adjustment_date_time: { type: 'string' },
      order_id: { type: 'string' },
      gclid: { type: 'string' },
      partial_failure_error: { type: 'string' },
    },
  },
});

export default uploadConversionAdjustment;
