'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import categories from '../../utils/category.json';

interface BusinessCategoryProps {
  onCategoryChange: (category: string) => void;
  initialCategory?: string;
  value?: string;
  className?: string;
  placeholder?: string;
}

const CategoryInput: React.FC<BusinessCategoryProps> = ({ 
  onCategoryChange, 
  initialCategory, 
  value,
  className = "", 
  placeholder = "Business Category" 
}) => {
  const selectedValue = value !== undefined ? value : initialCategory;

  const handleCategorySelect = (val: string) => {
    onCategoryChange(val);
  };

  return (
    <Select 
      onValueChange={handleCategorySelect} 
      value={selectedValue || undefined}
      defaultValue={initialCategory}
    >
      <SelectTrigger 
        id="bcategory"
        className={`h-11 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated px-3.5 text-left font-body text-sm font-normal text-gray-900 dark:text-zinc-100 shadow-none focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange hover:border-orange/60 transition-colors data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-zinc-500 cursor-pointer ${className}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent 
        className="w-full max-h-60 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-darkSurface shadow-2xl p-1.5 z-50 font-body"
        position="popper"
      >
        {categories.map((category, index) => (
          <SelectItem 
            key={index} 
            value={category} 
            className="hover:bg-orange/10 hover:text-orange dark:hover:bg-darkElevated text-gray-800 dark:text-zinc-200 font-body text-sm rounded-lg cursor-pointer py-2 px-3"
          >
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CategoryInput;
