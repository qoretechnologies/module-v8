/**
 * Process message timestamp from various formats
 *
 * Handles:
 * - Direct timestamp: "1710304378.475129"
 * - Slack message link: "https://workspace.slack.com/archives/C123/p1710304378475129"
 *
 * @param input - Timestamp string or Slack message URL
 * @returns Formatted timestamp or undefined if invalid
 */
export function processMessageTimestamp(input: string): string | undefined {
  if (!input) {
    return undefined;
  }

  // Regular expression to match a URL containing the timestamp
  // Format: /p{seconds}{microseconds}
  const urlRegex = /\/p(\d+)(\d{6})$/;

  // Check if the input is a URL
  const urlMatch = input.match(urlRegex);
  if (urlMatch) {
    const timestamp = `${urlMatch[1]}.${urlMatch[2]}`;
    return timestamp;
  }

  // Check if the input is already in the desired format (seconds.microseconds)
  const timestampRegex = /^(\d+)\.(\d{6})$/;
  const timestampMatch = input.match(timestampRegex);
  if (timestampMatch) {
    return input;
  }

  return undefined;
}

/**
 * Build Slack blocks for action buttons
 *
 * @param text - Message text
 * @param actions - Array of action buttons
 * @returns Slack blocks array
 */
export function buildActionBlocks(
  text: string,
  actions: Array<{ title: string; url: string }>
): any[] {
  const blocks: any[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
      },
    },
  ];

  if (actions && actions.length > 0) {
    const elements = actions.map((action) => ({
      type: 'button',
      text: {
        type: 'plain_text',
        text: action.title,
      },
      url: action.url,
    }));

    blocks.push({
      type: 'actions',
      elements,
    });
  }

  return blocks;
}
