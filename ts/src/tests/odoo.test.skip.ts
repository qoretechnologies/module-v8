import { configDotenv } from 'dotenv';
import {
  CreateOdooLead,
  CreateOdooPartner,
  DeleteOdooLead,
  DeleteOdooPartner,
  GetOdooLead,
  GetOdooPartner,
  ListOdooCompanies,
  ListOdooLeads,
  ListOdooPartners,
  UpdateOdooLead,
} from '../apps/odoo/actions';
import { getOdooActivityIdAllowedValues } from '../apps/odoo/helpers/get-activity-type-allowed-values';
import { getOdooUtmCampaignIdAllowedValues } from '../apps/odoo/helpers/get-campaign-allowed-values';
import { getOdooCompanyAllowedValues } from '../apps/odoo/helpers/get-company-allowed-values';
import { getOdooCountryIdAllowedValues } from '../apps/odoo/helpers/get-country-allowed-values';
import { getOdooLeadFieldsAllowedValues } from '../apps/odoo/helpers/get-fields-allowed-values';
import { getOdooIndustryAllowedValues } from '../apps/odoo/helpers/get-industry-allowed-values';
import { getOdooLangIdAllowedValues } from '../apps/odoo/helpers/get-lang-allowed-values';
import { getOdooLeadIdAllowedValues } from '../apps/odoo/helpers/get-lead-allowed-values';
import { getOdooLostReasonIdAllowedValues } from '../apps/odoo/helpers/get-lost-reason-allowed-values';
import { getOdooMarketingMediumAllowedValues } from '../apps/odoo/helpers/get-marketing-medium-allowed-values';
import { getOdooPartnerAllowedValues } from '../apps/odoo/helpers/get-partner-allowed-values';
import { getOdooPartnerCategoryAllowedValues } from '../apps/odoo/helpers/get-partner-category-allowed-values';
import { getOdooMarketingSourceAllowedValues } from '../apps/odoo/helpers/get-source-allowed-values';
import { getOdooStageIdAllowedValues } from '../apps/odoo/helpers/get-stage-allowed-values';
import { getOdooLeadTagAllowedValues } from '../apps/odoo/helpers/get-tag-allowed-values';
import { getOdooTeamIdAllowedValues } from '../apps/odoo/helpers/get-team-allowed-values';
import { getOdooUserIdAllowedValues } from '../apps/odoo/helpers/get-user-allowed-values';
configDotenv({ path: '.env' });

describe('Tests Odoo Actions', () => {
  const base_context = {
    conn_opts: {
      subdomain: '',
      username: '',
      password: '',
    } as any,
  };

  beforeAll(() => {
    const subdomain = process.env.ODOO_SUBDOMAIN;
    const username = process.env.ODOO_USERNAME;
    const password = process.env.ODOO_PASSWORD;

    if (!subdomain || !username || !password) {
      throw new Error(
        `Please set the` + `ODOO_SUBDOMAIN, ODOO_USERNAME, and ODOO_PASSWORD environment variables.`
      );
    }

    base_context.conn_opts.subdomain = subdomain;
    base_context.conn_opts.username = username;
    base_context.conn_opts.password = password;
  });

  let lead_id: number | undefined;
  describe('Should test Odoo allowed values', () => {
    it('Should get lead fields allowed values', async () => {
      const allowed_values = await getOdooLeadFieldsAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get lead id allowed values', async () => {
      const allowed_values = await getOdooLeadIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      lead_id = allowed_values[0].value;
    });

    it('Should get team id allowed values', async () => {
      const allowed_values = await getOdooTeamIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get stage id allowed values', async () => {
      const allowed_values = await getOdooStageIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get user id allowed values', async () => {
      const allowed_values = await getOdooUserIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get country id allowed values', async () => {
      const allowed_values = await getOdooCountryIdAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get utm campaign id allowed values', async () => {
      const allowed_values = await getOdooUtmCampaignIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get marketing medium allowed values', async () => {
      const allowed_values = await getOdooMarketingMediumAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get marketing source allowed values', async () => {
      const allowed_values = await getOdooMarketingSourceAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get tag allowed values', async () => {
      const allowed_values = await getOdooLeadTagAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get partner allowed values', async () => {
      const allowed_values = await getOdooPartnerAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      console.dir(allowed_values, { depth: null, colors: true });
    });

    it('Should get company allowed values', async () => {
      const allowed_values = await getOdooCompanyAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get activity type allowed values', async () => {
      const allowed_values = await getOdooActivityIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get odoo lost reason allowed values', async () => {
      const allowed_values = await getOdooLostReasonIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get odoo lang allowed values', async () => {
      const allowed_values = await getOdooLangIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get odoo partner category allowed values', async () => {
      const allowed_values = await getOdooPartnerCategoryAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get odoo industry allowed values', async () => {
      const allowed_values = await getOdooIndustryAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });
  });

  describe('Should test Odoo actions', () => {
    let created_lead_id: number | undefined;
    let created_partner_id: number | undefined;

    it('Should get a lead', async () => {
      const action = GetOdooLead;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          lead_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should list leads', async () => {
      const action = ListOdooLeads;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 2,
          sort: {
            field: 'name',
            direction: 'desc',
          },
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].id).toBeDefined();
    });

    it('should create a lead using all available fields', async () => {
      const action = CreateOdooLead;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          name: 'Test Lead',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.lead_id).toBeGreaterThan(0);
      expect(result.lead_data.name).toBe('Test Lead');

      created_lead_id = result.lead_id;
    });

    it('Should update a lead', async () => {
      const action = UpdateOdooLead;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          lead_id: created_lead_id,
          name: 'Updated Test Lead',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.lead_id).toBe(created_lead_id);
    });

    it('Should delete a lead', async () => {
      const action = DeleteOdooLead;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          lead_id: created_lead_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.lead_id).toBe(created_lead_id);
    });

    it('Should list partners', async () => {
      const action = ListOdooPartners;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          sort: {
            field: 'name',
            direction: 'asc',
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list companies', async () => {
      const action = ListOdooCompanies;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          sort: {
            field: 'name',
            direction: 'asc',
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should create a partner', async () => {
      const action = CreateOdooPartner;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          name: 'Test Partner',
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.partner_id).toBeGreaterThan(0);

      created_partner_id = result.partner_id;
    });

    it('Should get a partner', async () => {
      const action = GetOdooPartner;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          partner_id: created_partner_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(created_partner_id);
    });

    it('Should delete a partner', async () => {
      const action = DeleteOdooPartner;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          partner_id: created_partner_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.partner_id).toBe(created_partner_id);
    });
  });
});
