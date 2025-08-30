// filename: src/hooks/useAudioTranscriptionReal.tsx
import { useState, useCallback, useRef } from 'react';
import axios, { AxiosResponse } from 'axios';
import {
  AudioFile,
  Job,
  Transcription,
  TranscriptSegment,
  Summary,
  ChatMessage,
  Project
} from '../types';

const API_BASE ='https://tigo.pythonanywhere.com';
const API_KEY = '';

const authHeaders = () => ({
  Authorization: API_KEY ? `Bearer ${API_KEY}` : ''
});

async function pollJobUntilReady(jobId: string, interval = 1500, timeout = 5 * 60 * 1000) {
  const start = Date.now();
  while (true) {
    const res = await axios.get(`${API_BASE}/api/v1/jobs/${jobId}/status`, { headers: authHeaders() });
    // backend returns formatted job
    const status = res.data?.status;
    if (status === 'ready') return res.data;
    if (status === 'failed') throw new Error('Job failed on server');
    if (Date.now() - start > timeout) throw new Error('Job poll timeout');
    await new Promise(r => setTimeout(r, interval));
  }
}

export const useAudioTranscription = () => {
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: 'My First Project', createdAt: new Date(), lastModified: new Date() }
  ]);
  const [currentProject, setCurrentProject] = useState<Project>(projects[0]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [settings, setSettings] = useState({
    model: 'whisper-large-v3',
    language: 'auto',
    temperature: 0.3,
    chunkSize: 25,
    enableSpeakerLabels: true
  });

  const mountedRef = useRef(true);
  // cleanup on unmount
  // (call in your component: React.useEffect(() => () => mountedRef.current = false, []))
  // but we keep mountedRef to avoid state updates after unmount in async flows.

  // Helper to upsert job in local state
  const upsertJob = useCallback((jobObj: any) => {
    const mapped: Job = {
      id: jobObj.id || jobObj.job_id || jobObj.jobId || Math.random().toString(36).slice(2, 9),
      audioFile: {
        id: (jobObj.audioFile && jobObj.audioFile.id) || '',
        name: (jobObj.audioFile && jobObj.audioFile.name) || 'unknown',
        size: (jobObj.audioFile && jobObj.audioFile.size) || 0,
        type: (jobObj.audioFile && jobObj.audioFile.type) || 'audio/*',
        file: (jobObj.audioFile && (jobObj.audioFile.file as File)) || (undefined as any)
      },
      status: jobObj.status,
      progress: jobObj.progress,
      error: jobObj.error,
      createdAt: jobObj.createdAt ? new Date(jobObj.createdAt) : new Date(),
      completedAt: jobObj.completedAt ? new Date(jobObj.completedAt) : undefined
    };
    setJobs(prev => {
      const idx = prev.findIndex(j => j.id === mapped.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = mapped;
        return copy;
      }
      return [mapped, ...prev];
    });
    setCurrentJob(mapped);
    return mapped;
  }, []);

  const uploadAudio = useCallback(async (audioFile: AudioFile): Promise<Job> => {
    setIsUploading(true);
    setUploadProgress(0);
    setTranscription(null);
    setSummary(null);
    setChatMessages([]);

    const form = new FormData();
    form.append('file', audioFile.file);
    // optionally include settings
    form.append('model', settings.model);
    form.append('language', settings.language);

    try {
      const resp = await axios.post(`${API_BASE}/api/v1/audio/upload`, form, {
        headers: {
          ...authHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (ev) => {
          if (ev.total) {
            const pct = Math.round((ev.loaded * 100) / ev.total);
            setUploadProgress(pct);
          }
        },
        timeout: 5 * 60 * 1000
      });

      // backend returns { job_id, status, job }
      const jobPayload = resp.data.job ?? { id: resp.data.job_id, status: resp.data.status };
      const mappedJob = upsertJob(jobPayload);

      // poll the transcription job until ready, then fetch transcription
      try {
        const readyJob = await pollJobUntilReady(mappedJob.id);
        upsertJob(readyJob);
        // fetch transcription
        const tResp = await axios.get(`${API_BASE}/api/v1/jobs/${mappedJob.id}/transcription`, { headers: authHeaders() });
        if (tResp.status === 200) {
          const t: Transcription = tResp.data as Transcription;
          setTranscription(t);
        }
      } catch (err: any) {
        // job failed or timed out
        mappedJob.status = 'failed';
        mappedJob.error = err?.message || 'Job failed';
        upsertJob(mappedJob);
        throw err;
      }

      return mappedJob;
    } catch (err: any) {
      console.error('uploadAudio error', err);
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [settings, upsertJob]);

  const generateSummary = useCallback(async (type: 'short' | 'medium' | 'long') => {
    if (!transcription || !currentJob) return;
    setIsGeneratingSummary(true);
    try {
      // call summary endpoint for the transcription's job id
      const resp = await axios.post(`${API_BASE}/api/v1/jobs/${currentJob.id}/summary`, { style: type }, { headers: authHeaders() });
      // backend returns { summary_job_id, job }
      const summaryJobId = resp.data.summary_job_id || resp.data.job?.id;
      if (!summaryJobId) throw new Error('No summary job id returned');

      // poll the summary job
      await pollJobUntilReady(summaryJobId);

      // download summary content
      const dl = await axios.get(`${API_BASE}/api/v1/jobs/${summaryJobId}/download?format=txt`, {
        headers: authHeaders(),
        responseType: 'text'
      });
      const content = typeof dl.data === 'string' ? dl.data : String(dl.data);

      // naive bullets split (backend could return structured bullets)
      const bullets = content.split('\\n').slice(0, 4).filter(Boolean);

      const newSummary: Summary = {
        id: summaryJobId,
        transcriptionId: transcription.id,
        type,
        content,
        bullets
      };
      setSummary(newSummary);
      return newSummary;
    } catch (err: any) {
      console.error('generateSummary error', err);
      throw err;
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [transcription, currentJob]);

  const sendChatMessage = useCallback(async (
    content: string,
    includeTranscript: boolean,
    segments: string[],
    requirementsFile?: File
  ) => {
    if (!transcription || !currentJob) return;
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      let resp: AxiosResponse<any>;
      if (requirementsFile) {
        const form = new FormData();
        form.append('question', content);
        form.append('requirement_file', requirementsFile);
        // include context selection if requested
        if (includeTranscript && segments.length > 0) {
          form.append('context', JSON.stringify({ segments }));
        }
        resp = await axios.post(`${API_BASE}/api/v1/jobs/${currentJob.id}/qa`, form, {
          headers: {
            ...authHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // JSON endpoint
        resp = await axios.post(`${API_BASE}/api/v1/jobs/${currentJob.id}/qa`, {
          question: content,
          requirement_text: undefined,
          context: includeTranscript ? transcription.fullText : undefined
        }, { headers: { ...authHeaders() } });
      }

      const qaJobId = resp.data.qa_job_id || resp.data.job?.id;
      if (!qaJobId) throw new Error('No QA job id returned');

      // poll QA job to completion
      await pollJobUntilReady(qaJobId);

      // download answer
      const dl = await axios.get(`${API_BASE}/api/v1/jobs/${qaJobId}/download?format=txt`, {
        headers: authHeaders(),
        responseType: 'text'
      });
      const answerText = typeof dl.data === 'string' ? dl.data : String(dl.data);

      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: answerText,
        timestamp: new Date(),
        referencedSegments: segments.length ? segments : undefined
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      return assistantMessage;
    } catch (err: any) {
      console.error('sendChatMessage error', err);
      const failMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: 'Failed to get an answer. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, failMsg]);
      throw err;
    } finally {
      setIsChatLoading(false);
    }
  }, [transcription, currentJob]);

  const toggleSegmentSelection = useCallback((segmentId: string) => {
    setSelectedSegments(prev =>
      prev.includes(segmentId) ? prev.filter(id => id !== segmentId) : [...prev, segmentId]
    );
  }, []);

  const editSegmentText = useCallback((segmentId: string, newText: string) => {
    if (!transcription) return;
    setTranscription(prev => {
      if (!prev) return prev;
      const newSegments = prev.segments.map(s => (s.id === segmentId ? { ...s, text: newText } : s));
      return { ...prev, segments: newSegments, fullText: newSegments.map(s => s.text).join(' ') };
    });
  }, [transcription]);

  const exportTranscription = useCallback((jobId: string, format: 'txt' | 'srt' | 'vtt' | 'pdf') => {
    // open download URL in new tab (backend supports download endpoint)
    const url = `${API_BASE}/api/v1/jobs/${jobId}/download?format=${format}`;
    window.open(url, '_blank');
  }, []);

  const deleteJob = useCallback((jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    if (currentJob?.id === jobId) {
      setCurrentJob(null);
      setTranscription(null);
      setSummary(null);
      setChatMessages([]);
      setSelectedSegments([]);
    }
  }, [currentJob]);

  const viewJob = useCallback((jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) setCurrentJob(job);
  }, [jobs]);

  const createNewProject = useCallback(() => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Project ${projects.length + 1}`,
      createdAt: new Date(),
      lastModified: new Date()
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
  }, [projects.length]);

  return {
    // State
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

    // Actions
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
  };
};
