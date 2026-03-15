import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import BrandFilter from "../components/BrandFilter";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { useMobileAuth } from "../hooks/useMobileAuth";
import { useListings, useUnreadMessages } from "../hooks/useQueries";

export function HomePage() {
  const navigate = useNavigate();
  const { phoneNumber } = useMobileAuth();
  const {
    data: listings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useListings();
  const { data: unreadMessages = [] } = useUnreadMessages();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Clear selected brands when category changes away from Smartphones
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    if (category !== "Smartphones") {
      setSelectedBrands([]);
    }
  };

  // Log query state for debugging
  console.log("[HomePage] Query state:", {
    timestamp: new Date().toISOString(),
    isLoading,
    isError,
    error: error instanceof Error ? error.message : error,
    listingsCount: listings?.length ?? 0,
    listingsData: listings,
  });

  const filteredListings = useMemo(() => {
    console.log("[HomePage] Computing filtered listings:", {
      timestamp: new Date().toISOString(),
      totalListings: listings.length,
      searchTerm,
      selectedCategory,
      selectedBrands,
    });

    let filtered = listings;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(lowerSearch) ||
          listing.description.toLowerCase().includes(lowerSearch),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (listing) => listing.category === selectedCategory,
      );
    }

    // Apply brand filtering only when Smartphones category is selected and brands are chosen
    if (selectedCategory === "Smartphones" && selectedBrands.length > 0) {
      filtered = filtered.filter(
        (listing) => listing.brand && selectedBrands.includes(listing.brand),
      );
    }

    console.log("[HomePage] Filtered listings result:", {
      timestamp: new Date().toISOString(),
      filteredCount: filtered.length,
    });

    return filtered;
  }, [listings, searchTerm, selectedCategory, selectedBrands]);

  // Log before map operation
  console.log("[HomePage] About to render listings:", {
    timestamp: new Date().toISOString(),
    filteredListingsCount: filteredListings.length,
    isArray: Array.isArray(filteredListings),
  });

  const unreadCount = unreadMessages.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden">
        <img
          src="/assets/uploads/756488-1.png"
          alt="OLS Marketplace - Buy Smart. Sell Fast."
          className="w-full object-cover"
        />
      </div>

      {/* Search and Filter Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 space-y-4">
          <div>
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />
          {selectedCategory === "Smartphones" && (
            <BrandFilter
              selectedBrands={selectedBrands}
              onBrandsChange={setSelectedBrands}
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* My Chats Button for Authenticated Users */}
        {phoneNumber && (
          <div className="mb-6 flex justify-end">
            <Button
              onClick={() =>
                navigate({ to: "/profile", search: { tab: "messages" } })
              }
              variant="outline"
              className="relative"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              My Chats
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-5 min-w-5 rounded-full px-1 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Loading ads...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="mb-2 text-lg font-semibold text-destructive">
              Failed to load ads
            </p>
            <p className="mb-4 text-sm text-destructive/80">
              {error instanceof Error
                ? error.message
                : "An unknown error occurred. Please try again."}
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredListings.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="mb-2 text-lg font-medium text-foreground">
              {searchTerm || selectedCategory || selectedBrands.length > 0
                ? "No ads found"
                : "No ads available yet"}
            </p>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory || selectedBrands.length > 0
                ? "Try adjusting your search or filters"
                : "Be the first to post an ad!"}
            </p>
            {phoneNumber && (
              <Button
                onClick={() => navigate({ to: "/create-listing" })}
                className="mt-4"
              >
                Post Your First Ad
              </Button>
            )}
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && !isError && filteredListings.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing, index) => {
              console.log(`[HomePage] Rendering listing ${index}:`, {
                id: listing.id?.toString(),
                title: listing.title,
              });
              return (
                <ProductCard key={listing.id.toString()} listing={listing} />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
