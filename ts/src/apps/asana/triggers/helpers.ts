import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAppActionWithWebhookBase } from '@qoretechnologies/ts-toolkit';

type AsanaObjectType = {
  gid: string;
  name: string;
  resource_type: string;
  resource_subtype: string;
};

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
  const response = await QorusRequest.get<{ data: { data: AsanaObjectType } }>(
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

export const getAsanaTask = async (token: string, taskGid: string) => {
  const response = await QorusRequest.get<{ data: { data: AsanaObjectType } }>(
    {
      path: `/api/1.0/tasks/${taskGid}`,
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

export const getAsanaWorkspace = async (token: string, workspaceGid: string) => {
  const response = await QorusRequest.get<{ data: { data: AsanaObjectType } }>(
    {
      path: `/api/1.0/workspaces/${workspaceGid}`,
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
    data: {
      data: AsanaObjectType[];
    };
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

export const getAsanaTaskStories = async (
  token: string,
  taskGid: string,
  type: 'all' | 'comments' = 'all'
) => {
  const response = await QorusRequest.get<{
    data: {
      data: {
        gid: string;
        resource_type: string;
        text: string;
        type: string;
        resource_subtype: string;
      }[];
    };
  }>(
    {
      path: `/api/1.0/tasks/${taskGid}/stories`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      url: 'https://app.asana.com',
      endpointId: 'Asana',
    }
  );

  const stories = response?.data?.data || [];

  if (type === 'comments') {
    return stories.filter((story) => story.type === 'comment');
  }

  return stories;
};

export const getAsanaTags = async (
  token: string,
  objectGid: string,
  type: 'tasks' | 'workspaces'
) => {
  const response = await QorusRequest.get<{
    data: {
      data: {
        gid: string;
        resource_type: string;
        name: string;
      }[];
    };
  }>(
    {
      path: `/api/1.0/${type}/${objectGid}/tags`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      url: 'https://app.asana.com',
      endpointId: 'Asana',
    }
  );

  const tags = response?.data?.data || [];

  return tags;
};

export const getAsanaWorkspaceProjects = async (token: string, workspaceGid: string) => {
  const response = await QorusRequest.get<{
    data: {
      data: AsanaObjectType[];
    };
  }>(
    {
      path: `/api/1.0/workspaces/${workspaceGid}/projects`,
      params: { limit: '1' },
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

export const getAsasnaTaskSubtask = async (token: string, taskGid: string) => {
  const response = await QorusRequest.get<{
    data: {
      data: AsanaObjectType[];
    };
  }>(
    {
      path: `/api/1.0/tasks/${taskGid}/subtasks`,
      params: { limit: '1' },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      url: 'https://app.asana.com',
      endpointId: 'Asana',
    }
  );

  return response?.data?.data[0] || null;
};

export const getAsanaWorkspaceTeams = async (token: string, workspaceId: string) => {
  const response = await QorusRequest.get<{
    data: {
      data: { gid: string; name: string; resourceType: string }[];
    };
  }>(
    {
      path: `/api/1.0/teams`,
      params: { workspace: workspaceId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      url: 'https://app.asana.com',
      endpointId: 'Asana',
    }
  );

  return response?.data?.data || [];
};

export const getAsasnaAttachments = async (
  token: string,
  objectId: string,
  type: 'projects' | 'tasks'
) => {
  const response = await QorusRequest.get<{
    data: {
      data: AsanaObjectType[];
    };
  }>(
    {
      path: `/api/1.0/${type}/${objectId}/attachments`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      url: 'https://app.asana.com',
      endpointId: 'Asana',
    }
  );

  return response?.data?.data || [];
};
