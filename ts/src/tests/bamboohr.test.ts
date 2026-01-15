import { configDotenv } from 'dotenv';
import {
  GetBambooHREmployee,
  ListBambooHREmployees,
  CreateBambooHREmployee,
  UpdateBambooHREmployee,
  GetBambooHRWhosOut,
  SearchBambooHRTimeOffRequests,
  GetAllBambooHREmployeeFiles,
  GetAllBambooHRCompanyFiles,
} from '../apps/bamboohr/actions';
import { getBambooHRFields, clearFieldsCache } from '../apps/bamboohr/helpers/get-fields';
import { getBambooHRLists, clearListsCache } from '../apps/bamboohr/helpers/get-list-options';
import {
  getEmployeeFileCategories,
  getCompanyFileCategories,
  getEmployeeFileCategoriesAllowedValues,
  getCompanyFileCategoriesAllowedValues,
  clearFileCategoriesCache,
} from '../apps/bamboohr/helpers/get-file-categories';
import {
  getTimeOffTypes,
  getTimeOffTypesAllowedValues,
  getTimeOffStatusAllowedValues,
  clearTimeOffTypesCache,
} from '../apps/bamboohr/helpers/get-time-off-types';
import {
  getBambooHREmployeeInputType,
  getBambooHREmployeeResponseType,
  mapBambooHRFieldToQoreOption,
} from '../apps/bamboohr/helpers/dynamic-types';
import {
  NewBambooHRTimeOffRequest,
  NewBambooHRTimeOff,
  NewBambooHREmployee,
} from '../apps/bamboohr/triggers';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { checkAllowedValues } from './utils';
import { IBambooHRConnectionOptions, IBambooHRFieldMetadata } from '../apps/bamboohr/types';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe.skip('BambooHR', () => {
  const baseContext = {
    conn_opts: {
      token: '',
      company_domain: '',
    } as IBambooHRConnectionOptions,
  };

  const connectionOptions: IBambooHRConnectionOptions = {
    token: '',
    company_domain: '',
  };

  beforeAll(async () => {
    const token = process.env.BAMBOOHR_TOKEN;
    const companyDomain = process.env.BAMBOOHR_COMPANY_DOMAIN;

    if (!token || !companyDomain) {
      throw new Error(
        'Please set BAMBOOHR_TOKEN and BAMBOOHR_COMPANY_DOMAIN environment variables.'
      );
    }

    baseContext.conn_opts.token = token;
    baseContext.conn_opts.company_domain = companyDomain;
    connectionOptions.token = token;
    connectionOptions.company_domain = companyDomain;
  });

  beforeEach(() => {
    // Clear caches before each test to ensure fresh data
    clearFieldsCache();
    clearListsCache();
    clearFileCategoriesCache();
    clearTimeOffTypesCache();
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

        // Response type should cover all actual fields
        // Note: Response type may have more fields than actual if some fields are null/missing
        expect(responseTypeFields.length).toBeGreaterThanOrEqual(actualFields.length);
      });
    });

    describe('Create and Update Employee', () => {
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

  // ============================================================================
  // Time Off Actions Tests
  // ============================================================================

  describe('Time Off Actions', () => {
    describe("Get Who's Out", () => {
      it('Should get who is out without date filters', async () => {
        const action = GetBambooHRWhosOut;

        if (!('api_function' in action)) {
          throw new Error('api_function not found in action');
        }

        const result = await action.api_function({}, undefined, baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      it('Should get who is out with date range', async () => {
        const action = GetBambooHRWhosOut;

        if (!('api_function' in action)) {
          throw new Error('api_function not found in action');
        }

        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const result = await action.api_function(
          {
            start_date: today.toISOString(),
            end_date: nextMonth.toISOString(),
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        // If there are results, check the structure
        if (result.length > 0) {
          const entry = result[0];
          expect(entry).toHaveProperty('type');
          expect(entry).toHaveProperty('start');
          expect(entry).toHaveProperty('end');
        }
      });
    });

    describe('Search Time Off Requests', () => {
      it('Should search time off requests with required date range', async () => {
        const action = SearchBambooHRTimeOffRequests;

        if (!('api_function' in action)) {
          throw new Error('api_function not found in action');
        }

        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const result = await action.api_function(
          {
            start_date: lastMonth.toISOString(),
            end_date: nextMonth.toISOString(),
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        // If there are results, check the structure
        if (result.length > 0) {
          const request = result[0];
          expect(request).toHaveProperty('id');
          expect(request).toHaveProperty('employee_id');
          expect(request).toHaveProperty('start_date');
          expect(request).toHaveProperty('end_date');
          expect(request).toHaveProperty('status');
        }
      });

      it('Should filter by status', async () => {
        const action = SearchBambooHRTimeOffRequests;

        if (!('api_function' in action)) {
          throw new Error('api_function not found in action');
        }

        const today = new Date();
        const lastYear = new Date(today);
        lastYear.setFullYear(lastYear.getFullYear() - 1);

        const result = await action.api_function(
          {
            start_date: lastYear.toISOString(),
            end_date: today.toISOString(),
            status: ['approved'],
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        // All returned requests should have approved status
        result.forEach((request: { status: string }) => {
          expect(request.status).toBe('approved');
        });
      });
    });
  });

  // ============================================================================
  // File Categories Helper Tests
  // ============================================================================

  describe('File Categories Helpers', () => {
    let testEmployeeId: string | undefined;

    beforeAll(async () => {
      // Get an employee ID to use for employee file category tests
      const action = ListBambooHREmployees;
      if ('api_function' in action) {
        const employees = await action.api_function({}, undefined, baseContext);
        if (employees.length > 0) {
          testEmployeeId = employees[0].id;
        }
      }
    });

    beforeEach(() => {
      clearFileCategoriesCache();
    });

    it('Should fetch employee file categories', async () => {
      if (!testEmployeeId) {
        console.warn('Skipping test - no employee ID available');
        return;
      }

      const categories = await getEmployeeFileCategories(connectionOptions, testEmployeeId);

      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);

      // BambooHR should have at least some file categories
      if (categories.length > 0) {
        const firstCategory = categories[0];
        expect(firstCategory).toHaveProperty('id');
        expect(firstCategory).toHaveProperty('name');
      }
    });

    it('Should fetch company file categories', async () => {
      const categories = await getCompanyFileCategories(connectionOptions);

      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);

      // BambooHR should have at least some file categories
      if (categories.length > 0) {
        const firstCategory = categories[0];
        expect(firstCategory).toHaveProperty('id');
        expect(firstCategory).toHaveProperty('name');
      }
    });

    it('Should cache employee file categories on subsequent calls', async () => {
      if (!testEmployeeId) {
        console.warn('Skipping test - no employee ID available');
        return;
      }

      // First call
      const categories1 = await getEmployeeFileCategories(connectionOptions, testEmployeeId);

      // Second call should return cached data
      const categories2 = await getEmployeeFileCategories(connectionOptions, testEmployeeId);

      expect(categories1).toBe(categories2); // Same reference = cached
    });

    it('Should cache company file categories on subsequent calls', async () => {
      // First call
      const categories1 = await getCompanyFileCategories(connectionOptions);

      // Second call should return cached data
      const categories2 = await getCompanyFileCategories(connectionOptions);

      expect(categories1).toBe(categories2); // Same reference = cached
    });

    it('Should return employee file categories as allowed values', async () => {
      if (!testEmployeeId) {
        console.warn('Skipping test - no employee ID available');
        return;
      }

      const allowedValues = await getEmployeeFileCategoriesAllowedValues({
        conn_opts: connectionOptions,
        opts: { employee_id: testEmployeeId },
      });

      checkAllowedValues(allowedValues, { checkNonEmpty: true });
    });

    it('Should return company file categories as allowed values', async () => {
      const allowedValues = await getCompanyFileCategoriesAllowedValues({
        conn_opts: connectionOptions,
      });

      checkAllowedValues(allowedValues, { checkNonEmpty: true });
    });

    it('Should return empty array when connection options are missing', async () => {
      const allowedValues = await getEmployeeFileCategoriesAllowedValues({});

      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });

    it('Should return empty array when employee_id is missing', async () => {
      const allowedValues = await getEmployeeFileCategoriesAllowedValues({
        conn_opts: connectionOptions,
      });

      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });
  });

  // ============================================================================
  // Time Off Types Helper Tests
  // ============================================================================

  describe('Time Off Types Helpers', () => {
    it('Should fetch time off types', async () => {
      const types = await getTimeOffTypes(connectionOptions);

      expect(types).toBeDefined();
      expect(Array.isArray(types)).toBe(true);

      // BambooHR should have at least some time off types
      if (types.length > 0) {
        const firstType = types[0];
        expect(firstType).toHaveProperty('id');
        expect(firstType).toHaveProperty('name');
      }
    });

    it('Should cache time off types on subsequent calls', async () => {
      // First call
      const types1 = await getTimeOffTypes(connectionOptions);

      // Second call should return cached data
      const types2 = await getTimeOffTypes(connectionOptions);

      expect(types1).toBe(types2); // Same reference = cached
    });

    it('Should return time off types as allowed values', async () => {
      const allowedValues = await getTimeOffTypesAllowedValues({
        conn_opts: connectionOptions,
      });

      checkAllowedValues(allowedValues, { checkNonEmpty: true });
    });

    it('Should return static time off status allowed values', () => {
      const statusValues = getTimeOffStatusAllowedValues();

      checkAllowedValues(statusValues, { checkNonEmpty: true });

      // Check for expected statuses
      const statuses = statusValues.map((s) => s.value);
      expect(statuses).toContain('approved');
      expect(statuses).toContain('denied');
      expect(statuses).toContain('requested');
      expect(statuses).toContain('canceled');
    });
  });

  // ============================================================================
  // Employee File Actions Tests
  // ============================================================================

  describe('Employee File Actions', () => {
    let employeeId: string | undefined;

    beforeAll(async () => {
      // Get an employee ID to use for file tests
      const action = ListBambooHREmployees;
      if ('api_function' in action) {
        const employees = await action.api_function({}, undefined, baseContext);
        if (employees.length > 0) {
          employeeId = employees[0].id;
        }
      }
    });

    describe('Get All Employee Files', () => {
      it('Should get all files for an employee', async () => {
        if (!employeeId) {
          console.warn('Skipping test - no employee ID available');
          return;
        }

        const action = GetAllBambooHREmployeeFiles;

        if (!('api_function' in action)) {
          throw new Error('api_function not found in action');
        }

        const result = await action.api_function(
          { employee_id: employeeId },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result).toHaveProperty('employee_id');
        expect(result).toHaveProperty('categories');
        expect(Array.isArray(result.categories)).toBe(true);

        // If there are categories, check structure
        if (result.categories.length > 0) {
          const category = result.categories[0];
          expect(category).toHaveProperty('id');
          expect(category).toHaveProperty('name');
          expect(category).toHaveProperty('files');
          expect(Array.isArray(category.files)).toBe(true);
        }
      });
    });
  });

  // ============================================================================
  // Company File Actions Tests
  // ============================================================================

  describe('Company File Actions', () => {
    describe('Get All Company Files', () => {
      it('Should get all company files', async () => {
        const action = GetAllBambooHRCompanyFiles;

        if (!('api_function' in action)) {
          throw new Error('api_function not found in action');
        }

        const result = await action.api_function({}, undefined, baseContext);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('categories');
        expect(Array.isArray(result.categories)).toBe(true);

        // If there are categories, check structure
        if (result.categories.length > 0) {
          const category = result.categories[0];
          expect(category).toHaveProperty('id');
          expect(category).toHaveProperty('name');
          expect(category).toHaveProperty('files');
          expect(Array.isArray(category.files)).toBe(true);
        }
      });
    });
  });

  // ============================================================================
  // Trigger Tests
  // ============================================================================

  describe('Triggers', () => {
    /**
     * Helper function to verify that example event data matches the event_info type structure.
     * This ensures that get_example_event_data returns data consistent with the declared schema.
     */
    const verifyExampleDataMatchesEventInfo = (
      exampleData: Record<string, unknown>,
      eventInfo: { type: { fields: Record<string, unknown> } }
    ) => {
      const declaredFields = Object.keys(eventInfo.type.fields);
      const exampleFields = Object.keys(exampleData);

      // All declared fields should be present in example data
      const missingFields = declaredFields.filter((f) => !exampleFields.includes(f));
      expect(missingFields).toEqual([]);

      // Example data should not have extra undeclared fields
      const extraFields = exampleFields.filter((f) => !declaredFields.includes(f));
      expect(extraFields).toEqual([]);
    };

    describe('New Employee Trigger', () => {
      it('Should have correct trigger structure', () => {
        const trigger = NewBambooHREmployee;

        expect(trigger).toBeDefined();
        expect(trigger).toHaveProperty('event_function');
        expect(trigger).toHaveProperty('get_example_event_data');
        expect(trigger).toHaveProperty('event_info');
      });

      it('Should return example event data matching event_info schema', async () => {
        const trigger = NewBambooHREmployee;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
          throw new Error('get_example_event_data not found in trigger');
        }

        if (!('event_info' in trigger) || !trigger.event_info) {
          throw new Error('event_info not found in trigger');
        }

        const exampleData = await trigger.get_example_event_data(baseContext);

        expect(exampleData).toBeDefined();
        expect(exampleData).toHaveProperty('id');
        expect(exampleData).toHaveProperty('first_name');
        expect(exampleData).toHaveProperty('last_name');

        // Verify example data matches event_info schema
        verifyExampleDataMatchesEventInfo(
          exampleData as Record<string, unknown>,
          trigger.event_info as { type: { fields: Record<string, unknown> } }
        );
      });
    });

    describe('New Time Off Trigger', () => {
      it('Should have correct trigger structure', () => {
        const trigger = NewBambooHRTimeOff;

        expect(trigger).toBeDefined();
        expect(trigger).toHaveProperty('event_function');
        expect(trigger).toHaveProperty('get_example_event_data');
        expect(trigger).toHaveProperty('event_info');
      });

      it('Should return example event data matching event_info schema', async () => {
        const trigger = NewBambooHRTimeOff;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
          throw new Error('get_example_event_data not found in trigger');
        }

        if (!('event_info' in trigger) || !trigger.event_info) {
          throw new Error('event_info not found in trigger');
        }

        const exampleData = await trigger.get_example_event_data(baseContext);

        expect(exampleData).toBeDefined();
        expect(exampleData).toHaveProperty('id');
        expect(exampleData).toHaveProperty('type');
        expect(exampleData).toHaveProperty('start_date');
        expect(exampleData).toHaveProperty('end_date');

        // Verify example data matches event_info schema
        verifyExampleDataMatchesEventInfo(
          exampleData as Record<string, unknown>,
          trigger.event_info as { type: { fields: Record<string, unknown> } }
        );
      });
    });

    describe('New Time Off Request Trigger', () => {
      it('Should have correct trigger structure', () => {
        const trigger = NewBambooHRTimeOffRequest;

        expect(trigger).toBeDefined();
        expect(trigger).toHaveProperty('event_function');
        expect(trigger).toHaveProperty('get_example_event_data');
        expect(trigger).toHaveProperty('event_info');
      });

      it('Should return example event data matching event_info schema', async () => {
        const trigger = NewBambooHRTimeOffRequest;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
          throw new Error('get_example_event_data not found in trigger');
        }

        if (!('event_info' in trigger) || !trigger.event_info) {
          throw new Error('event_info not found in trigger');
        }

        const exampleData = await trigger.get_example_event_data(baseContext);

        expect(exampleData).toBeDefined();
        expect(exampleData).toHaveProperty('id');
        expect(exampleData).toHaveProperty('employee_id');
        expect(exampleData).toHaveProperty('start_date');
        expect(exampleData).toHaveProperty('end_date');
        expect(exampleData).toHaveProperty('status');

        // Verify example data matches event_info schema
        verifyExampleDataMatchesEventInfo(
          exampleData as Record<string, unknown>,
          trigger.event_info as { type: { fields: Record<string, unknown> } }
        );
      });
    });
  });
});
