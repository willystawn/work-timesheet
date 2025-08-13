import React, { useState, useMemo } from 'react';
import type { TimesheetEntry } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { ClockIcon } from './icons/ClockIcon';
import { HourglassIcon } from './icons/HourglassIcon';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface TimesheetListProps {
  entries: TimesheetEntry[];
  deleteEntry: (id: string) => void;
  loading: boolean;
  onEdit: (entry: TimesheetEntry) => void;
  editingId: string | null;
}

const formatDate = (dateString: string) => {
    // Add timezone context to avoid off-by-one day errors
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(`1970-01-01T${start}`);
    const endTime = new Date(`1970-01-01T${end}`);
    let diff = endTime.getTime() - startTime.getTime();
    if (diff < 0) return 'N/A';
    const hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / 1000 / 60);
    
    const parts = [];
    if (hours > 0) parts.push(`${hours} jam`);
    if (minutes > 0) parts.push(`${minutes} menit`);
    
    return parts.length > 0 ? parts.join(' ') : '0 menit';
};

const renderTask = (task: string) => {
  const lines = task.split('\n').filter(line => line.trim() !== '');
  if (lines.length > 1) {
    return (
      <ul className="list-disc list-outside pl-5 space-y-1.5 text-gray-700 dark:text-gray-300">
        {lines.map((line, index) => (
          <li key={index}>{line.trim()}</li>
        ))}
      </ul>
    );
  }
  return <p className="text-gray-700 dark:text-gray-300">{task}</p>;
};

const monthNames = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
    { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
];

export const TimesheetList: React.FC<TimesheetListProps> = ({ entries, deleteEntry, loading, onEdit, editingId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const availableYears = useMemo(() => {
    if (entries.length === 0) return [new Date().getFullYear()];
    const years = new Set(entries.map(entry => new Date(entry.date + 'T00:00:00').getFullYear()));
    return Array.from(years).sort((a, b) => b - a); // Descending order
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
        const entryDate = new Date(entry.date + 'T00:00:00');
        const entryYear = entryDate.getFullYear();
        const entryMonth = entryDate.getMonth() + 1;

        const yearMatch = entryYear === selectedYear;
        // If selectedMonth is 0 ('All Months'), monthMatch is true
        const monthMatch = selectedMonth === 0 || entryMonth === selectedMonth;

        return yearMatch && monthMatch;
    });
  }, [entries, selectedYear, selectedMonth]);


  const openDeleteModal = (id: string) => {
    setEntryToDelete(id);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setEntryToDelete(null);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteEntry(entryToDelete);
    }
    closeDeleteModal();
  };
  
  const selectClasses = "text-sm w-full sm:w-auto p-2.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm";

  return (
    <div className="bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-200 dark:border-gray-800 flex flex-col max-h-[75vh]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">Riwayat Kinerja</h2>
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <select
                aria-label="Filter Bulan"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className={selectClasses}
            >
                <option value={0}>Semua Bulan</option>
                {monthNames.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                ))}
            </select>
            <select
                aria-label="Filter Tahun"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={selectClasses}
            >
                {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto -mr-2 pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Memuat catatan...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-full">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Belum ada catatan</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Mulai tambahkan rangkuman harianmu!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredEntries.length > 0 ? (
              filteredEntries.map(entry => (
                  <li key={entry.id} className={`group p-4 rounded-lg transition-all duration-300 relative border ${editingId === entry.id ? 'bg-blue-50 dark:bg-gray-800/60 border-blue-500 shadow-md' : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'}`}>
                  <div>
                      <div className="flex justify-between items-start gap-3">
                          <div className="flex-grow">
                              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">{formatDate(entry.date)}</p>
                              <div className="font-medium text-gray-800 dark:text-gray-200 text-base">
                                  {renderTask(entry.task)}
                              </div>
                          </div>
                           <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${editingId === entry.id ? 'opacity-100' : ''}`}>
                              <button onClick={() => onEdit(entry)} className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors" aria-label="Edit Catatan">
                                  <EditIcon />
                              </button>
                              <button onClick={() => openDeleteModal(entry.id)} className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-gray-700 transition-colors" aria-label="Hapus Catatan">
                                  <TrashIcon />
                              </button>
                          </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs border-t border-gray-200 dark:border-gray-700/60 pt-3">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                              <ClockIcon />
                              <span className="font-mono">{entry.startTime} - {entry.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-semibold">
                              <HourglassIcon />
                              <span>{calculateDuration(entry.startTime, entry.endTime)}</span>
                          </div>
                      </div>
                  </div>
                  </li>
              ))
            ) : (
              <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                  <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Tidak Ada Catatan</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tidak ada catatan yang ditemukan untuk periode yang dipilih.</p>
              </div>
            )}
          </ul>
        )}
      </div>
       <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
};