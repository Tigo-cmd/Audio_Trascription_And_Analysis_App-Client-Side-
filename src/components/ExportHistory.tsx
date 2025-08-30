import React, { useState } from 'react';
import { Download, History, Trash2, Eye } from 'lucide-react';
import { Job } from '../types';

interface ExportHistoryProps {
  jobs: Job[];
  onExport: (jobId: string, format: 'txt' | 'srt' | 'vtt' | 'pdf') => void;
  onDeleteJob: (jobId: string) => void;
  onViewJob: (jobId: string) => void;
}

export const ExportHistory: React.FC<ExportHistoryProps> = ({
  jobs,
  onExport,
  onDeleteJob,
  onViewJob
}) => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const completedJobs = jobs.filter(job => job.status === 'ready');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <History className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Export & History</h2>
      </div>
      
      {completedJobs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No completed transcriptions yet</p>
      ) : (
        <div className="space-y-3">
          {completedJobs.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{job.audioFile.name}</h3>
                  <p className="text-sm text-gray-500">
                    Completed {job.completedAt?.toLocaleDateString()} • 
                    {(job.audioFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewJob(job.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View transcription"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Export options"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    {selectedJob === job.id && (
                      <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-1">
                          {['txt', 'srt', 'vtt', 'pdf'].map((format) => (
                            <button
                              key={format}
                              onClick={() => {
                                onExport(job.id, format as 'txt' | 'srt' | 'vtt' | 'pdf');
                                setSelectedJob(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md text-gray-700"
                            >
                              Export as {format.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onDeleteJob(job.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};