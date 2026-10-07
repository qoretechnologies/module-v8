// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { ZoomError } from '../constants';

const assertValidDate = (date: Date): void => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new ZoomError(`Cannot format an invalid date for the Zoom API: ${String(date)}`);
  }
};

/**
 * Formats a date the way Zoom documents its `date` query parameters (`yyyy-MM-dd`), for example `from`
 * and `to` on `GET /users/{userId}/meetings`.
 *
 * The calendar day is taken in UTC; a request that sends it should also send `timezone=UTC`, so that
 * Zoom reads the day the same way instead of in the account's own timezone.
 */
export const toZoomDate = (date: Date): string => {
  assertValidDate(date);

  return date.toISOString().slice(0, 10);
};

/**
 * Formats a date the way Zoom documents its `date-time` query parameters (`yyyy-MM-dd'T'HH:mm:ss'Z'`),
 * for example `from` and `to` on `GET /users/{userId}/meeting_summaries`.
 *
 * `Date#toISOString()` adds milliseconds, which the documented format does not have.
 */
export const toZoomDateTime = (date: Date): string => {
  assertValidDate(date);

  return `${date.toISOString().slice(0, 19)}Z`;
};
