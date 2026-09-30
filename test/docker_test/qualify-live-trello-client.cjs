#!/usr/bin/env node
// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
// Opt-in qualification: only the newly created private board is modified.
const assert = require('node:assert/strict');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const master = process.env.QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT
  || '/usr/share/qore-v8-app-catalogue/dist/index.js';
const app = path.join(path.dirname(master), 'apps/trello');
const { trelloClient } = require(`${app}/client.js`);
const { getTrelloBoardIdAllowedValues } = require(`${app}/helpers/get-board-id-allowed-values.js`);
const { getTrelloBoardListsIdAllowedValues } = require(`${app}/helpers/get-list-id-allowed-values.js`);
const { getTrelloListCardsIdAllowedValues } = require(`${app}/helpers/get-card-id-allowed-values.js`);
const { searchTrelloRecords } = require(`${app}/helpers/record-based/search-records.js`);

async function qualify() {
  const auth = { key: process.env.TRELLO_KEY, token: process.env.TRELLO_APIKEY };
  assert.ok(auth.key && auth.token, 'TRELLO_KEY and TRELLO_APIKEY must identify a test account');
  const marker = `Qore-5473-${randomUUID()}`;
  let board;
  try {
    board = await trelloClient.post('boards', undefined, { ...auth, params: {
      name: marker, defaultLists: false, prefs_permissionLevel: 'private',
    } });
    assert.ok(board.id);
    assert.equal(board.prefs.permissionLevel, 'private');
    const list = await trelloClient.post('lists', undefined, { ...auth,
      params: { idBoard: board.id, name: marker } });
    const cards = [];
    for (const suffix of ['one', 'two']) {
      cards.push(await trelloClient.post('cards', undefined, { ...auth,
        params: { idList: list.id, name: `${marker}-${suffix}` } }));
    }
    await trelloClient.put(`cards/${cards[0].id}`, undefined, { ...auth,
      params: { name: `${marker}-updated` } });
    assert.equal((await trelloClient.get(`cards/${cards[0].id}`, auth)).name, `${marker}-updated`);

    const context = { conn_opts: auth, opts: { idBoard: board.id, idList: list.id } };
    const boards = await getTrelloBoardIdAllowedValues(context);
    assert.equal(boards.find(value => value.value === board.id)?.display_name, marker);
    const lists = await getTrelloBoardListsIdAllowedValues(context);
    assert.deepEqual(lists.map(value => value.value), [list.id]);
    const values = await getTrelloListCardsIdAllowedValues(context);
    assert.deepEqual(values.map(value => value.value).sort(), cards.map(card => card.id).sort());
    assert.ok(values.every(value => value.display_name.startsWith(marker)));

    // Trello list cards are fetched once; its record iterator paginates the result locally.
    const iterator = await searchTrelloRecords(context, undefined, { table: `${marker}|${marker}`, limit: 1 });
    const first = await iterator(context, 1);
    const second = await iterator(context, 1);
    assert.equal(first.id.length, 1);
    assert.equal(second.id.length, 1);
    assert.deepEqual([...first.id, ...second.id].sort(), cards.map(card => card.id).sort());
    assert.equal(await iterator(context, 1), null);
    assert.equal(await iterator(context, 1), null);
    console.log('Trello shared CRUD, board/list/card allowed values and record iterator pagination passed');
  } finally {
    if (board?.id) {
      try { await trelloClient.delete(`boards/${board.id}`, auth); }
      catch { assert.fail(`Remove the remaining test board: ${board.id}`); }
      console.log('Trello helper qualification board and its contents removed');
    }
  }
}
qualify().catch(error => {
  // Network errors can include credential query parameters.
  console.error(error instanceof assert.AssertionError ? error.message : 'Trello helper qualification failed');
  process.exitCode = 1;
});
