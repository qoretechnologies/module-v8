import { runCLI } from 'jest';
import * as path from 'path';
import { IQoreRestConnectionConfig } from '@qoretechnologies/ts-toolkit';
import { StrictRecord } from '../global/models/utils';

export interface IQoreTestApi {
  createConnection: <CustomConnOptions>(
    app: string,
    config?: {
      opts?: StrictRecord<keyof CustomConnOptions, any> & Partial<IQoreRestConnectionConfig>;
    }
  ) => string;
  execAppAction: (
    app: string,
    action: string,
    connection: string,
    data?: Record<string, any>,
    opts?: Record<string, any>
  ) => any;
}

export type IQoreTestFunction = (
  it: (name: string, fn: () => void) => void,
  api: IQoreTestApi
) => void;

export class QTester {
  public async run(api: IQoreTestApi) {
    // Assign the api to the global object so it can be accessed in the Jest tests as `testApi`
    (globalThis as any).testApi = api;
    // Run the Jest tests
    await runJest();
  }
}

async function runJest() {
  const { results } = await runCLI(
    {
      testMatch: ['**/?(*.)+(qtest).[tj]s?(x)'],
      config: path.join(process.cwd(), '/jest.config.js'),
      verbose: true,
      runInBand: true,
      _: [],
      $0: '',
    },
    [process.cwd()]
  );

  if (results.success) {
    console.log('Tests passed!');
  } else {
    console.error('Tests failed!');
    process.exit(1);
  }
}

export const qtester = new QTester();
