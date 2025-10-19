const Survey = require('../model/survey');

// Create survey, now supports bgColor
async function createSurvey(data, userId) {
  const surveyData = {
    ...data,
    createdBy: userId,
    bgColor: data.bgColor || "#ffffff", // default white
  };
  const survey = new Survey(surveyData);
  return await survey.save();
}

// Get all surveys

async function getSurveys() {
return await Survey.find()
.sort({ createdAt: -1 })
.populate('createdBy', 'name email');

}

// Get survey by ID with access control

async function getSurveyById(id, userEmail) {
    const survey = await Survey.findById(id).populate('createdBy', 'name email');
    if (!survey) return null;
  
    // Always allow access if user is the creator
    if (survey.isPrivate) {
      if (
        survey.createdBy.email !== userEmail && // If not creator
        !survey.allowedEmails.includes(userEmail) // and not in allowed emails
      ) {
        const err = new Error('Access denied');
        err.status = 403;
        throw err;
      }
    }
  
    return survey;
  }
  

// Update survey by ID

async function updateSurvey(id, updates) {
return await Survey.findByIdAndUpdate(id, updates, { new: true });

}

// Delete survey by ID

async function deleteSurvey(id) {
return await Survey.findByIdAndDelete(id);

}

//to particular user
async function getSurveysByUser(userId) {
  return await Survey.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email');
}
async function getSurveyByIdRaw(id) {
  return await Survey.findById(id);
}

async function getActiveSurveysByUser(userId) {
  return await Survey.find({ createdBy: userId, isActive: true })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email');
}


module.exports = {
createSurvey,
getSurveys,
getSurveyById,
updateSurvey,
deleteSurvey,
getSurveysByUser,
getSurveyByIdRaw,
getActiveSurveysByUser,
};
