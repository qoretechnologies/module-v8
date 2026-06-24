import { readFileSync } from 'fs';
import { forEach } from 'lodash';
import { join } from 'node:path';
import { actionsCatalogue } from '../ActionsCatalogue';
import en from '../i18n/en';
import { APP_GROUPS, isValidAppGroup } from '../i18n/groups';

const collectErrors = (
  check: () => void,
  ctx: string,
  errors: string[]
): void => {
  try {
    check();
  } catch {
    errors.push(ctx);
  }
};

describe('Qorus Apps Catalogue tests', () => {
  it('Should register the apps', () => {
    actionsCatalogue.initializeCatalogue();
    // NEW-style apps load lazily on demand at runtime; eagerly load the full set
    // here so this test can validate every app's metadata in a Node context.
    actionsCatalogue.loadAllNewApps();

    expect(actionsCatalogue.apps).toHaveProperty('zendesk');
    expect(actionsCatalogue.apps).toHaveProperty('asana');
    expect(actionsCatalogue.apps).toHaveProperty('esignature');
    expect(actionsCatalogue.apps).toHaveProperty('example');

    const allErrors: string[] = [];

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
            collectErrors(
              () => expect(option.display_name).not.toBeFalsy(),
              `${context}: "display_name" is missing/empty`,
              allErrors
            );
            collectErrors(
              () => expect(option.short_desc).not.toBeFalsy(),
              `${context}: "short_desc" is missing/empty`,
              allErrors
            );
            collectErrors(
              () => expect(option.desc).not.toBeFalsy(),
              `${context}: "desc" is missing/empty`,
              allErrors
            );
            collectErrors(
              () => expect(option.type).not.toBeFalsy(),
              `${context}: "type" is missing/empty`,
              allErrors
            );
            if (typeof option.type === 'object') {
              // Handle hash type with direct fields
              if (option.type.fields) {
                forEach(option.type.fields, (field, fieldKey) => {
                  checkOption(field, `${context} -> fields.${fieldKey}`);
                });
              }
              // Handle list type with element_type.fields (list of hash)
              if (option.type.element_type?.fields) {
                forEach(option.type.element_type.fields, (field, fieldKey) => {
                  checkOption(field, `${context} -> element_type.fields.${fieldKey}`);
                });
              }
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
              forEach(action.response_type?.fields, (responseType) => {
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

    if (allErrors.length > 0) {
      throw new Error(
        `Found ${allErrors.length} locale validation error(s):\n${allErrors.join('\n')}`
      );
    }
  });

  it('Should have valid app-level groups in all locale files', () => {
    const errors: string[] = [];

    forEach(en.apps, (appLocale, appName) => {
      // Skip test apps
      if (appName.startsWith('_')) {
        return;
      }

      const groups = (appLocale as { groups?: string[] }).groups;

      if (groups && Array.isArray(groups)) {
        groups.forEach((group) => {
          if (!isValidAppGroup(group)) {
            errors.push(
              `${appName}: Invalid app group "${group}". ` +
                `Add it to APP_GROUPS in src/i18n/groups.ts or use an existing group.`
            );
          }
        });
      }
    });

    if (errors.length > 0) {
      const availableGroups = APP_GROUPS.join(', ');
      throw new Error(
        `Found ${errors.length} invalid app group(s):\n${errors.join('\n')}\n\n` +
          `Available groups: ${availableGroups}`
      );
    }
  });
});
