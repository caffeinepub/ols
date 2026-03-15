import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import type { ProductListing } from "../backend";
import { formatPhoneNumber } from "../utils/formatPhoneNumber";
import { formatPrice } from "../utils/formatPrice";

interface ProductCardProps {
  listing: ProductListing;
}

export default function ProductCard({ listing }: ProductCardProps) {
  // Defensive null checks with default values
  const title = listing.title || "Untitled";
  const price = listing.price ?? 0n;
  const category = listing.category || "Uncategorized";
  const sellerPhone = listing.sellerPhone || "Unknown";
  const brand = listing.brand;

  // Handle missing or invalid imageUrl
  let imageUrl = "/assets/generated/hero-banner.dim_1200x400.png"; // Default placeholder
  try {
    if (
      listing.imageUrl &&
      typeof listing.imageUrl.getDirectURL === "function"
    ) {
      imageUrl = listing.imageUrl.getDirectURL();
    }
  } catch (error) {
    console.error("[ProductCard] Error getting image URL:", error);
  }

  return (
    <Link
      to="/listing/$id"
      params={{ id: listing.id.toString() }}
      className="group"
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              console.error("[ProductCard] Image failed to load:", imageUrl);
              // Set fallback image on error
              e.currentTarget.src =
                "/assets/generated/hero-banner.dim_1200x400.png";
            }}
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className="bg-background/90 text-foreground border-border">
              {category}
            </Badge>
          </div>
          {category === "Smartphones" && brand && (
            <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
              {brand}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-2xl font-bold text-primary mb-2">
            {formatPrice(price)}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            Seller: {formatPhoneNumber(sellerPhone)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
