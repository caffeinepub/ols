import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Phone, AlertCircle, X } from 'lucide-react';
import { useSendMessage, useConversation, useMarkMessagesAsRead } from '../hooks/useQueries';
import { useMobileAuth } from '../hooks/useMobileAuth';
import { formatPhoneNumber } from '../utils/formatPhoneNumber';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: bigint;
  sellerPhoneNumber: string;
  listingTitle: string;
}

export default function ChatDialog({
  open,
  onOpenChange,
  listingId,
  sellerPhoneNumber,
  listingTitle,
}: ChatDialogProps) {
  const [messageText, setMessageText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { phoneNumber } = useMobileAuth();
  const sendMessage = useSendMessage();
  const { data: messages, isLoading, error } = useConversation(sellerPhoneNumber, listingId);
  const markAsRead = useMarkMessagesAsRead();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Log dialog state for debugging
  useEffect(() => {
    console.log('ChatDialog - State changed:', {
      open,
      listingId: listingId.toString(),
      sellerPhoneNumber,
      listingTitle,
      phoneNumber,
      messagesCount: messages?.length || 0,
      isLoading,
      error: error?.message,
    });
  }, [open, listingId, sellerPhoneNumber, listingTitle, phoneNumber, messages, isLoading, error]);

  // Mark messages as read when dialog opens
  useEffect(() => {
    if (open && sellerPhoneNumber && listingId && phoneNumber) {
      console.log('ChatDialog - Marking messages as read');
      markAsRead.mutate({
        senderPhoneNumber: sellerPhoneNumber,
        listingId,
      });
    }
  }, [open, sellerPhoneNumber, listingId, phoneNumber]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear error when dialog closes
  useEffect(() => {
    if (!open) {
      setErrorMessage(null);
      console.log('ChatDialog - Dialog closed, cleared error');
    }
  }, [open]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      setErrorMessage('Please enter a message');
      return;
    }

    if (!phoneNumber) {
      setErrorMessage('You must be logged in to send messages');
      return;
    }

    // Clear any previous errors
    setErrorMessage(null);

    console.log('ChatDialog - Attempting to send message:', {
      receiverPhoneNumber: sellerPhoneNumber,
      listingId: listingId.toString(),
      messageText: messageText.trim(),
    });

    try {
      await sendMessage.mutateAsync({
        receiverPhoneNumber: sellerPhoneNumber,
        listingId,
        messageText: messageText.trim(),
      });
      setMessageText('');
      console.log('ChatDialog - Message sent successfully');
    } catch (error) {
      // Display the error message to the user
      const errorMsg = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      setErrorMessage(errorMsg);
      console.error('ChatDialog - Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const dismissError = () => {
    setErrorMessage(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {formatPhoneNumber(sellerPhoneNumber)}
            <span className="text-muted-foreground">•</span>
            <span className="text-sm">{listingTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            {isLoading ? (
              <div className="space-y-4 p-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-3/4" />
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load messages. Please try again.
                  </AlertDescription>
                </Alert>
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-4 p-4">
                {messages.map((message) => {
                  const isOwnMessage = message.senderPhoneNumber === phoneNumber;
                  const date = new Date(Number(message.timestamp) / 1000000);

                  return (
                    <div
                      key={message.id.toString()}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.messageText}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
          </ScrollArea>

          {errorMessage && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{errorMessage}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-2"
                  onClick={dismissError}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessage.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendMessage.isPending}
              size="icon"
            >
              {sendMessage.isPending ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
