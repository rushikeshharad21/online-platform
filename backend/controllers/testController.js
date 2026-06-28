import Test    from '../models/Test.js';
import Attempt from '../models/Attempt.js';
import Course  from '../models/Course.js';

/* ─── Helpers ────────────────────────────────────────────────── */
function grade(question, userAnswer) {
  if (userAnswer === undefined || userAnswer === null || userAnswer === '') return false;
  if (question.type === 'INTEGER') return Number(userAnswer) === Number(question.correct);
  return String(userAnswer) === String(question.correct);
}

function sanitizeQuestions(questions) {
  return questions.map(q => ({
    type:        q.type,
    difficulty:  q.difficulty,
    text:        q.text?.trim(),
    options:     q.type === 'MCQ' ? q.options?.slice(0, 4) : undefined,
    correct:     q.type === 'INTEGER' ? Number(q.correct) : q.correct,
    explanation: q.explanation?.trim() ?? '',
  }));
}

/* ─── Instructor Controllers ─────────────────────────────────── */

// POST /api/tests
export const createTest = async (req, res) => {
  try {
    const { courseId, title, description, durationSeconds, questions, allowReview } = req.body;

    const course = await Course.findById(courseId);
    if (!course) 
      return res.status(404).json({ message: 'Course not found' });

    if (String(course.instructor) !== String(req.user._id))
      return res.status(403).json({ message: 'Not your course' });

    const test = await Test.create({
      course:      courseId,
      instructor:  req.user._id,
      title,
      description,
      durationSeconds,
      questions:   sanitizeQuestions(questions),
      allowReview: allowReview ?? true,
    });

    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tests/course/:courseId
export const getTestsByCourse = async (req, res) => {
  try {
    const tests = await Test.find({ course: req.params.courseId })
      .select('-questions.correct')
      .sort({ createdAt: -1 })
      .lean();

    const ids    = tests.map(t => t._id);
    const counts = await Attempt.aggregate([
      { $match: { test: { $in: ids } } },
      { $group: { _id: '$test', count: { $sum: 1 }, avgPct: { $avg: '$percentage' } } },
    ]);
    const countMap = Object.fromEntries(counts.map(c => [String(c._id), c]));

    const enriched = tests.map(t => ({
      ...t,
      attemptCount: countMap[String(t._id)]?.count  ?? 0,
      avgScore:     countMap[String(t._id)]?.avgPct ?? null,
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/tests/:testId/publish
export const togglePublish = async (req, res) => {
  try {
    const test = await Test.findOne({ _id: req.params.testId, instructor: req.user._id });
    if (!test) 
      return res.status(404).json({ message: 'Test not found' });

    test.isPublished = !test.isPublished;
    await test.save();
    res.json({ isPublished: test.isPublished });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tests/:testId/results
export const getTestResults = async (req, res) => {
  try {
    const test = await Test.findOne({ _id: req.params.testId, instructor: req.user._id });
    if (!test) 
      return res.status(404).json({ message: 'Test not found' });

    const attempts = await Attempt.find({ test: test._id })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 })
      .lean();

    // Per-question accuracy map
    const qStats = {};
    test.questions.forEach(q => {
      qStats[String(q._id)] = {
        text:       q.text,
        type:       q.type,
        difficulty: q.difficulty,
        correct:    0,
        total:      0,
      };
    });

    attempts.forEach(a => {
      a.answers.forEach(ans => {
        const qs = qStats[String(ans.questionId)];
        if (!qs) return;
        qs.total++;
        if (ans.isCorrect) qs.correct++;
      });
    });

    const totalAttempts = attempts.length;
    const avgPct  = totalAttempts
      ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / totalAttempts)
      : 0;
    const highest = totalAttempts ? Math.max(...attempts.map(a => a.percentage)) : 0;
    const lowest  = totalAttempts ? Math.min(...attempts.map(a => a.percentage)) : 0;

    res.json({
      test: {
        _id:            test._id,
        title:          test.title,
        durationSeconds: test.durationSeconds,
        totalQuestions: test.questions.length,
      },
      summary:     { totalAttempts, avgPct, highest, lowest },
      perStudent:  attempts.map(a => ({
        student:     a.student,
        score:       a.score,
        total:       a.total,
        percentage:  a.percentage,
        timeTaken:   a.timeTakenSeconds,
        submittedAt: a.submittedAt,
        answers:     a.answers,
      })),
      perQuestion: Object.values(qStats),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── Student Controllers ────────────────────────────────────── */

// GET /api/tests/student/course/:courseId
export const getStudentTests = async (req, res) => {
  try {
    const tests = await Test.find({ course: req.params.courseId, isPublished: true })
      .select('-questions.correct -questions.explanation')
      .sort({ createdAt: -1 })
      .lean();

    const attempted = await Attempt.find({
      test:    { $in: tests.map(t => t._id) },
      student: req.user._id,
    }).select('test percentage score').lean();

    const attemptMap = Object.fromEntries(attempted.map(a => [String(a.test), a]));

    res.json(tests.map(t => ({
      ...t,
      attempt: attemptMap[String(t._id)] ?? null,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tests/:testId/attempt
export const getTestForAttempt = async (req, res) => {
  try {
    const test = await Test.findOne({ _id: req.params.testId, isPublished: true })
      .select('-questions.correct -questions.explanation')
      .lean();

    if (!test) 
      return res.status(404).json({ message: 'Test not found or not published' });

    const existing = await Attempt.findOne({ test: test._id, student: req.user._id });
    if (existing) 
      return res.status(409).json({ message: 'Already attempted', attemptId: existing._id });

    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tests/:testId/submit
export const submitAttempt = async (req, res) => {
  try {
    const { answers, timeTakenSeconds } = req.body;

    const existing = await Attempt.findOne({ test: req.params.testId, student: req.user._id });
    if (existing) 
      return res.status(409).json({ message: 'Already submitted' });

    const test = await Test.findById(req.params.testId);
    if (!test || !test.isPublished) 
      return res.status(404).json({ message: 'Test not found' });

    let score = 0;
    const gradedAnswers = test.questions.map(q => {
      const ua        = answers[String(q._id)];
      const isCorrect = grade(q, ua);
      if (isCorrect) score++;
      return { questionId: q._id, answer: ua ?? null, isCorrect };
    });

    const percentage = Math.round((score / test.questions.length) * 100);

    const attempt = await Attempt.create({
      test:             test._id,
      student:          req.user._id,
      course:           test.course,
      answers:          gradedAnswers,
      score,
      total:            test.questions.length,
      percentage,
      timeTakenSeconds: timeTakenSeconds ?? null,
    });

    res.status(201).json({
      attemptId:  attempt._id,
      score,
      total:      test.questions.length,
      percentage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tests/:testId/my-result
export const getMyResult = async (req, res) => {
  try {
    const attempt = await Attempt.findOne({
      test:    req.params.testId,
      student: req.user._id,
    }).lean();

    if (!attempt) 
      return res.status(404).json({ message: 'No attempt found' });

    const test = await Test.findById(req.params.testId).lean();

    const enrichedAnswers = attempt.answers.map(ans => {
      const q = test.questions.find(q => String(q._id) === String(ans.questionId));
      return { ...ans, question: q };
    });

    res.json({
      ...attempt,
      enrichedAnswers,
      testTitle: test.title,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};