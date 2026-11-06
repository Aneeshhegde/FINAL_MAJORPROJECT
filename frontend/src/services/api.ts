import axios from 'axios';
import { 
  SchemeInfo, 
  AnalysisResponse, 
  DistrictRankingResponse, 
  StateOverviewResponse,
  LiveDemoResponse,
  AnswerKeyComparison
} from '../types';

// Connect via relative proxy in dev/prod with fallback to direct port 8000
const API_BASE = 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  getSchemes: async (): Promise<SchemeInfo[]> => {
    const res = await client.get<SchemeInfo[]>('/schemes');
    return res.data;
  },

  getStates: async (): Promise<string[]> => {
    const res = await client.get<{ states: string[]; count: number }>('/states');
    return res.data.states;
  },

  getDistricts: async (state: string): Promise<string[]> => {
    const res = await client.get<{ state: string; districts: string[]; count: number }>(
      '/districts', 
      { params: { state } }
    );
    return res.data.districts;
  },

  analyzeDistrict: async (state: string, district: string, scheme: string = 'MGNREGA'): Promise<AnalysisResponse> => {
    const res = await client.post<AnalysisResponse>('/analyze', {
      state,
      district,
      scheme,
    });
    return res.data;
  },

  getDistrictRankings: async (state: string, scheme: string = 'MGNREGA', aggregation: 'district' | 'record' = 'district'): Promise<DistrictRankingResponse> => {
    const res = await client.get<DistrictRankingResponse>('/district-ranking', {
      params: { state, scheme, aggregation },
    });
    return res.data;
  },

  getStateOverview: async (state: string, scheme: string = 'MGNREGA'): Promise<StateOverviewResponse> => {
    const res = await client.get<StateOverviewResponse>('/state-overview', {
      params: { state, scheme },
    });
    return res.data;
  },

  syncLiveAPI: async (state: string, district: string, scheme: string = 'MGNREGA'): Promise<any> => {
    const res = await client.post('/sync/live', {
      state,
      district,
      scheme,
    });
    return res.data;
  },

  uploadAndAnalyze: async (file: File): Promise<LiveDemoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post<LiveDemoResponse>('/upload-analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  compareAnswerKey: async (keyFile: File, dataFile?: File): Promise<AnswerKeyComparison> => {
    const formData = new FormData();
    formData.append('answer_key', keyFile);
    if (dataFile) {
      formData.append('data_file', dataFile);
    }
    const res = await client.post<AnswerKeyComparison>('/compare-answer-key', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  loadDemoFile: async (fileName: string): Promise<File> => {
    const response = await fetch(`/demo/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${fileName}: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new File([blob], fileName, { type: 'text/csv' });
  }
};
