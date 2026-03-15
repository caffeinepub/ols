import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface BrandFilterProps {
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
}

const MOBILE_BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Realme",
  "Vivo",
  "Oppo",
];

export default function BrandFilter({
  selectedBrands,
  onBrandsChange,
}: BrandFilterProps) {
  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandsChange(selectedBrands.filter((b) => b !== brand));
    } else {
      onBrandsChange([...selectedBrands, brand]);
    }
  };

  const clearAllBrands = () => {
    onBrandsChange([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filter by Brand</h3>
        {selectedBrands.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllBrands}
            className="h-8 gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-4">
          {MOBILE_BRANDS.map((brand) => {
            const isSelected = selectedBrands.includes(brand);
            return (
              <Button
                key={brand}
                variant={isSelected ? "default" : "outline"}
                onClick={() => toggleBrand(brand)}
                className="shrink-0"
                size="sm"
              >
                {brand}
                {isSelected && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-4 w-4 rounded-full p-0 flex items-center justify-center"
                  >
                    ✓
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
