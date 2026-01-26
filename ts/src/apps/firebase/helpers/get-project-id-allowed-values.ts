import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FirebaseError } from '../constants';

type TGCPProject = {
  projectId: string;
  projectNumber: string;
  name: string;
  lifecycleState: string;
};

export const getFirebaseProjectIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: FirebaseError,
  });

  try {
    const response = await QorusRequest.get<{ data: { projects: TGCPProject[] } }>(
      {
        path: '/v1/projects',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      {
        url: 'https://cloudresourcemanager.googleapis.com',
        endpointId: 'Firebase',
      }
    );

    const projects = response?.data?.projects || [];

    const allowedValues: IQoreAllowedValue<string>[] = projects
      .filter((project) => project.lifecycleState === 'ACTIVE')
      .map((project) => ({
        value: project.projectId,
        display_name: project.name || project.projectId,
        desc: `Project ID: ${project.projectId}\nProject Number: ${project.projectNumber}\nState: ${project.lifecycleState}`,
      }));

    return allowedValues;
  } catch (error) {
    throw new FirebaseError(`Failed to fetch projects: ${error.message || error}`);
  }
};
