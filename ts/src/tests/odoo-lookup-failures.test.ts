// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

const mockRead = jest.fn();
const mockConnect = jest.fn();
jest.mock('odoo-await', () => ({
  __esModule: true,
  default: class {
    connect = mockConnect;
    searchRead = mockRead;
  },
}));
import { fetchOdooAllowedValues } from '../apps/odoo/helpers/constants';

const failure = new Error('fixture upstream failure');
const options = {
  username: 'fixture',
  password: 'fixture',
  subdomain: 'fixture',
  model: 'res.partner',
  limit: 1,
  mapItemToAllowedValue: (item: { id: string }) => ({ value: item.id }),
};
beforeEach(() => {
  jest.useFakeTimers();
  mockRead.mockReset();
  mockConnect.mockReset().mockResolvedValue(undefined);
});
afterEach(() => {
  jest.useRealTimers();
});
it('rejects a failed Odoo login', async () => {
  mockConnect.mockRejectedValue(failure);
  await expect(fetchOdooAllowedValues(options)).rejects.toThrow(failure);
  expect(mockRead).not.toHaveBeenCalled();
});
it('rejects a failed Odoo first page', async () => {
  mockRead.mockRejectedValue(failure);
  await expect(fetchOdooAllowedValues(options)).rejects.toThrow(failure);
});
it('rejects an Odoo second-page failure', async () => {
  mockRead.mockResolvedValueOnce([{ id: 'one' }]).mockRejectedValueOnce(failure);
  await Promise.all([
    expect(fetchOdooAllowedValues(options)).rejects.toThrow(failure),
    jest.runAllTimersAsync(),
  ]);
  expect(mockRead).toHaveBeenCalledTimes(2);
});
it('returns an empty Odoo collection only after a successful request', async () => {
  mockRead.mockResolvedValue([]);
  await expect(fetchOdooAllowedValues(options)).resolves.toEqual([]);
  expect(mockRead).toHaveBeenCalledTimes(1);
});
it('rejects Odoo responses that exceed the scan deadline', async () => {
  mockRead.mockImplementation(async () => {
    jest.setSystemTime(Date.now() + 60_000);
    return [];
  });
  await expect(fetchOdooAllowedValues(options)).rejects.toThrow(/timeout/i);
});
