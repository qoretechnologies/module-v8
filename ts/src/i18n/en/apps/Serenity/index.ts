

const SerenityAppEn = {
  displayName: 'Serenity',
  groups: ['AI & Language Models'],
  shortDesc: 'Create conversations, execute agents and manage interactions with Serenity AI Hub.',
  longDesc:
    'Enterprise AI ecosystem that enables businesses to create, manage, and scale AI agents effortlessly, enhancing productivity and innovation across various processes.',
  actions: {
    'create-conversation': {
      displayName: 'Create Conversation',
      shortDesc: 'Create a conversation with a conversation agent',
      longDesc:
        'Creates a conversation with the given agent code. This is required before executing an agent.',
      options: {
        agentCode: {
          displayName: 'Agent Code',
          shortDesc: 'The code of the agent to create a conversation with',
          longDesc: 'The code of the agent to create a conversation with',
        },
        userIdentifier: {
          displayName: 'User Identifier',
          shortDesc: 'Used to uniquely identify a user in a conversation. ',
          longDesc:
            'It helps maintain context across interactions. For example, you might use `"userIdentifier": "landing-page-user"` to track a specific user session.',
        },
        inputParameters: {
          displayName: 'Input Parameters',
          shortDesc: 'An array of key-value pairs for additional context.',
          longDesc: 'An array of key-value pairs for additional context.',
          type: {
            fields: {
              key: {
                displayName: 'Key',
                shortDesc: 'The key of the parameter',
                longDesc: 'The key of the parameter',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value of the parameter',
                longDesc: 'The value of the parameter',
              },
            },
          },
        },
      },
    },
    'execute-agent': {
      displayName: 'Execute Agent',
      shortDesc: 'Executes an agent with the given code.',
      longDesc: 'Executes an agent with the given code.',
      options: {
        agentCode: {
          displayName: 'Agent Code',
          shortDesc: 'Used to identify and execute a specific agent within the Serenity* AI Hub',
          longDesc: 'Used to identify and execute a specific agent within the Serenity* AI Hub',
        },
        culture: {
          displayName: 'Culture',
          shortDesc: 'Use this param to override the culture of the response.',
          longDesc: 'Use this param to override the culture of the response.',
        },
        userLanguage: {
          displayName: 'User Language',
          shortDesc: 'The preferred language of the response',
          longDesc: 'The preferred language of the response',
        },
        params: {
          displayName: 'Params',
          shortDesc: 'An array of key-value pairs for execution context.',
          longDesc: 'An array of key-value pairs for execution context.',
          type: {
            fields: {
              key: {
                displayName: 'Key',
                shortDesc: 'The key of the parameter',
                longDesc: 'The key of the parameter',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value of the parameter',
                longDesc: 'The value of the parameter',
              },
            },
          },
        },
        volatileKnowledgeIds: {
          displayName: 'Volatile Knowledge IDs',
          shortDesc:
            'Unique identifiers (UUIDs) used to retrieve specific pieces of volatile knowledge in the Serenity* AI Hub',
          longDesc:
            'Unique identifiers (UUIDs) used to retrieve specific pieces of volatile knowledge in the Serenity* AI Hub',
        },
      },
    },
    'execute-conversation': {
      displayName: 'Execute Conversation',
      shortDesc: 'Send a message to a chat with agent',
      longDesc: 'Send a message to a chat with agent',
      options: {
        agentCode: {
          displayName: 'Agent Code',
          shortDesc: 'The agent to check for conversations with',
          longDesc: 'The agent to check for conversations with',
        },
        conversationId: {
          displayName: 'Conversation ID',
          shortDesc: 'The conversation to send the message to',
          longDesc: 'The conversation to send the message to',
        },
        userLanguage: {
          displayName: 'User Language',
          shortDesc: 'The preferred language of the response',
          longDesc: 'The preferred language of the response',
        },
        message: {
          displayName: 'Message',
          shortDesc: 'Message to send to the agent',
          longDesc: 'Message to send to the agent',
        },
        culture: {
          displayName: 'Culture',
          shortDesc: 'Use this param to override the culture of the response.',
          longDesc: 'Use this param to override the culture of the response. ',
        },
      },
    },
  },
  triggers: {
    'new-conversation-message': {
      displayName: 'New Conversation Message',
      shortDesc: 'Triggered when a new message is posted in a conversation.',
      longDesc: 'This trigger activates when a new message is posted in a conversation.',
      options: {
        conversationId: {
          displayName: 'Conversation ID',
          shortDesc: 'The unique identifier for the conversation.',
          longDesc:
            'Enter the Conversation ID to specify the conversation where you want to monitor new messages.',
        },
        agentCode: {
          displayName: 'Agent ID',
          shortDesc: 'The unique identifier for the agent.',
          longDesc: 'Agent ID to check for available conversations from',
        },
        sender: {
          displayName: 'Sender',
          shortDesc: 'Filter the messages by the sender.',
          longDesc: 'Choose the sender the messages should be filtered by.',
        },
      },
    },
  },
};

export default SerenityAppEn;
