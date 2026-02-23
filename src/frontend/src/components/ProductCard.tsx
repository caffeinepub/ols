import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProductListing } from '../backend';
import { formatPrice } from '../utils/formatPrice';
import { formatPhoneNumber } from '../utils/formatPhoneNumber';

interface ProductCardProps {
  listing: ProductListing;
}

export default function ProductCard({ listing }: ProductCardProps) {
  const imageUrl = listing.image.getDirectURL();

  return (
    <Link to="/listing/$id" params={{ id: listing.id.toString() }} className="group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <Badge className="absolute top-3 right-3 bg-background/90 text-foreground border-border">
            {listing.category}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <p className="text-2xl font-bold text-primary mb-2">
            {formatPrice(listing.price)}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            Seller: {formatPhoneNumber(listing.sellerPhoneNumber)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
