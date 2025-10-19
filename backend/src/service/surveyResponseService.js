const SurveyResponse = require('../model/surveyresponse');
const Survey = require('../model/survey'); // <-- Required to check survey activity

// Create a new survey response (with duplicate check and isActive check)
async function createSurveyResponse(data) {
  // 1. Check if survey exists and is active
  const survey = await Survey.findById(data.surveyId);
  if (!survey) {
    throw new Error("Survey not found.");
  }
  if (!survey.isActive) {
    throw new Error("This survey is inactive and not accepting responses.");
  }

  // 2. Prevent duplicate responses from same email for the same survey
  const existing = await SurveyResponse.findOne({
    surveyId: data.surveyId,
    respondentEmail: data.respondentEmail,
  });

  if (existing) {
    throw new Error("You have already submitted this survey.");
  }

  // 3. Save the response
  const response = new SurveyResponse(data);
  return await response.save();
}

// Get all responses
async function getAllSurveyResponses() {
  return await SurveyResponse.find().sort({ submittedAt: -1 });
}

// Get all responses for a specific survey (only respondentEmail and answers)
async function getResponsesBySurveyId(surveyId) {
  return await SurveyResponse.find({ surveyId })
    .sort({ submittedAt: -1 })
    .select('respondentEmail answers -_id');
}

// Get a specific response by ID
async function getSurveyResponseById(id) {
  return await SurveyResponse.findById(id);
}

// Delete a survey response
async function deleteSurveyResponse(id) {
  return await SurveyResponse.findByIdAndDelete(id);
}

// Check if user has already responded to a survey
async function hasUserResponded(surveyId, respondentEmail) {
  return await SurveyResponse.findOne({ surveyId, respondentEmail });
}

async function getResponseCountBySurveyId(surveyId) {
  return await SurveyResponse.countDocuments({ surveyId });
}

module.exports = {
  createSurveyResponse,
  getAllSurveyResponses,
  getResponsesBySurveyId,
  getSurveyResponseById,
  deleteSurveyResponse,
  hasUserResponded,
  getResponseCountBySurveyId
};