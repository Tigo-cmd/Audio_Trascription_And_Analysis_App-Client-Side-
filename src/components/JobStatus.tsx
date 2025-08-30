import React from 'react';
import { Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Job } from '../types';

interface JobStatusProps {
  job: Job | null;
}

export const JobStatus: React.FC<JobStatusProps> = ({ job }) => {
  if (!job) return null;

  const getStatusIcon = () => {
    switch (job.status) {
      case 'queued':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'queued':
        return 'Queued for processing';
      case 'processing':
        return 'Processing audio...';
      case 'ready':
        return 'Transcription complete';
      case 'failed':
        return 'Processing failed';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'queued':
        return 'bg-yellow-50 border-yellow-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      case 'ready':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="font-medium text-gray-900">{job.audioFile.name}</p>
          <p className="text-sm text-gray-600">{getStatusText()}</p>
          {job.error && (
            <p className="text-sm text-red-600 mt-1">{job.error}</p>
          )}
        </div>
        
        {job.progress !== undefined && job.status === 'processing' && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{job.progress}%</p>
            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${job.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        Started: {job.createdAt.toLocaleString()}
        {job.completedAt && (
          <> • Completed: {job.completedAt.toLocaleString()}</>
        )}
      </div>
    </div>
  );
};