import { getMailchimpCampaignIdAllowedValues } from '../apps/mailchimp/helpers/get-campaign-id-allowed-values';
import { getMailchimpCustomerIdAllowedValues } from '../apps/mailchimp/helpers/get-customer-id-allowed-values';
import { getMailchimpCampaignFolderIdAllowedValues } from '../apps/mailchimp/helpers/get-folder-id-allowed-values';
import {
  getMailchimpInterestCategoryIdAllowedValues,
  getMailchimpInterestIdAllowedValues,
} from '../apps/mailchimp/helpers/get-interest-id-allowed-values';
import { getMailchimpListIdAllowedValues } from '../apps/mailchimp/helpers/get-list-id-allowed-values';
import { getMailchimpNoteIdAllowedValues } from '../apps/mailchimp/helpers/get-note-id-allowed-values';
import { getMailchimpSegmentIdAllowedValues } from '../apps/mailchimp/helpers/get-segment-id-allowed-values';
import { getMailchimpStoreIdAllowedValues } from '../apps/mailchimp/helpers/get-store-id-allowed-values';
import { getMailchimpSubscriberHashAllowedValues } from '../apps/mailchimp/helpers/get-subscriber-allowed-values';
import { getMailchimpListUniqueEmailIdAllowedValues } from '../apps/mailchimp/helpers/get-unique-email-id-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

