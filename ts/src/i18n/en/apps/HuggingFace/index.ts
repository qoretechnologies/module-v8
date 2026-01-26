/* eslint-disable max-len */
const HuggingFaceAppEn = {
  displayName: 'Hugging Face',
  groups: ['AI & Language Models'],
  shortDesc: 'AI models and datasets platform',
  longDesc:
    'Access and deploy machine learning models, datasets, and spaces from Hugging Face Hub for natural language processing, computer vision, and other AI tasks',
  connectionMessage: {
    title: 'Connect to Hugging Face',
    content: `To connect to Hugging Face, you will need your **Access Token**.

## Getting Your Access Token

1. Sign in to your [Hugging Face account](https://huggingface.co/)
2. Click on your profile picture → **Settings**
3. Navigate to **Access Tokens** in the left sidebar
4. Click **New token**
5. Give your token a descriptive name (e.g., "Qore Integration")
6. Select the appropriate role:
   - **Read**: For accessing public models and datasets
   - **Write**: For uploading models, creating repos, and full API access
7. Click **Generate a token**
8. Copy the generated token immediately

You can access the tokens page directly at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

## Connection Details

### Access Token
Your Hugging Face access token starting with \`hf_\`. This token authenticates all API requests to Hugging Face services.

**Note:** Keep your access token secure and never share it publicly. You can create multiple tokens with different permissions and revoke them at any time from the settings page.`,
  },
  actions: {
    list_models: {
      displayName: 'List Models',
      shortDesc: 'List and search Hugging Face models',
      longDesc:
        'Retrieve a list of Hugging Face models with filtering options by task, owner, tags, and other criteria',
      options: {
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter models by tags',
          longDesc: 'List of tags to filter models by',
        },
        inferenceProviders: {
          displayName: 'Inference Providers',
          shortDesc: 'Filter by inference providers',
          longDesc: 'List of inference providers to filter models by',
        },
        owner: {
          displayName: 'Owner',
          shortDesc: 'Filter by model owner',
          longDesc: 'Username or organization name to filter models by',
        },
        query: {
          displayName: 'Search Query',
          shortDesc: 'Search models by query',
          longDesc: 'Text query to search for in model names and descriptions',
        },
        task: {
          displayName: 'Task',
          shortDesc: 'Filter by model task',
          longDesc: 'Machine learning task type to filter models by',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of models to return',
          longDesc: 'The maximum number of models to retrieve (default: 10)',
        },
        additionalFields: {
          displayName: 'Additional Fields',
          shortDesc: 'Extra model fields to include',
          longDesc: 'Additional model metadata fields to include in the response',
        },
      },
    },
    create_summary: {
      displayName: 'Create Summary',
      shortDesc: 'Generate text summary using AI',
      longDesc:
        'Create a concise summary of the provided text using Hugging Face summarization models',
      options: {
        model: {
          displayName: 'Model',
          shortDesc: 'Summarization model to use',
          longDesc: 'The Hugging Face summarization model to use for generating the summary',
        },
        text: {
          displayName: 'Text',
          shortDesc: 'Text to summarize',
          longDesc: 'The input text that you want to create a summary for',
        },
      },
    },
    answer_question_based_on_context: {
      displayName: 'Answer Question Based on Context',
      shortDesc: 'Answer questions using provided context',
      longDesc:
        'Answer questions based on text, document, or image context using specialized question-answering models',
      options: {
        type: {
          displayName: 'Question Type',
          shortDesc: 'Type of question answering',
          longDesc: 'The type of context and question answering model to use',
        },
        model: {
          displayName: 'Model',
          shortDesc: 'Question answering model to use',
          longDesc: 'The Hugging Face model to use for answering the question',
        },
        question: {
          displayName: 'Question',
          shortDesc: 'Question to answer',
          longDesc: 'The question you want to answer based on the provided context',
        },
        context: {
          displayName: 'Text Context',
          shortDesc: 'Text context for the question',
          longDesc: 'The text context that contains information to answer the question',
        },
        file: {
          displayName: 'Document File',
          shortDesc: 'Document context for the question',
          longDesc: 'The document file that contains information to answer the question',
        },
        image: {
          displayName: 'Image File',
          shortDesc: 'Image context for the question',
          longDesc: 'The image file that contains visual information to answer the question',
        },
      },
    },
    create_text_classification: {
      displayName: 'Create Text Classification',
      shortDesc: 'Classify text into categories',
      longDesc:
        'Classify text into predefined categories using Hugging Face text classification models',
      options: {
        model: {
          displayName: 'Model',
          shortDesc: 'Text classification model to use',
          longDesc: 'The Hugging Face text classification model to use for categorizing the text',
        },
        text: {
          displayName: 'Text',
          shortDesc: 'Text to classify',
          longDesc: 'The input text that you want to classify into categories',
        },
      },
    },
    create_translation: {
      displayName: 'Create Translation',
      shortDesc: 'Translate text between languages',
      longDesc: 'Translate text from one language to another using Hugging Face translation models',
      options: {
        model: {
          displayName: 'Model',
          shortDesc: 'Translation model to use',
          longDesc: 'The Hugging Face translation model to use for translating the text',
        },
        text: {
          displayName: 'Text',
          shortDesc: 'Text to translate',
          longDesc: 'The input text that you want to translate to another language',
        },
      },
    },
    create_chat_completion: {
      displayName: 'Create Chat Completion',
      shortDesc: 'Generate AI chat responses',
      longDesc: 'Generate conversational AI responses using Hugging Face chat completion models',
      options: {
        model: {
          displayName: 'Model',
          shortDesc: 'Chat completion model to use',
          longDesc: 'The Hugging Face chat completion model to use for generating responses',
        },
        messages: {
          displayName: 'Messages',
          shortDesc: 'Conversation messages',
          longDesc: 'The conversation history including user and assistant messages',
          type: {
            element_type: {
              fields: {
                role: {
                  displayName: 'Role',
                  shortDesc: 'Message sender role',
                  longDesc: 'Whether the message is from a user or assistant',
                },
                content: {
                  displayName: 'Content',
                  shortDesc: 'Message content',
                  longDesc: 'The text content of the message',
                },
              },
            },
          },
        },
      },
    },
  },
};

export default HuggingFaceAppEn;
