import { getTrelloBoardIdAllowedValues } from '../apps/trello/helpers/get-board-id-allowed-values';
import { getTrelloBoardMembersIdAllowedValues } from '../apps/trello/helpers/get-board-members-allowed-values';
import { getTrelloListCardsIdAllowedValues } from '../apps/trello/helpers/get-card-id-allowed-values';
import { getTrelloCardChecklistsIdAllowedValues } from '../apps/trello/helpers/get-checklist-id-allowed-values';
import { getTrelloChecklistItemsIdAllowedValues } from '../apps/trello/helpers/get-checklist-item-id-allowed-values';
import { getTrelloBoardLabelsIdAllowedValues } from '../apps/trello/helpers/get-label-id-allowed-values';
import { getTrelloBoardListsIdAllowedValues } from '../apps/trello/helpers/get-list-id-allowed-values';
import { getTrelloOrganizationIdAllowedValues } from '../apps/trello/helpers/get-organization-id-allowed-values';
import { getTrelloOrganizationMembersIdAllowedValues } from '../apps/trello/helpers/get-organization-members-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

let connection: string;
describe('Tests Trello Actions', () => {
  const token = process.env.TRELLO_TOKEN;
  const key = process.env.TRELLO_KEY;

  beforeAll(() => {
    if (!token || !key) {
      throw new Error('Trello token or key is not set in environment variables');
    }

    connection = testApi.createConnection('trello', {
      opts: {
        oauth2_grant_type: 'none' as any,
        token,
        key,
        headers: {
          Authorization: `OAuth oauth_consumer_key="${key}", oauth_token="${token}"`,
        },
      },
    });

    expect(connection).toBeDefined();
  });

  let orgId: string;
  let boardId: string;
  let listId: string;
  let cardId: string;
  let checklistId: string;

  describe('Should test trello allowed values functions', () => {
    it('Should get trello organization allowed values', async () => {
      const allowedValues = await getTrelloOrganizationIdAllowedValues({
        conn_opts: {
          token,
          key,
        } as any,
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);

      orgId = allowedValues[0].value;
    });

    it('Should get trello organization members allowed values', async () => {
      const allowedValues = await getTrelloOrganizationMembersIdAllowedValues({
        conn_opts: {
          token,
          key,
        } as any,
        opts: {
          id: orgId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });

    it('Should get trello boards allowed values', async () => {
      const allowedValues = await getTrelloBoardIdAllowedValues({
        conn_opts: {
          token,
          key,
        } as any,
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);

      boardId = allowedValues[0].value;
    });

    it('Should get trello board members allowed values', async () => {
      const allowedValues = await getTrelloBoardMembersIdAllowedValues({
        conn_opts: {
          token,
          key,
        } as any,
        opts: {
          id: boardId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });

    it('Should get trello lists allowed values', async () => {
      const allowedValues = await getTrelloBoardListsIdAllowedValues({
        conn_opts: {
          token,
          key,
        } as any,
        opts: {
          boardId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);

      listId = allowedValues[0].value;
    });

    it('Should get trello cards allowed values', async () => {
      const allowedValues = await getTrelloListCardsIdAllowedValues({
        conn_opts: {
          token,
          key,
        } as any,
        opts: {
          id: listId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);

      cardId = allowedValues[0].value;
    });

    it('Should get trello card labels allowed values', async () => {
      const allowedValues = await getTrelloBoardLabelsIdAllowedValues({
        conn_opts: {
          token,
          key,
        } as any,
        opts: {
          id: boardId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });

    it('Should get trello checklist id allowed values', async () => {
      const allowedValues = await getTrelloCardChecklistsIdAllowedValues({
        conn_opts: {
          token,
          key,
        } as any,
        opts: {
          id: cardId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);

      checklistId = allowedValues[0].value;
    });

    it('Should get trello checklist item id allowed values', async () => {
      const allowedValues = await getTrelloChecklistItemsIdAllowedValues({
        conn_opts: {
          token,
          key,
        } as any,
        opts: {
          id: checklistId,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });
  });

  // Return when the auth is fixed

  // describe('Should test Trello actions', () => {
  //   let createdBoardId: string;
  //   let createdListId: string;
  //   let createdCardId: string;
  //   let createdLabelId: string;

  //   it('Should create a board', async () => {
  //     const boardName = `Test Board ${new Date().toISOString()}`;

  //     const { body } = await testApi.execAppAction('trello', 'post-boards', connection, {
  //       name: boardName,
  //     });

  //     expect(body).toBeDefined();
  //     expect(body.id).toBeDefined();
  //     expect(body.name).toBe(boardName);

  //     createdBoardId = body.id;
  //   });

  //   it('Should get the created board', async () => {
  //     const { body } = await testApi.execAppAction('trello', 'get-boards-id', connection, {
  //       id: createdBoardId,
  //     });

  //     expect(body).toBeDefined();
  //     expect(body.id).toBe(createdBoardId);
  //   });

  //   it('Should update the created board', async () => {
  //     const boardName = `Updated Test Board ${new Date().toISOString()}`;

  //     const { body } = await testApi.execAppAction('trello', 'put-boards-id', connection, {
  //       id: createdBoardId,
  //       name: boardName,
  //     });

  //     expect(body).toBeDefined();
  //     expect(body.id).toBe(createdBoardId);
  //     expect(body.name).toBe(boardName);
  //   });

  //   it('Should create a list', async () => {
  //     const { body } = await testApi.execAppAction('trello', 'post-lists', connection, {
  //       name: 'Test List',
  //       idBoard: boardId,
  //     });

  //     expect(body).toBeDefined();
  //     expect(body.id).toBeDefined();

  //     createdListId = body.id;
  //   });

  //   it('Should get list by id', async () => {
  //     const { body } = await testApi.execAppAction('trello', 'get-lists-id', connection, {
  //       id: listId,
  //     });

  //     expect(body).toBeDefined();
  //     expect(body.id).toBe(createdListId);
  //   });

  //   it('Should update the list', async () => {
  //     const listName = `Updated Test List ${new Date().toISOString()}`;

  //     const { body } = await testApi.execAppAction('trello', 'put-lists-id', connection, {
  //       id: createdListId,
  //       name: listName,
  //     });

  //     expect(body).toBeDefined();
  //     expect(body.id).toBe(createdListId);
  //     expect(body.name).toBe(listName);
  //   });

  //   it('Should create a card', async () => {
  //     const { body } = await testApi.execAppAction('trello', 'post-cards', connection, {
  //       name: 'Test Card',
  //       idList: createdListId,
  //     });

  //     expect(body).toBeDefined();
  //     expect(body.id).toBeDefined();

  //     createdCardId = body.id;
  //   });

  //   it('Should update the card', async () => {
  //     const cardName = `Updated Test Card ${new Date().toISOString()}`;

  //     const { body } = await testApi.execAppAction('trello', 'put-cards-id', connection, {
  //       id: createdCardId,
  //       name: cardName,
  //     });

  //     expect(body).toBeDefined();
  //     expect(body.id).toBe(createdCardId);
  //     expect(body.name).toBe(cardName);
  //   });

  //   it('Should a comment on the card', async () => {
  //     const comment = `Test Comment ${new Date().toISOString()}`;

  //     const { body } = await testApi.execAppAction(
  //       'trello',
  //       'post-cards-id-actions-comments',
  //       connection,
  //       {
  //         id: createdCardId,
  //         text: comment,
  //       }
  //     );

  //     expect(body).toBeDefined();
  //     expect(body.data.text).toBe(comment);
  //   });

  //   it('Should create a label', async () => {
  //     const { body } = await testApi.execAppAction('trello', 'post-labels', connection, {
  //       name: `Test Label-${Date.now()}`,
  //       color: 'sky',
  //       idBoard: boardId,
  //     });

  //     expect(body).toBeDefined();
  //     expect(body.id).toBeDefined();
  //     expect(body.name).toBeDefined();

  //     createdLabelId = body.id;
  //   });

  //   it('Should add a label to card', async () => {
  //     const { body } = await testApi.execAppAction('trello', 'post-cards-id-idlabels', connection, {
  //       id: createdCardId,
  //       value: createdLabelId,
  //     });

  //     expect(body).toBeDefined();
  //     expect(body.id).toBe(createdCardId);
  //   });

  //   it('Should delete the label', async () => {
  //     await testApi.execAppAction('trello', 'delete-labels-id', connection, {
  //       id: createdLabelId,
  //     });
  //   });

  //   it('Should delete the created board', async () => {
  //     await testApi.execAppAction('trello', 'delete-boards-id', connection, {
  //       id: createdBoardId,
  //     });
  //   });
  // });
});
