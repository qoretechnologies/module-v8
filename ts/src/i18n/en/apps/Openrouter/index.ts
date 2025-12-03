/* eslint-disable max-len */
const OpenrouterAppEn = {
  displayName: 'OpenRouter',
  groups: ['AI & Language Models'],
  shortDesc: 'Access multiple AI models through a unified API',
  longDesc:
    'OpenRouter provides a unified interface to access and compare multiple AI models from different providers. Route your requests to the best model for your specific use case, with support for text generation, chat completion, and other AI capabilities from leading providers like OpenAI, Anthropic, Google, and more.',
  OpenRouter: {
    actions: {
      list_models: {
        displayName: 'List Models',
        shortDesc: 'Retrieve available AI models from OpenRouter',
        longDesc:
          'Fetches a comprehensive list of all AI models available through OpenRouter, including model metadata such as pricing, capabilities, context length, supported parameters, and provider information.',
        options: {
          category: {
            displayName: 'Category',
            shortDesc: 'Filter models by category',
            longDesc:
              'Optional filter to retrieve models from a specific category or type. Leave empty to get all available models.',
          },
        },
      },
      send_prompt: {
        displayName: 'Send Prompt',
        shortDesc: 'Send a text prompt for completion',
        longDesc:
          'Sends a single text prompt to an AI model for completion. This is ideal for simple text generation tasks, creative writing, or when you need a direct response to a single input.',
        options: {
          model: {
            displayName: 'Model',
            shortDesc: 'The AI model to use for completion',
            longDesc:
              'Select the specific AI model to process your prompt. Different models have varying capabilities, pricing, and specializations.',
          },
          prompt: {
            displayName: 'Prompt',
            shortDesc: 'The text prompt to send',
            longDesc:
              'Enter the text prompt you want the AI model to complete or respond to. Be clear and specific for better results.',
          },
          temperature: {
            displayName: 'Temperature',
            shortDesc: 'Control randomness in responses',
            longDesc:
              'Controls the randomness of the output. Lower values (0.0-0.3) make responses more focused and deterministic, while higher values (0.7-1.0) make them more creative and varied.',
          },
          max_tokens: {
            displayName: 'Max Tokens',
            shortDesc: 'Maximum number of tokens to generate',
            longDesc:
              'Sets the maximum number of tokens (roughly words) the model should generate in its response. Higher values allow for longer responses but may increase costs.',
          },
          seed: {
            displayName: 'Seed',
            shortDesc: 'Random seed for reproducible results',
            longDesc:
              'A number used to initialize the random number generator. Using the same seed with identical parameters should produce consistent results across requests.',
          },
          top_p: {
            displayName: 'Top P',
            shortDesc: 'Nucleus sampling parameter',
            longDesc:
              'Controls diversity via nucleus sampling. Only tokens with cumulative probability up to this value are considered. Lower values focus on more likely tokens.',
          },
          top_k: {
            displayName: 'Top K',
            shortDesc: 'Top-k sampling parameter',
            longDesc:
              'Limits the model to consider only the top K most likely tokens at each step. Lower values make responses more focused, higher values increase diversity.',
          },
        },
      },
      chat_completion: {
        displayName: 'Chat Completion',
        shortDesc: 'Generate chat responses from conversation messages',
        longDesc:
          'Processes a conversation history with multiple messages and roles (system, user, assistant) to generate contextual responses. Perfect for building chatbots, conversational AI, or multi-turn interactions.',
        options: {
          model: {
            displayName: 'Model',
            shortDesc: 'The AI model to use for chat completion',
            longDesc:
              'Select the specific AI model to process your conversation. Different models excel at different types of conversations and have varying context lengths.',
          },
          messages: {
            displayName: 'Messages',
            shortDesc: 'Conversation messages with roles',
            longDesc:
              'An array of message objects representing the conversation history. Each message includes a role (system, user, assistant, developer, tool) and content.',
            type: {
              element_type: {
                fields: {
                  role: {
                    displayName: 'Role',
                    shortDesc: 'The role of the message sender',
                    longDesc:
                      'Defines who is sending the message: system (instructions), user (human input), assistant (AI responses), developer (special instructions), or tool (tool outputs).',
                  },
                  content: {
                    displayName: 'Content',
                    shortDesc: 'The message content',
                    longDesc:
                      'The actual text content of the message. For system messages, this typically contains instructions. For user messages, it contains the human input.',
                  },
                },
              },
            },
          },
          temperature: {
            displayName: 'Temperature',
            shortDesc: 'Control randomness in responses',
            longDesc:
              'Controls the randomness of the output. Lower values (0.0-0.3) make responses more focused and deterministic, while higher values (0.7-1.0) make them more creative and varied.',
          },
          max_tokens: {
            displayName: 'Max Tokens',
            shortDesc: 'Maximum number of tokens to generate',
            longDesc:
              'Sets the maximum number of tokens (roughly words) the model should generate in its response. Higher values allow for longer responses but may increase costs.',
          },
          seed: {
            displayName: 'Seed',
            shortDesc: 'Random seed for reproducible results',
            longDesc:
              'A number used to initialize the random number generator. Using the same seed with identical parameters should produce consistent results across requests.',
          },
          top_p: {
            displayName: 'Top P',
            shortDesc: 'Nucleus sampling parameter',
            longDesc:
              'Controls diversity via nucleus sampling. Only tokens with cumulative probability up to this value are considered. Lower values focus on more likely tokens.',
          },
          top_k: {
            displayName: 'Top K',
            shortDesc: 'Top-k sampling parameter',
            longDesc:
              'Limits the model to consider only the top K most likely tokens at each step. Lower values make responses more focused, higher values increase diversity.',
          },
        },
      },
    },
  },
};

export default OpenrouterAppEn;
