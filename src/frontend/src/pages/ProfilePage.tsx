import { useState, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Trash2, MessageCircle } from 'lucide-react';
import { useUserListings, useDeleteListing, useUnreadMessages } from '../hooks/useQueries';
import { useMobileAuth } from '../hooks/useMobileAuth';
import { formatPrice } from '../utils/formatPrice';
import { formatPhoneNumber } from '../utils/formatPhoneNumber';
import ChatDialog from '../components/ChatDialog';
import { toast } from 'sonner';
import type { ChatMessage } from '../backend';

interface ConversationInfo {
  listingId: bigint;
  otherPhone: string;
  listingTitle: string;
  lastMessage: string;
  timestamp: bigint;
  unreadCount: number;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/profile' });
  const { phoneNumber } = useMobileAuth();
  const { data: listings = [], isLoading: listingsLoading } = useUserListings();
  const { data: unreadMessages = [], isLoading: messagesLoading } = useUnreadMessages();
  const deleteListing = useDeleteListing();
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<{
    listingId: bigint;
    otherPhone: string;
    listingTitle: string;
  } | null>(null);

  const activeTab = (search as { tab?: string })?.tab || 'ads';

  console.log('ProfilePage - Unread messages:', {
    count: unreadMessages.length,
    messages: unreadMessages,
  });

  // Group messages by conversation (listingId + other person's phone)
  const conversations = useMemo(() => {
    const conversationMap = new Map<string, ConversationInfo>();

    unreadMessages.forEach((msg) => {
      // Determine the other person in the conversation
      const isReceived = msg.receiverPhone === phoneNumber;
      const otherPhone = isReceived ? msg.senderPhone : msg.receiverPhone;
      
      // Create a unique key for this conversation
      const key = `${msg.listingId}-${msg.senderPhone}`;

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          listingId: msg.listingId,
          otherPhone,
          listingTitle: `Listing #${msg.listingId}`,
          lastMessage: msg.messageText,
          timestamp: msg.timestamp,
          unreadCount: isReceived && !msg.isRead ? 1 : 0,
        });
      } else {
        const existing = conversationMap.get(key)!;
        if (msg.timestamp > existing.timestamp) {
          existing.lastMessage = msg.messageText;
          existing.timestamp = msg.timestamp;
        }
        if (isReceived && !msg.isRead) {
          existing.unreadCount++;
        }
      }
    });

    const result = Array.from(conversationMap.values()).sort(
      (a, b) => Number(b.timestamp - a.timestamp)
    );

    console.log('ProfilePage - Processed conversations:', result);
    return result;
  }, [unreadMessages, phoneNumber]);

  const handleDeleteListing = async (listingId: bigint) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      try {
        await deleteListing.mutateAsync(listingId);
        toast.success('Ad deleted successfully');
      } catch (error) {
        toast.error('Failed to delete ad');
        console.error(error);
      }
    }
  };

  const handleConversationClick = (conv: ConversationInfo) => {
    console.log('ProfilePage - Opening conversation:', conv);
    setSelectedConversation({
      listingId: conv.listingId,
      otherPhone: conv.otherPhone,
      listingTitle: conv.listingTitle,
    });
    setChatDialogOpen(true);
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Logged in as {formatPhoneNumber(phoneNumber || '')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => navigate({ to: '/profile', search: { tab: value } })}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="ads">My Ads</TabsTrigger>
          <TabsTrigger value="messages" className="relative">
            Messages
            {conversations.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 rounded-full px-1 text-xs">
                {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ads">
          {listingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't posted any ads yet</p>
                <Button onClick={() => navigate({ to: '/create-listing' })}>
                  Post Your First Ad
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id.toString()} className="overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={listing.imageUrl.getDirectURL()}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-3 right-3 bg-background/90 text-foreground border-border">
                      {listing.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground">
                      {listing.title}
                    </h3>
                    <p className="text-2xl font-bold text-primary mb-4">
                      {formatPrice(listing.price)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          navigate({ to: '/edit-listing/$id', params: { id: listing.id.toString() } })
                        }
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteListing(listing.id)}
                        disabled={deleteListing.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages">
          {messagesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No messages yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {conversations.map((conv) => (
                <Card
                  key={`${conv.listingId}-${conv.otherPhone}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleConversationClick(conv)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {formatPhoneNumber(conv.otherPhone)}
                          </h3>
                          {conv.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 min-w-5 rounded-full px-1 text-xs">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{conv.listingTitle}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {conv.lastMessage}
                        </p>
                      </div>
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedConversation && (
        <ChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          listingId={selectedConversation.listingId}
          sellerPhoneNumber={selectedConversation.otherPhone}
          listingTitle={selectedConversation.listingTitle}
        />
      )}
    </div>
  );
}
