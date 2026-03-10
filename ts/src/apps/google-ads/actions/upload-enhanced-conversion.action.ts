// Copyright 2026 Qore Technologies, s.r.o.
import { createHash } from 'crypto';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { common, services } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';
import { getGoogleAdsConversionActionAllowedValues } from '../helpers/get-conversion-action-allowed-values';

const action = 'upload_enhanced_conversion';

const normalizeEmail = (email: string): string => {
  let normalized = email.trim().toLowerCase();
  const [localPart, domain] = normalized.split('@');
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const cleanLocal = localPart.replace(/\./g, '').replace(/\+.*$/, '');
    normalized = `${cleanLocal}@${domain}`;
  }
  return normalized;
};

const sha256Hash = (value: string): string => {
  return createHash('sha256').update(value).digest('hex');
};

const options = {
  ...CUSTOMER_ID_OPTION,
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
  email: {
    type: 'string',
    required: false,
  },
  phone_number: {
    type: 'string',
    required: false,
  },
  order_id: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const uploadEnhancedConversion = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any, [
      'conversion_action_id',
      'conversion_date_time',
    ]);

    const {
      conversion_action_id,
      conversion_date_time,
      conversion_value,
      currency_code = 'USD',
      email,
      phone_number,
      order_id,
    } = obj || {};

    if (!conversion_action_id || !conversion_date_time) {
      throw new GoogleAdsError('conversion_action_id and conversion_date_time are required');
    }

    if (!email && !phone_number) {
      throw new GoogleAdsError('At least one user identifier (email or phone_number) is required');
    }

    const customerId = String(customer.credentials.customer_id).replace(/-/g, '');
    const conversionAction = `customers/${customerId}/conversionActions/${conversion_action_id}`;

    try {
      const userIdentifiers: common.IUserIdentifier[] = [];

      if (email) {
        userIdentifiers.push({
          hashed_email: sha256Hash(normalizeEmail(email)),
        });
      }

      if (phone_number) {
        const normalizedPhone = phone_number.trim().replace(/[\s\-()]/g, '');
        userIdentifiers.push({
          hashed_phone_number: sha256Hash(normalizedPhone),
        });
      }

      const conversion: services.IClickConversion = {
        conversion_action: conversionAction,
        conversion_date_time,
        user_identifiers: userIdentifiers,
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
        conversion_action: conversionAction,
        conversion_date_time,
        has_email: !!email,
        has_phone: !!phone_number,
        ...(hasPartialFailure
          ? { partial_failure_error: response.partial_failure_error?.message ?? 'Unknown error' }
          : {}),
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to upload enhanced conversion: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      uploaded_conversions: { type: 'integer' },
      conversion_action: { type: 'string' },
      conversion_date_time: { type: 'string' },
      has_email: { type: 'bool' },
      has_phone: { type: 'bool' },
      partial_failure_error: { type: 'string' },
    },
  },
});

export default uploadEnhancedConversion;
