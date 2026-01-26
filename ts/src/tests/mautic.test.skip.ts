/**
 * Mautic Integration Tests
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { configDotenv } from 'dotenv';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

// Import actions
import CreateContact from '../apps/mautic/actions/create-contact.action';
import DeleteContact from '../apps/mautic/actions/delete-contact.action';
import EditContactPoints from '../apps/mautic/actions/edit-contact-points.action';
import EditDoNotContact from '../apps/mautic/actions/edit-do-not-contact.action';
import GetContact from '../apps/mautic/actions/get-contact.action';
import GetManyContacts from '../apps/mautic/actions/get-many-contacts.action';
import UpdateContact from '../apps/mautic/actions/update-contact.action';

import CreateCompany from '../apps/mautic/actions/create-company.action';
import DeleteCompany from '../apps/mautic/actions/delete-company.action';
import GetCompany from '../apps/mautic/actions/get-company.action';
import GetManyCompanies from '../apps/mautic/actions/get-many-companies.action';
import UpdateCompany from '../apps/mautic/actions/update-company.action';

import AddContactToCompany from '../apps/mautic/actions/add-contact-to-company.action';
import RemoveContactFromCompany from '../apps/mautic/actions/remove-contact-from-company.action';

// Import helpers
import { getMauticCampaignsAllowedValues } from '../apps/mautic/helpers/get-campaigns-allowed-values';
import { getMauticCompaniesAllowedValues } from '../apps/mautic/helpers/get-companies-allowed-values';
import { getMauticContactsAllowedValues } from '../apps/mautic/helpers/get-contacts-allowed-values';
import { getMauticEmailsAllowedValues } from '../apps/mautic/helpers/get-emails-allowed-values';
import { getMauticSegmentsAllowedValues } from '../apps/mautic/helpers/get-segments-allowed-values';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Mautic Integration', () => {
  const baseContext = {
    conn_opts: {
      instance_url: '',
      username: '',
      password: '',
    } as any,
  };

  // Test data tracking for cleanup
  let testContactId: number | null = null;
  let testCompanyId: number | null = null;

  beforeAll(async () => {
    const instanceUrl = process.env.MAUTIC_INSTANCE_URL;
    const username = process.env.MAUTIC_USERNAME;
    const password = process.env.MAUTIC_PASSWORD;

    if (!instanceUrl || !username || !password) {
      throw new Error(
        'Please set MAUTIC_INSTANCE_URL, MAUTIC_USERNAME, and MAUTIC_PASSWORD environment variables.'
      );
    }

    baseContext.conn_opts.instance_url = instanceUrl;
    baseContext.conn_opts.username = username;
    baseContext.conn_opts.password = password;
  });

  afterEach(async () => {
    await delay(500);
  });

  afterAll(async () => {
    // Cleanup: delete test contact and company if they exist
    if (testContactId && 'api_function' in DeleteContact) {
      try {
        await DeleteContact.api_function({ contact: testContactId }, undefined, baseContext);
      } catch {
        // Ignore cleanup errors
      }
    }

    if (testCompanyId && 'api_function' in DeleteCompany) {
      try {
        await DeleteCompany.api_function({ company: testCompanyId }, undefined, baseContext);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Contact Actions', () => {
    describe('Create Contact', () => {
      it('should create a new contact with required fields', async () => {
        if (!('api_function' in CreateContact)) throw new Error('api_function not found');

        const timestamp = Date.now();
        const result = await CreateContact.api_function(
          {
            email: `test-${timestamp}@example.com`,
            firstname: 'Test',
            lastname: 'User',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.contact).toBeDefined();
        expect(result.contact.id).toBeDefined();

        // Store for later tests and cleanup
        testContactId = result.contact.id;
      });

      it('should create a contact with all optional fields', async () => {
        if (!('api_function' in CreateContact)) throw new Error('api_function not found');

        const timestamp = Date.now();
        const result = await CreateContact.api_function(
          {
            email: `full-${timestamp}@example.com`,
            firstname: 'Full',
            lastname: 'Contact',
            phone: '+1234567890',
            mobile: '+0987654321',
            company: 'Test Company',
            position: 'Developer',
            address1: '123 Main St',
            city: 'New York',
            zipcode: '10001',
            website: 'https://example.com',
            tags: ['test', 'integration'],
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.contact).toBeDefined();
        expect(result.contact.id).toBeDefined();

        // Clean up this contact
        if ('api_function' in DeleteContact) {
          await DeleteContact.api_function({ contact: result.contact.id }, undefined, baseContext);
        }
      });

      it('should fail when email is missing', async () => {
        if (!('api_function' in CreateContact)) throw new Error('api_function not found');

        await expect(
          CreateContact.api_function({ firstname: 'Test' } as any, undefined, baseContext)
        ).rejects.toThrow();
      });
    });

    describe('Get Contact', () => {
      it('should get a contact by ID', async () => {
        if (!testContactId) throw new Error('No test contact available');
        if (!('api_function' in GetContact)) throw new Error('api_function not found');

        const result = await GetContact.api_function(
          { contact: testContactId },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.contact).toBeDefined();
        expect(result.contact.id).toBe(testContactId);
      });

      it('should fail for non-existent contact ID', async () => {
        if (!('api_function' in GetContact)) throw new Error('api_function not found');

        await expect(
          GetContact.api_function({ contact: 999999999 }, undefined, baseContext)
        ).rejects.toThrow();
      });
    });

    describe('Get Many Contacts', () => {
      it('should get a list of contacts', async () => {
        if (!('api_function' in GetManyContacts)) throw new Error('api_function not found');

        const result = await GetManyContacts.api_function({ limit: 10 }, undefined, baseContext);

        expect(result).toBeDefined();
        expect(result.contacts).toBeDefined();
        expect(Array.isArray(result.contacts)).toBe(true);
        expect(result.total).toBeDefined();
      });

      it('should search contacts by query', async () => {
        if (!('api_function' in GetManyContacts)) throw new Error('api_function not found');

        const result = await GetManyContacts.api_function(
          { search: 'test', limit: 5 },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.contacts).toBeDefined();
        expect(Array.isArray(result.contacts)).toBe(true);
      });

      it('should paginate contacts', async () => {
        if (!('api_function' in GetManyContacts)) throw new Error('api_function not found');

        const result = await GetManyContacts.api_function(
          { limit: 5, start: 0 },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.contacts).toBeDefined();
        expect(result.contacts.length).toBeLessThanOrEqual(5);
      });
    });

    describe('Update Contact', () => {
      it('should update contact fields', async () => {
        if (!testContactId) throw new Error('No test contact available');
        if (!('api_function' in UpdateContact)) throw new Error('api_function not found');

        const result = await UpdateContact.api_function(
          {
            contact: testContactId,
            firstname: 'Updated',
            lastname: 'Name',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.contact).toBeDefined();
      });
    });

    describe('Edit Contact Points', () => {
      it('should add points to a contact', async () => {
        if (!testContactId) throw new Error('No test contact available');
        if (!('api_function' in EditContactPoints)) throw new Error('api_function not found');

        const result = await EditContactPoints.api_function(
          {
            contact: testContactId,
            operation: 'add',
            points: 10,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });

      it('should subtract points from a contact', async () => {
        if (!testContactId) throw new Error('No test contact available');
        if (!('api_function' in EditContactPoints)) throw new Error('api_function not found');

        const result = await EditContactPoints.api_function(
          {
            contact: testContactId,
            operation: 'subtract',
            points: 5,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });
    });

    describe('Edit Do Not Contact', () => {
      it('should add contact to DNC list', async () => {
        if (!testContactId) throw new Error('No test contact available');
        if (!('api_function' in EditDoNotContact)) throw new Error('api_function not found');

        const result = await EditDoNotContact.api_function(
          {
            contact: testContactId,
            operation: 'add',
            channel: 'email',
            reason: 3,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });

      it('should remove contact from DNC list', async () => {
        if (!testContactId) throw new Error('No test contact available');
        if (!('api_function' in EditDoNotContact)) throw new Error('api_function not found');

        const result = await EditDoNotContact.api_function(
          {
            contact: testContactId,
            operation: 'remove',
            channel: 'email',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });
    });
  });

  describe('Company Actions', () => {
    describe('Create Company', () => {
      it('should create a new company', async () => {
        if (!('api_function' in CreateCompany)) throw new Error('api_function not found');

        const timestamp = Date.now();
        const result = await CreateCompany.api_function(
          {
            companyname: `Test Company ${timestamp}`,
            companyemail: `company-${timestamp}@example.com`,
            companyphone: '+1234567890',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.company).toBeDefined();
        expect(result.company.id).toBeDefined();

        // Store for later tests and cleanup
        testCompanyId = result.company.id;
      });

      it('should fail when company name is missing', async () => {
        if (!('api_function' in CreateCompany)) throw new Error('api_function not found');

        await expect(
          CreateCompany.api_function(
            { companyemail: 'test@example.com' } as any,
            undefined,
            baseContext
          )
        ).rejects.toThrow();
      });
    });

    describe('Get Company', () => {
      it('should get a company by ID', async () => {
        if (!testCompanyId) throw new Error('No test company available');
        if (!('api_function' in GetCompany)) throw new Error('api_function not found');

        const result = await GetCompany.api_function(
          { company: testCompanyId },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.company).toBeDefined();
        expect(result.company.id).toBe(testCompanyId);
      });
    });

    describe('Get Many Companies', () => {
      it('should get a list of companies', async () => {
        if (!('api_function' in GetManyCompanies)) throw new Error('api_function not found');

        const result = await GetManyCompanies.api_function({ limit: 10 }, undefined, baseContext);

        expect(result).toBeDefined();
        expect(result.companies).toBeDefined();
        expect(Array.isArray(result.companies)).toBe(true);
        expect(result.total).toBeDefined();
      });
    });

    describe('Update Company', () => {
      it('should update company fields', async () => {
        if (!testCompanyId) throw new Error('No test company available');
        if (!('api_function' in UpdateCompany)) throw new Error('api_function not found');

        const result = await UpdateCompany.api_function(
          {
            company: testCompanyId,
            companydescription: 'Updated description',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.company).toBeDefined();
      });
    });
  });

  describe('Company Contact Associations', () => {
    describe('Add Contact to Company', () => {
      it('should add a contact to a company', async () => {
        if (!testContactId || !testCompanyId) {
          throw new Error('No test contact or company available');
        }
        if (!('api_function' in AddContactToCompany)) throw new Error('api_function not found');

        const result = await AddContactToCompany.api_function(
          {
            company: testCompanyId,
            contact: testContactId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });
    });

    describe('Remove Contact from Company', () => {
      it('should remove a contact from a company', async () => {
        if (!testContactId || !testCompanyId) {
          throw new Error('No test contact or company available');
        }
        if (!('api_function' in RemoveContactFromCompany))
          throw new Error('api_function not found');

        const result = await RemoveContactFromCompany.api_function(
          {
            company: testCompanyId,
            contact: testContactId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });
    });
  });

  describe('Helpers - Allowed Values', () => {
    describe('getMauticContactsAllowedValues', () => {
      it('should return a list of contacts as allowed values', async () => {
        const result = await getMauticContactsAllowedValues(baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        if (result.length > 0) {
          expect(result[0]).toHaveProperty('value');
          expect(result[0]).toHaveProperty('display_name');
        }
      });
    });

    describe('getMauticCompaniesAllowedValues', () => {
      it('should return a list of companies as allowed values', async () => {
        const result = await getMauticCompaniesAllowedValues(baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        if (result.length > 0) {
          expect(result[0]).toHaveProperty('value');
          expect(result[0]).toHaveProperty('display_name');
        }
      });
    });

    describe('getMauticCampaignsAllowedValues', () => {
      it('should return a list of campaigns as allowed values', async () => {
        const result = await getMauticCampaignsAllowedValues(baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('getMauticSegmentsAllowedValues', () => {
      it('should return a list of segments as allowed values', async () => {
        const result = await getMauticSegmentsAllowedValues(baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('getMauticEmailsAllowedValues', () => {
      it('should return a list of emails as allowed values', async () => {
        const result = await getMauticEmailsAllowedValues(baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Delete Contact', () => {
    it('should delete a contact', async () => {
      // Create a contact to delete
      if (!('api_function' in CreateContact)) throw new Error('api_function not found');

      const timestamp = Date.now();
      const createResult = await CreateContact.api_function(
        {
          email: `delete-me-${timestamp}@example.com`,
          firstname: 'Delete',
          lastname: 'Me',
        },
        undefined,
        baseContext
      );

      const contactToDelete = createResult.contact.id;

      if (!('api_function' in DeleteContact)) throw new Error('api_function not found');

      const result = await DeleteContact.api_function(
        { contact: contactToDelete },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
    });
  });

  describe('Delete Company', () => {
    it('should delete a company', async () => {
      // Create a company to delete
      if (!('api_function' in CreateCompany)) throw new Error('api_function not found');

      const timestamp = Date.now();
      const createResult = await CreateCompany.api_function(
        {
          companyname: `Delete Me Company ${timestamp}`,
        },
        undefined,
        baseContext
      );

      const companyToDelete = createResult.company.id;

      if (!('api_function' in DeleteCompany)) throw new Error('api_function not found');

      const result = await DeleteCompany.api_function(
        { company: companyToDelete },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
    });
  });
});
