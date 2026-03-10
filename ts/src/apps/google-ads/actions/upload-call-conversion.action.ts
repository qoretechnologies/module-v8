// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { services } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';
import { getGoogleAdsConversionActionAllowedValues } from '../helpers/get-conversion-action-allowed-values';

const action = 'upload_call_conversion';

const options = {
  ...CUSTOMER_ID_OPTION,
  caller_id: {
    type: 'string',
    required: true,
  },
  conversion_action_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsConversionActionAllowedValues,
    depends_on: ['customer_id'],
  },
  conversion_date_time: {
    type: 'string',
    required: true,
  },
  call_start_date_time: {
    type: 'string',
    required: true,
  },
  conversion_value: {
    type: 'float',
    required: false,
  },
  currency_code: {
    type: 'string',
    required: false,
    default_value: 'USD',
  },
} satisfies TQoreOptions;

const uploadCallConversion = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any, [
      'caller_id',
      'conversion_action_id',
      'conversion_date_time',
      'call_start_date_time',
    ]);

    const {
      caller_id,
      conversion_action_id,
      conversion_date_time,
      call_start_date_time,
      conversion_value,
      currency_code = 'USD',
    } = obj || {};

    if (!caller_id || !conversion_action_id || !conversion_date_time || !call_start_date_time) {
      throw new GoogleAdsError(
        'caller_id, conversion_action_id, conversion_date_time, and call_start_date_time are required'
      );
    }

    const customerId = String(customer.credentials.customer_id).replace(/-/g, '');
    const conversionAction = `customers/${customerId}/conversionActions/${conversion_action_id}`;

    try {
      const conversion: services.ICallConversion = {
        caller_id,
        conversion_action: conversionAction,
        conversion_date_time,
        call_start_date_time,
        ...(conversion_value !== undefined && conversion_value !== null
          ? { conversion_value }
          : {}),
        ...(currency_code ? { currency_code } : {}),
      };

      const response = await customer.conversionUploads.uploadCallConversions({
        customer_id: customerId,
        conversions: [conversion],
        partial_failure: true,
      } as services.UploadCallConversionsRequest);

      const results = response.results || [];
      const hasPartialFailure = !!response.partial_failure_error;

      return {
        success: results.length > 0 && !hasPartialFailure,
        uploaded_conversions: results.length,
        caller_id,
        conversion_action: conversionAction,
        conversion_date_time,
        call_start_date_time,
        ...(hasPartialFailure
          ? { partial_failure_error: response.partial_failure_error?.message ?? 'Unknown error' }
          : {}),
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to upload call conversion: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      uploaded_conversions: { type: 'integer' },
      caller_id: { type: 'string' },
      conversion_action: { type: 'string' },
      conversion_date_time: { type: 'string' },
      call_start_date_time: { type: 'string' },
      partial_failure_error: { type: 'string' },
    },
  },
});

export default uploadCallConversion;
