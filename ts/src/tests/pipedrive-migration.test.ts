// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { composePipedriveSchemas, normalizeSchema, appContract, schemaCompatibilityDigest } from '../schema-cache/apps';
import { fetchPipedrivePaginatedRecords, pipedriveApiClient, pipedriveRecordPages } from '../apps/pipedrive/helpers/client';
import { pipedriveRecordBody, pipedriveTablePath } from '../apps/pipedrive/helpers/record-based/constants';
import { searchPipedriveRecords } from '../apps/pipedrive/helpers/record-based/search-records';
import { createPipedriveRecords } from '../apps/pipedrive/helpers/record-based/create-records';
import { updatePipedriveRecords } from '../apps/pipedrive/helpers/record-based/update-records';
import { getPipedrivePersonRecordType } from '../apps/pipedrive/helpers/record-based/get-person-record-type';
import { getPipedriveAttendeeAllowedValues } from '../apps/pipedrive/helpers/get-attendee-allowed-values';

function bundle(): Record<string, any> {
  return Object.fromEntries(['v1', 'v2'].map(version => {
    const prefix = version === 'v1' ? '/v1' : '/api/v2';
    const paths: Record<string, any> = {};
    for (const op of appContract('pipedrive').operations.filter(op => op.path.startsWith(prefix + '/'))) {
      (paths[op.path.slice(prefix.length)] ||= {})[op.method] = {
        security: [{ key: [], token: [] }],
        responses: { '200': { description: 'Synthetic response', content: { 'application/json': {
          schema: { $ref: '#/components/schemas/Record' },
        } } } },
      };
    }
    return [version, { openapi: '3.0.1', info: { title: 'Synthetic provider', version: '1' },
      servers: [{ url: `https://api.pipedrive.com${prefix}` }], paths,
      components: { schemas: { Record: { type: 'object', properties: { id: { type: version === 'v1' ? 'string' : 'integer' } } } },
        securitySchemes: { key: { type: 'apiKey', in: 'query', name: 'key' }, token: { type: 'apiKey', in: 'query', name: 'token' } } },
    }];
  }));
}

