import { configDotenv } from 'dotenv';
import {
  AddKlaviyoProfileToList,
  AddKlaviyoTagToList,
  AddKlaviyoTagToSegment,
  CreateKlaviyoEvent,
  CreateKlaviyoList,
  CreateOrUpdateKlaviyoProfile,
  GetKlaviyoCampaign,
  GetKlaviyoProfile,
  ListKlaviyoCampaigns,
  ListKlaviyoProfiles,
  ListKlaviyoSegments,
  ListKlaviyoTags,
  RemoveKlaviyoProfileFromList,
  RemoveKlaviyoTagFromList,
  RemoveKlaviyoTagFromSegment,
  SubscribeKlaviyoProfile,
  UnsubscribeKlaviyoProfile,
  UpdateKlaviyoProfile,
} from '../apps/klaviyo/actions';
import { getKlaviyoApis } from '../apps/klaviyo/helpers/constants';
import { getKlaviyoCampaignIdAllowedValues } from '../apps/klaviyo/helpers/get-campaign-allowed-values';
import { getKlaviyoListIdAllowedValues } from '../apps/klaviyo/helpers/get-list-allowed-values';
import {
  getKlaviyoMetricAllowedValues,
  getKlaviyoMetricIdAllowedValues,
} from '../apps/klaviyo/helpers/get-metric-allowed-values';
import { getKlaviyoProfileIdAllowedValues } from '../apps/klaviyo/helpers/get-profile-allowed-values';
import { getKlaviyoSegmentIdAllowedValues } from '../apps/klaviyo/helpers/get-segment-allowed-values';
import { getKlaviyoTagIdAllowedValues } from '../apps/klaviyo/helpers/get-tag-id-allowed-values';
import {
  NewKlaviyoEvent,
  NewKlaviyoListProfile,
  NewKlaviyoProfile,
} from '../apps/klaviyo/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });

