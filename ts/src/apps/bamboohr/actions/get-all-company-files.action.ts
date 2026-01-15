/**
 * Get All Company Files Action
 *
 * Retrieves all company files organized by category.
 *
 * @see https://documentation.bamboohr.com/reference/list-company-files-1
 */

import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { IBambooHRCompanyFilesResponse } from '../types';
 
const action = 'get_all_company_files';

const options = {} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    categories: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: { type: 'number' },
            name: { type: 'string' },
            files: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    original_file_name: { type: 'string' },
                    size: { type: 'number' },
                    date_created: { type: 'string' },
                    created_by: { type: 'string' },
                    shared_with_employee: { type: 'bool' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

const getAllCompanyFiles = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BAMBOOHR_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, company_domain } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'company_domain'],
      ErrorClass: BambooHRError,
    });

    try {
      const response = await bambooHRClient.get<IBambooHRCompanyFilesResponse>('files/view/', {
        token,
        connectionOptions: { company_domain },
      });

      // Transform response to consistent format
      return {
        categories: (response?.categories || []).map((category) => ({
          id: category.id,
          name: category.name,
          files: (category.files || []).map((file) => ({
            id: file.id,
            name: file.name,
            original_file_name: file.originalFileName,
            size: file.size,
            date_created: file.dateCreated,
            created_by: file.createdBy,
            shared_with_employee: file.shareWithEmployee === 'yes',
          })),
        })),
      };
    } catch (error) {
      throw new BambooHRError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: responseType,
});

export default getAllCompanyFiles;
