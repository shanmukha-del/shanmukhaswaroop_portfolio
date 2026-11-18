/**
 * Portfolio Data Types & Interfaces
 * Factual type definitions for worlds, projects, confirmed skills, and achievements.
 * Excludes fabricated metrics, fake proficiency percentages, or unverified claims.
 */

export interface RealmCoordinates {
  x: number;
  y: number;
  z: number;
}

export interface SkillItem {
  name: string;
  category: 'Programming & Core' | 'Frontend' | 'Backend & Data' | 'Tools & Workflows';
  status: 'confirmed' | 'learning_interest';
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  districtName: string;
  overview: string;
  verifiedFeatures: string[];
  visualDiorama: {
    primaryStructure: string;
    landmarks: string[];
    palette: {
      primary: string;
      accent: string;
      glow: string;
    };
  };
  liveDemoUrl?: string;
  sourceCodeUrl?: string;
}

export interface ChallengeItem {
  id: string;
  eventName: string;
  projectOrChallenge: string;
  result: 'Second Prize' | 'Participation';
  duration?: string;
  description: string;
}

export interface AchievementItem {
  id: string;
  event: string;
  projectOrDomain: string;
  distinction: 'Second Prize' | 'Participation';
  representation: string; // Explicitly describes illustrative 3D voxel representation
  summary: string;
}

export interface WorldData {
  id: string;
  realmNumber: number;
  name: string;
  subtitle: string;
  tagline: string;
  videoAsset: string;
  coordinates: RealmCoordinates;
  themeColor: string;
  accentColor: string;
  skyColor: string;
  ambientLightColor: string;
  narrativeLead: string;
  detailedStory: string[];
  keyAttributes: string[];
  projects?: ProjectItem[];
  skills?: SkillItem[];
  achievements?: AchievementItem[];
  challenges?: ChallengeItem[];
  verifiedOverview?: {
    companyName?: string;
    companyUrl?: string;
    eventOrganized?: string;
  };
}

export interface DeveloperProfile {
  name: string;
  preferredName: string;
  title: string;
  bioSummary: string;
  characterVisuals: {
    upperBody: string;
    accents: string;
    accessories: string;
    lowerBody: string;
    footwear: string;
    likeness: string;
  };
  socialLinks: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
}
