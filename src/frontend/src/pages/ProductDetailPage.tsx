import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  MessageCircle,
  Phone,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ChatDialog from "../components/ChatDialog";
import { useMobileAuth } from "../hooks/useMobileAuth";
import { useListing } from "../hooks/useQueries";
import { formatPhoneNumber } from "../utils/formatPhoneNumber";
import { formatPrice } from "../utils/formatPrice";

export default function ProductDetailPage() {
  const { id } = useParams({ from: "/listing/$id" });
  const navigate = useNavigate();
  const { data: listing, isLoading } = useListing(BigInt(id));
  const { isAuthenticated, phoneNumber } = useMobileAuth();
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  const handleChatClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to chat with the seller");
      return;
    }
    if (phoneNumber === listing?.sellerPhone) {
      toast.error("You cannot chat with yourself");
      return;
    }
    setChatDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-8">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container max-w-5xl py-8">
        <p className="text-center text-muted-foreground">Ad not found</p>
      </div>
    );
  }

  const imageUrl = listing.imageUrl.getDirectURL();
  const date = new Date(Number(listing.createdAt) / 1000000);
  const isOwnListing = phoneNumber === listing.sellerPhone;

  return (
    <div className="container max-w-5xl py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: "/" })}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Listings
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                {listing.title}
              </h1>
              <Badge variant="outline" className="text-sm">
                {listing.category}
              </Badge>
            </div>
            {listing.category === "Smartphones" && listing.brand && (
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-sm">
                  {listing.brand}
                </Badge>
              </div>
            )}
            <p className="text-4xl font-bold text-primary">
              {formatPrice(listing.price)}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-3 text-foreground">
                Description
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Seller Information
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{formatPhoneNumber(listing.sellerPhone)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Posted on {date.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {!isOwnListing && (
            <Button
              onClick={handleChatClick}
              className="w-full gap-2"
              size="lg"
            >
              <MessageCircle className="h-5 w-5" />
              Chat with Seller
            </Button>
          )}
        </div>
      </div>

      {listing && !isOwnListing && (
        <ChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          listingId={listing.id}
          sellerPhoneNumber={listing.sellerPhone}
          listingTitle={listing.title}
        />
      )}
    </div>
  );
}
