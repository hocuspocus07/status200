

export interface Certificate {
  _id: string;
  course: string;
  issued_by: string;
  issued_to: string;
  passed_at: string;
  verification_link?: string;
  nsqf_level?: number;
  tags?: string[];
  keywords?: string[];
  course_duration?: number;
  is_verified?: boolean;
}

export interface UserProfile {
  avatar?: string;
  username?: string;
}

export interface ProfileData {
  _id: string;
  name: string;
  email: string;
  headline?: string;
  location?: string;
  about?: string;
  title?: string; // Used in MessageDialog header
  isVerified?: boolean;
  skills?: string[];
  profile?: UserProfile;
  // Specific to Search Results
  matchedCertificates?: Certificate[];
  certificates?: Certificate[];
}