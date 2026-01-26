import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { CallListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/call';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { getTwilioPhoneNumberAllowedValues } from '../helpers/get-phone-number-allowed-values';
import {
  TwilioLanguageAllowedValues,
  TwilioVoiceAllowedValues,
} from '../helpers/get-voice-allowed-values';
import { TwilioCallResponseType } from '../response-types/call';

const action = 'create_call_with_tts';

const options = {
  to: {
    type: 'string',
    required: true,
  },
  from: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioPhoneNumberAllowedValues,
    allowed_values_creatable: true,
  },
  message: {
    type: 'string',
    required: true,
  },
  voice: {
    type: 'string',
    required: false,
    allowed_values: TwilioVoiceAllowedValues,
  },
  language: {
    type: 'string',
    required: false,
    allowed_values: TwilioLanguageAllowedValues,
  },
  record: {
    type: 'bool',
    required: false,
  },
  transcribe: {
    type: 'bool',
    required: false,
    depends_on: ['record'],
  },
  transcriptionCallback: {
    type: 'string',
    required: false,
    depends_on: ['transcribe'],
  },
  sendDigits: {
    type: 'string',
    required: false,
  },
  statusCallback: {
    type: 'string',
    required: false,
  },
  timeout: {
    type: 'integer',
    required: false,
  },
  machineDetection: {
    type: 'string',
    required: false,
    allowed_values: [
      { display_name: 'Enable', value: 'Enable' },
      { display_name: 'Detect Message End', value: 'DetectMessageEnd' },
    ],
  },
} satisfies TQoreOptions;

const responseType = TwilioCallResponseType;

type TCreateCallRequest = CallListInstanceCreateOptions;

const generateTwiML = (params: {
  message: string;
  voice?: string;
  language?: string;
  record?: boolean;
  transcribe?: boolean;
  transcriptionCallback?: string;
}): string => {
  const { message, voice, language, record, transcribe, transcriptionCallback } = params;

  let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';

  const sayAttrs: string[] = [];
  if (voice) sayAttrs.push(`voice="${voice}"`);
  if (language) sayAttrs.push(`language="${language}"`);

  const sayAttrsStr = sayAttrs.length > 0 ? ` ${sayAttrs.join(' ')}` : '';
  twiml += `<Say${sayAttrsStr}>${escapeXml(message)}</Say>`;

  if (record) {
    const recordAttrs: string[] = [];
    if (transcribe) {
      recordAttrs.push('transcribe="true"');
      if (transcriptionCallback) {
        recordAttrs.push(`transcribeCallback="${escapeXml(transcriptionCallback)}"`);
      }
    }
    const recordAttrsStr = recordAttrs.length > 0 ? ` ${recordAttrs.join(' ')}` : '';
    twiml += `<Record${recordAttrsStr}/>`;
  }

  twiml += '</Response>';

  return twiml;
};

const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const createTwilioCallWithTTS = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password, ...requiredActionOptions } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['to', 'from', 'message'],
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    const {
      voice,
      language,
      record,
      transcribe,
      transcriptionCallback,
      sendDigits,
      statusCallback,
      timeout,
      machineDetection,
    } = obj || {};

    try {
      const twiml = generateTwiML({
        message: requiredActionOptions.message,
        voice,
        language,
        record,
        transcribe,
        transcriptionCallback,
      });

      const callData: TCreateCallRequest = {
        to: requiredActionOptions.to,
        from: requiredActionOptions.from,
        twiml,
        ...(sendDigits && { sendDigits }),
        ...(statusCallback && { statusCallback }),
        ...(timeout !== undefined && { timeout }),
        ...(machineDetection && { machineDetection }),
      };

      const call = await client.calls.create(callData);

      return call;
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createTwilioCallWithTTS;
