
import { StripeTriggerOptionsEn } from './trigger-options';

const StripeAppEn = {
  displayName: 'Stripe',
  groups: ['Payment Processing'],
  shortDesc: 'Collection of actions to interact with the Stripe API',
  longDesc: 'Collection of actions to interact with the Stripe API',
  triggers: {
    charge_dispute_created: {
      options: StripeTriggerOptionsEn,
      displayName: 'New Charge Dispute',
      shortDesc: 'Triggers when a dispute is created for a previously made charge.',
      longDesc:
        'This trigger fires whenever a customer initiates a dispute (also known as a chargeback) against a completed charge. You can use this to respond promptly, provide evidence, or communicate with the customer regarding the disputed charge.',
      event_info: {
        desc: 'Provides details about the newly created dispute, including the reason, amount, and any relevant metadata.',
      },
    },
    charge_refunded: {
      options: StripeTriggerOptionsEn,
      displayName: 'Charge Refunded',
      shortDesc: 'Triggers when an existing charge is fully or partially refunded.',
      longDesc:
        'This trigger fires whenever you issue a refund to a customer for a previously successful charge. It includes information about the refunded amount, the original charge details, and the refund reason.',
      event_info: {
        desc: 'Contains refund details, including the refunded amount, the source charge, and the timestamp of the refund.',
      },
    },
    charge_succeeded: {
      options: StripeTriggerOptionsEn,
      displayName: 'Charge Succeeded',
      shortDesc: 'Triggers when a new charge is successfully completed.',
      longDesc:
        'This trigger fires whenever a payment charge is successfully processed, typically following a card payment or another supported payment method. Use this event to fulfill orders, send confirmations, or update your internal records.',
      event_info: {
        desc: 'Includes details about the successful charge, such as the amount, payment method, and associated customer or order data.',
      },
    },
    checkout_session_completed: {
      options: StripeTriggerOptionsEn,
      displayName: 'Checkout Session Completed',
      shortDesc:
        'Triggers when a Stripe Checkout session is finalized and the payment is successful.',
      longDesc:
        "This trigger fires after a customer completes the entire Stripe Checkout flow, including any required payment steps. It's ideal for finalizing orders, sending receipts, and granting access to purchased products or services.",
      event_info: {
        desc: 'Provides information about the completed checkout session, including the purchased items, total amount, and customer details.',
      },
    },
    customer_created: {
      options: StripeTriggerOptionsEn,
      displayName: 'Customer Created',
      shortDesc: 'Triggers when a new customer record is added to your Stripe account.',
      longDesc:
        'This trigger fires whenever a new customer is created, either through your website, the Stripe dashboard, or via the API. You can use this event to start onboarding processes, welcome emails, or custom CRM integrations.',
      event_info: {
        desc: 'Contains details of the newly created customer, such as their email address, billing information, and associated metadata.',
      },
    },
    invoice_created: {
      options: StripeTriggerOptionsEn,
      displayName: 'Invoice Created',
      shortDesc: 'Triggers when a new invoice is generated.',
      longDesc:
        "This trigger fires whenever an invoice is created, either automatically as part of a recurring billing cycle or manually. It's useful for sending invoice notifications, updating financial systems, or automating payment reminders.",
      event_info: {
        desc: 'Provides the full invoice object, including line items, amounts due, currency, and related customer information.',
      },
    },
    invoice_payment_failed: {
      options: StripeTriggerOptionsEn,
      displayName: 'Invoice Payment Failed',
      shortDesc: 'Triggers when an attempt to pay an invoice fails.',
      longDesc:
        'This trigger fires whenever Stripe attempts to charge a customer for an invoice and the payment is declined or otherwise fails. Use it to send payment failure notices, prompt customers to update their payment methods, or pause services until payment is resolved.',
      event_info: {
        desc: 'Includes details about the failed payment attempt, such as the invoice amount, payment method, and the reason for failure.',
      },
    },

    payment_intent_failed: {
      options: StripeTriggerOptionsEn,
      displayName: 'Payment Intent Failed',
      shortDesc: 'Triggers when a Payment Intent cannot be completed successfully.',
      longDesc:
        'This event fires when a Payment Intent—created to handle dynamic payment flows—ultimately fails, for example, due to insufficient funds, authentication failures, or timeouts. Use this to notify customers of payment issues or prompt them to try another payment method.',
      event_info: {
        desc: 'Includes details about the failed Payment Intent, such as the amount, currency, payment method attempts, and the reason for failure.',
      },
    },
    payment_intent_succeeded: {
      options: StripeTriggerOptionsEn,
      displayName: 'Payment Intent Succeeded',
      shortDesc: 'Triggers when a Payment Intent successfully completes, confirming payment.',
      longDesc:
        'This trigger fires when a Payment Intent transitions to a successful state, indicating that funds are captured or confirmed. Use it to fulfill orders, update your internal systems, or send customers confirmation messages.',
      event_info: {
        desc: 'Provides comprehensive details about the successful Payment Intent, including payment amount, method, customer details, and associated metadata.',
      },
    },
    payment_link_created: {
      options: StripeTriggerOptionsEn,
      displayName: 'Payment Link Created',
      shortDesc: 'Triggers when a new Payment Link is created.',
      longDesc:
        'This trigger fires whenever you create a Payment Link, which provides a hosted payment page that customers can use to pay for a product or service. You can use this event to track link creation, automate sharing, or log link details in your CRM.',
      event_info: {
        desc: 'Contains information about the new Payment Link, including URL, product details, and associated pricing configurations.',
      },
    },
    subscription_canceled: {
      options: StripeTriggerOptionsEn,
      displayName: 'Subscription Canceled',
      shortDesc: 'Triggers when an active subscription is canceled.',
      longDesc:
        'This event fires whenever a subscription is canceled, whether by the customer, via API, or due to an automatic cancellation (e.g., payment failures). Use it to adjust service access, send account closure notices, or offer re-subscription incentives.',
      event_info: {
        desc: 'Provides details about the canceled subscription, such as the cancellation reason, effective end date, and any prorated refunds.',
      },
    },
    subscription_created: {
      options: StripeTriggerOptionsEn,
      displayName: 'Subscription Created',
      shortDesc: 'Triggers when a new subscription is successfully created.',
      longDesc:
        'This event fires whenever a customer starts a new subscription, either by signing up for a plan or adding a subscription product. Use it to onboard new subscribers, grant access to services, or send a welcome message.',
      event_info: {
        desc: 'Includes details about the newly created subscription, including plan information, start date, and billing cycle details.',
      },
    },
    subscription_updated: {
      options: StripeTriggerOptionsEn,
      displayName: 'Subscription Updated',
      shortDesc: 'Triggers when a subscription’s details change.',
      longDesc:
        'This event fires whenever a subscription’s parameters are updated. For example, a change in the billing cycle, swapping a plan, adding or removing products, or modifying payment settings. Use it to keep your internal records accurate, send notifications about plan changes, or adjust service access levels.',
      event_info: {
        desc: 'Provides the updated subscription object, highlighting changes such as plan modifications, trial adjustments, or updated billing details.',
      },
    },
  },
  actions: {
    GetAccount: {
      groups: ['Accounts'],
      displayName: 'Get account details',
      shortDesc: 'Retrieves the details of the account.',
    },
    PostAccountLinks: {
      groups: ['Accounts'],
      displayName: 'Create account links',
      shortDesc:
        'Creates a url that the platform can redirect their user to take them through the Connect Onboarding flow.',
    },
    DeleteAccountsAccount: {
      groups: ['Accounts'],
      displayName: 'Delete account',
      shortDesc: 'Deletes the specified account.',
    },
    GetAccountsAccount: {
      groups: ['Accounts'],
      displayName: 'Retrieve account',
      shortDesc: 'Retrieves the details of an account.',
    },
    PostAccountsAccount: {
      groups: ['Accounts'],
      displayName: 'Update account',
      shortDesc: 'Updates the specified account by setting the values of the parameters passed.',
    },
    GetAccountsAccountExternalAccounts: {
      groups: ['Accounts'],
      displayName: 'List external accounts',
      shortDesc: 'Returns a list of external accounts associated with the Stripe account.',
    },
    PostAccountsAccountExternalAccounts: {
      groups: ['Accounts'],
      displayName: 'Create external account',
      shortDesc: 'Create an external account for a connected account.',
    },
    PostAccountsAccountLoginLinks: {
      groups: ['Accounts'],
      displayName: 'Create login links',
      shortDesc: 'Creates a short-lived link that can be used to log in to the Stripe Dashboard.',
    },
    GetAccountsAccountPeople: {
      groups: ['Accounts'],
      displayName: 'List people',
      shortDesc: 'Returns a list of people associated with the account.',
    },
    PostAccountsAccountPeople: {
      groups: ['Accounts'],
      displayName: 'Create person',
      shortDesc: 'Creates a new person.',
    },
    GetBalance: {
      groups: ['Balance'],
      displayName: 'Retrieve balance',
      shortDesc: 'Retrieves the current account balance.',
    },
    GetBalanceHistory: {
      groups: ['Balance'],
      displayName: 'List balance history',
      shortDesc:
        'Returns a list of transactions that have contributed to the Stripe account balance.',
    },
    GetBalanceHistoryId: {
      groups: ['Balance'],
      displayName: 'Retrieve balance history',
      shortDesc: 'Retrieves the details of a balance history item.',
    },
    GetCharges: {
      groups: ['Charges'],
      displayName: 'List charges',
      shortDesc: 'Returns a list of charges you have previously created.',
    },
    PostCharges: {
      groups: ['Charges'],
      displayName: 'Create charge',
      shortDesc: 'Creates a new charge object.',
    },
    GetChargesCharge: {
      groups: ['Charges'],
      displayName: 'Retrieve charge',
      shortDesc: 'Retrieves the details of a charge.',
    },
    PostChargesCharge: {
      groups: ['Charges'],
      displayName: 'Update charge',
      shortDesc: 'Updates the specified charge by setting the values of the parameters passed.',
    },
    GetCustomers: {
      groups: ['Customers'],
      displayName: 'List customers',
      shortDesc: 'Returns a list of your customers.',
    },
    PostCustomers: {
      groups: ['Customers'],
      displayName: 'Create customer',
      shortDesc: 'Creates a new customer object.',
    },
    DeleteCustomersCustomer: {
      groups: ['Customers'],
      displayName: 'Delete customer',
      shortDesc: 'Deletes the specified customer.',
    },
    GetCustomersCustomer: {
      groups: ['Customers'],
      displayName: 'Retrieve customer',
      shortDesc: 'Retrieves the details of an existing customer.',
    },
    PostCustomersCustomer: {
      groups: ['Customers'],
      displayName: 'Update customer',
      shortDesc: 'Updates the specified customer by setting the values of the parameters passed.',
    },
    GetCustomersCustomerBalanceTransactions: {
      groups: ['Balance'],
      displayName: 'List balance transactions',
      shortDesc:
        'Returns a list of transactions that have contributed to the customers account balance.',
    },
    PostCustomersCustomerBalanceTransactions: {
      groups: ['Balance'],
      displayName: 'Create balance transaction',
      shortDesc: 'Creates a new balance transaction.',
    },
    GetCustomersCustomerSources: {
      groups: ['Customers'],
      displayName: 'List sources',
      shortDesc: 'Returns a list of sources for the customer.',
    },
    PostCustomersCustomerSources: {
      groups: ['Customers'],
      displayName: 'Create source',
      shortDesc: 'Creates a new source object.',
    },
    GetCustomersCustomerSubscriptions: {
      groups: ['Customers'],
      displayName: 'List subscriptions',
      shortDesc: 'Returns a list of subscriptions for a customer.',
    },
    PostCustomersCustomerSubscriptions: {
      groups: ['Customers'],
      displayName: 'Create subscription',
      shortDesc: 'Creates a new subscription on an existing customer.',
    },
    GetInvoices: {
      groups: ['Invoices'],
      displayName: 'List invoices',
      shortDesc: 'Returns a list of your invoices.',
    },
    PostInvoices: {
      groups: ['Invoices'],
      displayName: 'Create invoice',
      shortDesc: 'Creates a draft invoice for a given customer.',
    },
    DeleteInvoicesInvoice: {
      groups: ['Invoices'],
      displayName: 'Delete invoice',
      shortDesc: 'Deletes the specified invoice.',
    },
    GetInvoicesInvoice: {
      groups: ['Invoices'],
      displayName: 'Retrieve invoice',
      shortDesc: 'Retrieves the details of an existing invoice.',
    },
    PostInvoicesInvoice: {
      groups: ['Invoices'],
      displayName: 'Update invoice',
      shortDesc: 'Updates the specified invoice by setting the values of the parameters passed.',
    },
    GetPaymentIntents: {
      groups: ['Payment Intents'],
      displayName: 'List payment intents',
      shortDesc: 'Returns a list of payment intents.',
    },
    PostPaymentIntents: {
      groups: ['Payment Intents'],
      displayName: 'Create payment intent',
      shortDesc: 'Creates a new payment intent.',
    },
    GetRefunds: {
      groups: ['Refunds'],
      displayName: 'List refunds',
      shortDesc: 'Returns a list of all refunds you’ve previously created.',
    },
    PostRefunds: {
      groups: ['Refunds'],
      displayName: 'Create refund',
      shortDesc: 'Creates a new refund object.',
    },
  },
};

export default StripeAppEn;
