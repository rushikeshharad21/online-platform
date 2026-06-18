import apiClient from '../../utils/apiClient';

// १. नवीन कोर्स डेटाबेसमध्ये पाठवण्यासाठी API Call
const createCourse = async (courseData) => {
  // आपण आधी बनवलेला सुरक्षित apiClient वापरून POST रिक्वेस्ट पाठवणे
  const response = await apiClient.post('/courses/create', courseData);
  return response.data;
};

// २. सर्व पब्लिक कोर्सेस होमपेजवर दाखवण्यासाठी API Call
const getAllCourses = async () => {
  const response = await apiClient.get('/courses');
  return response.data;
};

const courseService = {
  createCourse,
  getAllCourses,
};

export default courseService;