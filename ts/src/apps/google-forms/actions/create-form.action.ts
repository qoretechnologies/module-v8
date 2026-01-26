import { forms_v1 } from '@googleapis/forms';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreMappedOptions,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_FORMS_APP_NAME, GoogleFormsError } from '../constants';
import { createGoogleFormsClient } from '../helpers/constants';
import { GoogleFormsQuestionTypes } from '../helpers/forms-question-types-allowed-values';
import { GoogleFormsEmailCollectionAllowedValues } from '../helpers/forms-email-collection-allowed-values';

const options = {
  title: {
    required: true,
    type: 'string',
    preselected: true,
  },
  description: {
    required: false,
    type: 'string',
  },
  document_title: {
    required: false,
    type: 'string',
  },
  settings: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        email_collection: {
          required: false,
          type: 'string',
          allowed_values: GoogleFormsEmailCollectionAllowedValues,
        },
        is_quiz: {
          required: false,
          type: 'bool',
          default_value: false,
        },
      },
    },
  },
  questions: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          title: {
            required: true,
            type: 'string',
          },
          type: {
            required: true,
            type: 'string',
            allowed_values: GoogleFormsQuestionTypes,
          },
          required: {
            required: false,
            type: 'bool',
            default_value: false,
            preselected: true,
          },
          help_text: {
            required: false,
            preselected: true,
            type: 'string',
          },
          choices: {
            required: false,
            type: {
              type: 'list',
              element_type: 'softstring',
            },
          },
          scale_min: {
            required: false,
            type: 'number',
            default_value: 1,
          },
          scale_max: {
            required: false,
            type: 'number',
            default_value: 5,
          },
          scale_min_label: {
            required: false,
            type: 'string',
          },
          scale_max_label: {
            required: false,
            type: 'string',
          },
          correct_answer: {
            required: false,
            type: 'string',
          },
          points: {
            required: false,
            type: 'number',
            default_value: 1,
          },
          feedback: {
            required: false,
            type: 'string',
          },
          shuffle_choices: {
            required: false,
            type: 'bool',
            default_value: false,
          },
        },
      },
    },
  },
} satisfies TQoreOptions;

type TQuestion = TQoreMappedOptions<typeof options>['questions'][number];

