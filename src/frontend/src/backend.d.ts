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
    description: string;
    timestamp: bigint;
    category: string;
    image: ExternalBlob;
    price: bigint;
    sellerPhoneNumber: string;
}
export interface ChatMessage {
    id: bigint;
    receiverPhoneNumber: string;
    listingId: bigint;
    isRead: boolean;
    messageText: string;
    timestamp: bigint;
    senderPhoneNumber: string;
}
export interface backendInterface {
    createListing(sellerPhoneNumber: string, title: string, description: string, price: bigint, category: string, image: ExternalBlob, timestamp: bigint): Promise<bigint>;
    deleteListing(listingId: bigint, sellerPhoneNumber: string): Promise<void>;
    editListing(listingId: bigint, sellerPhoneNumber: string, title: string, description: string, price: bigint, category: string, image: ExternalBlob): Promise<void>;
    getAllCategories(): Promise<Array<string>>;
    getAllListings(): Promise<Array<ProductListing>>;
    getConversation(phoneNumber1: string, phoneNumber2: string, listingId: bigint): Promise<Array<ChatMessage>>;
    getListing(listingId: bigint): Promise<ProductListing>;
    getListingsByCategory(category: string): Promise<Array<ProductListing>>;
    getUnreadMessages(receiverPhoneNumber: string): Promise<Array<ChatMessage>>;
    getUserListings(sellerPhoneNumber: string): Promise<Array<ProductListing>>;
    markMessagesAsRead(senderPhoneNumber: string, receiverPhoneNumber: string, listingId: bigint): Promise<void>;
    searchListings(searchTerm: string): Promise<Array<ProductListing>>;
    sendMessage(senderPhoneNumber: string, receiverPhoneNumber: string, listingId: bigint, messageText: string): Promise<void>;
}
