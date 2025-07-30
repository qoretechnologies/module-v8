import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { BIG_ML_APP_NAME, BigMlError } from '../constants';
import { bigMlApiClient } from '../helpers/constants';
import { getBigMlProjectAllowedValues } from '../helpers/get-project-id-allowed-values';
import { BigMlAnomalyResponseType } from '../response-types/anomaly.response-type';
import { BigMlClusterResponseType } from '../response-types/cluster.response-type';
import { BigMlDeepNetResponseType } from '../response-types/deepnet.response-type';
import { BigMlEnsembleResponseType } from '../response-types/ensemble.response-type';
import { BigMlModelResponseType } from '../response-types/model.response-type';
import { BigMlTopicModelResponseType } from '../response-types/topic-model.response-type';

const BigMlNewResourceTrigger = QoreAppCreator.createLocalizedTrigger({
  app: BIG_ML_APP_NAME,
  action: 'new_resource',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    type: {
      type: 'string',
      required: true,
      allowed_values: [
        { value: 'deepnet', display_name: 'Deepnet' },
        { value: 'cluster', display_name: 'Cluster' },
        { value: 'model', display_name: 'Model' },
        { value: 'anomaly', display_name: 'Anomaly Detector' },
        { value: 'ensemble', display_name: 'Ensemble' },
        { value: 'topicmodel', display_name: 'Topic Model' },
      ],
    },
    name: {
      preselected: true,
      required: false,
      type: 'string',
    },
    project: {
      type: 'string',
      required: false,
      preselected: true,
      get_allowed_values: getBigMlProjectAllowedValues,
    },
    tags: {
      required: false,
      preselected: true,
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, type, username } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'username'],
      optionFields: ['type'],
      ErrorClass: BigMlError,
    });

    const { name, project, tags } = context.opts || {};

    const getItems = () => {
      return fetchLatestResources({
        username,
        token,
        type,
        name,
        project,
        tags,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'bigml_new_resource',
      uniqueField: 'resource',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, type, username } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'username'],
      optionFields: ['type'],
      ErrorClass: BigMlError,
    });

    const { name, project, tags } = context.opts || {};

    const resources = await fetchLatestResources({
      username,
      token,
      type,
      name,
      project,
      tags,
    });

    return resources?.length ? resources[0] : null;
  },
  event_info: {
    desc: 'BigML New Resource Trigger Event Info',
    type: {
      type: 'hash',
    },
  },

  get_dynamic_type: (context) => {
    const { type } = getQoreContextRequiredValues({
      context,
      optionFields: ['type'],
      ErrorClass: BigMlError,
    });

    if (type === 'deepnet') return BigMlDeepNetResponseType;
    if (type === 'cluster') return BigMlClusterResponseType;
    if (type === 'model') return BigMlModelResponseType;
    if (type === 'anomaly') return BigMlAnomalyResponseType;
    if (type === 'ensemble') return BigMlEnsembleResponseType;
    if (type === 'topicmodel') return BigMlTopicModelResponseType;

    return 'hash';
  },
});

const fetchLatestResources = async (options: {
  username: string;
  token: string;
  type: string;
  name?: string;
  project?: string;
  tags?: string[];
}): Promise<Array<Record<string, any>>> => {
  const pageSize = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { type, tags, name, project, ...auth } = options;

  try {
    const resources = await bigMlApiClient<Array<Record<string, any>>>({
      ...auth,
      method: 'GET',
      path: type,
      object: 'objects',
      params: {
        order_by: '-created',
        limit: pageSize.toString(),
        ...(name && { name__icontains: name }),
        ...(project && { project }),
        ...(tags && tags.length > 0 && { tags__in: tags.join(',') }),
      },
    });

    return resources;
  } catch (error) {
    throw new BigMlError(`Failed to fetch latest ${options.type}: ${error.message || error}`);
  }
};

export default BigMlNewResourceTrigger;
