import { IQoreAppActionWithFunction } from '@qoretechnologies/ts-toolkit';
import { ExecuteSerenityAgent, ExecuteSerenityConversation } from '../apps/serenity/actions';
import { CreateSerenityConversation } from '../apps/serenity/actions/create-conversation';
import {
  getSerenityConversationAgentAllowedValues,
  getSerenitySystemAgentAllowedValues,
} from '../apps/serenity/helpers/get-agent-allowed-values';
import { getSerenityConversationAllowedValues } from '../apps/serenity/helpers/get-conversation-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { getSerenityAgentParamsAllowedValues } from '../apps/serenity/helpers/get-agent-params-allowed-values';

Debugger.level = DebugLevels.Verbose;

describe('Should test serenity actions', () => {
  let token: string;
  let conversationAgentCode: string;
  let systemAgentCode: string;
  let testConversationId: string;

  beforeAll(() => {
    if (!process.env.SERENITY_API_KEY) {
      throw new Error('SERENITY_API_KEY environment variable is required for these tests');
    }

    token = process.env.SERENITY_API_KEY;
  });

  describe('Should test serenity allowed values', () => {
    it('Should get serenity system agent allowed values', async () => {
      const allowed_values = await getSerenitySystemAgentAllowedValues({
        conn_opts: { token } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      systemAgentCode = allowed_values[0].value;
    });

    it('Should get serenity conversation agent allowed values', async () => {
      const allowed_values = await getSerenityConversationAgentAllowedValues({
        conn_opts: { token } as any,
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      conversationAgentCode = allowed_values[0].value;
    });

    it('Should get serenity conversation allowed values', async () => {
      const allowed_values = await getSerenityConversationAllowedValues({
        conn_opts: { token } as any,
        opts: { agentCode: conversationAgentCode },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      testConversationId = allowed_values[0].value;
    });

    it('Should get serenity agent params', async () => {
      const allowed_values = await getSerenityAgentParamsAllowedValues({
        conn_opts: { token } as any,
        opts: { agentCode: systemAgentCode },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });
  });

  describe('Should test serenity actions', () => {
    it('Should execute system agent', async () => {
      const action = ExecuteSerenityAgent as IQoreAppActionWithFunction;

      const data = {
        agentCode: systemAgentCode,
        params: [
          {
            Key: 'search',
            Value: 'how to cook pancakes',
          },
        ],
      };

      const result = await action.api_function(data, undefined, {
        conn_opts: { token } as any,
      });

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

    it('Should execute conversation agent', async () => {
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
