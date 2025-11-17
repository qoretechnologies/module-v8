import { configDotenv } from 'dotenv';
import {
  AddBrevoContactsToList,
  CreateBrevoCompany,
  CreateBrevoContact,
  CreateBrevoList,
  DeleteBrevoCompany,
  DeleteBrevoContact,
  DeleteBrevoList,
  GetBrevoCompany,
  GetBrevoContact,
  GetBrevoList,
  ListBrevoCompanies,
  ListBrevoContacts,
  ListBrevoFolders,
  ListBrevoLists,
  RemoveBrevoContactsFromList,
  UpdateBrevoCompany,
  UpdateBrevoContact,
  UpdateBrevoList
} from '../apps/brevo/actions';
import { getBrevoCompanyAllowedValues } from '../apps/brevo/helpers/get-company-allowed-values';
import { getBrevoContactAllowedValues } from '../apps/brevo/helpers/get-contact-allowed-values';
import { getBrevoDealAllowedValues } from '../apps/brevo/helpers/get-deal-allowed-values';
import { getBrevoFolderAllowedValues } from '../apps/brevo/helpers/get-folder-allowed-values';
import { getBrevoListAllowedValues } from '../apps/brevo/helpers/get-list-allowed-values';
import {
  BrevoNewCompanyTrigger,
  BrevoNewContactTrigger,
  BrevoNewDealTrigger,
  BrevoNewListTrigger,
} from '../apps/brevo/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Brevo', () => {
  const base_context = {
    conn_opts: {
      token: undefined,
    } as any,
  };

  beforeAll(() => {
    const token = process.env.BREVO_API_KEY;

    if (!token) {
      throw new Error(`
        Please set the BREVO_API_KEY environment variable.
      `);
    }

    base_context.conn_opts.token = token;
  });

  describe('Should test allowed values', () => {
    it('Should get list allowed values', async () => {
      const allowed_values = await getBrevoListAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });
    it('Should get contact allowed values', async () => {
      const allowed_values = await getBrevoContactAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get folder allowed values', async () => {
      const allowed_values = await getBrevoFolderAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get company allowed values', async () => {
      const allowed_values = await getBrevoCompanyAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get deal allowed values', async () => {
      const allowed_values = await getBrevoDealAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    let createdContact: string | undefined;
    let folderId: number | undefined;
    let createdList: number | undefined;
    let createdCompany: string | undefined;
    // let createdDeal: string | undefined;

    it('Should list folders', async () => {
      const action = ListBrevoFolders;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);
      expect(result).toBeDefined();
      expect(Array.isArray(result.folders)).toBeTruthy();

      folderId = result.folders[0].id;
    });

    it('Should create contact', async () => {
      const action = CreateBrevoContact;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          email: 'test@example.com',
          attributes: {
            FIRSTNAME: 'Test',
            LASTNAME: 'User',
          },
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdContact = result.id;
    });

    it('Should get contact', async () => {
      const action = GetBrevoContact;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          identifier: createdContact,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdContact);
    });

    it('Should update contact', async () => {
      const action = UpdateBrevoContact;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          identifier: createdContact,
          attributes: {
            FIRSTNAME: 'Updated',
            LASTNAME: 'User',
          },
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
    });

    it('Should list contacts', async () => {
      const action = ListBrevoContacts;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);
      expect(result).toBeDefined();
      expect(Array.isArray(result.contacts)).toBeTruthy();
    });

    it('Should create a list', async () => {
      const action = CreateBrevoList;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!folderId) throw new Error('folderId is not defined');

      const result = await action.api_function(
        {
          name: 'Test List',
          folderId,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdList = result.id;
    });

    it('Should get a list', async () => {
      const action = GetBrevoList;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdList) throw new Error('createdList is not defined');

      const result = await action.api_function(
        {
          listId: createdList,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(createdList);
    });

    it('Should list lists', async () => {
      const action = ListBrevoLists;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);
      expect(result).toBeDefined();
      expect(Array.isArray(result.lists)).toBeTruthy();
    });

    it('Should update list', async () => {
      const action = UpdateBrevoList;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdList) throw new Error('createdList is not defined');

      const result = await action.api_function(
        {
          listId: createdList,
          name: 'Updated List',
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
    });

    it('Should add contact to a list', async () => {
      const action = AddBrevoContactsToList;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdList) throw new Error('createdList is not defined');
      if (!createdContact) throw new Error('createdContact is not defined');

      const result = await action.api_function(
        {
          listId: createdList,
          ids: [parseInt(createdContact, 10)],
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
    });

    it('Should remove contact from a list', async () => {
      const action = RemoveBrevoContactsFromList;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdList) throw new Error('createdList is not defined');
      if (!createdContact) throw new Error('createdContact is not defined');

      const result = await action.api_function(
        {
          listId: createdList,
          ids: [parseInt(createdContact, 10)],
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
    });

    it('Should create a company', async () => {
      const action = CreateBrevoCompany;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          name: 'Test Company',
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdCompany = result.id;
    });

    it('Should list companies', async () => {
      const action = ListBrevoCompanies;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          filter: {
            field: 'name',
            value: 'Test Company',
          },
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBeTruthy();
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('Should get company', async () => {
      const action = GetBrevoCompany;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdCompany) throw new Error('createdCompany is not defined');

      const result = await action.api_function(
        {
          companyId: createdCompany,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.attributes.name).toBe('Test Company');
    });

    it('Should update a company', async () => {
      const action = UpdateBrevoCompany;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdCompany) throw new Error('createdCompany is not defined');

      const result = await action.api_function(
        {
          companyId: createdCompany,
          attributes: {
            name: 'Updated Company',
          },
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
    });

    // Brevo free tier limits deals API access
    // it('Should create a deal', async () => {
    //   const action = CreateBrevoDeal;
    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   const result = await action.api_function(
    //     {
    //       name: 'Test Deal',
    //     },
    //     undefined,
    //     base_context
    //   );
    //   expect(result).toBeDefined();
    //   expect(result.id).toBeDefined();

    //   createdDeal = result.id;
    // });

    // it('Should update a deal', async () => {
    //   const action = UpdateBrevoDeal;
    //   if (!('api_function' in action)) throw new Error('api_function not found in action');
    //   if (!createdDeal) throw new Error('createdDeal is not defined');

    //   const result = await action.api_function(
    //     {
    //       dealId: createdDeal,
    //       name: 'Updated Deal',
    //     },
    //     undefined,
    //     base_context
    //   );
    //   expect(result).toBeDefined();
    // });

    // it('Should get deals', async () => {
    //   const action = ListBrevoDeals;
    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   const result = await action.api_function({}, undefined, base_context);
    //   expect(result).toBeDefined();
    //   expect(Array.isArray(result.items)).toBeTruthy();
    //   expect(result.items.length).toBeGreaterThan(0);
    // });

    // it('Should get a deal', async () => {
    //   const action = GetBrevoDeal;
    //   if (!('api_function' in action)) throw new Error('api_function not found in action');
    //   if (!createdDeal) throw new Error('createdDeal is not defined');

    //   const result = await action.api_function(
    //     {
    //       dealId: ,
    //     },
    //     undefined,
    //     base_context
    //   );
    //   expect(result).toBeDefined();
    //   expect(result.id).toBeDefined();
    //   expect(result.attributes.deal_name).toBe('Updated Deal');
    // });

    // it('Should delete a deal', async () => {
    //   const action = DeleteBrevoDeal;
    //   if (!('api_function' in action)) throw new Error('api_function not found in action');
    //   if (!createdDeal) throw new Error('createdDeal is not defined');

    //   const result = await action.api_function(
    //     {
    //       dealId: createdDeal,
    //     },
    //     undefined,
    //     base_context
    //   );
    //   expect(result).toBeDefined();
    // });

    it('Should delete a company', async () => {
      const action = DeleteBrevoCompany;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdCompany) throw new Error('createdCompany is not defined');

      const result = await action.api_function(
        {
          companyId: createdCompany,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
    });

    it('Should delete contact', async () => {
      const action = DeleteBrevoContact;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          identifier: createdContact,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
    });

    it('Should delete a list', async () => {
      const action = DeleteBrevoList;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdList) throw new Error('createdList is not defined');

      const result = await action.api_function(
        {
          listId: createdList,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new contact trigger', async () => {
      const trigger = BrevoNewContactTrigger;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should get example event data for new deal trigger', async () => {
      const trigger = BrevoNewDealTrigger;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should get example event data for new company trigger', async () => {
      const trigger = BrevoNewCompanyTrigger;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should get example event data for new list trigger', async () => {
      const trigger = BrevoNewListTrigger;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });
});
