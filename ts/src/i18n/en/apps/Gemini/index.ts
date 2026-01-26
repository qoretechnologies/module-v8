/* eslint-disable max-len */
const GeminiAppEn = {
  displayName: 'Gemini',
  groups: ['AI & Language Models'],
  shortDesc: "Google's advanced AI model for multimodal understanding and generation",
  longDesc: `Connect to Google's Gemini AI to leverage state-of-the-art multimodal capabilities including text generation, image analysis, code assistance, and reasoning tasks. Gemini excels at understanding and generating content across text, images, and code, making it ideal for complex workflows requiring advanced AI reasoning, creative content generation, data analysis, and intelligent automation within your Qore applications.`,
  connectionMessage: {
    title: 'Connect to Google Gemini',
    content: `To connect to Google Gemini, you will need your **API Key**.

## Getting Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **Get API key** in the left sidebar
4. Click **Create API key**
5. Select a Google Cloud project or create a new one
6. Copy the generated API key

You can access the API keys page directly at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

## Connection Details

### API Key
Your Google AI API key that authenticates requests to the Gemini API. This key is associated with your Google Cloud project.

**Note:** Keep your API key secure and never share it publicly. API usage may be subject to quotas and billing based on your Google Cloud project settings. You can manage and revoke API keys from the Google AI Studio at any time.`,
  },
  actions: {
    list_models: {
      displayName: 'List Models',
      shortDesc: 'Retrieve a list of available Gemini models',
      longDesc:
        'Get a comprehensive list of all available Google Gemini models with their specifications, capabilities, and limitations. This helps you choose the right model for your specific use case.',
    },
    send_message: {
      displayName: 'Send Message',
      shortDesc: 'Send a prompt to Google Gemini and get a response',
      longDesc:
        'Send a text prompt to Google Gemini AI with optional system instructions and customizable parameters. Gemini can process complex prompts and provide intelligent, contextual responses.',
      options: {
        model: {
          displayName: 'Model',
          shortDesc: 'The Gemini model to use for generation',
          longDesc:
            'Select which Google Gemini model to use for generating the response. Different models have varying capabilities, performance characteristics, and token limits.',
        },
        prompt: {
          displayName: 'Prompt',
          shortDesc: 'The prompt to send to Gemini',
          longDesc:
            'Enter the text prompt you want to send to Gemini. This will be the main content that Gemini responds to and generates content based on.',
        },
        system: {
          displayName: 'System Instruction',
          shortDesc: 'System-level instructions for Gemini',
          longDesc:
            "Optional system instruction that defines how Gemini should behave, its role, or specific guidelines for the conversation. This helps shape Gemini's responses and behavior.",
        },
        maxOutputTokens: {
          displayName: 'Max Output Tokens',
          shortDesc: 'Maximum number of tokens in the response',
          longDesc:
            'Set the maximum number of tokens that Gemini can use in its response. Higher values allow for longer responses but may increase processing time and costs.',
        },
        files: {
          displayName: 'Files',
          shortDesc: 'Files to attach to the prompt',
          longDesc:
            'Attach files that Gemini can reference when generating its response. This allows Gemini to analyze and incorporate information from the provided files into its output.',
        },
        temperature: {
          displayName: 'Temperature',
          shortDesc: 'Controls randomness in responses (0.0-2.0)',
          longDesc:
            "Control the creativity and randomness of Gemini's responses. Lower values (near 0) make responses more focused and deterministic, while higher values (up to 2.0) make them more creative and varied.",
        },
        topK: {
          displayName: 'Top K',
          shortDesc: 'Limits token selection to top K most likely options',
          longDesc:
            "Limit Gemini's token selection to the K most likely options at each step. This parameter helps control the coherence and focus of responses by restricting the vocabulary considered.",
        },
        topP: {
          displayName: 'Top P',
          shortDesc: 'Nucleus sampling parameter (0.0-1.0)',
          longDesc:
            'Use nucleus sampling to control response diversity. Gemini will only consider tokens whose cumulative probability mass is within the top P threshold, helping balance creativity and coherence.',
        },
      },
    },
    list_files: {
      displayName: 'List Files',
      shortDesc: 'Retrieve a list of uploaded files from Gemini',
      longDesc:
        'Lists all files that have been uploaded to the Gemini service, including file metadata such as name, size, creation time, and MIME type.',
    },
    upload_file: {
      displayName: 'Upload File',
      shortDesc: 'Upload a file to Gemini for processing',
      longDesc:
        'Uploads a file to the Gemini service where it can be used for AI processing, analysis, or generation tasks. The file will be stored and made available for use with other Gemini operations.',
      options: {
        file: {
          displayName: 'File',
          shortDesc: 'The file to upload',
          longDesc:
            'Select the file you want to upload to Gemini. The file will be converted and stored in a format suitable for AI processing.',
        },
        name: {
          displayName: 'Display Name',
          shortDesc: 'Optional custom name for the file',
          longDesc:
            'Provide a custom display name for the uploaded file. If not provided, the original filename will be used.',
        },
      },
    },
    generate_image: {
      displayName: 'Generate Image',
      shortDesc: 'Generate images using Gemini AI models',
      longDesc:
        'Uses Gemini AI to generate high-quality images based on text prompts. Supports various aspect ratios and person generation settings for flexible image creation.',
      options: {
        model: {
          displayName: 'Model',
          shortDesc: 'The Gemini model to use for image generation',
          longDesc:
            'Select the specific Gemini model for generating images. Different models may have varying capabilities and quality levels.',
        },
        prompt: {
          displayName: 'Prompt',
          shortDesc: 'Text description of the image to generate',
          longDesc:
            'Provide a detailed text description of the image you want to generate. Be specific about objects, style, composition, and any other visual elements.',
        },
        ratio: {
          displayName: 'Aspect Ratio',
          shortDesc: 'The aspect ratio for the generated image',
          longDesc:
            'Choose the aspect ratio for your generated image. Options include square (1:1), portrait (3:4, 9:16), landscape (4:3, 16:9), and other common ratios.',
        },
        personGeneration: {
          displayName: 'Person Generation',
          shortDesc: 'Control generation of people in images',
          longDesc:
            'Set the policy for generating images with people. Choose to allow all people, only adults, or no people in the generated images.',
        },
      },
    },
  },
};

export default GeminiAppEn;
