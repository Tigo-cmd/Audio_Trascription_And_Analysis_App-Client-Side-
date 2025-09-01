export interface AudioFile {
  id: string;
  name: string;
  size: number;
  duration?: number;
  type: string;
  file: File;
}

export interface Job {
  id: string;
  audioFile: AudioFile;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  progress?: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence: number;
}

export interface Transcription {
  id: string;
  jobId: string;
  segments: TranscriptSegment[];
  fullText: string;
  language: string;
}

export interface Summary {
  id: string;
  transcriptionId: string;
  type: 'short' | 'medium' | 'long';
  content: string;
  bullets: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  referencedSegments?: string[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  lastModified: Date;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}