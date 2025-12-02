import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  CreateCopperCrmLead,
  DeleteCopperCrmLead,
  SearchCopperCrmLeads,
  UpdateCopperCrmLead,
  CreateCopperCrmPerson,
  GetCopperCrmPerson,
  UpdateCopperCrmPerson,
  DeleteCopperCrmPerson,
  SearchCopperCrmPeople,
  CreateCopperCrmTask,
  GetCopperCrmTask,
  UpdateCopperCrmTask,
  DeleteCopperCrmTask,
  SearchCopperCrmTasks,
  CreateCopperCrmCompany,
  GetCopperCrmCompany,
  UpdateCopperCrmCompany,
  DeleteCopperCrmCompany,
  SearchCopperCrmCompanies,
  CreateCopperCrmOpportunity,
  GetCopperCrmOpportunity,
  UpdateCopperCrmOpportunity,
  DeleteCopperCrmOpportunity,
  SearchCopperCrmOpportunities,
} from '../apps/coppercrm/actions';
import { getCopperCrmCompanyAllowedValues } from '../apps/coppercrm/helpers/get-company-allowed-values';
import {
  getCopperCrmCustomFieldDynamicResponseTypeFunction,
  getCopperCrmCustomFieldDynamicTypeFunction,
} from '../apps/coppercrm/helpers/get-custom-fields';
import { getCopperCrmCustomerSourceAllowedValues } from '../apps/coppercrm/helpers/get-customer-source-allowed-values';
import { getCopperCrmLeadAllowedValues } from '../apps/coppercrm/helpers/get-lead-allowed-values';
import { getCopperCrmOpportunityAllowedValues } from '../apps/coppercrm/helpers/get-opportunity-allowed-values';
import { getCopperCrmPersonAllowedValues } from '../apps/coppercrm/helpers/get-person-allowed-values';
import { getCopperCrmPipelineAllowedValues } from '../apps/coppercrm/helpers/get-pipeline-allowed-values';
import { getCopperCrmPipelineStageAllowedValues } from '../apps/coppercrm/helpers/get-pipeline-stage-allowed-values';
import { getCopperCrmTaskAllowedValues } from '../apps/coppercrm/helpers/get-task-allowed-values';
import { getCopperCrmUserAllowedValues } from '../apps/coppercrm/helpers/get-user-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { getCopperCrmContactTypeAllowedValues } from '../apps/coppercrm/helpers/get-contact-type-allowed-values';
import { getCopperCrmLeadStatusAllowedValues } from '../apps/coppercrm/helpers/get-lead-status-allowed-values';
import { getCopperCrmLossReasonAllowedValues } from '../apps/coppercrm/helpers/get-loss-reason-allowed-values';
import { getCopperCrmTagAllowedValues } from '../apps/coppercrm/helpers/get-tag-allowed-values';
import {
  NewCopperCrmCompany,
  NewCopperCrmLead,
  NewCopperCrmOpportunity,
  NewCopperCrmPerson,
  NewCopperCrmTask,
} from '../apps/coppercrm/triggers';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

const checkAllowedValues = (allowedValues: IQoreAllowedValue<any>[]) => {
  expect(allowedValues).toBeDefined();
  expect(allowedValues.length).toBeGreaterThan(0);
  expect(allowedValues[0]).toHaveProperty('display_name');
  expect(allowedValues[0]).toHaveProperty('value');
  expect(allowedValues[0].value).toBeDefined();
  expect(allowedValues[0].display_name).toBeDefined();
};

