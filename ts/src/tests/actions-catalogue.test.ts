import { readFileSync } from 'fs';
import { forEach } from 'lodash';
import { join } from 'node:path';
import { actionsCatalogue } from '../ActionsCatalogue';

describe('Qorus Apps Catalogue tests', () => {
  it('Should register the apps', () => {
    actionsCatalogue.initializeCatalogue();

    expect(actionsCatalogue.apps).toHaveProperty('zendesk');
    expect(actionsCatalogue.apps).toHaveProperty('asana');
    expect(actionsCatalogue.apps).toHaveProperty('esignature');

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
          forEach(action.options, (option) => {
            expect(option.display_name).not.toBeFalsy();
            expect(option.short_desc).not.toBeFalsy();
            expect(option.desc).not.toBeFalsy();
            expect(option.type).not.toBeFalsy();
          });
        }

        if ('response_type' in action) {
          if (typeof action.response_type === 'string') {
            expect(action.response_type).not.toBeFalsy();
          } else {
            const responseTypeFields = action.response_type?.fields;
            if (responseTypeFields) {
              forEach(action.response_type.fields, (responseType) => {
                expect(responseType.display_name).not.toBeFalsy();
                expect(responseType.short_desc).not.toBeFalsy();
                expect(responseType.desc).not.toBeFalsy();
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
