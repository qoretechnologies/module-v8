// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { removeTrelloSelectionFields } from '../apps/trello/allowed-paths/constants';

describe('Trello native selection fields', () => {
  const convert = removeTrelloSelectionFields(['idBoard']);

  it('removes UI selectors from either schema location without mutating the input', async () => {
    const request = { query: { idBoard: 'board', idList: 'list' }, body: { idBoard: 'board', name: 'card' } };
    expect(await convert(request)).toEqual({ query: { idList: 'list' }, body: { name: 'card' } });
    expect(request).toEqual({ query: { idBoard: 'board', idList: 'list' }, body: { idBoard: 'board', name: 'card' } });
  });

  it('does not send an empty body when all body fields are synthetic selectors', async () => {
    expect(await convert({ query: { idList: 'list', name: 'card' }, body: { idBoard: 'board' } }))
      .toEqual({ query: { idList: 'list', name: 'card' } });
    expect(await convert({ query: { idBoard: 'board' } })).toEqual({});
    expect(await convert({})).toEqual({});
  });

  it('preserves opaque and array bodies and similarly named nested fields', async () => {
    expect(await convert({ body: 'opaque body' })).toEqual({ body: 'opaque body' });
    expect(await convert({ body: [{ idBoard: 'wire value' }] })).toEqual({ body: [{ idBoard: 'wire value' }] });
    expect(await convert({ body: { nested: { idBoard: 'wire value' } } }))
      .toEqual({ body: { nested: { idBoard: 'wire value' } } });
  });
});
