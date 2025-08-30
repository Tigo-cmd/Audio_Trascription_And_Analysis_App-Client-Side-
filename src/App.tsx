import React, { useState } from 'react';
import { Header } from './components/Header';
import { AudioUpload } from './components/AudioUpload';
import { JobStatus } from './components/JobStatus';
import { TranscriptionPanel } from './components/TranscriptionPanel';
import { SummaryPanel } from './components/SummaryPanel';
import { ChatPanel } from './components/ChatPanel';
import { ExportHistory } from './components/ExportHistory';
import { Settings } from './components/Settings';
import { useAudioTranscription } from './hooks/useAudioTranscription';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    projects,
    currentProject,
    jobs,
    currentJob,
    transcription,
    summary,
    chatMessages,
    selectedSegments,
    isUploading,
    uploadProgress,
    isGeneratingSummary,
    isChatLoading,
    settings,
    setCurrentProject,
    uploadAudio,
    generateSummary,
    sendChatMessage,
    toggleSegmentSelection,
    editSegmentText,
    exportTranscription,
    deleteJob,
    viewJob,
    createNewProject,
    setSettings
  } = useAudioTranscription();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentProject={currentProject}
        projects={projects}
        onProjectChange={setCurrentProject}
        onNewProject={createNewProject}
        onSettingsClick={() => setShowSettings(true)}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <AudioUpload
              onFileUpload={uploadAudio}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
            
            <JobStatus job={currentJob} />
            
            <SummaryPanel
              summary={summary}
              onGenerateSummary={generateSummary}
              isGenerating={isGeneratingSummary}
            />
          </div>
          
          {/* Center Column */}
          <div className="space-y-6">
            <TranscriptionPanel
              transcription={transcription}
              selectedSegments={selectedSegments}
              onSegmentSelect={toggleSegmentSelection}
              onTextEdit={editSegmentText}
            />
            
            <ExportHistory
              jobs={jobs}
              onExport={exportTranscription}
              onDeleteJob={deleteJob}
              onViewJob={viewJob}
            />
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-2 xl:col-span-1">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={sendChatMessage}
              selectedSegments={selectedSegments}
              isLoading={isChatLoading}
            />
          </div>
        </div>
      </main>
      
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}

export default App;