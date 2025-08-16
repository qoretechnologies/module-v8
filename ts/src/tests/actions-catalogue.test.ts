import { readFileSync } from 'fs';
import { forEach } from 'lodash';
import { join } from 'node:path';
import { actionsCatalogue } from '../ActionsCatalogue';

const expectWithContext = (run: () => void, ctx: string) => {
  try {
    run();
  } catch (err: any) {
    const original = err?.message ?? '';
    err.message = `${ctx}\n${original}`;
    throw err;
  }
};

describe('Qorus Apps Catalogue tests', () => {
  it('Should register the apps', () => {
    actionsCatalogue.initializeCatalogue();

    expect(actionsCatalogue.apps).toHaveProperty('zendesk');
    expect(actionsCatalogue.apps).toHaveProperty('asana');
    expect(actionsCatalogue.apps).toHaveProperty('esignature');
    expect(actionsCatalogue.apps).toHaveProperty('example');

    forEach(actionsCatalogue.apps, (app) => {
      expect(app.display_name).not.toBeFalsy();
      expect(app.short_desc).not.toBeFalsy();
      expect(app.desc).not.toBeFalsy();

      if (app.swagger) {
        // Make sure the swagger file exists
        expect(readFileSync(join(__dirname, '..', app.swagger))).not.toBeFalsy();
      }

      expect(app.actions).not.toBeFalsy();
      expect(app.actions.length).toBeGreaterThan(0);

      forEach(app.actions, (action) => {
        expect(action.action).not.toBeFalsy();
        expect(action.app).not.toBeFalsy();
        expect(action.display_name).not.toBeFalsy();
        expect(action.short_desc).not.toBeFalsy();
        expect(action.desc).not.toBeFalsy();

        if ('options' in action) {
          const checkOption = (option: any, context: string) => {
            expectWithContext(
              () => expect(option.display_name).not.toBeFalsy(),
              `${context}: "display_name" is missing/empty`
            );
            expectWithContext(
              () => expect(option.short_desc).not.toBeFalsy(),
              `${context}: "short_desc" is missing/empty`
            );
            expectWithContext(
              () => expect(option.desc).not.toBeFalsy(),
              `${context}: "desc" is missing/empty`
            );
            expectWithContext(
              () => expect(option.type).not.toBeFalsy(),
              `${context}: "type" is missing/empty`
            );
            if (typeof option.type === 'object' && option.type.fields) {
              forEach(option.type.fields, (field) => {
                checkOption(field, `${context} -> ${field.display_name ?? '[no name]'}`);
              });
            }
          };

          forEach(action.options, (option, key) => {
            const baseCtx = `${app.name} -> ${action.action} -> ${key}`;
            checkOption(option, baseCtx);
          });
        }

        if ('response_type' in action) {
          if (typeof action.response_type === 'string') {
            expect(action.response_type).not.toBeFalsy();
          } else if (action.response_type?.type === 'hash') {
            const responseTypeFields = action.response_type?.fields;
            if (responseTypeFields) {
              forEach(action?.response_type?.fields, (responseType) => {
                expect(responseType.type).not.toBeFalsy();
              });
            }
          }
        }

        if ('swagger_path' in action) {
          expect(action.swagger_path.includes('undefined')).not.toBeTruthy();
        }
      });
    });
  });
});
