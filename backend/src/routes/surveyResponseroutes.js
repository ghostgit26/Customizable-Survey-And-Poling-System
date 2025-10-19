const express = require('express');
const router = express.Router();
const service = require('../service/surveyResponseService');

// Create a new response
router.post('/', async (req, res) => {
  try {
    const response = await service.createSurveyResponse(req.body);
    res.status(201).json(response);
  } catch (err) {
    console.error("Survey response error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// Get all responses or check if user responded
router.get('/', async (req, res) => {
  const { surveyId, respondentEmail } = req.query;

  // If both parameters are present, check if user has already responded
  if (surveyId && respondentEmail) {
    try {
      const existingResponse = await service.hasUserResponded(surveyId, respondentEmail);
      return res.json(existingResponse ? [existingResponse] : []);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Default: get all survey responses
  try {
    const responses = await service.getAllSurveyResponses();
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get responses by survey ID (only respondentEmail and answers are returned)
router.get('/survey/:surveyId', async (req, res) => {
  try {
    const responses = await service.getResponsesBySurveyId(req.params.surveyId);
    // Format output to only respondentEmail and answers if needed
    const formatted = responses.map(r => ({
      respondentEmail: r.respondentEmail,
      answers: r.answers
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single response by response ID
router.get('/:id', async (req, res) => {
  try {
    const response = await service.getSurveyResponseById(req.params.id);
    if (!response) return res.status(404).json({ error: 'Not found' });
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a survey response
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await service.deleteSurveyResponse(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get count of responses for a specific survey
router.get('/survey/:surveyId/count', async (req, res) => {
  try {
    const count = await service.getResponseCountBySurveyId(req.params.surveyId);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;