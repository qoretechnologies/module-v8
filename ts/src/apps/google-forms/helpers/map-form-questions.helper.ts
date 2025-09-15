import { forms_v1 } from '@googleapis/forms';

type TFormQuestion = {
  id: string;
  title: string;
  type: string;
  help_text: string;
  required: boolean;
  choices: string[];
  scale_min: number;
  scale_max: number;
  scale_min_label: string;
  scale_max_label: string;
  correct_answer: string;
  points: number;
  feedback: string;
  shuffle_choices: boolean;
};

export const mapGoogleFormsQuestions = (form: forms_v1.Schema$Form): TFormQuestion[] => {
  if (!form.items || form.items.length === 0) return [];

  const filteredQuestions = form.items.filter(
    (question) => question.questionGroupItem || question.questionItem
  );

  const questions: TFormQuestion[] = filteredQuestions.flatMap((question) => {
    if (question.questionGroupItem?.questions) {
      const title = question.title || 'Untitled Group';
      const choices =
        question.questionGroupItem.grid?.columns?.options?.map((option) => option.value || '') ||
        [];
      const description = question.description;
      const type = question.questionGroupItem.grid?.columns?.type;

      return question.questionGroupItem.questions.map((item) => ({
        id: item.questionId || '',
        title: `[${title}] - ${item.rowQuestion?.title || 'Untitled Question'}`,
        type,
        help_text: description || '',
        required: item.required || false,
        ...(item.grading && {
          points: item.grading.pointValue || 0,
          choices,
          correct_answer: item.grading.correctAnswers?.answers
            ?.map((answer) => answer.value || '')
            .join(', '),
        }),
      }));
    }

    const questionItem = question.questionItem?.question;
    const title = question.title || 'Untitled Question';
    const required = questionItem?.required || false;
    const description = question.description || '';

    const commonFields = {
      id: questionItem?.questionId || '',
      title,
      required,
      help_text: description || '',
    };

    if (questionItem?.textQuestion) {
      return {
        ...commonFields,
        type: questionItem.textQuestion.paragraph ? 'PARAGRAPH' : 'TEXT',
      };
    } else if (questionItem?.choiceQuestion) {
      const choiceQuestion = questionItem.choiceQuestion;
      const type =
        choiceQuestion.type === 'RADIO'
          ? 'MULTIPLE_CHOICE'
          : choiceQuestion.type === 'CHECKBOX'
            ? 'CHECKBOX'
            : 'DROPDOWN';

      const questionData: Record<string, any> = {
        ...commonFields,
        type,
        choices: (choiceQuestion.options || []).map((option) => option.value || ''),
        shuffle_choices: choiceQuestion.shuffle || false,
      };

      if (questionItem.grading) {
        questionData.points = questionItem.grading.pointValue || 0;
        if (questionItem.grading.correctAnswers?.answers) {
          questionData.correct_answer = questionItem.grading.correctAnswers.answers
            .map((answer) => answer.value || '')
            .join(', ');
        }
        questionData.feedback = questionItem.grading.whenRight?.text || '';
      }

      return questionData;
    } else if (questionItem?.scaleQuestion) {
      const scaleQuestion = questionItem.scaleQuestion;

      return {
        ...commonFields,
        type: 'SCALE',
        scale_min: scaleQuestion.low || 1,
        scale_max: scaleQuestion.high || 5,
        scale_min_label: scaleQuestion.lowLabel || '',
        scale_max_label: scaleQuestion.highLabel || '',
      };
    } else if (questionItem?.dateQuestion) {
      return {
        ...commonFields,
        type: 'DATE',
      };
    } else if (questionItem?.timeQuestion) {
      return {
        ...commonFields,
        type: 'TIME',
      };
    } else {
      return {
        ...commonFields,
        type: 'UNKNOWN',
      };
    }
  });

  return questions;
};
