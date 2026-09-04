export interface CategoryProps {
    onCategoryChange: (category: string) => void;
}

export interface CityProps {
    onCityChange: (category: string) => void;
    placeholder: string;
    className?: string;
}

export interface LocationProps {
    onLocationChange: (category: string) => void;
    disabled?: boolean;
    placeholder: string;
    className?: string;
}

export interface VisitorSignupProps {
    isVisible: boolean;
    onClose: () => void;
}