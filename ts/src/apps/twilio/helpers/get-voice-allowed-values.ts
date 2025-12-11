import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const TwilioVoiceAllowedValues: IQoreAllowedValue<string>[] = [
  // English voices (most common)
  { display_name: 'English (US) - Polly Amy (Female, Neural)', value: 'Polly.Amy-Neural' },
  { display_name: 'English (US) - Polly Joanna (Female, Neural)', value: 'Polly.Joanna-Neural' },
  { display_name: 'English (US) - Polly Matthew (Male, Neural)', value: 'Polly.Matthew-Neural' },
  { display_name: 'English (US) - Polly Joey (Male, Neural)', value: 'Polly.Joey-Neural' },
  { display_name: 'English (US) - Google Standard (Female)', value: 'Google.en-US-Standard-A' },
  { display_name: 'English (US) - Google Standard (Male)', value: 'Google.en-US-Standard-B' },
  { display_name: 'English (US) - Google Neural (Female)', value: 'Google.en-US-Neural2-A' },
  { display_name: 'English (US) - Google Neural (Male)', value: 'Google.en-US-Neural2-D' },

  // English (UK)
  { display_name: 'English (UK) - Polly Amy (Female, Neural)', value: 'Polly.Amy-Neural' },
  { display_name: 'English (UK) - Polly Brian (Male, Neural)', value: 'Polly.Brian-Neural' },
  { display_name: 'English (UK) - Google Standard (Female)', value: 'Google.en-GB-Standard-A' },
  { display_name: 'English (UK) - Google Standard (Male)', value: 'Google.en-GB-Standard-B' },

  // Spanish
  { display_name: 'Spanish (US) - Polly Lupe (Female, Neural)', value: 'Polly.Lupe-Neural' },
  { display_name: 'Spanish (US) - Polly Pedro (Male, Neural)', value: 'Polly.Pedro-Neural' },
  { display_name: 'Spanish (Spain) - Polly Lucia (Female, Neural)', value: 'Polly.Lucia-Neural' },
  { display_name: 'Spanish (Spain) - Google Standard (Female)', value: 'Google.es-ES-Standard-A' },

  // French
  { display_name: 'French (France) - Polly Celine (Female, Neural)', value: 'Polly.Celine-Neural' },
  { display_name: 'French (France) - Polly Mathieu (Male, Neural)', value: 'Polly.Mathieu-Neural' },
  { display_name: 'French (France) - Google Standard (Female)', value: 'Google.fr-FR-Standard-A' },
  { display_name: 'French (Canada) - Google Standard (Female)', value: 'Google.fr-CA-Standard-A' },

  // German
  { display_name: 'German - Polly Vicki (Female, Neural)', value: 'Polly.Vicki-Neural' },
  { display_name: 'German - Polly Daniel (Male, Neural)', value: 'Polly.Daniel-Neural' },
  { display_name: 'German - Google Standard (Female)', value: 'Google.de-DE-Standard-A' },

  // Italian
  { display_name: 'Italian - Polly Bianca (Female, Neural)', value: 'Polly.Bianca-Neural' },
  { display_name: 'Italian - Polly Adriano (Male, Neural)', value: 'Polly.Adriano-Neural' },
  { display_name: 'Italian - Google Standard (Female)', value: 'Google.it-IT-Standard-A' },

  // Portuguese
  {
    display_name: 'Portuguese (Brazil) - Polly Camila (Female, Neural)',
    value: 'Polly.Camila-Neural',
  },
  {
    display_name: 'Portuguese (Brazil) - Polly Thiago (Male, Neural)',
    value: 'Polly.Thiago-Neural',
  },
  {
    display_name: 'Portuguese (Brazil) - Google Standard (Female)',
    value: 'Google.pt-BR-Standard-A',
  },

  // Japanese
  { display_name: 'Japanese - Polly Kazuha (Female, Neural)', value: 'Polly.Kazuha-Neural' },
  { display_name: 'Japanese - Polly Tomoko (Female, Neural)', value: 'Polly.Tomoko-Neural' },
  { display_name: 'Japanese - Google Standard (Female)', value: 'Google.ja-JP-Standard-A' },

  // Chinese
  {
    display_name: 'Chinese (Mandarin) - Polly Zhiyu (Female, Neural)',
    value: 'Polly.Zhiyu-Neural',
  },
  {
    display_name: 'Chinese (Mandarin) - Google Standard (Female)',
    value: 'Google.cmn-CN-Standard-A',
  },

  // Korean
  { display_name: 'Korean - Polly Seoyeon (Female, Neural)', value: 'Polly.Seoyeon-Neural' },
  { display_name: 'Korean - Google Standard (Female)', value: 'Google.ko-KR-Standard-A' },

  // Hindi
  { display_name: 'Hindi - Polly Kajal (Female, Neural)', value: 'Polly.Kajal-Neural' },
  { display_name: 'Hindi - Google Standard (Female)', value: 'Google.hi-IN-Standard-A' },

  // Arabic
  { display_name: 'Arabic - Polly Hala (Female, Neural)', value: 'Polly.Hala-Neural' },
  { display_name: 'Arabic - Polly Zayd (Male, Neural)', value: 'Polly.Zayd-Neural' },

  // Dutch
  { display_name: 'Dutch - Polly Laura (Female, Neural)', value: 'Polly.Laura-Neural' },
  { display_name: 'Dutch - Google Standard (Female)', value: 'Google.nl-NL-Standard-A' },

  // Polish
  { display_name: 'Polish - Polly Ola (Female, Neural)', value: 'Polly.Ola-Neural' },
  { display_name: 'Polish - Google Standard (Female)', value: 'Google.pl-PL-Standard-A' },
];

export const TwilioLanguageAllowedValues: IQoreAllowedValue<string>[] = [
  { display_name: 'English (United States)', value: 'en-US' },
  { display_name: 'English (United Kingdom)', value: 'en-GB' },
  { display_name: 'English (Australia)', value: 'en-AU' },
  { display_name: 'English (Canada)', value: 'en-CA' },
  { display_name: 'English (India)', value: 'en-IN' },
  { display_name: 'Spanish (Spain)', value: 'es-ES' },
  { display_name: 'Spanish (Mexico)', value: 'es-MX' },
  { display_name: 'Spanish (United States)', value: 'es-US' },
  { display_name: 'French (France)', value: 'fr-FR' },
  { display_name: 'French (Canada)', value: 'fr-CA' },
  { display_name: 'German (Germany)', value: 'de-DE' },
  { display_name: 'Italian (Italy)', value: 'it-IT' },
  { display_name: 'Portuguese (Brazil)', value: 'pt-BR' },
  { display_name: 'Portuguese (Portugal)', value: 'pt-PT' },
  { display_name: 'Japanese (Japan)', value: 'ja-JP' },
  { display_name: 'Chinese (Mandarin)', value: 'cmn-CN' },
  { display_name: 'Korean (South Korea)', value: 'ko-KR' },
  { display_name: 'Hindi (India)', value: 'hi-IN' },
  { display_name: 'Arabic (Gulf)', value: 'arb' },
  { display_name: 'Dutch (Netherlands)', value: 'nl-NL' },
  { display_name: 'Polish (Poland)', value: 'pl-PL' },
  { display_name: 'Swedish (Sweden)', value: 'sv-SE' },
  { display_name: 'Danish (Denmark)', value: 'da-DK' },
  { display_name: 'Norwegian (Norway)', value: 'nb-NO' },
  { display_name: 'Turkish (Turkey)', value: 'tr-TR' },
];
