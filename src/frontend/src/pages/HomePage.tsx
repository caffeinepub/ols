import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import { useListings, useUnreadMessages } from '../hooks/useQueries';
import { useMobileAuth } from '../hooks/useMobileAuth';

export function HomePage() {
  const navigate = useNavigate();
  const { phoneNumber } = useMobileAuth();
  const { data: listings = [], isLoading, isError, error } = useListings();
  const { data: unreadMessages = [] } = useUnreadMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredListings = useMemo(() => {
    let filtered = listings;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(lowerSearch) ||
          listing.description.toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((listing) => listing.category === selectedCategory);
    }

    return filtered;
  }, [listings, searchTerm, selectedCategory]);

  const unreadCount = unreadMessages.length;

  console.log('HomePage - Listings:', listings.length, 'Filtered:', filteredListings.length);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="Marketplace Hero"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30">
          <div className="container mx-auto flex h-full flex-col items-start justify-center px-4">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Buy & Sell Locally
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-white/90 md:text-xl">
              Connect with buyers and sellers in your area. Find great deals on everything from
              electronics to vehicles.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-4">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* My Chats Button for Authenticated Users */}
        {phoneNumber && (
          <div className="mb-6 flex justify-end">
            <Button
              onClick={() => navigate({ to: '/profile', search: { tab: 'messages' } })}
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
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading ads...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">
              Failed to load ads: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredListings.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="mb-2 text-lg font-medium text-foreground">
              {searchTerm || selectedCategory ? 'No ads found' : 'No ads available yet'}
            </p>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory
                ? 'Try adjusting your search or filters'
                : 'Be the first to post an ad!'}
            </p>
            {phoneNumber && (
              <Button onClick={() => navigate({ to: '/create-listing' })} className="mt-4">
                Post Your First Ad
              </Button>
            )}
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && !isError && filteredListings.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <ProductCard key={listing.id.toString()} listing={listing} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
