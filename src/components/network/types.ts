export type ProfileData = {
  _id: string;
  name: string;
  headline?: string;
  location?: string;
  avatar?:string,
  title?:string,
  about?: string;
  skills?: string[];
  profile?: {
    avatar?: string;
  };
  isVerified?: boolean;
};