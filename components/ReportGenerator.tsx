import React, { useState, useCallback, useEffect } from 'react';
import { generatePerformanceReview } from '../services/geminiService';
import type { TimesheetEntry } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportGeneratorProps {
  allEntries: TimesheetEntry[];
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ allEntries }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);


  useEffect(() => {
    if (allEntries.length > 0) {
      // Sort to find the actual earliest date
      const sortedEntries = [...allEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstEntryDate = sortedEntries[0].date;
      setStartDate(firstEntryDate);
    } else {
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
    }
  }, [allEntries]);

  const handleGenerateReport = useCallback(async () => {
    if (!startDate || !endDate) {
      setError('Silakan pilih rentang tanggal.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        setError('Tanggal mulai tidak boleh setelah tanggal selesai.');
        return;
    }
    
    setError('');
    setIsLoading(true);
    setReport('');
    setIsCopied(false);

    const filteredEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.date + 'T00:00:00'); // Ensure date comparison is correct
      return entryDate >= new Date(startDate + 'T00:00:00') && entryDate <= new Date(endDate + 'T00:00:00');
    });

    if (filteredEntries.length === 0) {
      setError('Tidak ada data pada rentang tanggal yang dipilih.');
      setIsLoading(false);
      return;
    }

    try {
      const generatedReport = await generatePerformanceReview(filteredEntries);
      setReport(generatedReport);
    } catch (err) {
      setError('Gagal membuat laporan. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, allEntries]);

  const handleCopy = () => {
    if (report) {
        navigator.clipboard.writeText(report);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Generator Laporan AI</h2>
        <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">Didukung oleh Gemini</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Tanggal Mulai</label>
          <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200" disabled={allEntries.length === 0} />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Tanggal Selesai</label>
          <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200" disabled={allEntries.length === 0} />
        </div>
      </div>

      <button onClick={handleGenerateReport} disabled={isLoading || allEntries.length === 0} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition-all duration-200 transform hover:shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none">
        <SparklesIcon />
        <span>{isLoading ? 'AI sedang Menganalisis...' : 'Buat Laporan Pencapaian'}</span>
      </button>
      
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-4 text-center">{error}</p>}
      
      {isLoading && (
         <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">AI sedang merangkum kontribusimu...</p>
        </div>
      )}

      {report && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-5">
           <div className="flex justify-between items-center mb-3">
             <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Hasil Analisis AI:</h3>
             <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={isCopied ? "M5 13l4 4L19 7" : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"} />
                    </svg>
                    <span>{isCopied ? 'Tersalin!' : 'Salin'}</span>
            </button>
           </div>
           <div className="prose prose-sm sm:prose-base prose-gray dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900/70 p-4 rounded-md border border-gray-200 dark:border-gray-700 max-h-[40vh] overflow-y-auto">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
           </div>
        </div>
      )}
    </div>
  );
};