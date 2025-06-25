
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';
// AcademicCapIcon is removed as it's replaced by the logo image

const Navbar: React.FC = () => {
  const companyLogoUrl = "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/HNAI%20Title%20-Teal%20%26%20Golden%20Logo%20-%20DESIGN%203%20-%20Raj-07.png";

  return (
    <nav className="bg-sky-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 text-2xl font-bold hover:text-sky-200 transition-colors">
          <img src={companyLogoUrl} alt={`${APP_NAME} Logo`} className="h-10 w-auto" /> {/* Increased size slightly */}
          <span>{APP_NAME}</span>
        </Link>
        <div className="space-x-4 flex items-center">
          <Link to="/" className="hover:text-sky-200 transition-colors px-3 py-2 rounded-md text-sm font-medium">Home</Link>
          <Link to="/create-path" className="hover:text-sky-200 transition-colors px-3 py-2 rounded-md text-sm font-medium">New Path</Link>
          <Link to="/saved-paths" className="hover:text-sky-200 transition-colors px-3 py-2 rounded-md text-sm font-medium">Saved Paths</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
