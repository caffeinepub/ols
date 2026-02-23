import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Phone } from 'lucide-react';
import { formatPhoneNumber } from '../utils/formatPhoneNumber';

interface ConversationItem {
  listingId: bigint;
  listingTitle: string;
  otherPhoneNumber: string;
  lastMessage: string;
  timestamp: bigint;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  onConversationClick: (listingId: bigint, phoneNumber: string, listingTitle: string) => void;
}

export default function ConversationList({
  conversations,
  onConversationClick,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
        <p className="text-muted-foreground">
          Start chatting with sellers on product listings
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-3">
        {conversations.map((conversation) => {
          const date = new Date(Number(conversation.timestamp) / 1000000);

          return (
            <Card
              key={`${conversation.listingId}-${conversation.otherPhoneNumber}`}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => {
                console.log('ConversationList - Conversation clicked:', {
                  listingId: conversation.listingId.toString(),
                  otherPhoneNumber: conversation.otherPhoneNumber,
                  listingTitle: conversation.listingTitle,
                });
                onConversationClick(
                  conversation.listingId,
                  conversation.otherPhoneNumber,
                  conversation.listingTitle
                );
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">
                        {formatPhoneNumber(conversation.otherPhoneNumber)}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {conversation.listingTitle}
                    </p>
                    <p className="text-sm text-foreground line-clamp-2">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {date.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
