import React from 'react';
import { Bell, Settings, User, Search } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-[#1A2234] border-b border-gray-800">
      <div className="px-6">
        <div className="flex justify-between h-16">
          <div className="flex items-center flex-1">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-[#232B3D] text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search..."
                  type="search"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-[#232B3D]">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-[#232B3D]">
              <Settings className="h-5 w-5" />
            </button>
            <button className="flex items-center space-x-3 p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-[#232B3D]">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium text-gray-200">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}