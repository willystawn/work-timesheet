import { useState, useEffect, useCallback } from 'react';
import type { TimesheetEntry } from '../types';
import { supabase } from '../services/supabaseClient';

export const useTimesheet = () => {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        setLoading(false);
        setEntries([]);
        console.warn("User not authenticated. Cannot fetch entries.");
        return;
    }

    const { data, error } = await supabase
      .from('timesheet_entries')
      .select('id, date, task, startTime, endTime')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('startTime', { ascending: false });

    if (error) {
      console.error("Failed to load entries from Supabase", error);
      setEntries([]);
    } else if (data) {
      setEntries(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Re-fetch when auth state changes. App.tsx handles the session listener,
    // so a simple location change or component re-render can trigger this.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          fetchEntries();
        }
      }
    );
  
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchEntries]);

  const addEntry = useCallback(async (newEntry: Omit<TimesheetEntry, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated. Cannot add entry.");

    const entryWithUser = { ...newEntry, user_id: user.id };

    const { data, error } = await supabase
      .from('timesheet_entries')
      .insert([entryWithUser])
      .select('id, date, task, startTime, endTime')
      .single();

    if (error) {
      console.error("Failed to save entry to Supabase", error);
      throw error;
    }

    if (data) {
        setEntries(prevEntries => [data, ...prevEntries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.startTime.localeCompare(a.startTime)));
    }
  }, []);
  
  const updateEntry = useCallback(async (id: string, updatedData: Omit<TimesheetEntry, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated. Cannot update entry.");

    const { error } = await supabase
        .from('timesheet_entries')
        .update(updatedData)
        .match({ id: id, user_id: user.id });
    
    if (error) {
        console.error("Failed to update entry in Supabase", error);
        throw error;
    }

    setEntries(prevEntries => 
        prevEntries
            .map(entry => (entry.id === id ? { ...entry, ...updatedData } : entry))
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.startTime.localeCompare(a.startTime))
    );
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated. Cannot delete entry.");
      
    const originalEntries = entries;
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    
    const { error } = await supabase
      .from('timesheet_entries')
      .delete()
      .match({ id: id, user_id: user.id });

    if (error) {
      console.error("Failed to delete entry from Supabase", error);
      setEntries(originalEntries); 
      throw error;
    }
  }, [entries]);

  return { entries, addEntry, deleteEntry, updateEntry, loading };
};