import { IQoreAppActionWithFunction } from '@qoretechnologies/ts-toolkit';
import {
  CreateSerenityConversation,
  ExecuteSerenityAgent,
  ExecuteSerenityConversation,
} from '../apps/serenity/actions';
import {
  getSerenityConversationAgentAllowedValues,
  getSerenitySystemAgentAllowedValues,
} from '../apps/serenity/helpers/get-agent-allowed-values';
import { getSerenityAgentParamsAllowedValues } from '../apps/serenity/helpers/get-agent-params-allowed-values';
import { getSerenityExecuteAgentParamsDefaultValue } from '../apps/serenity/helpers/get-execute-agent-params-default-value';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { retry } from './utils';
import { configDotenv } from 'dotenv';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Should test serenity actions', () => {
  let token: string;
  let conversationAgentCode: string;
  let systemAgentCode: string;
  let testConversationId: string;

  beforeAll(() => {
    if (!process.env.SERENITY_API_KEY) {
      throw new Error('SERENITY_API_KEY environment variable is required for these tests');
    }

    if (!process.env.SERENITY_SYSTEM_AGENT_CODE) {
      throw new Error(
        'SERENITY_SYSTEM_AGENT_CODE environment variable is required for these tests'
      );
    }

    if (!process.env.SERENITY_CONVERSATION_AGENT_CODE) {
      throw new Error(
        'SERENITY_CONVERSATION_AGENT_CODE environment variable is required for these tests'
      );
    }

    token = process.env.SERENITY_API_KEY;
    systemAgentCode = process.env.SERENITY_SYSTEM_AGENT_CODE;
    conversationAgentCode = process.env.SERENITY_CONVERSATION_AGENT_CODE;
  });

  describe('Should test serenity allowed values', () => {
    it('Should get serenity system agent allowed values', async () => {
      const allowed_values = await getSerenitySystemAgentAllowedValues({
        conn_opts: { token } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get serenity conversation agent allowed values', async () => {
      const allowed_values = await getSerenityConversationAgentAllowedValues({
        conn_opts: { token } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    // it('Should get serenity conversation allowed values', async () => {
    //   const allowed_values = await getSerenityConversationAllowedValues({
    //     conn_opts: { token } as any,
    //     opts: { agentCode: conversationAgentCode },
    //   });

    //   expect(allowed_values).toBeDefined();
    //   expect(allowed_values.length).toBeGreaterThan(0);
    //   const lastConversation = allowed_values.at(-1)?.value;
    //   if (lastConversation) {
    //     testConversationId = lastConversation;
    //   }
    // });

    it('Should get serenity agent params', async () => {
      const allowed_values = await getSerenityAgentParamsAllowedValues({
        conn_opts: { token } as any,
        opts: { agentCode: systemAgentCode },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get serenity agent execution params default value', async () => {
      const default_value = await getSerenityExecuteAgentParamsDefaultValue({
        conn_opts: { token } as any,
        opts: { agentCode: systemAgentCode },
      });

      expect(default_value).toBeDefined();
      expect(default_value.length).toBeGreaterThan(0);
    });
  });

  describe('Should test serenity actions', () => {
    it.skip('Should execute system agent', async () => {
      const action = ExecuteSerenityAgent as IQoreAppActionWithFunction;

      const data = {
        agentCode: systemAgentCode,
        params: [
          {
            Key: 'search',
            Value: 'how to test the action',
          },
          {
            Key: 'userLanguage',
            Value: 'en',
          },
        ],
      };

      const result = await retry<any>(
        () =>
          action.api_function(data, undefined, {
            conn_opts: { token } as any,
          }),
        3,
        5000
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('Should create a conversation', async () => {
      if (testConversationId) {
        return;
      }

      const action = CreateSerenityConversation as IQoreAppActionWithFunction;

      const data = {
        agentCode: conversationAgentCode,
        userIdentifier: 'test-conversation',
      };

      const result = await action.api_function(data, undefined, {
        conn_opts: { token } as any,
      });

      expect(result).toBeDefined();
      expect(result.chatId).toBeDefined();
      testConversationId = result.chatId;
    });

    // Looks like changing versions broke the conversations for agent
    it.skip('Should execute conversation agent', async () => {
      const action = ExecuteSerenityConversation as IQoreAppActionWithFunction;

      const data = {
        agentCode: conversationAgentCode,
        conversationId: testConversationId,
        message: 'Test message, write as short of a response as possible',
      };

      const result = await action.api_function(data, undefined, {
        conn_opts: { token } as any,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });
});