describe('Should test MailChimp app actions', () => {
  let token: string;
  let datacenter: string;
  let connection: string;

  beforeAll(() => {
    token = process.env.MAILCHIMP_TOKEN!;
    datacenter = process.env.MAILCHIMP_DATACENTER!;

    if (!token || !datacenter) {
      throw new Error(
        'MAILCHIMP_TOKEN and MAILCHIMP_DATACENTER environment variables are required'
      );
    }

    connection = testApi.createConnection('mailchimp', {
      opts: {
        oauth2_grant_type: 'none' as any,
        token,
        datacenter,
      },
    });

    expect(connection).toBeDefined();
  });

  let storeId: string;
  let listId: string;
  let sub: string;
  let interestCategoryId: string;

  describe('Should test allowed values functions', () => {
    it('Should get list id allowed values', async () => {
      const allowedValues = await getMailchimpListIdAllowedValues({
        conn_opts: {
          token,
          datacenter,
        } as any,
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);

      listId = allowedValues[0].value;
    });

    it('Should get store id allowed values', async () => {
      const allowedValues = await getMailchimpStoreIdAllowedValues({
        conn_opts: {
          token,
          datacenter,
        } as any,
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);

      storeId = allowedValues[0].value;
    });

    it('Should get customer id allowed values', async () => {
      const allowedValues = await getMailchimpCustomerIdAllowedValues({
        conn_opts: {
          token,
          datacenter,
        } as any,
        opts: {
          store_id: storeId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });

    it('Should get subscriber hash allowed values', async () => {
      const allowedValues = await getMailchimpSubscriberHashAllowedValues({
        conn_opts: {
          token,
          datacenter,
        } as any,
        opts: {
          list_id: listId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);

      sub = allowedValues[0].value;
    });

    it('Should get note id allowed values', async () => {
      const allowedValues = await getMailchimpNoteIdAllowedValues({
        conn_opts: {
          token,
          datacenter,
        } as any,
        opts: {
          list_id: listId,
          subscriber_hash: sub,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });

    it('Should get segment id allowed values', async () => {
      const allowedValues = await getMailchimpSegmentIdAllowedValues({
        conn_opts: {
          token,
          datacenter,
        } as any,
        opts: {
          list_id: listId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });

    it('Should get folder id allowed values', async () => {
      const allowedValues = await getMailchimpCampaignFolderIdAllowedValues({
        conn_opts: {
          token,
          datacenter,
        } as any,
        opts: {
          list_id: listId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });

    it('Should get campaign id allowed values', async () => {
      const allowedValues = await getMailchimpCampaignIdAllowedValues({
        conn_opts: {
          token,
          datacenter,
        } as any,
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });

    it('Should get unique email id allowed values', async () => {
      const allowedValues = await getMailchimpListUniqueEmailIdAllowedValues({
        conn_opts: {
          token,
          datacenter,
        } as any,
        opts: {
          list_id: listId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });

    it('Should get interest category id allowed values', async () => {
      const allowedValues = await getMailchimpInterestCategoryIdAllowedValues({
        conn_opts: {
          token,
          datacenter,
        } as any,
        opts: {
          list_id: listId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);

      interestCategoryId = allowedValues[0].value;
    });

    it('Should get interest id allowed values', async () => {
      const allowedValues = await getMailchimpInterestIdAllowedValues({
        conn_opts: {
          token,
          datacenter,
        } as any,
        opts: {
          interest_category_id: interestCategoryId,
          list_id: listId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });
  });

  describe('Should test actions', () => {
    let addedMemberId: string;
    let createdNoteId: string;

    const memberEmail = `test1@qoretechnologies.com`;
    const tagName = `test-tag`;

    it('Should get campaigns', async () => {
      const { body } = await testApi.execAppAction('mailchimp', 'getCampaigns', connection, {
        list_id: listId,
      });

      expect(body).toBeDefined();
      expect(body.campaigns.length).toBeGreaterThan(0);
    });

    it('Should add a member to campaign', async () => {
      const { body } = await testApi.execAppAction('mailchimp', 'postListsIdMembers', connection, {
        list_id: listId,
        body: {
          email_address: memberEmail,
          status: 'subscribed',
        },
      });

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();

      addedMemberId = body.id;
    });

    it('Should upsert a member', async () => {
      const { body } = await testApi.execAppAction('mailchimp', 'putListsIdMembersId', connection, {
        list_id: listId,
        subscriber_hash: memberEmail,
        body: {
          email_address: memberEmail,
          status_if_new: 'subscribed',
        },
      });

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();

      addedMemberId = body.id;
    });

    it('Should get list members', async () => {
      const { body } = await testApi.execAppAction('mailchimp', 'getListsIdMembers', connection, {
        list_id: listId,
      });

      expect(body).toBeDefined();
      expect(body.members.length).toBeGreaterThan(0);
    });

    it('Should add tags to member', async () => {
      await testApi.execAppAction('mailchimp', 'postListMemberTags', connection, {
        list_id: listId,
        subscriber_hash: addedMemberId,
        body: {
          tags: [
            {
              name: tagName,
              status: 'active',
            },
          ],
        },
      });
    });

    it('Should search tags by name', async () => {
      const { body } = await testApi.execAppAction('mailchimp', 'searchTagsByName', connection, {
        list_id: listId,
        name: tagName,
      });

      expect(body.tags).toBeDefined();
      expect(body.tags.length).toBeGreaterThan(0);
      expect(body.tags[0].name).toBe(tagName);
    });

    it('Should remove tag from member', async () => {
      await testApi.execAppAction('mailchimp', 'postListMemberTags', connection, {
        list_id: listId,
        subscriber_hash: addedMemberId,
        body: {
          tags: [
            {
              name: tagName,
              status: 'inactive',
            },
          ],
        },
      });
    });

    it('Should add a note to member', async () => {
      const { body } = await testApi.execAppAction(
        'mailchimp',
        'postListsIdMembersIdNotes',
        connection,
        {
          list_id: listId,
          subscriber_hash: addedMemberId,
          body: {
            note: 'Test note',
          },
        }
      );

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();

      createdNoteId = body.id;
    });

    it('Should delete a note from member', async () => {
      await testApi.execAppAction('mailchimp', 'deleteListsIdMembersIdNotesId', connection, {
        list_id: listId,
        subscriber_hash: addedMemberId,
        note_id: createdNoteId,
      });
    });

    it('Should archive member', async () => {
      await testApi.execAppAction('mailchimp', 'deleteListsIdMembersId', connection, {
        list_id: listId,
        subscriber_hash: addedMemberId,
      });
    });
  });
});