describe('Pipedrive API migration', () => {
  afterEach(() => jest.restoreAllMocks());
  const ctx = { conn_opts: { token: 'synthetic-token' } };
  const reply = (data: unknown[], additional_data: object = {}) => ({ data: { data, additional_data } });

  it('retains all identities, versioned routes, independent references and AND security', () => {
    const input = bundle();
    const original = structuredClone(input);
    const doc = normalizeSchema('pipedrive', input);
    expect(input).toEqual(original);
    expect(appContract('pipedrive').actions).toHaveLength(47);
    for (const op of appContract('pipedrive').operations) {
      expect(doc.paths[op.path][op.method].operationId).toBe(op.operationId);
    }
    expect(doc.paths['/api/v2/deals/{id}'].patch).toBeDefined();
    expect(doc.paths['/v1/notes/{id}'].put).toBeDefined();
    expect(doc.paths['/v1/leads/{id}'].patch).toBeDefined();
    expect(doc.paths['/api/v2/deals'].get.security).toEqual([{ v2_key: [], v2_token: [] }]);
    expect(doc.paths['/v1/leads'].get.responses['200'].content['application/json'].schema.$ref)
      .toBe('#/components/schemas/v1_Record');
    expect(doc.components.schemas.v1_Record.properties.id.type).toBe('string');
    expect(doc.components.schemas.v2_Record.properties.id.type).toBe('integer');
  });

  it('rejects missing generations, operations, remote references and changed servers', () => {
    const mutations = [
      (d: any) => { delete d.v2; },
      (d: any) => { d.extra = {}; },
      (d: any) => { delete d.v2.paths['/deals']; },
      (d: any) => { d.v2.servers[0].url = 'https://example.invalid'; },
      (d: any) => { d.v2.paths['/deals'].servers = [{ url: 'https://example.invalid' }]; },
      (d: any) => { d.v2.components.schemas.Record.$ref = 'https://example.invalid/schema'; },
    ];
    for (const mutate of mutations) {
      const input = bundle(); mutate(input);
      expect(() => normalizeSchema('pipedrive', input)).toThrow(/APP-SCHEMA-/);
    }
    expect(() => composePipedriveSchemas(null)).toThrow(/INVALID/);
  });

  it('preserves optional nullable lead archive reasons in request and response schemas', () => {
    const input = bundle();
    const previous = schemaCompatibilityDigest(normalizeSchema('pipedrive', input));
    const field = { type: 'string', nullable: true, description: 'Synthetic archive explanation' };
    const lead = { type: 'object', properties: { archive_reason: field } };
    input.v1.paths['/leads/{id}'].patch.requestBody = {
      content: { 'application/json': { schema: structuredClone(lead) } },
    };
    for (const [route, method] of [['/leads', 'get'], ['/leads', 'post'], ['/leads/{id}', 'get'],
      ['/leads/{id}', 'patch']]) {
      input.v1.paths[route][method].responses['200'].content['application/json'] = {
        schema: structuredClone(lead), example: { archive_reason: null },
      };
    }
    const original = structuredClone(input);
    const doc = normalizeSchema('pipedrive', input);
    expect(input).toEqual(original);
    expect(doc.paths['/v1/leads/{id}'].patch.requestBody.content['application/json'].schema).toEqual(lead);
    for (const [route, method] of [['/v1/leads', 'get'], ['/v1/leads', 'post'], ['/v1/leads/{id}', 'get'],
      ['/v1/leads/{id}', 'patch']]) {
      expect(doc.paths[route][method].responses['200'].content['application/json'])
        .toEqual({ schema: lead, example: { archive_reason: null } });
    }
    const reviewed = schemaCompatibilityDigest(doc);
    expect(reviewed).not.toBe(previous);
    for (const change of [
      (schema: Record<string, any>) => { schema.properties.archive_reason.type = 'integer'; },
      (schema: Record<string, any>) => { schema.properties.archive_reason.nullable = false; },
      (schema: Record<string, any>) => { schema.required = ['archive_reason']; },
      (schema: Record<string, any>) => { delete schema.properties.archive_reason; },
    ]) {
      const changed = structuredClone(doc);
      change(changed.paths['/v1/leads/{id}'].patch.requestBody.content['application/json'].schema);
      expect(schemaCompatibilityDigest(changed)).not.toBe(reviewed);
    }
  });

  // The revision published on 2026-10-07 documents the bounds of the v2 list operations' `limit`
  // parameter; the client has enforced the same bounds all along.
  it('preserves the published limit bounds of v2 list operations, which the client enforces', async () => {
    const input = bundle();
    const previous = schemaCompatibilityDigest(normalizeSchema('pipedrive', input));
    const lists = ['/activities', '/deals', '/organizations', '/persons', '/projects', '/tasks'];
    const limit = { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 500 } };
    for (const route of lists) {
      input.v2.paths[route].get.parameters = [structuredClone(limit)];
    }
    const original = structuredClone(input);
    const doc = normalizeSchema('pipedrive', input);
    expect(input).toEqual(original);
    for (const route of lists) {
      expect(doc.paths['/api/v2' + route].get.parameters).toEqual([limit]);
    }
    const reviewed = schemaCompatibilityDigest(doc);
    expect(reviewed).not.toBe(previous);
    for (const change of [
      (schema: Record<string, any>) => { schema.maximum = 1000; },
      (schema: Record<string, any>) => { delete schema.minimum; },
      (schema: Record<string, any>) => { schema.type = 'string'; },
    ]) {
      const changed = structuredClone(doc);
      change(changed.paths['/api/v2/deals'].get.parameters[0].schema);
      expect(schemaCompatibilityDigest(changed)).not.toBe(reviewed);
    }
    for (const outside of [0, 501]) {
      await expect(fetchPipedrivePaginatedRecords({ token: 'test', path: 'deals', limit: outside, maxResults: 1 }))
        .rejects.toThrow('Invalid Pipedrive pagination limits');
    }
  });

  it('keeps component dictionaries separate from object prototypes', () => {
    const input = bundle();
    Object.defineProperty(input.v2.components, '__proto__', {
      value: { synthetic: { type: 'string' } }, enumerable: true,
    });
    const doc = composePipedriveSchemas(input);
    expect(Object.getPrototypeOf(doc.components)).toBeNull();
    expect(doc.components.__proto__.v2_synthetic).toEqual({ type: 'string' });
    expect(Object.prototype).not.toHaveProperty('v2_synthetic');
  });

  it('reads nested v2 cursors, respects limits and stops exactly at the result cap', async () => {
    const get = jest.spyOn(QorusRequest, 'get')
      .mockResolvedValueOnce(reply([{ id: 1 }, { id: 2 }], { next_cursor: 'opaque' }))
      .mockResolvedValueOnce(reply([{ id: 3 }, { id: 4 }], { next_cursor: 'unused' }));
    expect(await fetchPipedrivePaginatedRecords({ token: 'test', path: 'deals', limit: 2, maxResults: 3 }))
      .toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(get.mock.calls.map(call => call[0])).toMatchObject([
      { path: '/api/v2/deals', params: { limit: '2' } },
      { params: { limit: '1', cursor: 'opaque' } },
    ]);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('uses v1 next_start instead of calculating the next offset from the page size', async () => {
    const get = jest.spyOn(QorusRequest, 'get')
      .mockResolvedValueOnce(reply([{ id: 1 }], { pagination: { more_items_in_collection: true, next_start: 19 } }))
      .mockResolvedValueOnce(reply([{ id: 2 }], { pagination: { more_items_in_collection: false } }));
    expect(await fetchPipedrivePaginatedRecords({ token: 'test', path: 'v1/notes' })).toHaveLength(2);
    expect(get.mock.calls[1][0]).toMatchObject({ path: '/v1/notes', params: { start: '19' } });
  });

  it('excludes consumer processing time from the pagination budget', async () => {
    let now = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    jest.spyOn(QorusRequest, 'get')
      .mockResolvedValueOnce(reply([{ id: 1 }], { next_cursor: 'next' }))
      .mockResolvedValueOnce(reply([{ id: 2 }]));
    const pages = pipedriveRecordPages({ token: 'test', path: 'deals', timeout: 10 });
    expect((await pages.next()).value).toEqual([{ id: 1 }]);
    now = 1000;
    expect((await pages.next()).value).toEqual([{ id: 2 }]);
    expect((await pages.next()).done).toBe(true);
  });

  it('fails on repeated cursors, invalid offsets, malformed pages and request errors', async () => {
    const get = jest.spyOn(QorusRequest, 'get');
    get.mockResolvedValue(reply([{ id: 1 }], { next_cursor: 'same' }));
    await expect(fetchPipedrivePaginatedRecords({ token: 'test', path: 'deals' })).rejects.toThrow(/cursor/);
    get.mockResolvedValue(reply([{ id: 1 }], { pagination: { more_items_in_collection: true, next_start: 0 } }));
    await expect(fetchPipedrivePaginatedRecords({ token: 'test', path: 'v1/notes' })).rejects.toThrow(/offset/);
    get.mockResolvedValue({ data: { data: {} } });
    await expect(fetchPipedrivePaginatedRecords({ token: 'test', path: 'deals' })).rejects.toThrow(/expected records/);
    get.mockRejectedValue(new Error('synthetic transport failure'));
    await expect(fetchPipedrivePaginatedRecords({ token: 'test', path: 'deals' })).rejects.toThrow(/transport/);
    get.mockClear();
    expect(await fetchPipedrivePaginatedRecords({ token: 'test', path: 'deals', maxResults: 0 })).toEqual([]);
    expect(get).not.toHaveBeenCalled();
    await expect(fetchPipedrivePaginatedRecords({ token: 'test', path: 'deals', limit: -1 })).rejects.toThrow(/limits/);
  });

  it('uses the native request bridge for PATCH', async () => {
    const patch = jest.spyOn(QorusRequest, 'patch').mockResolvedValue(reply([{ id: 1 }]));
    await pipedriveApiClient({ token: 'test', path: 'deals/1', method: 'PATCH', body: { title: 'Changed' } });
    expect(patch).toHaveBeenCalledWith(expect.objectContaining({ path: '/api/v2/deals/1', data: { title: 'Changed' } }),
      expect.objectContaining({ endpointId: 'Pipedrive' }));
  });

  it('retains v2 record fields absent from v1 metadata and emits v2 attendee keys', async () => {
    const get = jest.spyOn(QorusRequest, 'get')
      .mockResolvedValueOnce(reply([{ id: 1, key: 'name', name: 'Person name', field_type: 'varchar' }]))
      .mockResolvedValueOnce(reply([{ id: 2, name: 'Ada', emails: [{ value: 'ada@example.invalid' }] },
        { id: 3, name: 'No email' }]));
    const type = await getPipedrivePersonRecordType(ctx);
    expect(type).toMatchObject({ fields: { name: { required: true }, emails: { type: 'list' }, phones: { type: 'list' } } });
    expect(get.mock.calls[0][0].path).toBe('/v1/personFields');
    expect(await getPipedriveAttendeeAllowedValues(ctx)).toEqual([
      expect.objectContaining({ value: { email: 'ada@example.invalid', person_id: 2 } }),
    ]);
  });

  it('propagates search failures and returns an empty search only once', async () => {
    const get = jest.spyOn(QorusRequest, 'get').mockResolvedValue(reply([]));
    const empty = await searchPipedriveRecords(ctx, undefined, { table: 'notes' });
    expect(await empty(ctx, 5)).toBeNull();
    expect(await empty(ctx, 5)).toBeNull();
    expect(get).toHaveBeenCalledTimes(1);
    get.mockRejectedValue(new Error('synthetic read failure'));
    const broken = await searchPipedriveRecords(ctx, undefined, { table: 'deals' });
    await expect(broken(ctx, 5)).rejects.toThrow(/synthetic read failure/);
    expect(await broken(ctx, 5)).toBeNull();
    await expect(searchPipedriveRecords(ctx, undefined, { table: '../bad' })).rejects.toThrow(/supported/);
    get.mockClear();
    await expect(searchPipedriveRecords(ctx, { content: 'Example' }, { table: 'notes' }))
      .rejects.toThrow(/conditions is not supported/);
    expect(get).not.toHaveBeenCalled();
  });

  it('returns the final search page before exhaustion and never repeats a page', async () => {
    const get = jest.spyOn(QorusRequest, 'get')
      .mockResolvedValueOnce(reply([{ id: 1 }], { next_cursor: 'next' }))
      .mockResolvedValueOnce(reply([{ id: 2 }]));
    const iterator = await searchPipedriveRecords(ctx, undefined, { table: 'deals', limit: 2,
      orderBy: { column: 'id', ascending: false } });
    expect(await iterator(ctx, 1)).toEqual({ id: [1] });
    expect(await iterator(ctx, 1)).toEqual({ id: [2] });
    expect(await iterator(ctx, 1)).toBeNull();
    expect(await iterator(ctx, 1)).toBeNull();
    expect(get).toHaveBeenCalledTimes(2);
    expect(get.mock.calls[0][0].params).toMatchObject({ sort_by: 'id', sort_direction: 'desc' });
  });

  it('removes a temporary filter before returning the last capped search block', async () => {
    jest.spyOn(QorusRequest, 'get')
      .mockResolvedValueOnce(reply([{ id: 7, key: 'title', name: 'Title', field_type: 'varchar' }]))
      .mockResolvedValueOnce(reply([{ id: 1, title: 'Example' }], { next_cursor: 'more' }));
    jest.spyOn(QorusRequest, 'post').mockResolvedValue({ data: { data: { id: 99 } } });
    const remove = jest.spyOn(QorusRequest, 'deleteReq').mockResolvedValue({ data: { success: true } });
    const iterator = await searchPipedriveRecords(ctx,
      { exp: '==', args: [{ field: 'title' }, { value: 'Example' }] }, { table: 'deals', limit: 1 });
    expect(await iterator(ctx, 1)).toEqual({ id: [1], title: ['Example'] });
    expect(remove.mock.calls[0][0]).toMatchObject({ path: '/v1/filters/99' });
    expect(await iterator(ctx, 1)).toBeNull();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('routes v1 creates and updates correctly and preserves per-record v2 custom fields', async () => {
    const custom = 'a'.repeat(40);
    expect(pipedriveRecordBody('deals', { title: 'Deal', [custom]: 2 })).toEqual({ title: 'Deal', custom_fields: { [custom]: 2 } });
    expect(pipedriveRecordBody('leads', { custom_fields: { [custom]: 2 } })).toEqual({ [custom]: 2 });
    expect(() => pipedriveTablePath('../deals')).toThrow(/supported/);
    expect(() => pipedriveRecordBody('deals', { custom_fields: [] })).toThrow(/object/);
    const post = jest.spyOn(QorusRequest, 'post').mockResolvedValue({ data: { data: { id: 1 } } });
    await createPipedriveRecords(ctx, { title: ['Lead'] }, { table: 'leads' });
    expect(post.mock.calls[0][0]).toMatchObject({ path: '/v1/leads', data: { title: 'Lead' } });
    expect(await createPipedriveRecords(ctx, {}, { table: 'deals' })).toEqual({});
    jest.spyOn(QorusRequest, 'get').mockResolvedValue(reply([{ id: 1 }]));
    const put = jest.spyOn(QorusRequest, 'put').mockResolvedValue({ data: { data: { id: 1 } } });
    await updatePipedriveRecords(ctx, { content: 'Changed' }, undefined, { table: 'notes' });
    expect(put.mock.calls[0][0]).toMatchObject({ path: '/v1/notes/1', data: { content: 'Changed' } });
  });
});
