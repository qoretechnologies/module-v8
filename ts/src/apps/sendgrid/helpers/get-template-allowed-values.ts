import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SENDGRID_CONN_OPTIONS, SendGridError } from '../constants';
import { createSendGridClient } from './constants';

interface ISendGridTemplate {
  id: string;
  name: string;
  versions: Array<{
    id: string;
    active: number;
    name: string;
    thumbnail_url: string;
  }>;
}

interface ISendGridTemplatesResponse {
  templates: ISendGridTemplate[];
}

const mapTemplateToAllowedValue = (template: ISendGridTemplate): IQoreAllowedValue<string> => {
  const version = template.versions.find((v) => v.active === 1);

  return {
    value: template.id,
    display_name: `${template.name} (Version: ${version?.name || 'N/A'})`,
    ...(version?.thumbnail_url && { image: version.thumbnail_url }),
  };
};

export const getSendGridTemplateAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SENDGRID_CONN_OPTIONS,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: SendGridError,
  });

  const client = createSendGridClient(token);

  try {
    const [response] = await client.request({
      url: '/v3/templates',
      qs: { generations: 'dynamic' },
      method: 'GET',
    });

    const data = response.body as ISendGridTemplatesResponse;

    return (data.templates || []).map(mapTemplateToAllowedValue);
  } catch (error: any) {
    throw new SendGridError(
      `Failed to fetch allowed values for templates: ${error.message || error}`
    );
  }
};
