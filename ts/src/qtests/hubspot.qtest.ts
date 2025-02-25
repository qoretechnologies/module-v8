import { TCustomConnOptions, TQoreAppActionFunctionContext } from '@qoretechnologies/ts-toolkit';
import { getHubspotCompanyAllowedValues } from '../apps/hubspot/helpers/get-company-allowed-values';
import { getHubspotContactAllowedValues } from '../apps/hubspot/helpers/get-contact-allowed-values';
import { getHubspotCustomObjectIdAllowedValues } from '../apps/hubspot/helpers/get-cusom-object-id-allowed-values';
import { getHubspotCustomObjectTypeAllowedValues } from '../apps/hubspot/helpers/get-custom-object-type-allowed-values';
import { getHubspotDealAllowedValues } from '../apps/hubspot/helpers/get-deal-allowed-values';
import { getHubspotLeadAllowedValues } from '../apps/hubspot/helpers/get-lead-allowed-values';
import { getHubspotProductAllowedValues } from '../apps/hubspot/helpers/get-product.allowed-values';
import { getHubspotTicketAllowedValues } from '../apps/hubspot/helpers/get-ticket-allowed-value';
import { getHubspotUserAllowedValues } from '../apps/hubspot/helpers/get-user-allowed-values';
import { getHubspotCompanyPropertiesAllowedValues } from '../apps/hubspot/helpers/object-properties-allowed-values';

