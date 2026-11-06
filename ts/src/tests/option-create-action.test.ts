// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { ActionsCatalogue } from '../ActionsCatalogue';

/**
 * An option can name, in its metadata, the action of its app that creates one of its values (qorus#683): the IDE
 * offers that action from the option form, runs it and reads the new value from its response. A descriptor naming
 * an action the app does not have, or a response field the action does not return, would offer a button that cannot
 * work, so every descriptor is checked against the catalogue.
 */
describe('Option create actions', () => {
  const catalogue = new ActionsCatalogue();
  catalogue.initializeCatalogue();
  catalogue.loadAllNewApps();

  const descriptors = Object.values(catalogue.apps).flatMap((app) =>
    (app.actions ?? []).flatMap((action) => {
      const options: TQoreOptions = ('options' in action ? action.options : undefined) ?? {};

      return Object.entries(options).flatMap(([option, info]) => {
        const createAction = info.metadata?.create_action;

        return createAction
          ? [{ app, where: `${app.name} ${action.action}.${option}`, createAction }]
          : [];
      });
    })
  );

  /** Whether a response type has the field at a dot-separated path */
  const hasField = (type: any, path: string): boolean => {
    let current = type;
    for (const segment of path.split('.')) {
      const field = current?.fields?.[segment];
      if (!field) {
        return false;
      }
      current = typeof field.type === 'object' ? field.type : field;
    }
    return true;
  };

  it('Slack channel options offer to create a channel', () => {
    expect(descriptors.map((descriptor) => descriptor.where)).toEqual(
      expect.arrayContaining([
        'Slack send_message.channel',
        'Slack upload_file.channel',
        'Slack request_action_message.channel',
        'Slack new_message.channel',
        'Slack app_mention.channel',
        'Slack new_reaction.channel',
      ])
    );
  });

  it('every create action is an action of the same app whose response has the fields it names', () => {
    const errors: string[] = [];
    for (const { app, where, createAction } of descriptors) {
      const creator = app.actions.find((action) => action.action === createAction.action);
      if (!creator) {
        errors.push(`${where}: ${createAction.action} is not an action of ${app.name}`);
        continue;
      }
      for (const field of [createAction.value_field, createAction.display_name_field]) {
        if (field && !hasField(creator.response_type, field)) {
          errors.push(`${where}: the response of ${createAction.action} has no ${field}`);
        }
      }
    }
    expect(errors).toEqual([]);
  });
});
