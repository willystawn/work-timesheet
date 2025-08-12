import React, { useState, useCallback, useEffect } from 'react';
import type { TimesheetEntry } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';

interface TimesheetFormProps {
  addEntry: (entry: Omit<TimesheetEntry, 'id'>) => Promise<void>;
  updateEntry: (id: string, entry: Omit<TimesheetEntry, 'id'>) => Promise<void>;
  editingEntry: TimesheetEntry | null;
  onCancelEdit: () => void;
}

export const TimesheetForm: React.FC<TimesheetFormProps> = ({ addEntry, editingEntry, updateEntry, onCancelEdit }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [task, setTask] = useState('');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('17:00');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = editingEntry !== null;

  useEffect(() => {
    if (isEditing && editingEntry) {
      setDate(editingEntry.date);
      setTask(editingEntry.task);
      setStartTime(editingEntry.startTime);
      setEndTime(editingEntry.endTime);
    } else if (!isEditing) {
      // Reset form when not editing (e.g., after an edit is cancelled or completed)
      setDate(new Date().toISOString().split('T')[0]);
      setTask('');
      setStartTime('08:30');
      setEndTime('17:00');
    }
  }, [editingEntry, isEditing]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) {
      setError('Deskripsi pencapaian tidak boleh kosong.');
      return;
    }
    if (new Date(`1970-01-01T${endTime}`) <= new Date(`1970-01-01T${startTime}`)) {
        setError('Waktu selesai harus setelah waktu mulai.');
        return;
    }
    setError('');
    setIsSubmitting(true);

    const entryData = { date, task, startTime, endTime };

    try {
        if (isEditing && editingEntry) {
            await updateEntry(editingEntry.id, entryData);
            onCancelEdit(); // Resets form and editing state via useEffect
        } else {
            await addEntry(entryData);
            setTask(''); // Explicitly clear task for new entry, keeping date/time
        }
    } catch (err) {
        setError('Gagal menyimpan catatan. Silakan coba lagi.');
    } finally {
        setIsSubmitting(false);
    }
  }, [addEntry, updateEntry, date, task, startTime, endTime, isEditing, editingEntry, onCancelEdit]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        {isEditing ? <EditIcon /> : <PlusIcon />}
        {isEditing ? 'Edit Catatan Kinerja' : 'Tambah Catatan Kinerja'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="task" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Deskripsi Pencapaian</label>
          <textarea
            id="task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Contoh: Menyelesaikan integrasi API pembayaran dan melakukan testing..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            rows={4}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Tanggal</label>
                <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200" required />
            </div>
            <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Mulai</label>
                <input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200" required />
            </div>
            <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Selesai</label>
                <input type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200" required />
            </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        
        <div className="flex items-center gap-4 pt-1">
            <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-all duration-200 transform hover:shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none">
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (isEditing ? <EditIcon /> : <PlusIcon />)
              }
              <span>{isSubmitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Catatan')}</span>
            </button>
            {isEditing && (
                <button type="button" onClick={onCancelEdit} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200">
                  Batal
                </button>
            )}
        </div>
      </form>
    </div>
  );
};