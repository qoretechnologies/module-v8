import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const HuggingFaceTaskAllowedValues = [
  // Natural Language Processing
  { value: 'text-classification', display_name: 'Text Classification' },
  { value: 'token-classification', display_name: 'Token Classification' },
  { value: 'table-question-answering', display_name: 'Table Question Answering' },
  { value: 'question-answering', display_name: 'Question Answering' },
  { value: 'zero-shot-classification', display_name: 'Zero-Shot Classification' },
  { value: 'translation', display_name: 'Translation' },
  { value: 'summarization', display_name: 'Summarization' },
  { value: 'feature-extraction', display_name: 'Feature Extraction' },
  { value: 'text-generation', display_name: 'Text Generation' },
  { value: 'fill-mask', display_name: 'Fill-Mask' },
  { value: 'sentence-similarity', display_name: 'Sentence Similarity' },
  { value: 'multiple-choice', display_name: 'Multiple Choice' },
  { value: 'text-ranking', display_name: 'Text Ranking' },
  { value: 'text-retrieval', display_name: 'Text Retrieval' },
  { value: 'table-to-text', display_name: 'Table to Text' },

  // Audio
  { value: 'text-to-speech', display_name: 'Text-to-Speech' },
  { value: 'text-to-audio', display_name: 'Text-to-Audio' },
  { value: 'automatic-speech-recognition', display_name: 'Automatic Speech Recognition' },
  { value: 'audio-to-audio', display_name: 'Audio-to-Audio' },
  { value: 'audio-classification', display_name: 'Audio Classification' },
  { value: 'voice-activity-detection', display_name: 'Voice Activity Detection' },

  // Computer Vision
  { value: 'depth-estimation', display_name: 'Depth Estimation' },
  { value: 'image-classification', display_name: 'Image Classification' },
  { value: 'object-detection', display_name: 'Object Detection' },
  { value: 'image-segmentation', display_name: 'Image Segmentation' },
  { value: 'text-to-image', display_name: 'Text-to-Image' },
  { value: 'image-to-text', display_name: 'Image-to-Text' },
  { value: 'image-to-image', display_name: 'Image-to-Image' },
  { value: 'image-to-video', display_name: 'Image-to-Video' },
  { value: 'unconditional-image-generation', display_name: 'Unconditional Image Generation' },
  { value: 'video-classification', display_name: 'Video Classification' },
  { value: 'zero-shot-image-classification', display_name: 'Zero-Shot Image Classification' },
  { value: 'mask-generation', display_name: 'Mask Generation' },
  { value: 'zero-shot-object-detection', display_name: 'Zero-Shot Object Detection' },
  { value: 'text-to-3d', display_name: 'Text-to-3D' },
  { value: 'image-to-3d', display_name: 'Image-to-3D' },
  { value: 'image-feature-extraction', display_name: 'Image Feature Extraction' },
  { value: 'text-to-video', display_name: 'Text-to-Video' },
  { value: 'keypoint-detection', display_name: 'Keypoint Detection' },
  { value: 'video-to-video', display_name: 'Video-to-Video' },

  // Multimodal
  { value: 'audio-text-to-text', display_name: 'Audio-Text-to-Text' },
  { value: 'image-text-to-text', display_name: 'Image-Text-to-Text' },
  { value: 'visual-question-answering', display_name: 'Visual Question Answering' },
  { value: 'document-question-answering', display_name: 'Document Question Answering' },
  { value: 'video-text-to-text', display_name: 'Video-Text-to-Text' },
  { value: 'visual-document-retrieval', display_name: 'Visual Document Retrieval' },
  { value: 'any-to-any', display_name: 'Any-to-Any' },

  // Reinforcement Learning
  { value: 'reinforcement-learning', display_name: 'Reinforcement Learning' },
  { value: 'robotics', display_name: 'Robotics' },

  // Tabular
  { value: 'tabular-classification', display_name: 'Tabular Classification' },
  { value: 'tabular-regression', display_name: 'Tabular Regression' },
  { value: 'tabular-to-text', display_name: 'Tabular to Text' },
  { value: 'time-series-forecasting', display_name: 'Time Series Forecasting' },

  // Other
  { value: 'graph-ml', display_name: 'Graph Machine Learning' },
  { value: 'other', display_name: 'Other' },
] satisfies IQoreAllowedValue<string>[];
