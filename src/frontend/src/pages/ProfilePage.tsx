import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useUserListings, useDeleteListing, useConversations } from '../hooks/useQueries';
import { useMobileAuth } from '../hooks/useMobileAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '../utils/formatPrice';
import ConversationList from '../components/ConversationList';
import ChatDialog from '../components/ChatDialog';

export default function ProfilePage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { tab?: string };
  const { phoneNumber } = useMobileAuth();
  const { data: listings, isLoading: listingsLoading } = useUserListings();
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const deleteListing = useDeleteListing();
  const [activeTab, setActiveTab] = useState('listings');
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<{
    listingId: bigint;
    phoneNumber: string;
    listingTitle: string;
  } | null>(null);

  // Handle deep linking from query parameter
  useEffect(() => {
    if (search?.tab === 'messages') {
      console.log('ProfilePage - Switching to messages tab from query param');
      setActiveTab('messages');
    }
  }, [search?.tab]);

  // Log conversations data for debugging
  useEffect(() => {
    console.log('ProfilePage - Conversations data:', {
      count: conversations.length,
      conversations: conversations.map(c => ({
        listingId: c.listingId.toString(),
        sender: c.senderPhoneNumber,
        receiver: c.receiverPhoneNumber,
        isRead: c.isRead,
      })),
    });
  }, [conversations]);

  const handleDelete = async (listingId: bigint) => {
    try {
      console.log('ProfilePage - Deleting listing:', listingId.toString());
      await deleteListing.mutateAsync(listingId);
      toast.success('Ad deleted successfully');
    } catch (error) {
      console.error('ProfilePage - Error deleting listing:', error);
      toast.error('Failed to delete ad');
    }
  };

  const handleConversationClick = (listingId: bigint, otherPhoneNumber: string, listingTitle: string) => {
    console.log('ProfilePage - Conversation clicked:', {
      listingId: listingId.toString(),
      otherPhoneNumber,
      listingTitle,
    });

    try {
      setSelectedConversation({
        listingId,
        phoneNumber: otherPhoneNumber,
        listingTitle,
      });
      setChatDialogOpen(true);
      console.log('ProfilePage - Chat dialog opened');
    } catch (error) {
      console.error('ProfilePage - Error opening chat dialog:', error);
      toast.error('Failed to open chat');
    }
  };

  // Group conversations by listing and sender
  const conversationGroups = conversations.reduce((acc, msg) => {
    const key = `${msg.listingId}-${msg.senderPhoneNumber}`;
    if (!acc[key]) {
      acc[key] = {
        listingId: msg.listingId,
        senderPhoneNumber: msg.senderPhoneNumber,
        messages: [],
      };
    }
    acc[key].messages.push(msg);
    return acc;
  }, {} as Record<string, { listingId: bigint; senderPhoneNumber: string; messages: typeof conversations }>);

  const conversationList = Object.values(conversationGroups).map(group => {
    const listing = listings?.find(l => l.id === group.listingId);
    const sortedMessages = group.messages.sort((a, b) => Number(b.timestamp - a.timestamp));
    const latestMessage = sortedMessages[0];
    const unreadCount = group.messages.filter(m => !m.isRead).length;

    return {
      listingId: group.listingId,
      listingTitle: listing?.title || 'Unknown Listing',
      otherPhoneNumber: group.senderPhoneNumber,
      lastMessage: latestMessage.messageText,
      timestamp: latestMessage.timestamp,
      unreadCount,
    };
  });

  const totalUnreadCount = conversations.filter(m => !m.isRead).length;

  if (listingsLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your ads and messages
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="listings">
            My Ads
            {listings && listings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {listings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages">
            Messages
            {totalUnreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {totalUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id.toString()} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={listing.image.getDirectURL()}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2">
                      {listing.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {listing.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {listing.description}
                    </p>
                    <p className="text-2xl font-bold text-primary mb-4">
                      {formatPrice(listing.price)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() =>
                          navigate({
                            to: '/edit-listing/$id',
                            params: { id: listing.id.toString() },
                          })
                        }
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Ad</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{listing.title}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(listing.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No ads yet</h3>
              <p className="text-muted-foreground mb-6">
                Start selling by creating your first ad
              </p>
              <Button onClick={() => navigate({ to: '/create-listing' })}>
                Create Ad
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          {conversationsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversationList}
              onConversationClick={handleConversationClick}
            />
          )}
        </TabsContent>
      </Tabs>

      {selectedConversation && (
        <ChatDialog
          open={chatDialogOpen}
          onOpenChange={(open) => {
            console.log('ProfilePage - Chat dialog open state changed:', open);
            setChatDialogOpen(open);
            if (!open) {
              setSelectedConversation(null);
            }
          }}
          listingId={selectedConversation.listingId}
          sellerPhoneNumber={selectedConversation.phoneNumber}
          listingTitle={selectedConversation.listingTitle}
        />
      )}
    </div>
  );
}
