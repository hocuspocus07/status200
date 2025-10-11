export type ProfileData = {
  _id: string;
  name: string;
  headline?: string;
  location?: string;
  avatar?: string,
  title?: string,
  about?: string;
  skills?: string[];
  profile?: {
    avatar?: string;
  };
  isVerified?: boolean;
};

export interface Certificate {
  _id: string;
  course: string;
  issued_to: string;
  issued_by: string;
  passed_at: string;
  is_verified: boolean;
  verification_link: string;
  bucket_image_url?: string;
  nsqf_level?: string;
  blockchain_certificate_hash?: string;
  reasons_for_failure?: string[];
  transaction_hash?: string;
}