
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LearningPathForm from './components/LearningPathForm';
import LearningPathDisplay from './components/LearningPathDisplay';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SavedPathsPage from './components/SavedPathsPage';
import AIAssistant from './components/AIAssistant'; // Import the AI Assistant

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/create-path" 
              element={<LearningPathForm />} 
            />
             <Route 
              path="/saved-paths" 
              element={<SavedPathsPage />} 
            />
            <Route 
              path="/learning-path" 
              element={<LearningPathDisplay />} 
            />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <AIAssistant /> {/* Render the AI Assistant globally */}
      </div>
    </HashRouter>
  );
};

export default App;
