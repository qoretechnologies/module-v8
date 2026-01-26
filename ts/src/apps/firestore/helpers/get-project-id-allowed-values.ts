import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FirestoreError } from '../constants';

type TGCPProject = {
  projectId: string;
  projectNumber: string;
  name: string;
  lifecycleState: string;
};

export const getFirestoreProjectIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: FirestoreError,
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
        endpointId: 'Firestore',
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
    throw new FirestoreError(`Failed to fetch projects: ${error.message || error}`);
  }
};
