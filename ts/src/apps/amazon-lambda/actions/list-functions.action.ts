import { ListFunctionsCommand } from '@aws-sdk/client-lambda';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_LAMBDA_APP_NAME, AmazonLambdaError } from '../constants';
import {
  createLambdaClient,
  formatFileSize,
  formatLambdaDate,
  formatMemorySize,
  formatTimeout,
} from '../helpers/constants';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  function_version: {
    required: false,
    type: 'string',
    allowed_values: [{ value: 'ALL', display_name: 'All Versions' }],
  },
  master_region: {
    required: false,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  max_items: {
    required: false,
    type: 'integer',
    default_value: 50,
  },
  next_marker: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const listFunctions = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_LAMBDA_APP_NAME,
  action: 'list_functions',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonLambdaError,
    });

    const region = obj?.region || context?.conn_opts?.region;
    const { function_version, master_region, max_items, next_marker } = obj || {};

    try {
      const lambdaClient = createLambdaClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new ListFunctionsCommand({
        FunctionVersion: function_version as 'ALL' | undefined,
        MasterRegion: master_region,
        MaxItems: max_items || 50,
        ...(next_marker && { Marker: next_marker }),
      });

      const response = await lambdaClient.send(command);

      const functions = (response.Functions || []).map((func) => ({
        function_name: func.FunctionName || '',
        function_arn: func.FunctionArn || '',
        runtime: func.Runtime || '',
        role: func.Role || '',
        handler: func.Handler || '',
        code_size: func.CodeSize || 0,
        formatted_code_size: formatFileSize(func.CodeSize),
        description: func.Description || '',
        timeout: func.Timeout || 0,
        formatted_timeout: formatTimeout(func.Timeout),
        memory_size: func.MemorySize || 0,
        formatted_memory_size: formatMemorySize(func.MemorySize),
        last_modified: formatLambdaDate(func.LastModified),
        code_sha256: func.CodeSha256 || '',
        version: func.Version || '',
        vpc_config: func.VpcConfig
          ? {
              subnet_ids: func.VpcConfig.SubnetIds || [],
              security_group_ids: func.VpcConfig.SecurityGroupIds || [],
              vpc_id: func.VpcConfig.VpcId || '',
            }
          : null,
        environment: func.Environment
          ? {
              variables: func.Environment.Variables || {},
              error: func.Environment.Error
                ? {
                    error_code: func.Environment.Error.ErrorCode || '',
                    message: func.Environment.Error.Message || '',
                  }
                : null,
            }
          : null,
        dead_letter_config: func.DeadLetterConfig
          ? {
              target_arn: func.DeadLetterConfig.TargetArn || '',
            }
          : null,
        kms_key_arn: func.KMSKeyArn || '',
        tracing_config: func.TracingConfig
          ? {
              mode: func.TracingConfig.Mode || '',
            }
          : null,
        master_arn: func.MasterArn || '',
        revision_id: func.RevisionId || '',
        layers:
          func.Layers?.map((layer) => ({
            arn: layer.Arn || '',
            code_size: layer.CodeSize || 0,
            formatted_code_size: formatFileSize(layer.CodeSize),
            signing_profile_version_arn: layer.SigningProfileVersionArn || '',
            signing_job_arn: layer.SigningJobArn || '',
          })) || [],
        state: func.State || '',
        state_reason: func.StateReason || '',
        state_reason_code: func.StateReasonCode || '',
        last_update_status: func.LastUpdateStatus || '',
        last_update_status_reason: func.LastUpdateStatusReason || '',
        last_update_status_reason_code: func.LastUpdateStatusReasonCode || '',
        file_system_configs:
          func.FileSystemConfigs?.map((config) => ({
            arn: config.Arn || '',
            local_mount_path: config.LocalMountPath || '',
          })) || [],
        package_type: func.PackageType || '',
        image_config_response: func.ImageConfigResponse
          ? {
              image_config: func.ImageConfigResponse.ImageConfig
                ? {
                    entry_point: func.ImageConfigResponse.ImageConfig.EntryPoint || [],
                    command: func.ImageConfigResponse.ImageConfig.Command || [],
                    working_directory: func.ImageConfigResponse.ImageConfig.WorkingDirectory || '',
                  }
                : null,
              error: func.ImageConfigResponse.Error
                ? {
                    error_code: func.ImageConfigResponse.Error.ErrorCode || '',
                    message: func.ImageConfigResponse.Error.Message || '',
                  }
                : null,
            }
          : null,
        signing_profile_version_arn: func.SigningProfileVersionArn || '',
        signing_job_arn: func.SigningJobArn || '',
        architectures: func.Architectures || [],
        ephemeral_storage: func.EphemeralStorage
          ? {
              size: func.EphemeralStorage.Size || 0,
              formatted_size: formatFileSize(func.EphemeralStorage.Size),
            }
          : null,
        snap_start: func.SnapStart
          ? {
              apply_on: func.SnapStart.ApplyOn || '',
              optimization_status: func.SnapStart.OptimizationStatus || '',
            }
          : null,
      }));

      return {
        function_count: functions.length,
        functions,
        next_marker: response.NextMarker || null,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonLambdaError(`Failed to list functions: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      function_count: { type: 'integer' },
      functions: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              function_name: { type: 'string' },
              function_arn: { type: 'string' },
              runtime: { type: 'string' },
              role: { type: 'string' },
              handler: { type: 'string' },
              code_size: { type: 'integer' },
              formatted_code_size: { type: 'string' },
              description: { type: 'string' },
              timeout: { type: 'integer' },
              formatted_timeout: { type: 'string' },
              memory_size: { type: 'integer' },
              formatted_memory_size: { type: 'string' },
              last_modified: { type: 'string' },
              code_sha256: { type: 'string' },
              version: { type: 'string' },
              vpc_config: {
                type: {
                  type: 'hash',
                  fields: {
                    subnet_ids: {
                      type: {
                        type: 'list',
                        element_type: 'string',
                      },
                    },
                    security_group_ids: {
                      type: {
                        type: 'list',
                        element_type: 'string',
                      },
                    },
                    vpc_id: { type: 'string' },
                  },
                },
              },
              environment: {
                type: {
                  type: 'hash',
                  fields: {
                    variables: {
                      type: {
                        type: 'hash',
                      },
                    },
                    error: {
                      type: {
                        type: 'hash',
                        fields: {
                          error_code: { type: 'string' },
                          message: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              dead_letter_config: {
                type: {
                  type: 'hash',
                  fields: {
                    target_arn: { type: 'string' },
                  },
                },
              },
              kms_key_arn: { type: 'string' },
              tracing_config: {
                type: {
                  type: 'hash',
                  fields: {
                    mode: { type: 'string' },
                  },
                },
              },
              master_arn: { type: 'string' },
              revision_id: { type: 'string' },
              layers: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      arn: { type: 'string' },
                      code_size: { type: 'integer' },
                      formatted_code_size: { type: 'string' },
                      signing_profile_version_arn: { type: 'string' },
                      signing_job_arn: { type: 'string' },
                    },
                  },
                },
              },
              state: { type: 'string' },
              state_reason: { type: 'string' },
              state_reason_code: { type: 'string' },
              last_update_status: { type: 'string' },
              last_update_status_reason: { type: 'string' },
              last_update_status_reason_code: { type: 'string' },
              file_system_configs: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      arn: { type: 'string' },
                      local_mount_path: { type: 'string' },
                    },
                  },
                },
              },
              package_type: { type: 'string' },
              image_config_response: {
                type: {
                  type: 'hash',
                  fields: {
                    image_config: {
                      type: {
                        type: 'hash',
                        fields: {
                          entry_point: {
                            type: {
                              type: 'list',
                              element_type: 'string',
                            },
                          },
                          command: {
                            type: {
                              type: 'list',
                              element_type: 'string',
                            },
                          },
                          working_directory: { type: 'string' },
                        },
                      },
                    },
                    error: {
                      type: {
                        type: 'hash',
                        fields: {
                          error_code: { type: 'string' },
                          message: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              signing_profile_version_arn: { type: 'string' },
              signing_job_arn: { type: 'string' },
              architectures: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              ephemeral_storage: {
                type: {
                  type: 'hash',
                  fields: {
                    size: { type: 'integer' },
                    formatted_size: { type: 'string' },
                  },
                },
              },
              snap_start: {
                type: {
                  type: 'hash',
                  fields: {
                    apply_on: { type: 'string' },
                    optimization_status: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      next_marker: { type: 'string' },
      retrieved_at: { type: 'string' },
    },
  },
});

export default listFunctions;
