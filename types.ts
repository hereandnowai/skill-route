// AppUser (FirebaseUser) is removed as Firebase Auth is no longer used.

export interface LearningPathInput {
  currentSkills: string;
  targetGoal: string;
  performanceSummary: string;
  resumeText?: string; // Added for resume content
}

export interface LearningPathStep {
  id: string; // Should be provided by Gemini or generated client-side
  title: string;
  description: string;
  resources: string[];
  duration: string;
  completed: boolean; // Managed client-side
}

export interface LearningPathPhase {
  phaseTitle: string;
  steps: LearningPathStep[];
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  notes: string;
}

// Updated LearningPath for client-side display and localStorage
export interface LearningPath {
  id: string; // Unique identifier for the path
  pathTitle: string;
  phases: LearningPathPhase[];
  createdAt: number; // Timestamp of creation
  updatedAt: number; // Timestamp of last update
  journalEntries?: JournalEntry[]; // Added for calendar/journal functionality
}

// Expected structure from Gemini API for learning path
export interface GeminiLearningPathResponse {
  pathTitle: string;
  phases: Array<{
    phaseTitle: string;
    steps: Array<{
      id: string; 
      title: string;
      description: string;
      resources: string[];
      duration: string;
    }>;
  }>;
  error?: string; // Optional error message from Gemini
}