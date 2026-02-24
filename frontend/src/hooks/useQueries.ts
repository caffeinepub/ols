import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useMobileAuth } from './useMobileAuth';
import type { ProductListing, ChatMessage } from '../backend';
import { ExternalBlob } from '../backend';

export function useListings() {
  const { actor, isFetching } = useActor();

  return useQuery<ProductListing[]>({
    queryKey: ['listings'],
    queryFn: async () => {
      console.log('[useListings] Query function called', {
        timestamp: new Date().toISOString(),
        actorAvailable: !!actor,
        isFetching,
      });

      if (!actor) {
        console.log('[useListings] Actor not available, returning empty array');
        return [];
      }

      try {
        console.log('[useListings] Calling backend getAllListings...');
        const listings = await actor.getAllListings();
        
        console.log('[useListings] Backend response received:', {
          timestamp: new Date().toISOString(),
          listingsCount: listings?.length ?? 0,
          isArray: Array.isArray(listings),
          listings: listings,
        });

        // Validate response is an array
        if (!Array.isArray(listings)) {
          console.error('[useListings] Response is not an array:', typeof listings);
          return [];
        }

        // Log each listing structure
        listings.forEach((listing, index) => {
          console.log(`[useListings] Listing ${index}:`, {
            id: listing.id?.toString(),
            title: listing.title,
            price: listing.price?.toString(),
            category: listing.category,
            brand: listing.brand,
            sellerPhone: listing.sellerPhone,
            hasImageUrl: !!listing.imageUrl,
            imageUrlType: typeof listing.imageUrl,
          });
        });

        return listings;
      } catch (error) {
        console.error('[useListings] Error fetching listings:', {
          timestamp: new Date().toISOString(),
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const { phoneNumber } = useMobileAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      price: number;
      category: string;
      brand?: string;
      image: File;
    }) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }

      if (!phoneNumber) {
        throw new Error('You must be logged in to create a listing');
      }

      console.log('useCreateListing - Creating listing with data:', {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        brand: data.brand,
        imageSize: data.image.size,
        phoneNumber,
      });

      // Convert image file to bytes
      const imageBytes = new Uint8Array(await data.image.arrayBuffer());
      const imageBlob = ExternalBlob.fromBytes(imageBytes);

      const listingId = await actor.createListing(
        phoneNumber,
        data.title,
        data.description,
        BigInt(data.price),
        data.category,
        imageBlob,
        BigInt(Date.now() * 1000000),
        data.brand || null
      );

      console.log('useCreateListing - Listing created with ID:', listingId);
      return listingId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
    },
    onError: (error) => {
      console.error('useCreateListing - Error creating listing:', error);
    },
  });
}

export function useUserListings() {
  const { actor, isFetching } = useActor();
  const { phoneNumber } = useMobileAuth();

  return useQuery<ProductListing[]>({
    queryKey: ['userListings', phoneNumber],
    queryFn: async () => {
      if (!actor || !phoneNumber) return [];
      console.log('useUserListings - Fetching listings for:', phoneNumber);
      const listings = await actor.getUserListings(phoneNumber);
      console.log('useUserListings - Retrieved listings:', listings.length);
      return listings;
    },
    enabled: !!actor && !!phoneNumber && !isFetching,
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const { phoneNumber } = useMobileAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor || !phoneNumber) {
        throw new Error('Not authenticated');
      }
      await actor.deleteListing(listingId, phoneNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
    },
  });
}

export function useEditListing() {
  const { actor } = useActor();
  const { phoneNumber } = useMobileAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      listingId: bigint;
      title: string;
      description: string;
      price: bigint;
      category: string;
      brand?: string;
      image: ExternalBlob;
    }) => {
      if (!actor || !phoneNumber) {
        throw new Error('Not authenticated');
      }

      await actor.editListing(
        data.listingId,
        phoneNumber,
        data.title,
        data.description,
        data.price,
        data.category,
        data.image,
        data.brand || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
    },
  });
}

export function useListing(listingId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<ProductListing | null>({
    queryKey: ['listing', listingId?.toString()],
    queryFn: async () => {
      if (!actor || !listingId) return null;
      return await actor.getListing(listingId);
    },
    enabled: !!actor && !!listingId && !isFetching,
  });
}

export function useCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      const categories = await actor.getAllCategories();
      return Array.from(new Set(categories));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchListings(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ProductListing[]>({
    queryKey: ['searchListings', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return await actor.searchListings(searchTerm);
    },
    enabled: !!actor && !!searchTerm && !isFetching,
  });
}

