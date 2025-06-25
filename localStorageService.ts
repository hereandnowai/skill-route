import { LearningPath } from './types';

const STORAGE_KEY = 'skillRouteLearningPaths';

export const getLearningPaths = (): LearningPath[] => {
  try {
    const pathsJson = localStorage.getItem(STORAGE_KEY);
    return pathsJson ? JSON.parse(pathsJson) : [];
  } catch (error) {
    console.error("Error retrieving learning paths from localStorage:", error);
    return [];
  }
};

export const saveLearningPaths = (paths: LearningPath[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
  } catch (error) {
    console.error("Error saving learning paths to localStorage:", error);
  }
};

export const addLearningPath = (newPath: LearningPath): void => {
  const paths = getLearningPaths();
  paths.push(newPath);
  saveLearningPaths(paths);
};

export const updateLearningPath = (updatedPath: LearningPath): void => {
  let paths = getLearningPaths();
  paths = paths.map(path => (path.id === updatedPath.id ? updatedPath : path));
  saveLearningPaths(paths);
};

export const getLearningPathById = (id: string): LearningPath | undefined => {
  const paths = getLearningPaths();
  return paths.find(path => path.id === id);
};

export const deleteLearningPath = (id: string): void => {
  let paths = getLearningPaths();
  paths = paths.filter(path => path.id !== id);
  saveLearningPaths(paths);
};
