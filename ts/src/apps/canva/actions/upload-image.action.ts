import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CANVA_APP_NAME, CanvaError } from '../constants';
import { canvaApiClient } from '../helpers/constants';

const action = 'upload_image';

const options = {
  image: { type: 'file', required: true },
  name: { required: false, type: 'string' },
  tags: {
    type: { type: 'list', element_type: 'string' },
    required: false,
  },
} satisfies TQoreOptions;

async function pollUploadJob(token: string, jobId: string, timeoutMs = 60000, everyMs = 1200) {
  const start = Date.now();
  for (;;) {
    const { data } = await axios.get(`https://api.canva.com/rest/v1/asset-uploads/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const status = data?.job?.status;
    if (status === 'success') return data?.job?.asset;
    if (status === 'failed') throw new CanvaError(data?.job?.error?.message || 'Upload failed');
    if (Date.now() - start > timeoutMs)
      throw new CanvaError('Timed out waiting for Canva upload job');
    await new Promise((r) => setTimeout(r, everyMs));
  }
}

async function setAssetTags(token: string, assetId: string, tags?: string[]) {
  const list = (tags || []).map((t) => t.trim()).filter(Boolean);
  if (!list.length) return;
  await axios.patch(
    `https://api.canva.com/rest/v1/assets/${assetId}`,
    { tags: list },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

const uploadImage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CANVA_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, image } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['image'],
      connectionFields: ['token'],
      ErrorClass: CanvaError,
    });

    const { name, tags } = obj || {};
    const metadata = { name_base64: Buffer.from(name || image.name).toString('base64') };

    try {
      const imageBuffer = Buffer.from(image.content, 'base64');

      const init = await axios.post('https://api.canva.com/rest/v1/asset-uploads', imageBuffer, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
          'Asset-Upload-Metadata': JSON.stringify(metadata),
        },
        maxBodyLength: Infinity,
      });

      const jobId = init?.data?.job?.id;
      if (!jobId) throw new CanvaError('No upload job id returned from Canva');

      const asset = await pollUploadJob(token, jobId);
      const assetId = asset?.id;
      if (!assetId) throw new CanvaError('Upload finished but asset id is missing');

      await setAssetTags(token, assetId, tags);

      const fullAsset = await canvaApiClient<{ asset: Record<string, any> }>({
        path: `assets/${assetId}`,
        method: 'GET',
        token,
      });

      return fullAsset.asset;
    } catch (error) {
      throw new CanvaError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      type: { type: 'string' },
      id: { type: 'string' },
      name: { type: 'string' },
      tags: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      import_status: {
        type: {
          type: 'hash',
          fields: {
            state: { type: 'string' },
          },
        },
      },
      created_at: { type: 'integer' },
      updated_at: { type: 'integer' },
      owner: {
        type: {
          type: 'hash',
          fields: {
            user_id: { type: 'string' },
            team_id: { type: 'string' },
          },
        },
      },
      thumbnail: {
        type: {
          type: 'hash',
          fields: {
            width: { type: 'integer' },
            height: { type: 'integer' },
            url: { type: 'string' },
          },
        },
      },
    },
  },
});

export default uploadImage;
