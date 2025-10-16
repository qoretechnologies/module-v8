import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BASEROW_APP_NAME, BaserowError } from '../constants';
import { getBaserowTableColumnsResponseType } from '../helpers/get-table-fields';

const action = 'upload_file';

const options = {
  file: { type: 'file', required: true },
} satisfies TQoreOptions;

const uploadFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BASEROW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url, file } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'url'],
      optionFields: ['file'],
      ErrorClass: BaserowError,
    });

    try {
      const byteChars = atob(file.content);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: file.mime_type });

      const formData = new FormData();
      formData.append('file', blob, file.name);

      const response = await axios.post(`${url}/api/user-files/upload-file/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new BaserowError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      size: { type: 'number' },
      mime_type: { type: 'string' },
      is_image: { type: 'boolean' },
      image_width: { type: 'number' },
      image_height: { type: 'number' },
      uploaded_at: { type: 'string' },
      url: { type: 'string' },
      name: { type: 'string' },
      original_name: { type: 'string' },
      thumbnails: {
        type: {
          type: 'hash',
          fields: {
            tiny: {
              type: {
                type: 'hash',
                fields: {
                  url: { type: 'string' },
                  width: { type: 'number' },
                  height: { type: 'number' },
                },
              },
            },
            small: {
              type: {
                type: 'hash',
                fields: {
                  url: { type: 'string' },
                  width: { type: 'number' },
                  height: { type: 'number' },
                },
              },
            },
            card_cover: {
              type: {
                type: 'hash',
                fields: {
                  url: { type: 'string' },
                  width: { type: 'number' },
                  height: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  },
  get_dynamic_response_type: getBaserowTableColumnsResponseType,
});

export default uploadFile;