export function useListingsByCategory(category: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ProductListing[]>({
    queryKey: ['listingsByCategory', category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return await actor.getListingsByCategory(category);
    },
    enabled: !!actor && !!category && !isFetching,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const { phoneNumber } = useMobileAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      receiverPhoneNumber: string;
      listingId: bigint;
      messageText: string;
    }) => {
      if (!actor || !phoneNumber) {
        console.error('useSendMessage - Not authenticated', { actor: !!actor, phoneNumber });
        throw new Error('Not authenticated');
      }
      
      console.log('useSendMessage - Sending message:', {
        senderPhoneNumber: phoneNumber,
        receiverPhoneNumber: data.receiverPhoneNumber,
        listingId: data.listingId.toString(),
        messageText: data.messageText,
      });

      try {
        await actor.sendMessage(
          phoneNumber,
          data.receiverPhoneNumber,
          data.listingId,
          data.messageText
        );
        console.log('useSendMessage - Message sent successfully');
      } catch (error) {
        console.error('useSendMessage - Error sending message:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      console.log('useSendMessage - Invalidating queries after successful send');
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
      queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('useSendMessage - Mutation error:', error);
    },
  });
}

export function useConversation(
  otherPhoneNumber: string | undefined,
  listingId: bigint | undefined
) {
  const { actor, isFetching } = useActor();
  const { phoneNumber } = useMobileAuth();

  return useQuery<ChatMessage[]>({
    queryKey: ['conversation', phoneNumber, otherPhoneNumber, listingId?.toString()],
    queryFn: async () => {
      if (!actor || !phoneNumber || !otherPhoneNumber || !listingId) {
        console.log('useConversation - Missing required parameters', {
          actor: !!actor,
          phoneNumber,
          otherPhoneNumber,
          listingId: listingId?.toString(),
        });
        return [];
      }
      
      console.log('useConversation - Fetching conversation:', {
        phoneNumber1: phoneNumber,
        phoneNumber2: otherPhoneNumber,
        listingId: listingId.toString(),
      });

      try {
        const messages = await actor.getConversation(phoneNumber, otherPhoneNumber, listingId);
        console.log('useConversation - Retrieved messages:', messages.length);
        return messages;
      } catch (error) {
        console.error('useConversation - Error fetching conversation:', error);
        throw error;
      }
    },
    enabled: !!actor && !!phoneNumber && !!otherPhoneNumber && !!listingId && !isFetching,
    refetchInterval: 3000,
  });
}

export function useMarkMessagesAsRead() {
  const { actor } = useActor();
  const { phoneNumber } = useMobileAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { senderPhoneNumber: string; listingId: bigint }) => {
      if (!actor || !phoneNumber) {
        console.error('useMarkMessagesAsRead - Not authenticated');
        throw new Error('Not authenticated');
      }
      
      console.log('useMarkMessagesAsRead - Marking messages as read:', {
        senderPhoneNumber: data.senderPhoneNumber,
        receiverPhoneNumber: phoneNumber,
        listingId: data.listingId.toString(),
      });

      await actor.markMessagesAsRead(data.senderPhoneNumber, phoneNumber, data.listingId);
      console.log('useMarkMessagesAsRead - Messages marked as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('useMarkMessagesAsRead - Error:', error);
    },
  });
}

export function useUnreadMessages() {
  const { actor, isFetching } = useActor();
  const { phoneNumber } = useMobileAuth();

  return useQuery<ChatMessage[]>({
    queryKey: ['unreadMessages', phoneNumber],
    queryFn: async () => {
      if (!actor || !phoneNumber) {
        console.log('useUnreadMessages - Missing actor or phoneNumber');
        return [];
      }
      
      console.log('useUnreadMessages - Fetching unread messages for:', phoneNumber);
      try {
        const messages = await actor.getUnreadMessages(phoneNumber);
        console.log('useUnreadMessages - Retrieved unread messages:', messages.length);
        return messages;
      } catch (error) {
        console.error('useUnreadMessages - Error fetching unread messages:', error);
        throw error;
      }
    },
    enabled: !!actor && !!phoneNumber && !isFetching,
    refetchInterval: 5000,
  });
}

// New hook to fetch all conversations for the current user
export function useConversations() {
  const { actor, isFetching } = useActor();
  const { phoneNumber } = useMobileAuth();

  return useQuery<ChatMessage[]>({
    queryKey: ['conversations', phoneNumber],
    queryFn: async () => {
      if (!actor || !phoneNumber) {
        console.log('useConversations - Missing actor or phoneNumber');
        return [];
      }
      
      console.log('useConversations - Fetching all conversations for:', phoneNumber);
      try {
        // Fetch unread messages to get conversation list
        const unreadMessages = await actor.getUnreadMessages(phoneNumber);
        console.log('useConversations - Retrieved messages:', unreadMessages.length);
        return unreadMessages;
      } catch (error) {
        console.error('useConversations - Error fetching conversations:', error);
        throw error;
      }
    },
    enabled: !!actor && !!phoneNumber && !isFetching,
    refetchInterval: 5000,
  });
}
