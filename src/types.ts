export type JobStatus = 'Active' | 'Hold';

export interface Job {
  id: number;
  status: JobStatus;
  company: string;
  account: string;
  shifts: string;
  interview: string;
  location: string;
  graduation: string;
  nationality: string;
  maxAge: number;
  language: string;
  languageRequirement: string;
  salary: string;
  process: string;
  training: string;
  details: string;
  locationType: 'office' | 'remote';
  targetLanguage: string;
  matchScore?: number;
  isNearbyLocation?: boolean;
  isCloseLanguage?: boolean;
}

export interface UserProfile {
  name: string;
  mobile: string;
  age: number | '';
  status: string;
  english: string;
  location: string;
  nationality: string;
  experience: string;
  experienceType: string;
  preferredShift: string;
}
