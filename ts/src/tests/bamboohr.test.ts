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
      const inputType = (await getBambooHREmployeeInputType({
        conn_opts: connectionOptions,
      })) as { type: string; fields: Record<string, any> };

      console.dir(inputType);

      expect(inputType).toBeDefined();
      expect(inputType.type).toBe('hash');
      expect(inputType.fields).toBeDefined();

      // Should have standard employee fields
      expect(Object.keys(inputType.fields).length).toBeGreaterThan(0);
    });

    it('Should generate response type for employee', async () => {
      const responseType = (await getBambooHREmployeeResponseType({
        conn_opts: connectionOptions,
      })) as { type: string; fields: Record<string, any> };

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
        expect(typeof responseType).toBe('object');
        expect((responseType as { type: string }).type).toBe('list');
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
        expect(result).toHaveProperty('id');
      });

      it('Should have dynamic response type matching actual fields', async () => {
        // Skip if we don't have an employee ID from list test
        if (!employeeId) {
          console.warn('Skipping comparison test - no employee ID available');
          return;
        }

        const action = GetBambooHREmployee;

        if (!('get_dynamic_response_type' in action)) {
          throw new Error('get_dynamic_response_type not found in action');
        }

        // Get the dynamic response type
        const responseType = await action.get_dynamic_response_type!({
          conn_opts: connectionOptions,
        });

        expect(responseType).toBeDefined();
        expect(typeof responseType).toBe('object');
        const typedResponse = responseType as { type: string; fields: Record<string, unknown> };
        expect(typedResponse.type).toBe('hash');
        expect(typedResponse.fields).toBeDefined();

        // Get actual employee data to compare
        const actualResult = await action.api_function!(
          { employee_id: employeeId },
          undefined,
          baseContext
        );

        // Verify dynamic response type fields match actual result fields
        const responseTypeFields = Object.keys(typedResponse.fields).sort();
        const actualFields = Object.keys(actualResult as Record<string, unknown>).sort();

        // All actual fields should be in response type
        const missingInResponseType = actualFields.filter((f) => !responseTypeFields.includes(f));
        expect(missingInResponseType).toEqual([]);

        // Response type should match actual fields (no extra fields)
        expect(responseTypeFields.length).toBe(actualFields.length);
      });
    });

    describe.skip('Create and Update Employee', () => {
      let createdEmployeeId: string;

      it('Should create an employee', async () => {
        const action = CreateBambooHREmployee;

        if (!('api_function' in action)) {
          throw new Error('api_function not found in action');
        }

        const result = await action.api_function(
          {
            employee_data: {
              firstName: 'Test',
              lastName: `Employee ${Date.now()}`,
              payRate: {
                value: 50000,
                currency: 'USD',
              },
            },
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        createdEmployeeId = result.id as string;
      });

      it('Should update the created employee', async () => {
        const action = UpdateBambooHREmployee;

        if (!('api_function' in action)) {
          throw new Error('api_function not found in action');
        }

        const result = await action.api_function(
          {
            employee_id: createdEmployeeId,
            employee_data: {
              mobilePhone: '+1234567890',
            },
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });

      it('Should have dynamic input type for create', async () => {
        const action = CreateBambooHREmployee;

        if (!('options' in action) || !action.options?.employee_data?.get_dynamic_type) {
          throw new Error('get_dynamic_type not found in action.options.employee_data');
        }

        const getDynamicType = action.options.employee_data.get_dynamic_type;
        const inputType = (await getDynamicType({ conn_opts: connectionOptions })) as {
          type: string;
          fields: Record<string, unknown>;
        };

        expect(inputType).toBeDefined();
        expect(inputType.type).toBe('hash');
      });

      it('Should have dynamic input type for update', async () => {
        const action = UpdateBambooHREmployee;

        if (!('options' in action) || !action.options?.employee_data?.get_dynamic_type) {
          throw new Error('get_dynamic_type not found in action.options.employee_data');
        }

        const getDynamicType = action.options.employee_data.get_dynamic_type;
        const inputType = (await getDynamicType({ conn_opts: connectionOptions })) as {
          type: string;
          fields: Record<string, unknown>;
        };

        expect(inputType).toBeDefined();
        expect(inputType.type).toBe('hash');
      });
    });
  });
});
