import React, { useState } from 'react';
import { FileText, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { Summary } from '../types';

interface SummaryPanelProps {
  summary: Summary | null;
  onGenerateSummary: (type: 'short' | 'medium' | 'long') => void;
  isGenerating: boolean;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  summary,
  onGenerateSummary,
  isGenerating
}) => {
  const [selectedType, setSelectedType] = useState<'short' | 'medium' | 'long'>('medium');
  const [expandedBullets, setExpandedBullets] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'short' | 'medium' | 'long')}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isGenerating}
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
          
          <button
            onClick={() => onGenerateSummary(selectedType)}
            disabled={isGenerating}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {!summary && !isGenerating && (
        <p className="text-gray-500 text-center py-8">Generate a summary from your transcription</p>
      )}
      
      {isGenerating && (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Generating summary...</span>
        </div>
      )}
      
      {summary && !isGenerating && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 capitalize">{summary.type} Summary</span>
            </div>
            <p className="text-gray-800 leading-relaxed">{summary.content}</p>
          </div>
          
          {summary.bullets.length > 0 && (
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setExpandedBullets(!expandedBullets)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">Key Points ({summary.bullets.length})</span>
                {expandedBullets ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {expandedBullets && (
                <div className="border-t border-gray-200 p-4">
                  <ul className="space-y-2">
                    {summary.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};