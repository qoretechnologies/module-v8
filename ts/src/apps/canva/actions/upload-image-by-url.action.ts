import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CANVA_APP_NAME, CanvaError } from '../constants';
import { canvaApiClient } from '../helpers/constants';

const action = 'upload_image_by_url';

const options = {
  url: { type: 'string', required: true },
  name: { type: 'string', required: false },
  tags: {
    type: { type: 'list', element_type: 'string' },
    required: false,
  },
} satisfies TQoreOptions;

async function pollUrlUploadJob(token: string, jobId: string, timeoutMs = 60000, everyMs = 1200) {
  const start = Date.now();
  for (;;) {
    const { data } = await axios.get(`https://api.canva.com/rest/v1/url-asset-uploads/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const status = data?.job?.status;
    if (status === 'success') return data?.job?.asset;
    if (status === 'failed') throw new CanvaError(data?.job?.error?.message || 'Upload failed');
    if (Date.now() - start > timeoutMs)
      throw new CanvaError('Timed out waiting for Canva URL upload job');
    await new Promise((r) => setTimeout(r, everyMs));
  }
}

async function setAssetTags(token: string, assetId: string, tags?: string[]) {
  const list = (tags || []).map((t) => t.trim()).filter(Boolean);
  if (!list.length) return;
  await canvaApiClient({
    path: `assets/${assetId}`,
    method: 'PATCH',
    token,
    body: { tags: list },
  });
}

const uploadImageByUrl = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CANVA_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['url'],
      connectionFields: ['token'],
      ErrorClass: CanvaError,
    });

    const { name, tags } = obj || {};

    try {
      const init = await axios.post(
        'https://api.canva.com/rest/v1/url-asset-uploads',
        { name: name || url.split('/').pop() || 'Uploaded Asset', url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          maxBodyLength: Infinity,
        }
      );

      const jobId = init?.data?.job?.id;
      if (!jobId) throw new CanvaError('No URL upload job id returned from Canva');

      const asset = await pollUrlUploadJob(token, jobId);
      const assetId = asset?.id;
      if (!assetId) throw new CanvaError('URL upload finished but asset id is missing');

      await setAssetTags(token, assetId, tags);

      const { asset: fullAsset } = await canvaApiClient<{ asset: Record<string, any> }>({
        path: `assets/${assetId}`,
        method: 'GET',
        token,
      });

      return fullAsset;
    } catch (error) {
      throw new CanvaError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: { type: 'hash' },
});

export default uploadImageByUrl;