let connection: string;
// TODO: finish tests as soon as the connection is fixed (schema map error)
describe('Tests Hubspot actions', () => {
  const token = process.env.HUBSPOT_TOKEN;
  let customObjectType: string;
  beforeAll(() => {
    expect(token).toBeDefined();

    connection = testApi.createConnection('hubspot', {
      opts: {
        token,
      },
    });

    expect(connection).toBeDefined();
  });

  // Allowed values
  describe('Tests Hubspot options allowed values', () => {
    afterEach(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    const baseContext = {
      conn_opts: {
        token: token!,
      },
    } as TQoreAppActionFunctionContext<TCustomConnOptions>;

    let objectType: string;

    it('Should get Hubspot contact allowed values', async () => {
      const allowedValues = await getHubspotContactAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot user allowed values', async () => {
      const allowedValues = await getHubspotUserAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot company allowed values', async () => {
      const allowedValues = await getHubspotCompanyAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot custom object type allowed values', async () => {
      const allowedValues = await getHubspotCustomObjectTypeAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();

      objectType = allowedValues[0].value;
      customObjectType = objectType;
    });

    it('Should get Hubspot custom object ID allowed values', async () => {
      const allowedValues = await getHubspotCustomObjectIdAllowedValues({
        ...baseContext,
        opts: {
          objectType,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot deal allowed values', async () => {
      const allowedValues = await getHubspotDealAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot ticket allowed values', async () => {
      const allowedValues = await getHubspotTicketAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot lead allowed values', async () => {
      const allowedValues = await getHubspotLeadAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot product allowed values', async () => {
      const allowedValues = await getHubspotProductAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot object properties allowed values', async () => {
      const allowedValues = await getHubspotCompanyPropertiesAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });
  });

  // Companies actions tests
  describe('Tests Hubspot companies actions', () => {
    let companyId: string;
    it('Should show all hubspot companies (getPage)', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-companies_getPage',
        connection,
        {
          properties: ['annualrevenue'],
        }
      );

      expect(body).toBeDefined();
      expect(body.results.length).toBeGreaterThan(0);
      expect(body.results[0].properties).toHaveProperty('annualrevenue');
    });

    it('Should create a hubspot company', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-companies_create',
        connection,
        {
          associations: [
            {
              to: {
                id: '123',
              },
              types: [],
            },
          ],
          properties: {
            name: 'Test Company',
            annualrevenue: '500000',
          },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();

      companyId = body.id;
    });

    it('Should search hubspot companies', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-companies-search_doSearch',
        connection,
        {
          filterGroups: [
            {
              filters: [{ propertyName: 'name', operator: 'EQ', value: 'Test Company' }],
            },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();
    });

    it('Should get a hubspot company by id', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-companies-companyId_getById',
        connection,
        {
          companyId,
          properties: ['annualrevenue'],
        }
      );

      expect(body).toBeDefined();
      expect(body.properties).toHaveProperty('annualrevenue');
    });

    it('Should update a hubspot company', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'patch-crm-v3-objects-companies-companyId_update',
        connection,
        {
          companyId,
          properties: { annualrevenue: '750000' },
        }
      );

      expect(body).toBeDefined();
      expect(body.properties).toHaveProperty('annualrevenue');
      expect(body.properties.annualrevenue).toBe('750000');
    });

    it('Should archive a hubspot company', async () => {
      await testApi.execAppAction(
        'hubspot',
        'delete-crm-v3-objects-companies-companyId_archive',
        connection,
        { companyId }
      );
    });
  });

  // Contacts actions tests
  describe('Tests Hubspot contacts actions', () => {
    let contactId: string;

    it('Should get hubspot contacts', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-contacts',
        connection,
        { properties: ['email'] }
      );

      expect(body).toBeDefined();
      expect(body.results.length).toBeGreaterThan(0);
      expect(body.results[0].properties).toHaveProperty('email');
    });

    it('Should create a hubspot contact', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-contacts',
        connection,
        {
          associations: [
            {
              to: {
                id: '123',
              },
              types: [],
            },
          ],
          properties: {
            email: 'test@example.com',
            firstname: 'Test',
            lastname: 'User',
          },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();

      contactId = body.id;
    });

    it('Should search hubspot contacts', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-contacts-search',
        connection,
        {
          filterGroups: [
            {
              filters: [{ propertyName: 'email', operator: 'EQ', value: 'test@example.com' }],
            },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();
    });

    it('Should get a hubspot contact by id', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-contacts-contactId',
        connection,
        {
          contactId,
          properties: ['email'],
        }
      );

      expect(body).toBeDefined();
      expect(body.properties).toHaveProperty('email');
    });

    it('Should update a hubspot contact', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'patch-crm-v3-objects-contacts-contactId',
        connection,
        {
          contactId,
          properties: { firstname: 'Updated' },
        }
      );

      expect(body).toBeDefined();
    });

    it('Should delete a hubspot contact', async () => {
      await testApi.execAppAction(
        'hubspot',
        'delete-crm-v3-objects-contacts-contactId',
        connection,
        { contactId }
      );
    });
  });

  // Custom Objects actions tests
  describe('Tests Hubspot custom objects actions', () => {
    it('Should get custom objects page', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-objectType_getPage',
        connection,
        {
          objectType: customObjectType,
          properties: ['custom_field'],
        }
      );

      expect(body).toBeDefined();
      expect(body.results.length).toBeGreaterThan(0);
    });
  });

  // Deals actions tests
  describe('Tests Hubspot deals actions', () => {
    let dealId: string;

    it('Should get deals page', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-deals_getPage',
        connection,
        { properties: ['amount'] }
      );

      expect(body).toBeDefined();
      expect(body.results.length).toBeGreaterThan(0);
    });

    it('Should create a deal', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-deals_create',
        connection,
        {
          associations: [
            {
              to: {
                id: '123',
              },
              types: [],
            },
          ],
          properties: { dealname: 'Test Deal', amount: '1000' },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();
      dealId = body.id;
    });

    it('Should search deals', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-deals-search_doSearch',
        connection,
        {
          filterGroups: [
            {
              filters: [{ propertyName: 'dealname', operator: 'EQ', value: 'Test Deal' }],
            },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();
    });

    it('Should get a deal by id', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-deals-dealId_getById',
        connection,
        {
          dealId,
          properties: ['amount'],
        }
      );

      expect(body).toBeDefined();
      expect(body.properties).toHaveProperty('amount');
    });

    it('Should update a deal', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'patch-crm-v3-objects-deals-dealId_update',
        connection,
        {
          dealId,
          properties: { amount: '2000' },
        }
      );

      expect(body).toBeDefined();
    });

    it('Should archive a deal', async () => {
      await testApi.execAppAction(
        'hubspot',
        'delete-crm-v3-objects-deals-dealId_archive',
        connection,
        { dealId }
      );
    });
  });

  // Products actions tests
  describe('Tests Hubspot products actions', () => {
    let productId: string;

    it('Should get products page', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-products_getPage',
        connection,
        { properties: ['price'] }
      );

      expect(body).toBeDefined();
      expect(body.results.length).toBeGreaterThan(0);
    });

    it('Should create a product', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-products_create',
        connection,
        {
          associations: [
            {
              to: {
                id: '123',
              },
              types: [],
            },
          ],
          properties: { name: 'Test Product', price: '100' },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();

      productId = body.id;
    });

    it('Should search products', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-products-search_doSearch',
        connection,
        {
          filterGroups: [
            {
              filters: [{ propertyName: 'name', operator: 'EQ', value: 'Test Product' }],
            },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();
    });

    it('Should get a product by id', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-products-productId_getById',
        connection,
        {
          productId,
          properties: ['price'],
        }
      );

      expect(body).toBeDefined();
      expect(body.properties).toHaveProperty('price');
    });

    it('Should update a product', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'patch-crm-v3-objects-products-productId_update',
        connection,
        {
          productId,
          properties: { price: '120' },
        }
      );

      expect(body).toBeDefined();
    });

    it('Should archive a product', async () => {
      await testApi.execAppAction(
        'hubspot',
        'delete-crm-v3-objects-products-productId_archive',
        connection,
        { productId }
      );
    });
  });

  // Tickets actions tests
  describe('Tests Hubspot tickets actions', () => {
    let ticketId: string;

    it('Should get tickets page', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-tickets_getPage',
        connection,
        { properties: ['subject'] }
      );

      expect(body).toBeDefined();
      expect(body.results.length).toBeGreaterThan(0);
    });

    it('Should create a ticket', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-tickets_create',
        connection,
        {
          associations: [
            {
              to: {
                id: '123',
              },
              types: [],
            },
          ],
          properties: {
            hs_pipeline: '0',
            hs_pipeline_stage: '1',
            hs_ticket_priority: 'HIGH',
            subject: 'troubleshoot report',
          },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();

      ticketId = body.id;
    });

    it('Should search tickets', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-tickets-search_doSearch',
        connection,
        {
          filterGroups: [
            {
              filters: [{ propertyName: 'subject', operator: 'EQ', value: 'Test Ticket' }],
            },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();
    });

    it('Should get a ticket by id', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-tickets-ticketId_getById',
        connection,
        {
          ticketId,
          properties: ['subject'],
        }
      );

      expect(body).toBeDefined();
      expect(body.properties).toHaveProperty('subject');
    });

    it('Should update a ticket', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'patch-crm-v3-objects-tickets-ticketId_update',
        connection,
        {
          ticketId,
          properties: { subject: 'Updated Ticket' },
        }
      );

      expect(body).toBeDefined();
    });

    it('Should archive a ticket', async () => {
      await testApi.execAppAction(
        'hubspot',
        'delete-crm-v3-objects-tickets-ticketId_archive',
        connection,
        { ticketId }
      );
    });
  });

  // Users actions tests
  describe('Tests Hubspot users actions', () => {
    let userId: string;

    it('Should get hubspot users', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-users',
        connection,
        {}
      );

      expect(body).toBeDefined();
      expect(Array.isArray(body.results)).toBe(true);

      userId = body.results[0].id;
    });

    it('Should search hubspot users', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-users-search',
        connection,
        {
          sorts: [
            {
              propertyName: 'hs_createdate',
              direction: 'DESCENDING',
            },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();
    });

    it('Should get a hubspot user by id', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-users-userId',
        connection,
        { userId }
      );

      expect(body).toBeDefined();
    });

    it('Should update a hubspot user', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'patch-crm-v3-objects-users-userId',
        connection,
        {
          userId,
          properties: { hs_job_title: 'Updated' },
        }
      );

      expect(body).toBeDefined();
    });
  });
});