describe('Klaviyo', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.KLAVIYO_REFRESH_TOKEN;
    const clientId = process.env.KLAVIYO_CLIENT_ID;
    const clientSecret = process.env.KLAVIYO_CLIENT_SECRET;
    const codeVerifier = process.env.KLAVIYO_CODE_VERIFIER;

    if (!refreshToken || !clientId || !clientSecret || !codeVerifier) {
      throw new Error(`
        Please set the KLAVIYO_REFRESH_TOKEN, KLAVIYO_CLIENT_ID, 
        KLAVIYO_CLIENT_SECRET, and KLAVIYO_CODE_VERIFIER environment variables.
      `);
    }

    const data = {
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      redirect_uri: 'https://api.qoretechnologies.com/qorus-oauth2-redirect',
      code_verifier: codeVerifier,
    };

    const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch('https://a.klaviyo.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicToken}`,
      },
      body: formBody,
    });

    const responseData = await response.json();
    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    base_context.conn_opts.token = responseData.access_token;
  });

  let profileId: string | undefined;
  let campaignId: string | undefined;
  let createdProfileId: string | undefined;
  let listId: string | undefined;
  let tagId: string | undefined;
  let segmentId: string | undefined;
  let createdListId: string | undefined;
  let metric: string | undefined;
  let metricId: string | undefined;

  describe('Should test klaviyo allowed values', () => {
    it('Should get metric allowed values', async () => {
      const allowed_values = await getKlaviyoMetricAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      metric = allowed_values[0].value;
    });

    it('Should get metric id allowed values', async () => {
      const allowed_values = await getKlaviyoMetricIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      metricId = allowed_values[1].value;
    });

    it('Should get tag allowed values', async () => {
      const allowed_values = await getKlaviyoTagIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      tagId = allowed_values[0].value;
    });

    it('Should get segment allowed values', async () => {
      const allowed_values = await getKlaviyoSegmentIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      segmentId = allowed_values[0].value;
    });

    it('Should get profile allowed values', async () => {
      const allowed_values = await getKlaviyoProfileIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      profileId = allowed_values[0].value;
    });

    it('Should get campaign allowed values', async () => {
      const allowed_values = await getKlaviyoCampaignIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      campaignId = allowed_values[0].value;
    });

    it('Should get list allowed values', async () => {
      const allowed_values = await getKlaviyoListIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      listId = allowed_values[0].value;
    });
  });

  describe('Should test klaviyo actions', () => {
    it('Should list profiles', async () => {
      const action = ListKlaviyoProfiles;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('Should get profile', async () => {
      const action = GetKlaviyoProfile;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({ id: profileId }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBe(profileId);
    });

    it('Should create or update profile', async () => {
      const action = CreateOrUpdateKlaviyoProfile;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        { email: `test@example.com`, firstName: 'Test', lastName: 'User' },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdProfileId = result.id;
    });

    it('Should update profile', async () => {
      const action = UpdateKlaviyoProfile;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          id: createdProfileId,
          firstName: 'Updated',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdProfileId);
      expect(result.firstName).toBe('Updated');
    });

    it('Should list campaigns', async () => {
      const action = ListKlaviyoCampaigns;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          channel: 'email',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('Should get campaign', async () => {
      const action = GetKlaviyoCampaign;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({ id: campaignId }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBe(campaignId);
    });

    it('Should list segments', async () => {
      const action = ListKlaviyoSegments;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('Should list tags', async () => {
      const action = ListKlaviyoTags;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('Should subscribe profile', async () => {
      const action = SubscribeKlaviyoProfile;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await action.api_function(
        {
          profileId: createdProfileId,
          email: 'test@example.com',
          consentToSubscribeToChannel: 'email',
        },
        undefined,
        base_context
      );
    });
    it('Should unsubscribe profile', async () => {
      const action = UnsubscribeKlaviyoProfile;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await action.api_function(
        {
          email: 'test@example.com',
        },
        undefined,
        base_context
      );
    });

    it('Should add profile to list', async () => {
      const action = AddKlaviyoProfileToList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await action.api_function(
        {
          profile: createdProfileId,
          list: listId,
        },
        undefined,
        base_context
      );
    });

    it('Should remove profile from list', async () => {
      const action = RemoveKlaviyoProfileFromList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await action.api_function(
        {
          profile: createdProfileId,
          list: listId,
        },
        undefined,
        base_context
      );
    });

    it('Should add tag to list', async () => {
      const action = AddKlaviyoTagToList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await action.api_function(
        {
          tag: tagId,
          list: listId,
        },
        undefined,
        base_context
      );
    });

    it('Should remove tag from list', async () => {
      const action = RemoveKlaviyoTagFromList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await action.api_function(
        {
          tag: tagId,
          list: listId,
        },
        undefined,
        base_context
      );
    });

    it('Should add tag to segment', async () => {
      const action = AddKlaviyoTagToSegment;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await action.api_function(
        {
          tag: tagId,
          segment: segmentId,
        },
        undefined,
        base_context
      );
    });

    it('Should remove tag from segment', async () => {
      const action = RemoveKlaviyoTagFromSegment;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await action.api_function(
        {
          tag: tagId,
          segment: segmentId,
        },
        undefined,
        base_context
      );
    });

    it('Should create list', async () => {
      const action = CreateKlaviyoList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          name: 'New List',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdListId = result.id;
    });

    it('Should create event', async () => {
      const action = CreateKlaviyoEvent;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      await action.api_function(
        {
          email: 'test@example.com',
          metric,
          time: new Date().toISOString(),
        },
        undefined,
        base_context
      );
    });
  });

  describe('Should clean up', () => {
    it('Should delete created list', async () => {
      const { listsApi } = getKlaviyoApis(base_context.conn_opts.token);

      if (!createdListId) throw new Error('createdListId is not defined');

      await listsApi.deleteList(createdListId);
    });
  });

  describe('Should test Klaviyo triggers event example data', () => {
    it('Should get example event data for new event trigger', async () => {
      const trigger = NewKlaviyoEvent;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { metric: metricId! },
      });
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should get example event data for new profile trigger', async () => {
      const trigger = NewKlaviyoProfile;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(base_context);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should get example event data for new profile trigger', async () => {
      const trigger = NewKlaviyoListProfile;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { list: 'UzYy2a' },
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });
});
