
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LearningPath } from '../types';
import { getLearningPaths, deleteLearningPath } from '../localStorageService';
import { EyeIcon, TrashIcon, CalendarDaysIcon, PlusCircleIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SavedPathsPage: React.FC = () => {
  const [savedPaths, setSavedPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = () => {
    setLoading(true);
    const paths = getLearningPaths().sort((a,b) => b.createdAt - a.createdAt); // Show newest first
    setSavedPaths(paths);
    setLoading(false);
  }

  const handleViewPath = (path: LearningPath) => {
    navigate('/learning-path', { state: { learningPath: path } });
  };

  const handleDeletePath = (pathId: string) => {
    if (window.confirm("Are you sure you want to delete this learning path? This action cannot be undone.")) {
      deleteLearningPath(pathId);
      loadPaths(); // Refresh the list
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-600"></div>
        <p className="ml-3 text-lg text-slate-700">Loading saved paths...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Saved Learning Paths</h1>
        <Link
          to="/create-path"
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Create New Path
        </Link>
      </div>

      {savedPaths.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
          <DocumentMagnifyingGlassIcon className="h-20 w-20 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">No Saved Paths Yet</h2>
          <p className="text-slate-500 mb-6">
            Looks like you haven't saved any learning paths. <br/>
            Create one now to start your journey!
          </p>
        </div>
      ) : (
        <ul className="space-y-6">
          {savedPaths.map(path => (
            <li key={path.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-xl font-semibold text-sky-700 hover:text-sky-600 transition-colors mb-1">
                    <button onClick={() => handleViewPath(path)} className="text-left focus:outline-none">
                      {path.pathTitle}
                    </button>
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-slate-400"/> 
                    Created: {new Date(path.createdAt).toLocaleDateString()} | 
                    Last Updated: {new Date(path.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3 flex-shrink-0">
                  <button
                    onClick={() => handleViewPath(path)}
                    className="flex items-center text-sm text-sky-600 hover:text-sky-800 bg-sky-100 hover:bg-sky-200 py-2 px-3 rounded-md transition-colors font-medium"
                    aria-label={`View ${path.pathTitle}`}
                  >
                    <EyeIcon className="h-5 w-5 mr-1.5" /> View
                  </button>
                  <button
                    onClick={() => handleDeletePath(path.id)}
                    className="flex items-center text-sm text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 py-2 px-3 rounded-md transition-colors font-medium"
                    aria-label={`Delete ${path.pathTitle}`}
                  >
                    <TrashIcon className="h-5 w-5 mr-1.5" /> Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedPathsPage;
