import { useCategories } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const categoryIcons: Record<string, string> = {
  Electronics: '/assets/generated/icon-electronics.dim_128x128.png',
  Vehicles: '/assets/generated/icon-vehicles.dim_128x128.png',
  'Real Estate': '/assets/generated/icon-realestate.dim_128x128.png',
  Fashion: '/assets/generated/icon-fashion.dim_128x128.png',
  'Home & Garden': '/assets/generated/icon-home.dim_128x128.png',
  Smartphones: '/assets/generated/smartphone-icon.dim_128x128.png',
};

// Define the order of categories with Smartphones first
const categoryOrder = [
  'Smartphones',
  'Electronics',
  'Vehicles',
  'Real Estate',
  'Fashion',
  'Home & Garden',
];

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const { data: allCategories } = useCategories();

  // Get unique categories and sort them according to the defined order
  const categories = allCategories
    ? Array.from(new Set(allCategories))
        .filter(Boolean)
        .sort((a, b) => {
          const indexA = categoryOrder.indexOf(a);
          const indexB = categoryOrder.indexOf(b);
          // If category is not in the order list, put it at the end
          if (indexA === -1 && indexB === -1) return a.localeCompare(b);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        })
    : [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Browse by Category</h3>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-4">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => onSelectCategory(null)}
            className="shrink-0"
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => onSelectCategory(category)}
              className="shrink-0 gap-2"
            >
              {categoryIcons[category] && (
                <img
                  src={categoryIcons[category]}
                  alt={category}
                  className="w-5 h-5 object-contain"
                />
              )}
              {category}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
