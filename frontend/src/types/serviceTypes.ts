export interface ProfileData {
  category: string;
  businessPhone: string;
  businessEmail: string;
  description: string;
  showCategoryDropdown?: boolean;
  city?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface EditProfileProps {
  isServiceVisible?: boolean;
}

export interface SocialData {
  websiteURL: string;
  xURL: string;
  tiktokURL: string;
  instagramURL: string;
  facebookURL: string;
}

export interface ServicesMenuProps {
  setActiveSection: (section: string) => void;
  activeSection?: string;
  vendorInfo?: any;
}

// New Service Interface
export interface Service {
  id: string;
  name: string;
  category?: string;
  description: string;
  city?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  reviews: Review[];
  vendor?: {
    busname: string;
    city: string;
  };
  banner: string;
}
interface Review {
    rating: string;
}