
import React, { useState, useEffect } from 'react';
import { LearningPath, LearningPathPhase, LearningPathStep, JournalEntry } from '../types';
import { AcademicCapIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, ListBulletIcon, BookOpenIcon, CogIcon, ClockIcon, ArrowUturnLeftIcon, InboxIcon, CalendarDaysIcon, PlusIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { updateLearningPath, getLearningPathById } from '../localStorageService'; 
import AIAssistant from './AIAssistant'; // Import the new AI Assistant

const StepItem: React.FC<{ 
  step: LearningPathStep, 
  phaseIndex: number, 
  stepIndex: number, 
  onToggleComplete: (phaseIdx: number, stepIdx: number, completed: boolean) => void 
}> = ({ step, phaseIndex, stepIndex, onToggleComplete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <li className="py-4 px-1 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation(); 
              onToggleComplete(phaseIndex, stepIndex, !step.completed);
            }}
            className={`mr-3 p-1 rounded-full focus:outline-none focus:ring-2 ${step.completed ? 'focus:ring-green-400' : 'focus:ring-sky-400'}`}
            aria-label={step.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {step.completed ? (
              <CheckCircleSolidIcon className="h-7 w-7 text-green-500" />
            ) : (
              <CheckCircleIcon className="h-7 w-7 text-slate-400 hover:text-sky-500" />
            )}
          </button>
          <span className={`text-lg font-medium ${step.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
            {step.title}
          </span>
        </div>
        {isExpanded ? <ChevronUpIcon className="h-5 w-5 text-slate-500" /> : <ChevronDownIcon className="h-5 w-5 text-slate-500" />}
      </div>
      {isExpanded && (
        <div className="mt-3 pl-10 pr-4 text-sm text-slate-600 space-y-3">
          <p>{step.description}</p>
          {step.duration && (
            <div className="flex items-center text-xs text-sky-700 bg-sky-100 px-2 py-1 rounded-full w-fit">
              <ClockIcon className="h-4 w-4 mr-1" /> Estimated: {step.duration}
            </div>
          )}
          {step.resources && step.resources.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-700 mb-1">Resources:</h4>
              <ul className="list-disc list-inside space-y-1">
                {step.resources.map((resource, idx) => (
                  <li key={idx} className="flex items-start">
                    {resource.toLowerCase().includes("book:") ? <BookOpenIcon className="h-4 w-4 mr-2 mt-0.5 text-sky-600 flex-shrink-0" /> : 
                     resource.toLowerCase().includes("tool:") || resource.toLowerCase().includes("software:") ? <CogIcon className="h-4 w-4 mr-2 mt-0.5 text-sky-600 flex-shrink-0" /> :
                     <ListBulletIcon className="h-4 w-4 mr-2 mt-0.5 text-sky-600 flex-shrink-0" /> }
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

const PhaseItem: React.FC<{ 
  phase: LearningPathPhase, 
  phaseIndex: number, 
  onToggleComplete: (phaseIdx: number, stepIdx: number, completed: boolean) => void 
}> = ({ phase, phaseIndex, onToggleComplete }) => {
  const [isExpanded, setIsExpanded] = useState(phaseIndex === 0);

  return (
    <div className="mb-8 p-6 bg-slate-50 rounded-xl shadow-lg">
      <div 
        className="flex justify-between items-center cursor-pointer py-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-2xl font-semibold text-sky-700">{phase.phaseTitle}</h3>
        {isExpanded ? <ChevronUpIcon className="h-6 w-6 text-sky-600" /> : <ChevronDownIcon className="h-6 w-6 text-sky-600" />}
      </div>
      {isExpanded && (
        <ul className="mt-4 space-y-3">
          {phase.steps.map((step, stepIndex) => (
            <StepItem 
              key={step.id || `step-${phaseIndex}-${stepIndex}`} 
              step={step} 
              phaseIndex={phaseIndex} 
              stepIndex={stepIndex} 
              onToggleComplete={onToggleComplete} 
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const LearningPathDisplay: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // State for new journal entry
  const [journalDate, setJournalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [journalNotes, setJournalNotes] = useState<string>('');


  useEffect(() => {
    setLoading(true);
    const pathFromState = location.state?.learningPath as LearningPath | undefined;
    
    if (pathFromState && pathFromState.id) {
      const storedPath = getLearningPathById(pathFromState.id);
      setLearningPath(storedPath || pathFromState);
    } else {
      // If no path in state, try to get pathId from URL (if we implement direct links later)
      // For now, if no state, it's an invalid access or direct navigation without context.
      const pathIdFromUrl = new URLSearchParams(location.search).get('pathId');
      if (pathIdFromUrl) {
          const storedPath = getLearningPathById(pathIdFromUrl);
          if (storedPath) {
              setLearningPath(storedPath);
          } else {
              setError(`Learning path with ID "${pathIdFromUrl}" not found.`);
              setLearningPath(null);
          }
      } else if (!pathFromState) {
         setLearningPath(null); // No path found via state or URL
      }
    }
    setLoading(false);
  }, [location.state, location.search]);

  const handleToggleComplete = (phaseIndex: number, stepIndex: number, completed: boolean) => {
    setLearningPath(prevPath => {
      if (!prevPath) return null;
      
      const newPhases = prevPath.phases.map((phase, pIdx) => {
        if (pIdx === phaseIndex) {
          return {
            ...phase,
            steps: phase.steps.map((step, sIdx) => {
              if (sIdx === stepIndex) {
                return { ...step, completed };
              }
              return step;
            }),
          };
        }
        return phase;
      });
      
      const updatedData = { ...prevPath, phases: newPhases, updatedAt: Date.now() };
      updateLearningPath(updatedData);
      return updatedData;
    });
  };

  const handleAddJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalDate || !journalTitle.trim()) {
      alert("Please provide a date and title for your journal entry.");
      return;
    }
    setLearningPath(prevPath => {
      if (!prevPath) return null;
      const newEntry: JournalEntry = {
        id: `journal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        date: journalDate,
        title: journalTitle.trim(),
        notes: journalNotes.trim(),
      };
      const updatedJournalEntries = [...(prevPath.journalEntries || []), newEntry];
      const updatedData = { ...prevPath, journalEntries: updatedJournalEntries, updatedAt: Date.now() };
      updateLearningPath(updatedData);
      
      // Reset form
      setJournalDate(new Date().toISOString().split('T')[0]);
      setJournalTitle('');
      setJournalNotes('');
      return updatedData;
    });
  };

  const handleDeleteJournalEntry = (entryId: string) => {
    if (!window.confirm("Are you sure you want to delete this journal entry?")) return;
    setLearningPath(prevPath => {
      if (!prevPath || !prevPath.journalEntries) return prevPath;
      const updatedJournalEntries = prevPath.journalEntries.filter(entry => entry.id !== entryId);
      const updatedData = { ...prevPath, journalEntries: updatedJournalEntries, updatedAt: Date.now() };
      updateLearningPath(updatedData);
      return updatedData;
    });
  };
  
  const calculateProgress = () => {
    if (!learningPath || !learningPath.phases) return 0;
    let totalSteps = 0;
    let completedSteps = 0;
    learningPath.phases.forEach(phase => {
      phase.steps.forEach(step => {
        totalSteps++;
        if (step.completed) {
          completedSteps++;
        }
      });
    });
    return totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-600"></div>
        <p className="ml-3 text-lg text-slate-700">Loading learning path...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="text-center p-8 bg-red-50 rounded-lg shadow">
        <p className="text-red-600 text-xl font-semibold">Error: {error}</p>
        <button 
          onClick={() => navigate('/create-path')} 
          className="mt-4 inline-block bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-700 transition"
        >
          Try Creating a New Path
        </button>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="text-center p-10 bg-white rounded-xl shadow-xl">
        <InboxIcon className="h-20 w-20 text-sky-500 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-slate-800 mb-3">No Learning Path Loaded</h2>
        <p className="text-slate-600 mb-8">
          To view a learning path, please generate a new one or select from your saved paths.
        </p>
        <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
          <Link 
            to="/create-path" 
            className="w-full sm:w-auto inline-flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors text-lg"
          >
            <AcademicCapIcon className="h-5 w-5 mr-2"/>
            Create New Path
          </Link>
          <Link 
            to="/saved-paths" 
            className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors text-lg"
          >
             <ArrowUturnLeftIcon className="h-5 w-5 mr-2"/>
            View Saved Paths
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const sortedJournalEntries = learningPath.journalEntries ? 
    [...learningPath.journalEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  return (
    <div className="max-w-4xl mx-auto pb-20"> {/* Added pb-20 for AIAssistant spacing */}
      <div className="bg-white p-8 rounded-xl shadow-2xl mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-sky-800 mb-3 md:mb-0">{learningPath.pathTitle}</h1>
            <div className="flex space-x-3">
              <Link 
                to="/saved-paths" 
                className="text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 py-2 px-4 rounded-lg transition-colors font-medium flex items-center"
              >
                <ArrowUturnLeftIcon className="h-4 w-4 mr-1.5"/>
                Back to Saved Paths
              </Link>
              <Link 
                to="/create-path" 
                className="text-sm bg-sky-100 text-sky-700 hover:bg-sky-200 py-2 px-4 rounded-lg transition-colors font-medium flex items-center"
              >
                <AcademicCapIcon className="h-4 w-4 mr-1.5"/>
                New Path
              </Link>
            </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-sky-700">Overall Progress</span>
            <span className="text-sm font-medium text-sky-700">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
              aria-label={`Learning path progress: ${progress}%`}
            ></div>
          </div>
        </div>
        {learningPath.updatedAt && (
            <p className="text-xs text-slate-500">Last updated: {new Date(learningPath.updatedAt).toLocaleString()}</p>
        )}
      </div>

      {/* Learning Path Phases */}
      {learningPath.phases.map((phase, index) => (
        <PhaseItem 
          key={phase.phaseTitle + index} 
          phase={phase} 
          phaseIndex={index} 
          onToggleComplete={handleToggleComplete} 
        />
      ))}
       {learningPath.phases.length === 0 && (
         <div className="text-center p-6 bg-slate-100 rounded-lg mb-8">
            <p className="text-slate-600">This learning path currently has no phases or steps.</p>
         </div>
       )}

      {/* Progress Journal Section */}
      <div className="mt-12 p-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-2xl font-semibold text-sky-800 mb-6 flex items-center">
          <PencilSquareIcon className="h-7 w-7 mr-2 text-sky-600" />
          My Progress Journal
        </h2>
        
        <form onSubmit={handleAddJournalEntry} className="mb-8 p-6 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
          <h3 className="text-lg font-medium text-slate-700">Add New Entry</h3>
          <div>
            <label htmlFor="journalDate" className="block text-sm font-medium text-slate-600 mb-1">Date</label>
            <input 
              type="date" 
              id="journalDate" 
              value={journalDate} 
              onChange={(e) => setJournalDate(e.target.value)}
              className="mt-1 block w-full sm:w-1/2 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              required 
            />
          </div>
          <div>
            <label htmlFor="journalTitle" className="block text-sm font-medium text-slate-600 mb-1">Title</label>
            <input 
              type="text" 
              id="journalTitle" 
              placeholder="e.g., Completed Python Basics"
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              required 
            />
          </div>
          <div>
            <label htmlFor="journalNotes" className="block text-sm font-medium text-slate-600 mb-1">Notes (Optional)</label>
            <textarea 
              id="journalNotes"
              rows={3}
              placeholder="Any thoughts, challenges, or achievements..."
              value={journalNotes}
              onChange={(e) => setJournalNotes(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>
          <button 
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow-sm transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Journal Entry
          </button>
        </form>

        {sortedJournalEntries.length > 0 ? (
          <ul className="space-y-6">
            {sortedJournalEntries.map(entry => (
              <li key={entry.id} className="p-4 bg-slate-50 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg text-slate-800">{entry.title}</h4>
                    <p className="text-sm text-slate-500 flex items-center mb-1">
                      <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-slate-400" /> 
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteJournalEntry(entry.id)}
                    className="p-1 text-slate-400 hover:text-red-500"
                    aria-label="Delete journal entry"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                {entry.notes && <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{entry.notes}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-500 py-4">No journal entries yet. Add one above to start tracking your progress!</p>
        )}
      </div>
      
      {/* AI Assistant */}
      <AIAssistant />

    </div>
  );
};

export default LearningPathDisplay;
