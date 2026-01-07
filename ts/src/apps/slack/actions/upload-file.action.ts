import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackChannelsAllowedValues } from '../helpers';
import { SlackUploadFileResponseType } from '../response-types';

const action = 'upload_file';

const options = {
  channel: {
    type: 'string',
    required: true,
    get_allowed_values: getSlackChannelsAllowedValues,
  },
  fileData: {
    type: 'data',
    required: true,
  },
  filename: {
    type: 'string',
    required: false,
  },
  comment: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const UploadFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackUploadFileResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, channel, fileData } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['channel', 'fileData'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const filename = obj?.filename || 'file';
    const comment = obj?.comment;

    try {
      // Slack files.uploadV2 endpoint requires multipart form data
      // For this implementation, we'll use the files.getUploadURLExternal + complete flow
      // or a direct POST if the client supports it

      // First get the upload URL
      const getUrlResponse = await slackClient.post<{
        ok: boolean;
        upload_url: string;
        file_id: string;
      }>(
        'files.getUploadURLExternal',
        {
          filename,
          length: fileData.length,
        },
        { token }
      );

      if (!getUrlResponse.upload_url) {
        throw new SlackError('Failed to get upload URL from Slack');
      }

      // Upload the file to the external URL
      // This requires a PUT request to the upload URL with the file content
      const uploadUrl = getUrlResponse.upload_url;
      const fileId = getUrlResponse.file_id;

      // We need to manually upload to the external URL
      const { QorusRequest } = await import('@qoretechnologies/ts-toolkit');
      await QorusRequest.put(
        {
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          path: '',
          data: fileData,
        },
        { url: uploadUrl, endpointId: SLACK_APP_NAME }
      );

      // Complete the upload
      const completeBody: Record<string, any> = {
        files: [{ id: fileId, title: filename }],
        channel_id: channel,
      };

      if (comment) {
        completeBody.initial_comment = comment;
      }

      const result = await slackClient.post<{ ok: boolean; files: any[] }>(
        'files.completeUploadExternal',
        completeBody,
        { token }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to upload file: ${error.message || error}`);
    }
  },
});

export default UploadFile;
