import { STRIPE_ACTIONS } from '../apps/stripe';

let connection: string;

describe('Tests Stripe Actions', () => {
  let customerId: string | null = null;
  let chargeId: string | null = null;
  let invoiceId: string | null = null;

  beforeAll(() => {
    connection = testApi.createConnection('stripe', {
      opts: {
        token:
          'sk_test_51Q5mY202gU5cv8l2YfWs1MqoWJgzpNWtQLz6ej0x92n2FpouXgMwpnBNcrah5QJtbUjgGs2Z3himoEmYmMSYDgDe00LYE7VkEb',
      },
    });

    expect(connection).toBeDefined();
  });

  // Accounts
  it('Should retrieve account details', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'GetAccount');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection);
    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
  });

  // Balances
  it('Should retrieve balance', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'GetBalance');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection);

    expect(response.body).toBeDefined();
  });

  it('Should retrieve balance history', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'GetBalanceHistory');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection);

    expect(response.body).toBeDefined();

    if (response.body.data.length > 0) {
      const getBalanceHistoryItem = STRIPE_ACTIONS.find((a) => a.action === 'GetBalanceHistoryId');
      expect(getBalanceHistoryItem).toBeDefined();

      const balanceHistoryItemResponse = await testApi.execAppAction(
        'stripe',
        getBalanceHistoryItem.action,
        connection,
        {
          id: response.body.data[0].id,
        }
      );

      expect(balanceHistoryItemResponse.body.id).toBeDefined();
      expect(balanceHistoryItemResponse.body.id).toBe(response.body.data[0].id);
    }
  });

  // Charges

  it('Should create a charge', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'PostCharges');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      amount: 500,
      currency: 'usd',
      source: 'tok_visa',
    });
    expect(response.body).toBeDefined();
    chargeId = response.body.id;
  });

  it('Should retrieve specific charge details', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'GetChargesCharge');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      charge: chargeId,
    });

    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(chargeId);
  });

  it('Should update a charge', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'PostChargesCharge');
    expect(action).toBeDefined();
    const description = 'Updated charge description';
    const response = await testApi.execAppAction('stripe', action.action, connection, {
      charge: chargeId,
      description,
    });

    expect(response.body).toBeDefined();
    expect(response.body.description).toBeDefined();
    expect(response.body.description).toBe(description);
  });

  it('Should list charges', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'GetCharges');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection);
    console.log('GetCharges', response);
    expect(response.body).toBeDefined();
  });

  // Refunds;
  it('Should create a refund', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'PostRefunds');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      charge: chargeId,
    });

    expect(response.body).toBeDefined();
    expect(response.body.status).toBe('succeeded');
  });

  it('Should list refunds', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'GetRefunds');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection);

    expect(response.body).toBeDefined();
  });

  // Customers

  it('Should create a customer', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'PostCustomers');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      email: 'test@example.com',
    });

    expect(response.body).toBeDefined();
    customerId = response.body.id;
  });

  it('Should list customers', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'GetCustomers');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection);
    expect(response.body).toBeDefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('Should retrieve specific customer details', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'GetCustomersCustomer');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      customer: customerId,
    });

    expect(response.body).toBeDefined();
  });

  it('Should update a customer', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'PostCustomersCustomer');
    expect(action).toBeDefined();

    const email = 'updated@example.com';
    const response = await testApi.execAppAction('stripe', action.action, connection, {
      customer: customerId,
      email,
    });

    expect(response.body).toBeDefined();
    expect(response.body.email).toBe(email);
  });

  it('Should create a customer balance transaction', async () => {
    const action = STRIPE_ACTIONS.find(
      (a) => a.action === 'PostCustomersCustomerBalanceTransactions'
    );
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      customer: customerId,
      amount: 100,
      currency: 'usd',
    });

    expect(response.body).toBeDefined();
    expect(response.body.customer).toBe(customerId);
  });

  it('Should list customer balance transactions', async () => {
    const action = STRIPE_ACTIONS.find(
      (a) => a.action === 'GetCustomersCustomerBalanceTransactions'
    );
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      customer: customerId,
    });

    expect(response.body).toBeDefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('Should create a customer source', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'PostCustomersCustomerSources');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      customer: customerId,
      source: 'tok_visa',
    });

    expect(response.body).toBeDefined();
  });

  it('Should list customer sources', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'GetCustomersCustomerSources');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      customer: customerId,
    });

    expect(response.body).toBeDefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  // Invoices
  it('Should create an invoice', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'PostInvoices');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      customer: customerId,
    });

    expect(response.body).toBeDefined();
    invoiceId = response.body.id;
  });

  it('Should retrieve a specific invoice', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'GetInvoicesInvoice');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      invoice: invoiceId,
    });

    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(invoiceId);
  });

  it('Should update an invoice', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'PostInvoicesInvoice');
    expect(action).toBeDefined();

    const description = 'Updated Invoice Description';
    const response = await testApi.execAppAction('stripe', action.action, connection, {
      invoice: invoiceId,
      description,
    });

    expect(response.body).toBeDefined();
    expect(response.body.description).toBeDefined();
    expect(response.body.description).toBe(description);
  });

  it('Should list invoices', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'GetInvoices');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection);

    expect(response.body).toBeDefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('Should delete an invoice', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'DeleteInvoicesInvoice');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      invoice: invoiceId,
    });

    expect(response.body).toBeDefined();
    expect(response.body.deleted).toBe(true);
  });

  // Payment Intents
  it('Should create a payment intent', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'PostPaymentIntents');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      amount: 1000,
      currency: 'usd',
      payment_method: 'pm_card_visa',
    });

    expect(response.body).toBeDefined();
    expect(response.body.amount).toBe(1000);
  });

  it('Should list payment intents', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'GetPaymentIntents');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection);

    expect(response.body).toBeDefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('Should delete a customer', async () => {
    const action = STRIPE_ACTIONS.find((a) => a.action === 'DeleteCustomersCustomer');
    expect(action).toBeDefined();

    const response = await testApi.execAppAction('stripe', action.action, connection, {
      customer: customerId,
    });

    expect(response.body).toBeDefined();
    expect(response.body.deleted).toBe(true);
  });
});
