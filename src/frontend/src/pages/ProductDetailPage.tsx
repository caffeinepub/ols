import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useListing } from '../hooks/useQueries';
import { useMobileAuth } from '../hooks/useMobileAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Phone, MessageCircle } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import { formatPhoneNumber } from '../utils/formatPhoneNumber';
import ChatDialog from '../components/ChatDialog';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams({ from: '/listing/$id' });
  const navigate = useNavigate();
  const { data: listing, isLoading } = useListing(BigInt(id));
  const { isAuthenticated, phoneNumber } = useMobileAuth();
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  const handleChatClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to chat with the seller');
      return;
    }
    if (phoneNumber === listing?.sellerPhoneNumber) {
      toast.error('You cannot chat with yourself');
      return;
    }
    setChatDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-8">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container max-w-5xl py-8">
        <p className="text-center text-muted-foreground">Listing not found</p>
      </div>
    );
  }

  const imageUrl = listing.image.getDirectURL();
  const date = new Date(Number(listing.timestamp));
  const isOwnListing = phoneNumber === listing.sellerPhoneNumber;

  return (
    <div className="container max-w-5xl py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Listings
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <Badge className="mb-3">{listing.category}</Badge>
            <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>
            <p className="text-4xl font-bold text-primary mb-6">
              {formatPrice(listing.price)}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold mb-3">Seller Information</h2>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-medium">
                  {formatPhoneNumber(listing.sellerPhoneNumber)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Posted:</span>
                <span>{date.toLocaleDateString()}</span>
              </div>
              {!isOwnListing && (
                <Button
                  onClick={handleChatClick}
                  className="w-full gap-2 mt-4"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat with Seller
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {listing && (
        <ChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          listingId={listing.id}
          sellerPhoneNumber={listing.sellerPhoneNumber}
          listingTitle={listing.title}
        />
      )}
    </div>
  );
}
