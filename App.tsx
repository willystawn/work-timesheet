import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { TimesheetForm } from './components/TimesheetForm';
import { TimesheetList } from './components/TimesheetList';
import { ReportGenerator } from './components/ReportGenerator';
import { useTimesheet } from './hooks/useTimesheet';
import type { TimesheetEntry } from './types';
import { supabase } from './services/supabaseClient';
import { Auth } from './components/Auth';
import { LogoutIcon } from './components/icons/LogoutIcon';

const TimesheetApp = () => {
  const { entries, addEntry, deleteEntry, updateEntry, loading } = useTimesheet();
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);

  const handleEdit = (entry: TimesheetEntry) => {
    setEditingEntry(entry);
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col min-h-screen font-sans antialiased text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900">
      <header className="sticky top-0 z-10 flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300">
            Timesheet Pencapaian AI
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors py-2 px-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
            aria-label="Keluar"
          >
            <LogoutIcon />
            <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          <div className="lg:col-span-3 flex flex-col gap-6">
            <TimesheetForm 
              addEntry={addEntry} 
              editingEntry={editingEntry}
              updateEntry={updateEntry}
              onCancelEdit={handleCancelEdit}
            />
            <ReportGenerator allEntries={entries} />
          </div>

          <div className="lg:col-span-2">
            <TimesheetList 
              entries={entries} 
              deleteEntry={deleteEntry} 
              loading={loading}
              onEdit={handleEdit}
              editingId={editingEntry?.id || null}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return <TimesheetApp />;
}

export default App;