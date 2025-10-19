
const express = require('express');
const router = express.Router();
const surveyService = require('../service/surveyService');
const protect = require('../middleware/auth');

// Get active surveys created by the authenticated user
router.get('/my-active-surveys', protect, async (req, res) => {
  try {
    const activeSurveys = await surveyService.getActiveSurveysByUser(req.user._id);
    res.json({ count: activeSurveys.length, surveys: activeSurveys });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/', protect, async (req, res) => {
try {
if (!req.user || !req.user._id) {
return res.status(401).json({ error: 'Authentication required' });
}
const survey = await surveyService.createSurvey(req.body, req.user._id);
res.status(201).json(survey);
} catch (err) {
res.status(400).json({ error: err.message });
}
});

// Get all surveys

router.get('/', async (req, res) => {
try {
const surveys = await surveyService.getSurveys();
res.json(surveys);
} catch (err) {
res.status(500).json({ error: err.message });
}
});

// Get surveys created by the current logged-in user
router.get('/mine', protect, async (req, res) => {
  // console.log("Authenticated user in /mine route:", req.user);
  try {
    const surveys = await surveyService.getSurveysByUser(req.user._id);
    res.json({ surveys });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single survey with access control

router.get('/:id', protect, async (req, res) => {
try {
if (!req.user || !req.user.email) {
return res.status(401).json({ error: 'Authentication required' });
}
const survey = await surveyService.getSurveyById(req.params.id, req.user.email);
if (!survey) return res.status(404).json({ error: 'Survey not found' });
res.json(survey);
} catch (err) {
if (err.status === 403) {
return res.status(403).json({ error: 'You do not have access to this survey' });
}
res.status(500).json({ error: err.message });

  }

});

// Update survey by ID

router.put('/:id', protect, async (req, res) => {

  try {
    const updated = await surveyService.updateSurvey(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Survey not found' });
    res.json(updated);
} catch (err) {
    res.status(400).json({ error: err.message });
}

});

// Delete survey by ID

router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await surveyService.deleteSurvey(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Survey not found' });
    res.json({ message: 'Survey deleted successfully' });
}   catch (err) {
    res.status(500).json({ error: err.message });

  }

});
//for active inactice button
// surveyRoutes.js (add below other routes)

router.patch('/toggle-active/:id', protect, async (req, res) => {
  try {
    const surveyId = req.params.id;
    const userId = req.user._id;

    const survey = await surveyService.getSurveyByIdRaw(surveyId);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });

    if (survey.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this survey' });
    }

    survey.isActive = !survey.isActive;
    await survey.save();

    res.json({ message: `Survey is now ${survey.isActive ? 'active' : 'inactive'}`, isActive: survey.isActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;