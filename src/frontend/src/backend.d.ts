import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ProductListing {
    id: bigint;
    status: string;
    title: string;
    sellerPhone: string;
    createdAt: bigint;
    description: string;
    imageUrl: ExternalBlob;
    category: string;
    brand?: string;
    price: bigint;
}
export interface ChatMessage {
    id: bigint;
    senderPhone: string;
    listingId: bigint;
    isRead: boolean;
    messageText: string;
    timestamp: bigint;
    receiverPhone: string;
}
export interface backendInterface {
    createListing(sellerPhone: string, title: string, description: string, price: bigint, category: string, imageUrl: ExternalBlob, createdAt: bigint, brand: string | null): Promise<bigint>;
    deleteListing(listingId: bigint, sellerPhone: string): Promise<void>;
    editListing(listingId: bigint, sellerPhone: string, title: string, description: string, price: bigint, category: string, imageUrl: ExternalBlob, brand: string | null): Promise<void>;
    getAllCategories(): Promise<Array<string>>;
    getAllListings(): Promise<Array<ProductListing>>;
    getConversation(phoneNumber1: string, phoneNumber2: string, listingId: bigint): Promise<Array<ChatMessage>>;
    getListing(listingId: bigint): Promise<ProductListing>;
    getListingsByCategory(category: string): Promise<Array<ProductListing>>;
    getUnreadMessages(receiverPhone: string): Promise<Array<ChatMessage>>;
    getUserListings(sellerPhone: string): Promise<Array<ProductListing>>;
    markMessagesAsRead(senderPhone: string, receiverPhone: string, listingId: bigint): Promise<void>;
    searchListings(searchTerm: string): Promise<Array<ProductListing>>;
    sendMessage(senderPhone: string, receiverPhone: string, listingId: bigint, messageText: string): Promise<void>;
}
