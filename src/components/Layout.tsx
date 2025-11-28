import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Chatbot } from '../chatbot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  return (
    <div className="flex h-screen bg-background-light dark:bg-gray-900">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br to-background-cream">
          {children}
        </main>
      </div>
      {/* Chatbot - Floating in bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <Chatbot/>
      </div>
    </div>
  );
};

export default Layout;