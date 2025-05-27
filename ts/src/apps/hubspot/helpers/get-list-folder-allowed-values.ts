import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';

type THubspotFolder = {
  id: string;
  name: string;
  childNodes: THubspotFolder[];
};

export const fetchHubspotFolders = async (token: string): Promise<THubspotFolder[]> => {
  const items: THubspotFolder[] = [];

  try {
    const response = await QorusRequest.get<{
      data: { folder: THubspotFolder };
    }>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/crm/v3/lists/folders`,
      },
      {
        url: `https://api.hubapi.com`,
        endpointId: 'Hubspot',
      }
    );

    const responseData: { folder: THubspotFolder } | undefined = response?.data;

    const getFolders = (folder: THubspotFolder): void => {
      if (!folder?.childNodes?.length) return;

      items.push(...folder.childNodes);

      folder.childNodes.forEach(getFolders);
    };

    if (responseData?.folder) {
      getFolders(responseData.folder);
    }
  } catch (error) {
    console.error(error);
    Debugger.log(`Error fetching hubspot records for lists`, error);

    return items;
  }

  return items;
};

const mapHubspotFolder = (folder: THubspotFolder): IQoreAllowedValue<string> => ({
  value: folder.id,
  display_name: folder.name,
});

export const getHubspotFolderAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Hubspot folder allowed values');
  }

  const folders = await fetchHubspotFolders(token);

  return folders.map(mapHubspotFolder);
};
