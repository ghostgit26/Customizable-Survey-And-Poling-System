const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
id: { type: String, required: true }, // UUID from frontend
type: { type: String, enum: ["text", "singleChoice", "multipleChoice", "dropdown","date"], required: true },
title: { type: String, required: true },
required: { type: Boolean, default: false },
options: [String], // Only for choice types
});

const SurveySchema = new mongoose.Schema({
title: { type: String, required: true },
description: String,
isPrivate: { type: Boolean, default: false },
allowedEmails: [String],
questions: [QuestionSchema],
bgColor: { type: String, default: "#ffffff" },
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who created the survey
isActive: { type: Boolean, default: true }, 
createdAt: { type: Date, default: Date.now },

});
module.exports = mongoose.model('Survey', SurveySchema);