const createForm = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_FORMS_APP_NAME,
  action: 'create_form',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, title } = getQoreContextRequiredValues<{
      token: string;
      title: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['title'],
      connectionFields: ['token'],
      ErrorClass: GoogleFormsError,
    });

    const description = obj?.description || '';
    const document_title = obj?.document_title || title;
    const settings = obj?.settings;
    const questions = obj?.questions || [];
    const isQuiz = settings?.is_quiz || false;

    validateQuestions(questions, isQuiz);

    try {
      const formsClient = createGoogleFormsClient(token);

      const formRequest: forms_v1.Schema$Form = {
        info: {
          title,
          documentTitle: document_title,
        },
      };

      const response = await formsClient.forms.create({
        requestBody: formRequest,
      });

      const formId = response.data.formId;

      if (!formId) {
        throw new GoogleFormsError('Failed to create form: No form ID returned');
      }

      await formsClient.forms.batchUpdate({
        formId,
        requestBody: {
          requests: [
            {
              updateSettings: {
                settings: {
                  emailCollectionType: settings?.email_collection,
                  quizSettings: {
                    isQuiz,
                  },
                },
                updateMask: '*',
              },
            },
            {
              updateFormInfo: {
                info: {
                  title,
                  description,
                  documentTitle: document_title,
                },
                updateMask: '*',
              },
            },
          ],
        },
      });

      if (questions.length > 0) {
        const questionsUpdates: forms_v1.Schema$Request[] = [];

        questionsUpdates.push(
          ...questions.map((question, index) => {
            return createQuestionRequest(question, index, isQuiz);
          })
        );

        await formsClient.forms.batchUpdate({
          formId,
          requestBody: {
            requests: questionsUpdates,
          },
        });
      }

      const responderUri = response.data.responderUri;

      return {
        success: true,
        form_id: formId,
        title,
        description,
        document_title,
        question_count: questions.length,
        created_at: new Date().toISOString(),
        edit_url: responderUri ? responderUri.replace('/viewform', '/edit') : null,
        view_url: responderUri,
      };
    } catch (error: any) {
      throw new GoogleFormsError(`Failed to create Google Form: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      form_id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      document_title: { type: 'string' },
      question_count: { type: 'number' },
      created_at: { type: 'string' },
      edit_url: { type: 'string' },
      view_url: { type: 'string' },
    },
  },
});

const createQuestionRequest = (
  question: TQuestion,
  index: number,
  isQuiz: boolean
): forms_v1.Schema$Request => {
  const request: forms_v1.Schema$Request = {
    createItem: {
      item: {
        title: question.title,
        description: question.help_text || undefined,
        questionItem: {
          question: {
            required: question.required || false,
          },
        },
      },
      location: {
        index,
      },
    },
  };

  if (request.createItem?.item?.questionItem?.question) {
    const questionObj = request.createItem.item.questionItem.question;

    switch (question.type) {
      case 'TEXT':
        questionObj.textQuestion = { paragraph: false };
        break;
      case 'PARAGRAPH':
        questionObj.textQuestion = { paragraph: true };
        break;
      case 'MULTIPLE_CHOICE':
      case 'CHECKBOX':
      case 'DROPDOWN':
        if (!question.choices || question.choices.length === 0) {
          throw new GoogleFormsError(`Choices are required for ${question.type} questions`);
        }

        const choiceType =
          question.type === 'DROPDOWN'
            ? 'DROP_DOWN'
            : question.type === 'CHECKBOX'
              ? 'CHECKBOX'
              : 'RADIO';

        questionObj.choiceQuestion = {
          type: choiceType,
          options: question.choices.map((choice: string) => ({ value: choice })),
          shuffle: question.shuffle_choices || false,
        };
        break;
      case 'SCALE':
        questionObj.scaleQuestion = {
          low: question.scale_min || 1,
          high: question.scale_max || 5,
          lowLabel: question.scale_min_label || '',
          highLabel: question.scale_max_label || '',
        };
        break;
      case 'DATE':
        questionObj.dateQuestion = {
          includeYear: true,
          includeTime: false,
        };
        break;
      case 'TIME':
        questionObj.timeQuestion = {
          duration: false,
        };
        break;
      default:
        throw new GoogleFormsError(`Unsupported question type: ${question.type}`);
    }

    if (isQuiz && question.correct_answer) {
      const answers = [];

      if (question.type === 'CHECKBOX' && question.correct_answer.includes(',')) {
        answers.push(...question.correct_answer.split(',').map((answer: string) => answer.trim()));
      } else {
        answers.push(question.correct_answer.trim());
      }

      questionObj.grading = {
        pointValue: question.points ?? 1,
        correctAnswers: {
          answers: answers.map((answer) => ({ value: answer })),
        },
      };

      if (question.feedback) {
        questionObj.grading.whenRight = { text: question.feedback };
        questionObj.grading.whenWrong = { text: question.feedback };
      }
    }
  }

  return request;
};

const validateQuestions = (questions: TQuestion[], isQuiz?: boolean) => {
  if (!questions || questions.length === 0) {
    return;
  }

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const questionIndex = i + 1;

    if (!question.title || question.title.trim() === '') {
      throw new GoogleFormsError(`Question #${questionIndex} is missing a title`);
    }

    switch (question.type) {
      case 'MULTIPLE_CHOICE':
      case 'CHECKBOX':
      case 'DROPDOWN':
        if (
          !question.choices ||
          !Array.isArray(question.choices) ||
          question.choices.length === 0
        ) {
          throw new GoogleFormsError(
            `Question #${questionIndex} ("${question.title}"): ${question.type}` +
              ` type requires at least one choice option`
          );
        }

        const emptyChoices = question.choices.filter((choice) => !choice || choice.trim() === '');
        if (emptyChoices.length > 0) {
          throw new GoogleFormsError(
            `Question #${questionIndex} ("${question.title}"): Contains ${emptyChoices.length} empty choice(s)`
          );
        }
        break;

      case 'SCALE':
        const min = question.scale_min ?? 1;
        const max = question.scale_max ?? 5;

        if (typeof min !== 'number' || typeof max !== 'number') {
          throw new GoogleFormsError(
            `Question #${questionIndex} ("${question.title}"): Scale min and max must be numbers`
          );
        }

        if (min >= max) {
          throw new GoogleFormsError(
            `Question #${questionIndex} ("${question.title}"): Scale min (${min}) must be less than scale max (${max})`
          );
        }

        if (min < 0 || max > 10) {
          throw new GoogleFormsError(
            `Question #${questionIndex} ("${question.title}"): Scale values must be between 0 and 10`
          );
        }
        break;
    }

    if (isQuiz && question.correct_answer) {
      if (['TEXT', 'PARAGRAPH', 'DATE', 'TIME'].includes(question.type)) {
        throw new GoogleFormsError(
          `Question #${questionIndex} ("${question.title}"): ${question.type}` +
            ` questions cannot have correct answers in a quiz`
        );
      }

      if (['MULTIPLE_CHOICE', 'DROPDOWN'].includes(question.type)) {
        if (!question.choices.includes(question.correct_answer)) {
          throw new GoogleFormsError(
            `Question #${questionIndex} ("${question.title}"):` +
              ` Correct answer "${question.correct_answer}" is not one of the provided choices`
          );
        }
      }

      if (question.type === 'CHECKBOX') {
        const answers = question.correct_answer.split(',').map((answer: string) => answer.trim());
        for (const answer of answers) {
          if (!question.choices.includes(answer)) {
            throw new GoogleFormsError(
              `Question #${questionIndex} ("${question.title}"):` +
                ` Correct answer "${answer}" is not one of the provided choices`
            );
          }
        }
      }

      if (
        question.points !== undefined &&
        (typeof question.points !== 'number' || question.points < 0)
      ) {
        throw new GoogleFormsError(
          `Question #${questionIndex} ("${question.title}"): Points must be a positive number`
        );
      }
    }
  }
};

export default createForm;
