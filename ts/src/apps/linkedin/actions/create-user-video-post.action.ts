import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreFile,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { LINKED_IN_APP_NAME, LinkedInError } from '../constants';
import { linkedInApiClient } from '../helpers/constants';
import axios from 'axios';

const action = 'create_user_video_post';

const options = {
  content: {
    required: true,
    type: 'string',
  },
  mentions: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          entity: {
            type: 'string',
            allowed_values: [{ value: 'company', display_name: 'Company' }],
            required: true,
          },
          urn: {
            type: 'string',
            required: true,
          },
          start: {
            type: 'integer',
            required: true,
          },
        },
      },
    },
  },
  visibility: {
    required: true,
    type: 'string',
    allowed_values: [
      { value: 'PUBLIC', display_name: 'Public' },
      { value: 'CONNECTIONS', display_name: 'Connections Only' },
    ],
  },
  video: {
    required: true,
    type: 'file',
  },
  videoTitle: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const createUserVideoPost = QoreAppCreator.createLocalizedAction<typeof options>({
  app: LINKED_IN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, content, visibility } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['content', 'visibility'],
      connectionFields: ['token'],
      ErrorClass: LinkedInError,
    });

    const mentions = obj?.mentions || [];
    const mediaType = obj?.video ? 'VIDEO' : 'NONE';
    const video = obj?.video;
    const videoTitle = obj?.videoTitle;

    try {
      let uploadId: string | undefined;

      const currentUser = await linkedInApiClient<{ sub: string }>({
        token,
        path: `userinfo`,
        method: 'GET',
      });

      const userUrn = `urn:li:person:${currentUser.sub}`;

      if (video) {
        uploadId = await uploadVideo({
          token,
          video,
          userUrn,
        });
      }

      const requestBody = {
        author: userUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
              ...(mentions.length > 0 && {
                attributes: mentions.map((mention) => ({
                  start: mention.start,
                  value: {
                    'com.linkedin.common.CompanyAttributedEntity': {
                      [mention.entity]: mention.urn,
                      start: mention.start || 0,
                    },
                  },
                })),
              }),
            },
            shareMediaCategory: mediaType,
            ...(uploadId && {
              media: [
                {
                  status: 'READY',
                  media: uploadId,
                  ...(videoTitle && {
                    title: {
                      text: videoTitle,
                    },
                  }),
                },
              ],
            }),
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': visibility,
        },
      };

      const response = await linkedInApiClient({
        token,
        path: 'ugcPosts',
        method: 'POST',
        body: requestBody,
      });

      return response;
    } catch (error) {
      const msg = error.response?.data?.message || 'Video post creation failed';

      throw new LinkedInError(`Failed to ${humanizeNameTitle(action)}: ${msg}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
    },
  },
});

export default createUserVideoPost;

const uploadVideo = async (options: {
  token: string;
  video: TQoreFile;
  userUrn: string;
}): Promise<string> => {
  const { token, video, userUrn } = options;

  const videoBuffer = Buffer.from(video.content, 'base64');

  const registerUploadResponse = await linkedInApiClient<{
    value: {
      asset: string;
      uploadMechanism: {
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': {
          uploadUrl: string;
        };
      };
    };
  }>({
    token,
    path: 'assets?action=registerUpload',
    method: 'POST',
    body: {
      registerUploadRequest: {
        owner: userUrn,
        recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
        serviceRelationships: [
          {
            identifier: 'urn:li:userGeneratedContent',
            relationshipType: 'OWNER',
          },
        ],
        supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD'],
      },
    },
  });

  const uploadId = registerUploadResponse.value.asset;

  const uploadUrl =
    registerUploadResponse.value.uploadMechanism[
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
    ].uploadUrl;

  await axios.put(uploadUrl, videoBuffer, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': video.mime_type || 'video/mp4',
      'Content-Length': videoBuffer.length,
    },
    maxBodyLength: Infinity,
  });

  return uploadId;
};
