/* eslint-disable max-len */
const ClaudeAppEn = {
  displayName: 'Claude',
  groups: ['AI & Language Models'],
  shortDesc: 'AI assistant for conversations, analysis, and content creation',
  longDesc: `Connect to Claude, Anthropic's AI assistant, to leverage advanced language understanding and generation capabilities. Use Claude for intelligent conversations, content creation, data analysis, code assistance, research support, and complex reasoning tasks. Claude can help automate workflows that require natural language processing, creative writing, technical documentation, and analytical thinking.`,
  connectionMessage: {
    title: 'Connect to Claude',
    content: `To connect to Claude, you will need your **Anthropic API Key**.

## Getting Your API Key

1. Sign in to the [Anthropic Console](https://console.anthropic.com/)
2. Navigate to **Settings** → **API Keys**
3. Click **Create Key**
4. Give your API key a descriptive name (e.g., "Qore Integration")
5. Copy the generated API key immediately (it won't be shown again)

You can access the API keys page directly at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

## Connection Details

### API Key
Your Anthropic API key starting with \`sk-ant-\`. This key authenticates all requests to the Claude API.

**Note:** Keep your API key secure and never share it publicly. API usage is billed based on the number of tokens processed. You can set spending limits and monitor usage in the Anthropic Console.`,
  },
  actions: {
    send_message: {
      displayName: 'Send Message',
      shortDesc: 'Send a message to Claude AI and get a response',
      longDesc:
        'Send a text message to Claude AI with optional system instructions, file attachments, and customizable parameters. Claude can process text, images, and documents to provide intelligent responses.',
      options: {
        model: {
          displayName: 'Model',
          shortDesc: 'The Claude model to use for the conversation',
          longDesc:
            'Select which Claude model to use for generating the response. Different models have varying capabilities, speed, and cost characteristics.',
        },
        message: {
          displayName: 'Message',
          shortDesc: 'The message to send to Claude',
          longDesc:
            'Enter the text message you want to send to Claude. This will be the main content that Claude responds to.',
        },
        system: {
          displayName: 'System Instructions',
          shortDesc: 'System-level instructions for Claude',
          longDesc:
            "Optional system instructions that define how Claude should behave, its role, or specific guidelines for the conversation. These instructions help shape Claude's responses.",
        },
        max_tokens: {
          displayName: 'Max Tokens',
          shortDesc: 'Maximum number of tokens in the response',
          longDesc:
            'Set the maximum number of tokens (roughly words) that Claude can use in its response. Higher values allow for longer responses but may increase costs.',
        },
        temperature: {
          displayName: 'Temperature',
          shortDesc: 'Controls randomness in responses (0.0-1.0)',
          longDesc:
            "Control the creativity and randomness of Claude's responses. Lower values (near 0) make responses more focused and deterministic, while higher values (near 1) make them more creative and varied.",
        },
        top_k: {
          displayName: 'Top K',
          shortDesc: 'Limits token selection to top K most likely options',
          longDesc:
            "Limit Claude's token selection to the K most likely options at each step. This can help control the coherence and focus of responses.",
        },
        top_p: {
          displayName: 'Top P',
          shortDesc: 'Nucleus sampling parameter (0.0-1.0)',
          longDesc:
            'Use nucleus sampling to control response diversity. Claude will only consider tokens whose cumulative probability mass is within the top P threshold.',
        },
        file: {
          displayName: 'File Attachment',
          shortDesc: 'Optional file to include with the message',
          longDesc:
            'Attach an image or document for Claude to analyze along with your message. Supported formats include images (JPEG, PNG, GIF, WebP) and PDF documents.',
        },
      },
    },
    list_models: {
      displayName: 'List Models',
      shortDesc: 'Retrieve a list of available Claude models',
      longDesc: 'Get a list of all available Claude models.',
    },
  },
};

export default ClaudeAppEn;
