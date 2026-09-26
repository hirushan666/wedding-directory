export interface OfferingProps {
    name: string,
    vendor: string,
    city: string, 
    reviews: Review[];
    banner: string,
    link: string,
    buttonText: string
}

export type ServiceProps = OfferingProps;

export interface FilterSearchBarProps {
    handleSearch: (city: string, category: string) => void;
    onCityChange: (city: string) => void;
    onCategoryChange: (category: string) => void;
    selectedCity?: string;
    selectedCategory?: string;
}

export type SocialTypes = {
    website?: string;
    facebook?: string;
    instagram?: string;
    x?: string;
    tiktok?: string;
};

interface Review {
    rating: string;
}

export interface Offering {
    id: string;
    name: string;
    category: string;
    visible: boolean;
    description?: string;
    bus_phone?: string;
    bus_email?: string;
    banner: string | null;
    reviews: Review[];
    city?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    vendor: {
        id: string;
        busname: string;
        city: string;
        phone: string;
    };
}

export type Service = Offering;