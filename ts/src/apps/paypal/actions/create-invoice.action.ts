import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { getPayPalErrorMessage, PAYPAL_APP_NAME, PayPalError } from '../constants';
import { payPalApiClient } from '../helpers/constants';
import { PayPalCurrencyCodesAllowedValues } from '../helpers/get-currency.allowed-values';

const action = 'create_invoice';

const options = {
  invoice_number: {
    type: 'string',
    required: false,
  },
  currency_code: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    allowed_values: PayPalCurrencyCodesAllowedValues,
  },
  note: {
    type: 'string',
    required: false,
  },
  recipient_email: {
    type: 'string',
    required: true,
  },
  recipient_first_name: {
    type: 'string',
    required: false,
  },
  recipient_last_name: {
    type: 'string',
    required: false,
  },
  item_name: {
    type: 'string',
    required: true,
  },
  item_description: {
    type: 'string',
    required: false,
  },
  item_quantity: {
    type: 'string',
    required: true,
    default_value: '1',
  },
  item_unit_price: {
    type: 'string',
    required: true,
  },
  tax_percent: {
    type: 'string',
    required: false,
  },
  tax_name: {
    type: 'string',
    required: false,
  },
  payment_term: {
    type: 'string',
    required: false,
    default_value: 'DUE_ON_RECEIPT',
    allowed_values: [
      { value: 'DUE_ON_RECEIPT', display_name: 'Due on Receipt' },
      { value: 'NET_10', display_name: 'Net 10 Days' },
      { value: 'NET_15', display_name: 'Net 15 Days' },
      { value: 'NET_30', display_name: 'Net 30 Days' },
      { value: 'NET_45', display_name: 'Net 45 Days' },
      { value: 'NET_60', display_name: 'Net 60 Days' },
      { value: 'NET_90', display_name: 'Net 90 Days' },
    ],
  },
  send_to_recipient: {
    type: 'boolean',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const createInvoice = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PAYPAL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const {
      token,
      environment,
      currency_code,
      recipient_email,
      item_name,
      item_quantity,
      item_unit_price,
    } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'environment'],
      optionFields: [
        'currency_code',
        'recipient_email',
        'item_name',
        'item_quantity',
        'item_unit_price',
      ],
      ErrorClass: PayPalError,
    });

    try {
      const invoiceData: Record<string, any> = {
        detail: {
          currency_code,
          ...(obj?.invoice_number && { invoice_number: obj.invoice_number }),
          ...(obj?.note && { note: obj.note }),
          ...(obj?.payment_term && {
            payment_term: {
              term_type: obj.payment_term,
            },
          }),
        },
        primary_recipients: [
          {
            billing_info: {
              email_address: recipient_email,
              ...(obj?.recipient_first_name || obj?.recipient_last_name
                ? {
                    name: {
                      ...(obj?.recipient_first_name && { given_name: obj.recipient_first_name }),
                      ...(obj?.recipient_last_name && { surname: obj.recipient_last_name }),
                    },
                  }
                : {}),
            },
          },
        ],
        items: [
          {
            name: item_name,
            ...(obj?.item_description && { description: obj.item_description }),
            quantity: item_quantity,
            unit_amount: {
              currency_code,
              value: item_unit_price,
            },
            ...(obj?.tax_percent && {
              tax: {
                name: obj.tax_name || 'Tax',
                percent: obj.tax_percent,
              },
            }),
          },
        ],
      };

      const response = await payPalApiClient<{
        id: string;
        href: string;
      }>({
        path: `v2/invoicing/invoices`,
        method: 'POST',
        body: invoiceData,
        headers: {
          Prefer: 'return=representation',
        },
        token,
        environment,
      });

      const invoiceId = response.id;

      if (obj?.send_to_recipient) {
        await payPalApiClient({
          path: `v2/invoicing/invoices/${invoiceId}/send`,
          method: 'POST',
          body: {
            send_to_recipient: true,
            send_to_invoicer: false,
          },
          token,
          environment,
        });
      }

      const invoice = await payPalApiClient<Record<string, any>>({
        path: `v2/invoicing/invoices/${invoiceId}`,
        method: 'GET',
        environment,
        token,
      });

      return {
        id: invoice.id,
        status: invoice.status,
        invoice_number: invoice.detail?.invoice_number,
        currency_code: invoice.detail?.currency_code,
        total_amount: invoice.amount?.value,
        due_amount: invoice.due_amount?.value,
        recipient_email: invoice.primary_recipients?.[0]?.billing_info?.email_address,
        invoice_url: invoice.detail?.metadata?.recipient_view_url,
        sent_to_recipient: obj?.send_to_recipient || false,
        create_time: invoice.detail?.metadata?.create_time,
      };
    } catch (error) {
      throw new PayPalError(
        `Failed to ${humanizeNameTitle(action)}: ${getPayPalErrorMessage(error)}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      status: { type: 'string' },
      invoice_number: { type: 'string' },
      currency_code: { type: 'string' },
      total_amount: { type: 'string' },
      due_amount: { type: 'string' },
      recipient_email: { type: 'string' },
      invoice_url: { type: 'string' },
      sent_to_recipient: { type: 'boolean' },
      create_time: { type: 'string' },
    },
  },
});

export default createInvoice;
