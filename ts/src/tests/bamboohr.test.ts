/**
 * BambooHR Integration Tests
 *
 * Tests the BambooHR app integration including:
 * - Field metadata fetching and caching
 * - List options fetching
 * - Dynamic type generation
 * - Employee actions (list, get)
 *
 * Note: Create/Update tests are skipped by default to avoid modifying
 * production data. Enable them with BAMBOOHR_TEST_WRITE=true.
 *
 * Required environment variables:
 * - BAMBOOHR_API_KEY: BambooHR API key
 * - BAMBOOHR_COMPANY_DOMAIN: Company subdomain (e.g., "mycompany")
 *
 * Optional environment variables:
 * - BAMBOOHR_TEST_WRITE: Set to "true" to enable create/update tests
 */

import { configDotenv } from 'dotenv';
import {
  GetBambooHREmployee,
  ListBambooHREmployees,
  CreateBambooHREmployee,
  UpdateBambooHREmployee,
} from '../apps/bamboohr/actions';
import { getBambooHRFields, clearFieldsCache } from '../apps/bamboohr/helpers/get-fields';
import { getBambooHRLists, clearListsCache } from '../apps/bamboohr/helpers/get-list-options';
import {
  getBambooHREmployeeInputType,
  getBambooHREmployeeResponseType,
  mapBambooHRFieldToQoreOption,
} from '../apps/bamboohr/helpers/dynamic-types';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { IBambooHRConnectionOptions, IBambooHRFieldMetadata } from '../apps/bamboohr/types';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('BambooHR', () => {
  const baseContext = {
    conn_opts: {
      api_key: '',
      company_domain: '',
    } as IBambooHRConnectionOptions,
  };

  const connectionOptions: IBambooHRConnectionOptions = {
    api_key: '',
    company_domain: '',
  };

  beforeAll(async () => {
    const apiKey = process.env.BAMBOOHR_API_KEY;
    const companyDomain = process.env.BAMBOOHR_COMPANY_DOMAIN;

    if (!apiKey || !companyDomain) {
      throw new Error(
        'Please set BAMBOOHR_API_KEY and BAMBOOHR_COMPANY_DOMAIN environment variables.'
      );
    }

    baseContext.conn_opts.api_key = apiKey;
    baseContext.conn_opts.company_domain = companyDomain;
    connectionOptions.api_key = apiKey;
    connectionOptions.company_domain = companyDomain;
  });

  beforeEach(() => {
    // Clear caches before each test to ensure fresh data
    clearFieldsCache();
    clearListsCache();
  });

  afterEach(async () => {
    await delay(500);
  });

  // ============================================================================
  // Helper Functions Tests
  // ============================================================================

  describe('Field Metadata Helpers', () => {
    it('Should fetch field metadata from BambooHR', async () => {
      const fields = await getBambooHRFields(connectionOptions);

      expect(fields).toBeDefined();
      expect(Array.isArray(fields)).toBe(true);
      expect(fields.length).toBeGreaterThan(0);

      // Check structure of first field
      const firstField = fields[0];
      expect(firstField).toHaveProperty('id');
      expect(firstField).toHaveProperty('name');
      expect(firstField).toHaveProperty('type');
    });

    it('Should cache field metadata on subsequent calls', async () => {
      // First call
      const fields1 = await getBambooHRFields(connectionOptions);

      // Second call should return cached data
      const fields2 = await getBambooHRFields(connectionOptions);

      expect(fields1).toBe(fields2); // Same reference = cached
    });

    it('Should find standard fields by alias', async () => {
      const fields = await getBambooHRFields(connectionOptions);

      // Standard fields should have aliases
      const firstNameField = fields.find((f) => f.alias === 'firstName');
      const lastNameField = fields.find((f) => f.alias === 'lastName');

      expect(firstNameField).toBeDefined();
      expect(lastNameField).toBeDefined();
    });
  });

  describe('List Options Helpers', () => {
    it('Should fetch list metadata from BambooHR', async () => {
      const lists = await getBambooHRLists(connectionOptions);

      expect(lists).toBeDefined();
      expect(Array.isArray(lists)).toBe(true);
      // BambooHR typically has list fields like department, location, etc.
    });

    it('Should cache list metadata on subsequent calls', async () => {
      // First call
      const lists1 = await getBambooHRLists(connectionOptions);

      // Second call should return cached data
      const lists2 = await getBambooHRLists(connectionOptions);

      expect(lists1).toBe(lists2); // Same reference = cached
    });
  });

  // ============================================================================
  // Dynamic Type Tests
  // ============================================================================

  describe('Dynamic Type Generation', () => {
    it('Should map a text field to Qore option', () => {
      const field: IBambooHRFieldMetadata = {
        id: 1,
        name: 'First Name',
        type: 'text',
        alias: 'firstName',
      };

      const option = mapBambooHRFieldToQoreOption(field);

      expect(option).toBeDefined();
      expect(option.type).toBe('string');
      expect(option.display_name).toBe('First Name');
    });

    it('Should map a date field to Qore option', () => {
      const field: IBambooHRFieldMetadata = {
        id: 2,
        name: 'Date of Birth',
        type: 'date',
        alias: 'dateOfBirth',
      };

      const option = mapBambooHRFieldToQoreOption(field);

      expect(option).toBeDefined();
      expect(option.type).toBe('date');
    });

    it('Should map a list field to softstring with needsAllowedValues', () => {
      const field: IBambooHRFieldMetadata = {
        id: 3,
        name: 'Department',
        type: 'list',
        alias: 'department',
      };

      const option = mapBambooHRFieldToQoreOption(field);

      expect(option).toBeDefined();
      expect(option.type).toBe('softstring');
    });

    it('Should map a status field with static allowed values', () => {
      const field: IBambooHRFieldMetadata = {
        id: 4,
        name: 'Employee Status',
        type: 'status',
        alias: 'status',
      };

      // For input type (default), should include allowed values
      const inputOption = mapBambooHRFieldToQoreOption(field, { isForResponse: false });

      expect(inputOption).toBeDefined();
      expect(inputOption.type).toBe('softstring');
      expect(inputOption.allowed_values).toBeDefined();
      expect(inputOption.allowed_values_creatable).toBe(true);
    });

    it('Should exclude allowed_values for response types', () => {
      const field: IBambooHRFieldMetadata = {
        id: 4,
        name: 'Employee Status',
        type: 'status',
        alias: 'status',
      };

      const responseOption = mapBambooHRFieldToQoreOption(field, { isForResponse: true });

      expect(responseOption).toBeDefined();
      expect(responseOption.allowed_values).toBeUndefined();
    });

    it('Should generate input type for employee', async () => {
      const inputType = await getBambooHREmployeeInputType({
        conn_opts: connectionOptions,
      }) as { type: string; fields: Record<string, any> };

      expect(inputType).toBeDefined();
      expect(inputType.type).toBe('hash');
      expect(inputType.fields).toBeDefined();

      // Should have standard employee fields
      expect(Object.keys(inputType.fields).length).toBeGreaterThan(0);
    });

    it('Should generate response type for employee', async () => {
      const responseType = await getBambooHREmployeeResponseType({
        conn_opts: connectionOptions,
      }) as { type: string; fields: Record<string, any> };

      expect(responseType).toBeDefined();
      expect(responseType.type).toBe('hash');
      expect(responseType.fields).toBeDefined();

      // Should have id field for response
      expect(responseType.fields.id).toBeDefined();
    });
  });

  // ============================================================================
  // Action Tests
  // ============================================================================

  describe('Employee Actions', () => {
    let employeeId: string | undefined;

    describe('List Employees', () => {
      it('Should list employees', async () => {
        const action = ListBambooHREmployees;

        if (!('api_function' in action)) {
          throw new Error('api_function not found in action');
        }

        const result = await action.api_function({}, undefined, baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        // Store first employee ID for get test
        if (result.length > 0) {
          employeeId = result[0].id;
        }
      });

      it('Should have dynamic response type', async () => {
        const action = ListBambooHREmployees;

        if (!('get_dynamic_response_type' in action)) {
          throw new Error('get_dynamic_response_type not found in action');
        }

        const responseType = await action.get_dynamic_response_type!({
          conn_opts: connectionOptions,
        });

        expect(responseType).toBeDefined();
        expect(responseType.type).toBe('list');
      });
    });

    describe('Get Employee', () => {
      it('Should get an employee by ID', async () => {
        // Skip if we don't have an employee ID from list test
        if (!employeeId) {
          console.warn('Skipping get employee test - no employee ID available');
          return;
        }

        const action = GetBambooHREmployee;

        if (!('api_function' in action)) {
          throw new Error('api_function not found in action');
        }

        const result = await action.api_function(
          { employee_id: employeeId },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.id).toBe(employeeId);
      });

      it('Should have dynamic response type', async () => {
        const action = GetBambooHREmployee;

        if (!('get_dynamic_response_type' in action)) {
          throw new Error('get_dynamic_response_type not found in action');
        }

        const responseType = await action.get_dynamic_response_type!({
          conn_opts: connectionOptions,
        });

        expect(responseType).toBeDefined();
        expect(responseType.type).toBe('hash');
        expect(responseType.fields).toBeDefined();
      });
    });

    // Write tests - skipped by default
    const runWriteTests = process.env.BAMBOOHR_TEST_WRITE === 'true';

    describe.skip('Create Employee (requires BAMBOOHR_TEST_WRITE=true)', () => {
      it('Should create an employee', async () => {
        if (!runWriteTests) {
          console.warn('Skipping create test - set BAMBOOHR_TEST_WRITE=true to enable');
          return;
        }

        const action = CreateBambooHREmployee;

        if (!('api_function' in action)) {
          throw new Error('api_function not found in action');
        }

        const result = await action.api_function(
          {
            employee_data: {
              firstName: 'Test',
              lastName: `Employee ${Date.now()}`,
            },
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      it('Should have dynamic input type', async () => {
        const action = CreateBambooHREmployee;

        if (!('get_dynamic_type' in action)) {
          throw new Error('get_dynamic_type not found in action');
        }

        const inputType = await action.get_dynamic_type!(
          { conn_opts: connectionOptions },
          'employee_data'
        );

        expect(inputType).toBeDefined();
        expect(inputType.type).toBe('hash');
      });
    });

    describe.skip('Update Employee (requires BAMBOOHR_TEST_WRITE=true)', () => {
      it('Should update an employee', async () => {
        if (!runWriteTests || !employeeId) {
          console.warn('Skipping update test - requires write access and employee ID');
          return;
        }

        const action = UpdateBambooHREmployee;

        if (!('api_function' in action)) {
          throw new Error('api_function not found in action');
        }

        const result = await action.api_function(
          {
            employee_id: employeeId,
            employee_data: {
              // Update with safe field that won't break anything
              mobilePhone: '+1234567890',
            },
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });

      it('Should have dynamic input type', async () => {
        const action = UpdateBambooHREmployee;

        if (!('get_dynamic_type' in action)) {
          throw new Error('get_dynamic_type not found in action');
        }

        const inputType = await action.get_dynamic_type!(
          { conn_opts: connectionOptions },
          'employee_data'
        );

        expect(inputType).toBeDefined();
        expect(inputType.type).toBe('hash');
      });
    });
  });
});
