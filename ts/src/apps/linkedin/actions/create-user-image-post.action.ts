import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreFile,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { LINKED_IN_APP_NAME, LinkedInError } from '../constants';
import { linkedInApiClient } from '../helpers/constants';

const action = 'create_user_image_post';

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
  image: {
    required: true,
    type: 'file',
  },
  imageTitle: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const createUserImagePost = QoreAppCreator.createLocalizedAction<typeof options>({
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
    const mediaType = obj?.image ? 'IMAGE' : 'NONE';
    const image = obj?.image;
    const imageTitle = obj?.imageTitle;

    try {
      const currentUser = await linkedInApiClient<{ sub: string }>({
        token,
        path: `userinfo`,
        method: 'GET',
      });
      const userUrn = `urn:li:person:${currentUser.sub}`;
      let uploadId: string | undefined;

      if (image) {
        uploadId = await uploadImage({
          token,
          image,
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
                  ...(imageTitle && {
                    title: {
                      text: imageTitle,
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
      throw new LinkedInError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },

  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
    },
  },
});

export default createUserImagePost;

const uploadImage = async (options: {
  token: string;
  image: TQoreFile;
  userUrn: string;
}): Promise<string> => {
  const { token, image, userUrn } = options;

  const imageBuffer = Buffer.from(image.content, 'base64');

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
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
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

  await axios.put(uploadUrl, imageBuffer, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': image.mime_type || 'image/jpeg',
      'Content-Length': imageBuffer.length,
    },
    maxBodyLength: Infinity,
  });

  return uploadId;
};
