import { TCustomConnOptions, TQoreAppActionFunctionContext } from '@qoretechnologies/ts-toolkit';
import { getHubspotCompanyAllowedValues } from '../apps/hubspot/helpers/get-company-allowed-values';
import { getHubspotContactAllowedValues } from '../apps/hubspot/helpers/get-contact-allowed-values';
import { getHubspotCustomObjectIdAllowedValues } from '../apps/hubspot/helpers/get-cusom-object-id-allowed-values';
import { getHubspotCustomObjectTypeAllowedValues } from '../apps/hubspot/helpers/get-custom-object-type-allowed-values';
import { getHubspotDealAllowedValues } from '../apps/hubspot/helpers/get-deal-allowed-values';
import { getHubspotLeadAllowedValues } from '../apps/hubspot/helpers/get-lead-allowed-values';
import { getHubspotProductAllowedValues } from '../apps/hubspot/helpers/get-product.allowe-values';
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

    it('Should get Hubspot user allowed values', async () => {
      const allowedValues = await getHubspotUserAllowedValues(baseContext);

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
          properties: {
            name: 'Test Company',
            annualrevenue: '500000',
          },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();
    });

    it('Should batch upsert hubspot companies', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-companies-batch-upsert_upsert',
        connection,
        {
          inputs: [
            { properties: { name: 'Company One', annualrevenue: '100000' } },
            { properties: { name: 'Company Two', annualrevenue: '200000' } },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();
      expect(Array.isArray(body.results)).toBe(true);
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

    it('Should archive a hubspot company', async () => {
      const companyId = '123'; // Replace with a valid company id
      const { body } = await testApi.execAppAction(
        'hubspot',
        'delete-crm-v3-objects-companies-companyId_archive',
        connection,
        { companyId }
      );

      expect(body).toBeDefined();
      // Add additional assertions based on expected archive response.
    });

    it('Should get a hubspot company by id', async () => {
      const companyId = '123'; // Replace with a valid company id
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
      const companyId = '123'; // Replace with a valid company id
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
      // Optionally, verify that the property was updated.
    });
  });

  // Contacts actions tests
  describe('Tests Hubspot contacts actions', () => {
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
          properties: {
            email: 'test@example.com',
            firstname: 'Test',
            lastname: 'User',
          },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();
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

    it('Should delete a hubspot contact', async () => {
      const contactId = '123'; // Replace with a valid contact id
      const { body } = await testApi.execAppAction(
        'hubspot',
        'delete-crm-v3-objects-contacts-contactId',
        connection,
        { contactId }
      );

      expect(body).toBeDefined();
    });

    it('Should get a hubspot contact by id', async () => {
      const contactId = '123'; // Replace with a valid contact id
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
      const contactId = '123'; // Replace with a valid contact id
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
    let dealIds: string[];

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
          properties: { dealname: 'Test Deal', amount: '1000' },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();
      dealId = body.id;
    });

    it('Should batch upsert deals', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-deals-batch-upsert_upsert',
        connection,
        {
          inputs: [
            { properties: { dealname: 'Deal One', amount: '500' } },
            { properties: { dealname: 'Deal Two', amount: '1500' } },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();
      dealIds = body.results.map((result: any) => result.id);
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
      const { body } = await testApi.execAppAction(
        'hubspot',
        'delete-crm-v3-objects-deals-dealId_archive',
        connection,
        { dealId }
      );

      expect(body).toBeDefined();
    });

    it('Should archive remaining deals', async () => {
      await Promise.all(
        dealIds.map(async (id) => {
          const { body } = await testApi.execAppAction(
            'hubspot',
            'delete-crm-v3-objects-deals-dealId_archive',
            connection,
            { dealId: id }
          );

          expect(body).toBeDefined();
        })
      );
    });
  });

  // Leads actions tests
  describe('Tests Hubspot leads actions', () => {
    let leadsId: string;
    let leadIds: string[];

    it('Should get leads page', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-leads_getPage',
        connection,
        { properties: ['firstname'] }
      );

      expect(body).toBeDefined();
      expect(body.results.length).toBeGreaterThan(0);
    });

    it('Should create a lead', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-leads_create',
        connection,
        {
          properties: { firstname: 'Test Lead' },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();
      leadsId = body.id;
    });

    it('Should batch upsert leads', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-leads-batch-upsert_upsert',
        connection,
        {
          inputs: [
            { properties: { firstname: 'Lead One' } },
            { properties: { firstname: 'Lead Two' } },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();
      leadIds = body.results.map((result: any) => result.id);
    });

    it('Should search leads', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-leads-search_doSearch',
        connection,
        {
          filterGroups: [
            {
              filters: [{ propertyName: 'firstname', operator: 'EQ', value: 'Lead One' }],
            },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();
    });

    it('Should get a lead by id', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-leads-leadsId_getById',
        connection,
        {
          leadsId,
          properties: ['firstname'],
        }
      );

      expect(body).toBeDefined();
      expect(body.properties).toHaveProperty('firstname');
    });

    it('Should update a lead', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'patch-crm-v3-objects-leads-leadsId_update',
        connection,
        {
          leadsId,
          properties: { firstname: 'Updated Lead' },
        }
      );

      expect(body).toBeDefined();
    });

    it('Should archive a lead', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'delete-crm-v3-objects-leads-leadsId_archive',
        connection,
        { leadsId }
      );

      expect(body).toBeDefined();
    });

    it('Should archive remaining leads', async () => {
      await Promise.all(
        leadIds.map(async (id) => {
          const { body } = await testApi.execAppAction(
            'hubspot',
            'delete-crm-v3-objects-leads-leadsId_archive',
            connection,
            { leadsId: id }
          );

          expect(body).toBeDefined();
        })
      );
    });
  });

  // Products actions tests
  describe('Tests Hubspot products actions', () => {
    let productId: string;
    let productIds: string[];

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
          properties: { name: 'Test Product', price: '100' },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();

      productId = body.id;
    });

    it('Should batch upsert products', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-products-batch-upsert_upsert',
        connection,
        {
          inputs: [
            { properties: { name: 'Product One', price: '50' } },
            { properties: { name: 'Product Two', price: '150' } },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();

      productIds = body.results.map((result: any) => result.id);
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
      const productId = '123'; // Replace with a valid product id
      const { body } = await testApi.execAppAction(
        'hubspot',
        'delete-crm-v3-objects-products-productId_archive',
        connection,
        { productId }
      );

      expect(body).toBeDefined();
    });

    it('Should archive remaining products', async () => {
      await Promise.all(
        productIds.map(async (id) => {
          const { body } = await testApi.execAppAction(
            'hubspot',
            'delete-crm-v3-objects-products-productId_archive',
            connection,
            { productId: id }
          );

          expect(body).toBeDefined();
        })
      );
    });
  });

  // Tickets actions tests
  describe('Tests Hubspot tickets actions', () => {
    let ticketId: string;
    let ticketIds: string[];

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
          properties: { subject: 'Test Ticket', content: 'Ticket content' },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();

      ticketId = body.id;
    });

    it('Should batch upsert tickets', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-tickets-batch-upsert_upsert',
        connection,
        {
          inputs: [
            { properties: { subject: 'Ticket One', content: 'Content One' } },
            { properties: { subject: 'Ticket Two', content: 'Content Two' } },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();

      ticketIds = body.results.map((result: any) => result.id);
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
      const { body } = await testApi.execAppAction(
        'hubspot',
        'delete-crm-v3-objects-tickets-ticketId_archive',
        connection,
        { ticketId }
      );

      expect(body).toBeDefined();
    });

    it('Should archive remaining tickets', async () => {
      await Promise.all(
        ticketIds.map(async (id) => {
          const { body } = await testApi.execAppAction(
            'hubspot',
            'delete-crm-v3-objects-tickets-ticketId_archive',
            connection,
            { ticketId: id }
          );

          expect(body).toBeDefined();
        })
      );
    });
  });

  // Users actions tests
  describe('Tests Hubspot users actions', () => {
    let userId: string;
    let userIds: string[];

    it('Should get hubspot users', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'get-crm-v3-objects-users',
        connection,
        {}
      );

      expect(body).toBeDefined();
      expect(Array.isArray(body.results)).toBe(true);
    });

    it('Should create a hubspot user', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-users',
        connection,
        {
          properties: {
            email: 'user@example.com',
            firstname: 'User',
            lastname: 'Test',
          },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();

      userId = body.id;
    });

    it('Should batch upsert hubspot users', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-users-batch-upsert',
        connection,
        {
          inputs: [
            { properties: { email: 'user1@example.com', firstname: 'User1' } },
            { properties: { email: 'user2@example.com', firstname: 'User2' } },
          ],
        }
      );

      expect(body).toBeDefined();
      expect(body.results).toBeDefined();

      userIds = body.results.map((result: any) => result.id);
    });

    it('Should search hubspot users', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'post-crm-v3-objects-users-search',
        connection,
        {
          filterGroups: [
            {
              filters: [{ propertyName: 'email', operator: 'EQ', value: 'user@example.com' }],
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
          properties: { firstname: 'Updated' },
        }
      );

      expect(body).toBeDefined();
    });

    it('Should delete a hubspot user', async () => {
      const { body } = await testApi.execAppAction(
        'hubspot',
        'delete-crm-v3-objects-users-userId',
        connection,
        { userId }
      );

      expect(body).toBeDefined();
    });

    it('Should delete remaining hubspot users', async () => {
      await Promise.all(
        userIds.map(async (id) => {
          const { body } = await testApi.execAppAction(
            'hubspot',
            'delete-crm-v3-objects-users-userId',
            connection,
            { userId: id }
          );

          expect(body).toBeDefined();
        })
      );
    });
  });
});
