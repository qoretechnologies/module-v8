import en from '../i18n/en';

/**
 * Every label an app shows a person (the name of an action, a trigger, an option or a field) is written in sentence
 * case: only its first word starts with a capital letter. Words keep their capitals when they are written that way
 * on purpose: words in capitals (API, URL), words with a capital after their first letter (OAuth2, HubSpot), the
 * app's own name, any app's full name, and the product names below.
 */
const PRODUCT_NAMES = new Set([
  'Google',
  'Microsoft',
  'Outlook',
  'Excel',
  'Word',
  'Slack',
  'Gmail',
  'YouTube',
  'Shopify',
  'Stripe',
  'PayPal',
  'Zoom',
  'Qorus',
  'Qore',
]);

// a product's name of more than one word, kept as it is written
const PRODUCT_PHRASES = [
  'Google Analytics',
  'Google Calendar',
  'Google Drive',
  'Google Sheets',
  // a named BambooHR feature ("the Who's Out list")
  "Who's Out",
];

interface ILabel {
  app: string;
  label: string;
}

const appNames = Object.values(en.apps)
  .map((app) => (app as { displayName?: unknown }).displayName)
  .filter((name): name is string => typeof name === 'string');

const collectLabels = (app: string, node: unknown, labels: ILabel[], top = true): void => {
  if (!node || typeof node !== 'object') {
    return;
  }
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    // the app's own name is a name, not a label
    if (key === 'displayName' && typeof value === 'string' && !top) {
      labels.push({ app, label: value });
    } else if (typeof value === 'object') {
      collectLabels(app, value, labels, false);
    }
  }
};

/** The words of a label after its first that start with a capital and are neither acronyms nor names */
export const titleCaseWords = (label: string, ownName: string): string[] => {
  const ownWords = new Set(ownName.split(' '));
  let text = label;
  for (const phrase of [...appNames, ...PRODUCT_PHRASES]) {
    if (phrase.includes(' ')) {
      text = text.split(phrase).join(phrase.replace(/ /g, '\u0001'));
    }
  }
  return text
    .split(' ')
    .slice(1)
    .flatMap((word) => word.split('/'))
    .filter((word) => {
      if (word.includes('\u0001')) {
        return false;
      }
      const core = word.replace(/[^A-Za-z0-9]/g, '');
      if (core.length < 2 || !/^[A-Z]/.test(core)) {
        return false;
      }
      // capitals after the first letter: an acronym (URL) or a name written that way (HubSpot)
      if (core.slice(1) !== core.slice(1).toLowerCase()) {
        return false;
      }
      return !ownWords.has(core) && !PRODUCT_NAMES.has(core);
    });
};

describe('app labels', () => {
  const labels: ILabel[] = [];
  for (const [app, translation] of Object.entries(en.apps)) {
    // a fixture app for the module's own tests, not shown to anyone
    if (app.startsWith('_')) {
      continue;
    }
    collectLabels(app, translation, labels);
  }

  it('finds the labels of every app', () => {
    expect(labels.length).toBeGreaterThan(3000);
  });

  it('writes every action, trigger, option and field label in sentence case', () => {
    const offenders = labels
      .map(({ app, label }) => ({
        app,
        label,
        words: titleCaseWords(
          label,
          String((en.apps as Record<string, { displayName?: unknown }>)[app].displayName ?? '')
        ),
      }))
      .filter(({ words }) => words.length)
      .map(({ app, label, words }) => `${app}: "${label}" (${words.join(', ')})`);
    expect(offenders).toEqual([]);
  });

  it('reads a title-case label as one', () => {
    expect(titleCaseWords('Create Contact List', 'Mautic')).toEqual(['Contact', 'List']);
    expect(titleCaseWords('Create contact list', 'Mautic')).toEqual([]);
    expect(titleCaseWords('Add a Google Analytics ID', 'Typeform')).toEqual([]);
    expect(titleCaseWords('Create Attio record', 'Attio')).toEqual([]);
  });
});
