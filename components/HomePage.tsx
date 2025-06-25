
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { SparklesIcon, UserGroupIcon, PencilSquareIcon, CheckBadgeIcon, PresentationChartLineIcon, LightBulbIcon, MagnifyingGlassCircleIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-center w-12 h-12 bg-sky-100 text-sky-600 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm">{description}</p>
  </div>
);

const HomePage: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white py-20 px-4 rounded-xl shadow-2xl">
        <div className="container mx-auto text-center">
          <SparklesIcon className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to {APP_NAME} – Your Personalized Learning Journey Starts Here!
          </h1>
          <p className="text-lg md:text-xl mb-8 text-sky-100">
            Unlock your potential with AI-powered learning plans tailored to your unique goals and skills.
          </p>
          <div className="space-x-4">
            <Link
              to="/create-path"
              className="bg-white text-sky-700 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-sky-50 transition-colors text-lg"
            >
              Get Started
            </Link>
            {/* "Log In / Sign Up" button removed as Firebase Auth is no longer used */}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">How It Works in 3 Simple Steps</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <PencilSquareIcon className="h-12 w-12 text-sky-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">1. Define Your Goal</h3>
            <p className="text-slate-600">Enter your current skills, career aspirations, and any performance insights.</p>
          </div>
          <div className="p-6">
            <LightBulbIcon className="h-12 w-12 text-sky-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">2. AI Generates Your Path</h3>
            <p className="text-slate-600">Our intelligent system analyzes your input and crafts a unique learning roadmap.</p>
          </div>
          <div className="p-6">
            <CheckBadgeIcon className="h-12 w-12 text-sky-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">3. Learn & Track</h3>
            <p className="text-slate-600">Follow your personalized plan, mark progress, and achieve your objectives.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Why Choose {APP_NAME}?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<PresentationChartLineIcon className="h-6 w-6" />}
            title="Personalized Plans"
            description="Tailored learning journeys designed specifically for your ambitions and current skill level."
          />
          <FeatureCard 
            icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
            title="Career Growth Tracking"
            description="Visualize your progress and stay motivated as you move closer to your career goals."
          />
          <FeatureCard 
            icon={<MagnifyingGlassCircleIcon className="h-6 w-6" />}
            title="Skill Gap Detection"
            description="AI identifies exactly what you need to learn to bridge the gap to your target role."
          />
          <FeatureCard 
            icon={<LightBulbIcon className="h-6 w-6" />}
            title="AI Recommendations"
            description="Get smart suggestions for courses, tools, books, and tasks relevant to your path."
          />
        </div>
      </section>

    </div>
  );
};

export default HomePage;
