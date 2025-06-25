
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateLearningPath } from '../services/geminiService';
import { LearningPathInput, GeminiLearningPathResponse, LearningPath } from '../types';
import { LightBulbIcon, DocumentTextIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { DEFAULT_LEARNING_PATH_TITLE } from '../constants';
import { addLearningPath } from '../localStorageService'; // Import localStorage service

const LearningPathForm: React.FC = () => {
  const [formData, setFormData] = useState<LearningPathInput>({
    currentSkills: '',
    targetGoal: '',
    performanceSummary: '',
    resumeText: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResumeTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, resumeText: e.target.value });
    if (fileName) setFileName(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setFormData({ ...formData, resumeText: text });
          setFileName(file.name);
          setError(null);
        };
        reader.onerror = () => {
          setError("Failed to read the resume file.");
          setFileName(null);
          setFormData({ ...formData, resumeText: ""});
        }
        reader.readAsText(file);
      } else {
        setError("Invalid file type. Please upload a .txt file.");
        setFileName(null);
        setFormData({ ...formData, resumeText: ""});
        e.target.value = '';
      }
    }
  };
  
  const clearResume = () => {
    setFormData({ ...formData, resumeText: "" });
    setFileName(null);
    const fileInput = document.getElementById('resumeFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submissionData: LearningPathInput = { ...formData };
      if (!submissionData.resumeText?.trim()) {
        delete submissionData.resumeText;
      }

      const generatedPathData: GeminiLearningPathResponse = await generateLearningPath(submissionData);
      
      if (generatedPathData.error) {
        setError(generatedPathData.error);
        setLoading(false);
        return;
      }
      
      if (!generatedPathData.phases || generatedPathData.phases.length === 0) {
        setError("The AI couldn't generate a path with the provided information. Please try refining your input.");
        setLoading(false);
        return;
      }

      const now = Date.now();
      const displayPath: LearningPath = {
        id: `path-${now}-${Math.random().toString(36).substring(2, 9)}`, // Unique ID
        pathTitle: generatedPathData.pathTitle || `${formData.targetGoal} Learning Path` || DEFAULT_LEARNING_PATH_TITLE,
        phases: generatedPathData.phases.map(phase => ({
          ...phase,
          steps: phase.steps.map((step, index) => ({
            ...step,
            id: step.id || `step_${now}_${index}`, 
            completed: false, 
          })),
        })),
        createdAt: now,
        updatedAt: now,
        journalEntries: [], // Initialize journal entries
      };
      
      addLearningPath(displayPath); // Save to localStorage
      
      navigate('/learning-path', { state: { learningPath: displayPath } });

    } catch (err: any) {
      console.error("Error in form submission or path generation:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="text-center mb-8">
        <LightBulbIcon className="mx-auto h-16 w-auto text-sky-600" />
        <h1 className="text-3xl font-bold text-slate-800 mt-4">Create Your Learning Path</h1>
        <p className="text-slate-600 mt-2">Tell us about yourself, and let AI craft your personalized journey.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
          <p className="font-semibold">Oops! Something went wrong:</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="currentSkills" className={labelClass}>
            Your Current Job Title or Key Skills
          </label>
          <input
            type="text"
            name="currentSkills"
            id="currentSkills"
            value={formData.currentSkills}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g., Junior Web Developer, Python, JavaScript, SQL"
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="targetGoal" className={labelClass}>
            Your Target Role or Career Goal
          </label>
          <input
            type="text"
            name="targetGoal"
            id="targetGoal"
            value={formData.targetGoal}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g., Become a Data Scientist, Master Full-Stack Development"
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="performanceSummary" className={labelClass}>
            Short Summary of Performance or Areas You're Struggling With (Optional)
          </label>
          <textarea
            name="performanceSummary"
            id="performanceSummary"
            rows={4}
            value={formData.performanceSummary}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g., Good at frontend but weak in backend, struggle with data structures, want to improve project management skills."
          />
        </div>

        <div className="space-y-2 p-4 border border-slate-200 rounded-md bg-slate-50">
          <label className={`${labelClass} flex items-center`}>
            <DocumentTextIcon className="h-5 w-5 mr-2 text-sky-600" />
            Resume Information (Optional)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            You can upload a .txt file of your resume or paste the text directly. This helps the AI better understand your experience.
          </p>
          
          <div>
            <label htmlFor="resumeFile" className={labelClass}>
              Upload Resume (.txt file)
            </label>
            <input
              type="file"
              name="resumeFile"
              id="resumeFile"
              accept=".txt"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-slate-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-sky-50 file:text-sky-700
                         hover:file:bg-sky-100"
              aria-describedby="resume-feedback"
            />
            {fileName && (
              <div id="resume-feedback" className="mt-2 text-sm text-green-600">
                Uploaded: {fileName}
              </div>
            )}
          </div>

          <div className="relative">
             <label htmlFor="resumeText" className={labelClass}>
              Or Paste Resume Text
            </label>
            <textarea
              name="resumeText"
              id="resumeText"
              rows={6}
              value={formData.resumeText || ""}
              onChange={handleResumeTextChange}
              className={`${inputClass} pr-10`}
              placeholder="Paste your resume text here..."
              aria-label="Paste resume text"
            />
            {(formData.resumeText || fileName) && (
                 <button 
                    type="button" 
                    onClick={clearResume}
                    className="absolute top-9 right-2 p-1 text-slate-400 hover:text-red-500"
                    aria-label="Clear resume information"
                  >
                  <XCircleIcon className="h-5 w-5"/>
                </button>
            )}
          </div>
        </div>


        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : null}
            {loading ? 'Generating Your Path...' : 'Generate My Learning Path'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LearningPathForm;