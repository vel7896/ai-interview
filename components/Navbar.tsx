
import React from 'react';
import { RobotIcon, HomeIcon, InfoIcon, UserIcon, LogoutIcon } from './ui/icons';

interface NavbarProps {
  onHome: () => void;
  onAbout: () => void;
  onProfile: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onHome, onAbout, onProfile, onLogout }) => {
  return (
    <nav className="w-full max-w-4xl mx-auto mb-8 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg backdrop-blur-sm p-2 md:p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={onHome}>
          <RobotIcon className="w-8 h-8 text-cyan-400" />
          <span className="text-xl font-bold text-white hidden sm:inline">AI Interview Coach</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onHome} className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors p-2 rounded-md" aria-label="Home">
            <HomeIcon className="w-5 h-5" />
            <span className="hidden md:inline">Home</span>
          </button>
          <button onClick={onAbout} className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors p-2 rounded-md" aria-label="About">
            <InfoIcon className="w-5 h-5" />
            <span className="hidden md:inline">About</span>
          </button>
          <button onClick={onProfile} className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors p-2 rounded-md" aria-label="Profile">
            <UserIcon className="w-5 h-5" />
            <span className="hidden md:inline">Profile</span>
          </button>
          <button onClick={onLogout} className="flex items-center gap-2 text-slate-300 hover:text-red-400 transition-colors p-2 rounded-md" aria-label="Logout">
            <LogoutIcon className="w-5 h-5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