describe('CopperCRM', () => {
  const baseContext = {
    conn_opts: {
      token: '',
    },
  } as any;

  beforeAll(() => {
    const token = process.env.COPPER_CRM_TOKEN;

    if (!token) {
      throw new Error('COPPER_CRM_TOKEN is not set in environment variables');
    }

    baseContext.conn_opts.token = token;
  });

  let pipelineId: number;
  describe('Should test allowed values', () => {
    it('Should get task allowed values', async () => {
      const allowedValues = await getCopperCrmTaskAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
    });

    it('Should get pipeline allowed values', async () => {
      const allowedValues = await getCopperCrmPipelineAllowedValues(baseContext);
      checkAllowedValues(allowedValues);

      pipelineId = allowedValues[0].value;
    });

    it('Should get pipeline stage allowed values', async () => {
      const allowedValues = await getCopperCrmPipelineStageAllowedValues({
        ...baseContext,
        opts: {
          pipeline_id: pipelineId,
        },
      });

      checkAllowedValues(allowedValues);
    });

    it('Should get company allowed values', async () => {
      const allowedValues = await getCopperCrmCompanyAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
    });

    it('Should get user allowed values', async () => {
      const allowedValues = await getCopperCrmUserAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
    });

    it('Should get person allowed values', async () => {
      const allowedValues = await getCopperCrmPersonAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
    });

    it('Should get lead allowed values', async () => {
      const allowedValues = await getCopperCrmLeadAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
    });

    it('Should get opportunity allowed values', async () => {
      const allowedValues = await getCopperCrmOpportunityAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
    });

    it('Should get customer source allowed values', async () => {
      const allowedValues = await getCopperCrmCustomerSourceAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
    });

    it('Should get contact type allowed values', async () => {
      const allowedValues = await getCopperCrmContactTypeAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
    });

    it('Should get lead status allowed values', async () => {
      const allowedValues = await getCopperCrmLeadStatusAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
    });

    it('Should get loss reason allowed values', async () => {
      const allowedValues = await getCopperCrmLossReasonAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
    });

    it('Should get tag allowed values', async () => {
      const allowedValues = await getCopperCrmTagAllowedValues(baseContext);
      checkAllowedValues(allowedValues);
    });
  });

  describe('Should test actions', () => {
    describe('Should test lead actions', () => {
      let createdLeadId: number;

      it('Should get custom fields dynamic request type', async () => {
        const dynamicType = await getCopperCrmCustomFieldDynamicTypeFunction(['lead'])(baseContext);

        expect(dynamicType).toBeDefined();
      });

      it('Should get custom fields dynamic response type', async () => {
        const dynamicType = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['lead'])(
          baseContext
        );

        expect(dynamicType).toBeDefined();
      });

      it('Should create a lead with custom fields', async () => {
        const action = CreateCopperCrmLead;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            first_name: 'My Lead',
            title: 'CEO',
            email: {
              email: 'mylead@noemail.com',
              category: 'work',
            },
            phone_numbers: [
              {
                number: '415-123-45678',
                category: 'mobile',
              },
            ],
            address: {
              street: '123 Main Street',
              city: 'Savannah',
              state: 'Georgia',
              postal_code: '31410',
              country: 'United States',
            },
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id');
        expect(result.id).toBeDefined();

        createdLeadId = result.id;
      });

      it('Should update the created lead', async () => {
        const action = UpdateCopperCrmLead;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            lead_id: createdLeadId,
            title: 'CTO',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.title).toBe('CTO');
      });

      it('Should search leads', async () => {
        const action = SearchCopperCrmLeads;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function({}, undefined, baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it('Should delete the created lead', async () => {
        const action = DeleteCopperCrmLead;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            lead_id: createdLeadId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.is_deleted).toBe(true);
      });
    });

    describe('Should test person actions', () => {
      let createdPersonId: number;

      it('Should get custom fields dynamic request type', async () => {
        const dynamicType = await getCopperCrmCustomFieldDynamicTypeFunction(['person'])(
          baseContext
        );

        expect(dynamicType).toBeDefined();
      });

      it('Should get custom fields dynamic response type', async () => {
        const dynamicType = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['person'])(
          baseContext
        );

        expect(dynamicType).toBeDefined();
      });

      it('Should create a person', async () => {
        const action = CreateCopperCrmPerson;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            name: 'John Doe',
            first_name: 'John',
            last_name: 'Doe',
            title: 'Software Engineer',
            emails: [
              {
                email: 'john.doe.test@example.com',
                category: 'work',
              },
            ],
            phone_numbers: [
              {
                number: '555-123-4567',
                category: 'mobile',
              },
            ],
            street: '456 Tech Avenue',
            city: 'San Francisco',
            state: 'CA',
            postal_code: '94105',
            country: 'US',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id');
        expect(result.id).toBeDefined();
        expect(result.name).toBe('John Doe');

        createdPersonId = result.id;
      });

      it('Should get the created person', async () => {
        const action = GetCopperCrmPerson;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            person_id: createdPersonId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.id).toBe(createdPersonId);
        expect(result.title).toBe('Software Engineer');
      });

      it('Should update the created person', async () => {
        const action = UpdateCopperCrmPerson;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            person_id: createdPersonId,
            title: 'Senior Software Engineer',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.title).toBe('Senior Software Engineer');
      });

      it('Should search people', async () => {
        const action = SearchCopperCrmPeople;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function({}, undefined, baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it('Should delete the created person', async () => {
        const action = DeleteCopperCrmPerson;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            person_id: createdPersonId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.is_deleted).toBe(true);
      });
    });

    describe('Should test task actions', () => {
      let createdTaskId: number;

      it('Should get custom fields dynamic request type', async () => {
        const dynamicType = await getCopperCrmCustomFieldDynamicTypeFunction(['task'])(baseContext);

        expect(dynamicType).toBeDefined();
      });

      it('Should get custom fields dynamic response type', async () => {
        const dynamicType = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['task'])(
          baseContext
        );

        expect(dynamicType).toBeDefined();
      });

      it('Should create a task', async () => {
        const action = CreateCopperCrmTask;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            name: 'Test Task',
            priority: 'High',
            status: 'Open',
            details: 'This is a test task',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id');
        expect(result.id).toBeDefined();
        expect(result.name).toBe('Test Task');
        expect(result.priority).toBe('High');

        createdTaskId = result.id;
      });

      it('Should get the created task', async () => {
        const action = GetCopperCrmTask;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            task_id: createdTaskId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.id).toBe(createdTaskId);
        expect(result.status).toBe('Open');
      });

      it('Should update the created task', async () => {
        const action = UpdateCopperCrmTask;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            task_id: createdTaskId,
            status: 'Completed',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.status).toBe('Completed');
      });

      it('Should search tasks', async () => {
        const action = SearchCopperCrmTasks;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function({}, undefined, baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it('Should delete the created task', async () => {
        const action = DeleteCopperCrmTask;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            task_id: createdTaskId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.is_deleted).toBe(true);
      });
    });

    describe('Should test company actions', () => {
      let createdCompanyId: number;

      it('Should get custom fields dynamic request type', async () => {
        const dynamicType = await getCopperCrmCustomFieldDynamicTypeFunction(['company'])(
          baseContext
        );

        expect(dynamicType).toBeDefined();
      });

      it('Should get custom fields dynamic response type', async () => {
        const dynamicType = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['company'])(
          baseContext
        );

        expect(dynamicType).toBeDefined();
      });

      it('Should create a company', async () => {
        const action = CreateCopperCrmCompany;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const uniqueDomain = `test-company-${Date.now()}.example.com`;

        const result = await action.api_function(
          {
            name: 'Test Company Inc',
            email_domain: uniqueDomain,
            address: {
              street: '789 Business Blvd',
              city: 'New York',
              state: 'NY',
              postal_code: '10001',
              country: 'US',
            },
            phone_numbers: [
              {
                number: '555-987-6543',
                category: 'work',
              },
            ],
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id');
        expect(result.id).toBeDefined();
        expect(result.name).toBe('Test Company Inc');
        expect(result.email_domain).toBe(uniqueDomain);

        createdCompanyId = result.id;
      });

      it('Should get the created company', async () => {
        const action = GetCopperCrmCompany;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            company_id: createdCompanyId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.id).toBe(createdCompanyId);
        expect(result.name).toBe('Test Company Inc');
      });

      it('Should update the created company', async () => {
        const action = UpdateCopperCrmCompany;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            company_id: createdCompanyId,
            details: 'Updated company details',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.details).toBe('Updated company details');
      });

      it('Should search companies', async () => {
        const action = SearchCopperCrmCompanies;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function({}, undefined, baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it('Should delete the created company', async () => {
        const action = DeleteCopperCrmCompany;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            company_id: createdCompanyId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.is_deleted).toBe(true);
      });
    });

    describe('Should test opportunity actions', () => {
      let createdOpportunityId: number;
      let testPersonId: number;

      beforeAll(async () => {
        const action = CreateCopperCrmPerson;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            name: 'Test Contact for Opportunity',
            emails: [
              {
                email: `opportunity-contact-${Date.now()}@example.com`,
                category: 'work',
              },
            ],
          },
          undefined,
          baseContext
        );

        testPersonId = result.id;
      });

      afterAll(async () => {
        if (testPersonId) {
          const action = DeleteCopperCrmPerson;

          if (!('api_function' in action) || !action.api_function)
            throw new Error('Action api_function is not defined');

          await action.api_function(
            {
              person_id: testPersonId,
            },
            undefined,
            baseContext
          );
        }
      });

      it('Should get custom fields dynamic request type', async () => {
        const dynamicType = await getCopperCrmCustomFieldDynamicTypeFunction(['opportunity'])(
          baseContext
        );

        expect(dynamicType).toBeDefined();
      });

      it('Should get custom fields dynamic response type', async () => {
        const dynamicType = await getCopperCrmCustomFieldDynamicResponseTypeFunction([
          'opportunity',
        ])(baseContext);

        expect(dynamicType).toBeDefined();
      });

      it('Should create an opportunity', async () => {
        const action = CreateCopperCrmOpportunity;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            name: 'Test Opportunity',
            primary_contact_id: testPersonId,
            monetary_value: 50000,
            status: 'Open',
            priority: 'High',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id');
        expect(result.id).toBeDefined();
        expect(result.name).toBe('Test Opportunity');
        expect(result.monetary_value).toBe(50000);

        createdOpportunityId = result.id;
      });

      it('Should get the created opportunity', async () => {
        const action = GetCopperCrmOpportunity;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            opportunity_id: createdOpportunityId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.id).toBe(createdOpportunityId);
        expect(result.status).toBe('Open');
      });

      it('Should update the created opportunity', async () => {
        const action = UpdateCopperCrmOpportunity;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            opportunity_id: createdOpportunityId,
            monetary_value: 75000,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.monetary_value).toBe(75000);
      });

      it('Should search opportunities', async () => {
        const action = SearchCopperCrmOpportunities;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function({}, undefined, baseContext);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it('Should delete the created opportunity', async () => {
        const action = DeleteCopperCrmOpportunity;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('Action api_function is not defined');

        const result = await action.api_function(
          {
            opportunity_id: createdOpportunityId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.is_deleted).toBe(true);
      });
    });

    describe('Should test triggers', () => {
      it('Should get example event data for leads triggers', async () => {
        const trigger = NewCopperCrmLead;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data(baseContext);

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      it('Should get example event data for company triggers', async () => {
        const trigger = NewCopperCrmCompany;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data(baseContext);

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      it('Should get example event data for task triggers', async () => {
        const trigger = NewCopperCrmTask;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data(baseContext);

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      it('Should get example event data for person triggers', async () => {
        const trigger = NewCopperCrmPerson;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data(baseContext);

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      it('Should get example event data for opportunity triggers', async () => {
        const trigger = NewCopperCrmOpportunity;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data(baseContext);

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });
    });
  });
});
