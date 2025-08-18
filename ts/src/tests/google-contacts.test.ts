import { configDotenv } from 'dotenv';
import {
  GoogleContactsAddContactToGroup,
  GoogleContactsCreateContact,
  GoogleContactsCreateContactGroup,
  GoogleContactsGetContact,
  GoogleContactsListContactGroups,
  GoogleContactsSearchContacts,
} from '../apps/google-contacts/actions';
import { createGooglePeopleClient } from '../apps/google-contacts/helpers/constants';
import { getGoogleContactsContactAllowedValues } from '../apps/google-contacts/helpers/get-contact-allowed-values';
import { getGoogleContactsGroupAllowedValues } from '../apps/google-contacts/helpers/get-group-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Google Contacts', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.GOOGLE_CONTACTS_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_CONTACTS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CONTACTS_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(
        `Please set the` +
          `GOOGLE_CONTACTS_REFRESH_TOKEN, GOOGLE_CONTACTS_CLIENT_ID, ` +
          `and GOOGLE_CONTACTS_CLIENT_SECRET environment variables.`
      );
    }

    const data = {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    const responseData = await response.json();
    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    base_context.conn_opts.token = responseData.access_token;
  });

  let created_contact: string | undefined;
  let created_group: string | undefined;

  describe('Should test google contacts allowed values', () => {
    it('Should get contact allowed values', async () => {
      const allowed_values = await getGoogleContactsContactAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get group allowed values', async () => {
      const allowed_values = await getGoogleContactsGroupAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });
  });

  describe('Should test google drive actions', () => {
    it('Should search contacts', async () => {
      const action = GoogleContactsSearchContacts;

      if (!('api_function' in action)) throw new Error('Action does not have api_function');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should create a contact', async () => {
      const action = GoogleContactsCreateContact;

      if (!('api_function' in action)) throw new Error('Action does not have api_function');

      const result = await action.api_function(
        {
          first_name: 'Test',
          last_name: 'User',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.resourceName).toBeDefined();

      created_contact = result.resourceName;
    });

    it('Should create a group', async () => {
      const action = GoogleContactsCreateContactGroup;

      if (!('api_function' in action)) throw new Error('Action does not have api_function');

      const result = await action.api_function(
        {
          name: 'Test Group',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Group');
      expect(result.resourceName).toBeDefined();

      created_group = result.resourceName;
    });

    it('Should add contact to group', async () => {
      const action = GoogleContactsAddContactToGroup;

      if (!('api_function' in action)) throw new Error('Action does not have api_function');

      const result = await action.api_function(
        {
          group_resource_name: created_group,
          contact_resource_name: created_contact,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should list contact groups', async () => {
      const action = GoogleContactsListContactGroups;

      if (!('api_function' in action)) throw new Error('Action does not have api_function');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.groups).toBeDefined();
      expect(Array.isArray(result.groups)).toBe(true);
      expect(result.groups.length).toBeGreaterThan(0);
    });

    it('Should get contact', async () => {
      const action = GoogleContactsGetContact;

      if (!('api_function' in action)) throw new Error('Action does not have api_function');

      const result = await action.api_function(
        {
          resource_name: created_contact,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });
  });

  describe('Clean up', () => {
    it('Should delete created contact', async () => {
      const client = createGooglePeopleClient(base_context.conn_opts.token);
      await client.people.deleteContact({
        resourceName: created_contact,
      });
    });

    it('Should delete created group', async () => {
      const client = createGooglePeopleClient(base_context.conn_opts.token);
      await client.contactGroups.delete({
        resourceName: created_group,
      });
    });
  });
});
