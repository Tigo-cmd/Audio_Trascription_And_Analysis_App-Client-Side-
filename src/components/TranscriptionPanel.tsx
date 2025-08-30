import React, { useState } from 'react';
import { Edit3, Clock, User, Volume2 } from 'lucide-react';
import { Transcription, TranscriptSegment } from '../types';

interface TranscriptionPanelProps {
  transcription: Transcription | null;
  selectedSegments: string[];
  onSegmentSelect: (segmentId: string) => void;
  onTextEdit: (segmentId: string, newText: string) => void;
}

export const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({
  transcription,
  selectedSegments,
  onSegmentSelect,
  onTextEdit
}) => {
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [editingSegment, setEditingSegment] = useState<string | null>(null);

  if (!transcription) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transcription</h2>
        <p className="text-gray-500 text-center py-8">Upload and process an audio file to see transcription</p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSegmentClick = (segmentId: string) => {
    onSegmentSelect(segmentId);
  };

  const handleEditStart = (segmentId: string) => {
    setEditingSegment(segmentId);
  };

  const handleEditSave = (segmentId: string, newText: string) => {
    onTextEdit(segmentId, newText);
    setEditingSegment(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Transcription</h2>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showTimestamps}
              onChange={(e) => setShowTimestamps(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Clock className="w-4 h-4" />
            <span>Timestamps</span>
          </label>
        </div>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {transcription.segments.map((segment) => (
          <div
            key={segment.id}
            className={`p-3 rounded-lg border-l-4 transition-colors cursor-pointer ${
              selectedSegments.includes(segment.id)
                ? 'bg-blue-50 border-blue-500'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            onClick={() => handleSegmentClick(segment.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {showTimestamps && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                    <span>{formatTime(segment.start)} - {formatTime(segment.end)}</span>
                    {segment.speaker && (
                      <>
                        <User className="w-3 h-3" />
                        <span>{segment.speaker}</span>
                      </>
                    )}
                    <div className="flex items-center space-x-1">
                      <Volume2 className="w-3 h-3" />
                      <span>{Math.round(segment.confidence * 100)}%</span>
                    </div>
                  </div>
                )}
                
                {editingSegment === segment.id ? (
                  <textarea
                    defaultValue={segment.text}
                    className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    onBlur={(e) => handleEditSave(segment.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleEditSave(segment.id, e.currentTarget.value);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <p className="text-gray-800">{segment.text}</p>
                )}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditStart(segment.id);
                }}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Selected: {selectedSegments.length} segments • 
          Language: {transcription.language} • 
          Total: {transcription.segments.length} segments
        </p>
      </div>
    </div>
  );
};