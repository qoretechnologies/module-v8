import { Environment, LogLevel, Paddle } from '@paddle/paddle-node-sdk';
import { getPaddleInstanceType, PADDLE_INSTANCE_TYPE } from '../constants';

export const createPaddleClient = (
  token: string,
  instanceType: (typeof PADDLE_INSTANCE_TYPE)[keyof typeof PADDLE_INSTANCE_TYPE]
) => {
  return new Paddle(token, {
    environment: Environment[getPaddleInstanceType(instanceType)],
    logLevel: LogLevel.error,
  });
};
