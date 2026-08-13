// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { services } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
} from '../helpers/constants';
import { getGoogleAdsConversionActionAllowedValues } from '../helpers/get-conversion-action-allowed-values';

const action = 'upload_click_conversion';

const options = {
  ...CUSTOMER_ID_OPTION,
  gclid: {
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
  conversion_value: {
    type: 'float',
    required: false,
  },
  currency_code: {
    type: 'string',
    required: false,
    default_value: 'USD',
  },
  order_id: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const uploadClickConversion = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any, [
      'gclid',
      'conversion_action_id',
      'conversion_date_time',
    ]);

    const {
      gclid,
      conversion_action_id,
      conversion_date_time,
      conversion_value,
      currency_code = 'USD',
      order_id,
    } = obj || {};

    if (!gclid || !conversion_action_id || !conversion_date_time) {
      throw new GoogleAdsError(
        'gclid, conversion_action_id, and conversion_date_time are required'
      );
    }

    const customerId = String(customer.credentials.customer_id).replace(/-/g, '');
    const conversionAction = `customers/${customerId}/conversionActions/${conversion_action_id}`;

    try {
      const conversion: services.IClickConversion = {
        gclid,
        conversion_action: conversionAction,
        conversion_date_time,
        ...(conversion_value !== undefined && conversion_value !== null
          ? { conversion_value }
          : {}),
        ...(currency_code ? { currency_code } : {}),
        ...(order_id ? { order_id } : {}),
      };

      const response = await customer.conversionUploads.uploadClickConversions({
        customer_id: customerId,
        conversions: [conversion],
        partial_failure: true,
      } as services.UploadClickConversionsRequest);

      const results = response.results || [];
      const hasPartialFailure = !!response.partial_failure_error;

      return {
        success: results.length > 0 && !hasPartialFailure,
        uploaded_conversions: results.length,
        gclid,
        conversion_action: conversionAction,
        conversion_date_time,
        ...(hasPartialFailure
          ? { partial_failure_error: response.partial_failure_error?.message ?? 'Unknown error' }
          : {}),
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to upload click conversion: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      uploaded_conversions: { type: 'integer' },
      gclid: { type: 'string' },
      conversion_action: { type: 'string' },
      conversion_date_time: { type: 'string' },
      partial_failure_error: { type: 'string' },
    },
  },
});

export default uploadClickConversion;
