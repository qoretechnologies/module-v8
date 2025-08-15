import { configDotenv } from 'dotenv';
import {
  ListBigMlAnomalyDetectors,
  ListBigMlClusters,
  ListBigMlDatasets,
  ListBigMlDeepnets,
  ListBigMlEnsembles,
  ListBigMlModels,
  ListBigMlProjects,
  ListBigMlSources,
  ListBigMlTopicModels,
} from '../apps/bigml/actions';
import { getBigMlAnomalyDetectorAllowedValues } from '../apps/bigml/helpers/get-anomaly-detector-allowed-values';
import { getBigMlClusterAllowedValues } from '../apps/bigml/helpers/get-cluster-allowed-values';
import { getBigMlDatasetAllowedValues } from '../apps/bigml/helpers/get-dataset-allowed-values';
import { mapBigMlDatasetFieldsToQoreOptions } from '../apps/bigml/helpers/get-dataset-fields';
import { getBigMlDeepnetAllowedValues } from '../apps/bigml/helpers/get-deepnet-allowed-values';
import { getBigMlEnsembleAllowedValues } from '../apps/bigml/helpers/get-ensemble-allowed-values';
import { getBigMlModelAllowedValues } from '../apps/bigml/helpers/get-model-allowed-values';
import { getBigMlProjectAllowedValues } from '../apps/bigml/helpers/get-project-id-allowed-values';
import { getBigMlTopicModelAllowedValues } from '../apps/bigml/helpers/get-topic-model-allowed-values';
import { BigMlNewResource } from '../apps/bigml/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Big Ml', () => {
  const base_context = {
    conn_opts: {
      token: '',
      username: '',
    } as any,
  };

  beforeAll(() => {
    const token = process.env.BIG_ML_API_KEY;
    const username = process.env.BIG_ML_USERNAME;

    if (!token) {
      throw new Error(`Please set the BIG_ML_API_KEY environment variable.`);
    }

    if (!username) {
      throw new Error(`Please set the BIG_ML_USERNAME environment variable.`);
    }

    base_context.conn_opts.token = token;
    base_context.conn_opts.username = username;
  });

  // let anomalyDetectorId: string | undefined;
  let datasetId: string | undefined;
  // let clusterId: string | undefined;

  describe('Should test allowed values', () => {
    it('Should get anomaly detector id allowed values', async () => {
      const allowed_values = await getBigMlAnomalyDetectorAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get project id allowed values', async () => {
      const allowed_values = await getBigMlProjectAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get dataset id allowed values', async () => {
      const allowed_values = await getBigMlDatasetAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      datasetId = allowed_values[0].value;
    });
    it('Should get ensemble id allowed values', async () => {
      const allowed_values = await getBigMlEnsembleAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get deepnet id allowed values', async () => {
      const allowed_values = await getBigMlDeepnetAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get model id allowed values', async () => {
      const allowed_values = await getBigMlModelAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get cluster id allowed values', async () => {
      const allowed_values = await getBigMlClusterAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get topic model id allowed values', async () => {
      const allowed_values = await getBigMlTopicModelAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get dataset fields', async () => {
      if (!datasetId) throw new Error('Dataset ID is not defined');

      const fields = await mapBigMlDatasetFieldsToQoreOptions({
        username: base_context.conn_opts.username,
        token: base_context.conn_opts.token,
        dataset: datasetId,
      });

      expect(fields).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    it('Should list models', async () => {
      const action = ListBigMlModels;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list projects', async () => {
      const action = ListBigMlProjects;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list datasets', async () => {
      const action = ListBigMlDatasets;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list sources', async () => {
      const action = ListBigMlSources;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list clusters', async () => {
      const action = ListBigMlClusters;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // clusterId = result[0].resource;
    });

    it('Should list anomaly detectors', async () => {
      const action = ListBigMlAnomalyDetectors;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          filter: {
            field: 'name',
            operator: '__icontains',
            value: 'Country Stats Mashup',
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // anomalyDetectorId = result[0].resource;
    });

    // it('Should create an anomaly score', async () => {
    //   const action = CreateBigMlAnomalyScore;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');
    //   if (!anomalyDetectorId) throw new Error('Anomaly Detector ID is not defined');

    //   const result = await action.api_function(
    //     {
    //       anomaly: anomalyDetectorId,
    //       input_data: {
    //         'Employment Rate': 55.56394465,
    //         'Alcohol Consumption per adult (lt)': 0.02,
    //         'CO2 Emissions per person (Mt Tons)': 0.16,
    //         'GDP per capita': 1145.61,
    //       },
    //     },
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.score).toBeDefined();
    // });

    // it('Should create a centroid', async () => {
    //   const action = CreateBigMlCentroid;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   if (!datasetId) throw new Error('Dataset ID is not defined');

    //   const result = await action.api_function(
    //     {
    //       cluster: clusterId,
    //       input_data: {
    //         'Employment Rate': 75.55710689,
    //         'Alcohol Consumption per adult (lt)': 5.48,
    //         'Expend/student Primary': 4.21768,
    //         'Expend/student Secondary': 41.68302,
    //         'Expend/student Tertiary': 76.38083899,
    //         'CO2 Emissions per person (Mt Tons)': 1.44,
    //         'Gender Equality Ratio': 0.629,
    //         'GDP per capita': 5495.28,
    //       },
    //     },
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.centroid).toBeDefined();
    // });

    it('Should list ensembles', async () => {
      const action = ListBigMlEnsembles;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list deepnets', async () => {
      const action = ListBigMlDeepnets;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list topic models', async () => {
      const action = ListBigMlTopicModels;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should get example event data', async () => {
      const trigger = BigMlNewResource;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { type: 'deepnet' } as any,
      });

      expect(result).toBeDefined();
      expect(result.resource).toBeDefined();
    });
  });
});
