import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreFile,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SLACK_API_URL, SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackChannelsAllowedValues } from '../helpers';
import { SlackUploadFileResponseType } from '../response-types';

const action = 'upload_file';

const options = {
  channel: {
    type: 'string',
    required: true,
    get_allowed_values: getSlackChannelsAllowedValues,
  },
  file: {
    type: 'file',
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
    const { token, channel, file } = getQoreContextRequiredValues<{
      token: string;
      channel: string;
      file: TQoreFile;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['channel', 'file'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const filename = obj?.filename || file.name || 'file';
    const comment = obj?.comment;

    // Decode base64 content to get the actual file buffer
    const fileBuffer = Buffer.from(file.content, 'base64');

    try {
      // Step 1: Get upload URL from Slack
      const getUrlResponse = await QorusRequest.get<{
        data: { ok: boolean; upload_url: string; file_id: string; error?: string };
      }>(
        {
          path: '/files.getUploadURLExternal',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            filename,
            length: fileBuffer.length,
          },
        },
        { url: SLACK_API_URL, endpointId: SLACK_APP_NAME }
      );

      if (!getUrlResponse.data?.ok || !getUrlResponse.data?.upload_url) {
        throw new SlackError(
          `Failed to get upload URL: ${getUrlResponse.data?.error || 'Unknown error'}`
        );
      }

      const uploadUrl = getUrlResponse.data.upload_url;
      const fileId = getUrlResponse.data.file_id;

      // Step 2: Upload file content to the external URL
      await QorusRequest.post(
        {
          headers: {
            'Content-Type': file.mime_type || 'application/octet-stream',
          },
          path: '',
          data: fileBuffer,
        },
        { url: uploadUrl, endpointId: SLACK_APP_NAME }
      );

      // Step 3: Complete the upload and share to channel
      // This endpoint expects JSON body
      const completeBody: Record<string, any> = {
        files: [{ id: fileId, title: filename }],
        channel_id: channel,
      };

      if (comment) {
        completeBody.initial_comment = comment;
      }

      const result = await QorusRequest.post<{
        data: { ok: boolean; files: any[]; error?: string };
      }>(
        {
          path: '/files.completeUploadExternal',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          data: completeBody,
        },
        { url: SLACK_API_URL, endpointId: SLACK_APP_NAME }
      );

      if (!result.data?.ok) {
        throw new SlackError(`Failed to complete upload: ${result.data?.error || 'Unknown error'}`);
      }

      return result.data;
    } catch (error) {
      throw new SlackError(`Failed to upload file: ${error.message || error}`);
    }
  },
});

export default UploadFile;
