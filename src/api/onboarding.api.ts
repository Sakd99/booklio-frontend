import { api } from './client';

export interface OnboardingStatus {
  completed: boolean;
  industry: string | null;
  websiteUrl: string | null;
  hasKnowledgeDocs: boolean;
}

export const onboardingApi = {
  getStatus: () =>
    api.get<OnboardingStatus>('/onboarding/status').then((r) => r.data),

  setIndustry: (industry: string) =>
    api.put('/onboarding/industry', { industry }).then((r) => r.data),

  setWebsite: (websiteUrl: string) =>
    api.put('/onboarding/website', { websiteUrl }).then((r) => r.data),

  uploadDocuments: (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return api
      .post('/onboarding/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  setInstructions: (data: {
    customPrompt?: string;
    aiTone?: string;
    language?: string;
  }) => api.put('/onboarding/instructions', data).then((r) => r.data),

  complete: () =>
    api.post('/onboarding/complete').then((r) => r.data),
};
