const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  answer: mongoose.Schema.Types.Mixed,
});

const SurveyResponseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  respondentEmail: { type: String, required: true },
  answers: [AnswerSchema],
  submittedAt: { type: Date, default: Date.now },
});

SurveyResponseSchema.index({ surveyId: 1, respondentEmail: 1 }, { unique: true }); // Prevent duplicate submissions

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);