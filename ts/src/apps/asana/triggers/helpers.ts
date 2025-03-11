import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAppActionWithWebhookBase } from '@qoretechnologies/ts-toolkit';

export const deregisterAsanaWebhook: IQoreAppActionWithWebhookBase['webhook_deregister'] = async (
  context,
  _url,
  regInfo
) => {
  const { webhook } = regInfo;
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to deregister Asana webhook');
  }

  await QorusRequest.deleteReq<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/api/1.0/webhooks/${webhook.gid}`,
    },
    {
      url: 'https://app.asana.com',
      endpointId: 'Asana',
    }
  );
};

export const getCurrentAsanaUser = async (token: string) => {
  const response = await QorusRequest.get<{
    data: { data: { gid: string; email: string; name: string } };
  }>(
    {
      path: '/api/1.0/users/me',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      url: 'https://app.asana.com',
      endpointId: 'Asana',
    }
  );

  return response?.data?.data;
};

export const getAsanaProject = async (token: string, projectGid: string) => {
  const response = await QorusRequest.get<{ data: { data: { name: string } } }>(
    {
      path: `/api/1.0/projects/${projectGid}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      url: 'https://app.asana.com',
      endpointId: 'Asana',
    }
  );

  return response?.data?.data;
};

export const getAsanaProjectTasks = async (token: string, projectGid: string) => {
  const response = await QorusRequest.get<{
    data: { data: { gid: string; name: string; resource_subtype: string }[] };
  }>(
    {
      path: `/api/1.0/projects/${projectGid}/tasks`,
      params: { limit: '1', opt_fields: 'gid,name,resource_subtype' },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      url: 'https://app.asana.com',
      endpointId: 'Asana',
    }
  );

  return response?.data?.data;
};
