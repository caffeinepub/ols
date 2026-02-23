import Set "mo:core/Set";
import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";
import Debug "mo:core/Debug";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type ProductListing = {
    id : Nat;
    title : Text;
    description : Text;
    price : Nat;
    category : Text;
    sellerPhoneNumber : Text;
    image : Storage.ExternalBlob;
    timestamp : Int;
    status : Text;
  };

  module ProductListing {
    public func compare(listingA : ProductListing, listingB : ProductListing) : Order.Order {
      Nat.compare(listingA.id, listingB.id);
    };
  };

  let listings = Map.empty<Nat, ProductListing>();
  var nextListingId = 0;

  public query ({ caller }) func getAllListings() : async [ProductListing] {
    let listingsArray = listings.values().toArray();
    Debug.print("getAllListings - Retrieved Listings Count: " # listingsArray.size().toText());
    listingsArray;
  };

  public shared ({ caller }) func createListing(
    sellerPhoneNumber : Text,
    title : Text,
    description : Text,
    price : Nat,
    category : Text,
    image : Storage.ExternalBlob,
    timestamp : Int,
  ) : async Nat {
    if (title.size() == 0) {
      let errorMsg = "Title cannot be empty";
      Debug.print("createListing - Error: " # errorMsg);
      Runtime.trap(errorMsg);
    };

    if (description.size() == 0) {
      let errorMsg = "Description cannot be empty";
      Debug.print("createListing - Error: " # errorMsg);
      Runtime.trap(errorMsg);
    };

    if (category.size() == 0) {
      let errorMsg = "Category cannot be empty";
      Debug.print("createListing - Error: " # errorMsg);
      Runtime.trap(errorMsg);
    };

    if (sellerPhoneNumber.size() == 0) {
      let errorMsg = "Seller phone number is required";
      Debug.print("createListing - Error: " # errorMsg);
      Runtime.trap(errorMsg);
    };

    let listing : ProductListing = {
      id = nextListingId;
      title;
      description;
      price;
      category;
      sellerPhoneNumber;
      image;
      timestamp;
      status = "active";
    };

    listings.add(nextListingId, listing);
    Debug.print("createListing - Listing successfully created for id: " # nextListingId.toText());
    nextListingId += 1;
    listing.id;
  };

  public shared ({ caller }) func editListing(
    listingId : Nat,
    sellerPhoneNumber : Text,
    title : Text,
    description : Text,
    price : Nat,
    category : Text,
    image : Storage.ExternalBlob,
  ) : async () {
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) {
        if (listing.sellerPhoneNumber != sellerPhoneNumber) {
          Runtime.trap("You are not the owner of this listing");
        };
        if (title.size() == 0) {
          let errorMsg = "Title cannot be empty";
          Debug.print("editListing - Error: " # errorMsg);
          Runtime.trap(errorMsg);
        };
        if (description.size() == 0) {
          let errorMsg = "Description cannot be empty";
          Debug.print("editListing - Error: " # errorMsg);
          Runtime.trap(errorMsg);
        };
        if (category.size() == 0) {
          let errorMsg = "Category cannot be empty";
          Debug.print("editListing - Error: " # errorMsg);
          Runtime.trap(errorMsg);
        };

        let updatedListing : ProductListing = {
          listing with
          title;
          description;
          price;
          category;
          image;
        };
        listings.add(listingId, updatedListing);
      };
    };
  };

  public shared ({ caller }) func deleteListing(listingId : Nat, sellerPhoneNumber : Text) : async () {
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) {
        if (listing.sellerPhoneNumber != sellerPhoneNumber) {
          Runtime.trap("You are not the owner of this listing");
        };
        listings.remove(listingId);
      };
    };
  };

  public query func getListingsByCategory(category : Text) : async [ProductListing] {
    let filtered = List.empty<ProductListing>();
    for ((_, listing) in listings.entries()) {
      if (listing.category == category) {
        filtered.add(listing);
      };
    };
    filtered.toArray();
  };

  public query func getUserListings(sellerPhoneNumber : Text) : async [ProductListing] {
    let filtered = List.empty<ProductListing>();
    for ((_, listing) in listings.entries()) {
      if (listing.sellerPhoneNumber == sellerPhoneNumber) {
        filtered.add(listing);
      };
    };
    filtered.toArray();
  };

  public query func searchListings(searchTerm : Text) : async [ProductListing] {
    let filtered = List.empty<ProductListing>();
    for ((_, listing) in listings.entries()) {
      if (
        listing.title.toLower().contains(#text(searchTerm.toLower())) or
        listing.description.toLower().contains(#text(searchTerm.toLower()))
      ) {
        filtered.add(listing);
      };
    };
    filtered.toArray();
  };

  public query func getAllCategories() : async [Text] {
    listings.values().toArray().map(
      func(listing) {
        listing.category;
      }
    );
  };

  public query func getListing(listingId : Nat) : async ProductListing {
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) { listing };
    };
  };

  // Chat Functionality
  type ChatMessage = {
    id : Nat;
    senderPhoneNumber : Text;
    receiverPhoneNumber : Text;
    listingId : Nat;
    messageText : Text;
    timestamp : Int;
    isRead : Bool;
  };

  var nextMessageId = 0;

  let chatMessages = Map.empty<Nat, ChatMessage>();

  public shared ({ caller }) func sendMessage(
    senderPhoneNumber : Text,
    receiverPhoneNumber : Text,
    listingId : Nat,
    messageText : Text,
  ) : async () {
    // Validate inputs
    if (senderPhoneNumber.size() == 0 or receiverPhoneNumber.size() == 0) {
      Runtime.trap("Both sender and receiver phone numbers are required");
    };

    if (messageText.size() == 0) {
      Runtime.trap("Message text cannot be empty");
    };

    switch (listings.get(listingId)) {
      case (null) {
        Runtime.trap("Listing does not exist");
      };
      case (?_listing) {
        let message : ChatMessage = {
          id = nextMessageId;
          senderPhoneNumber;
          receiverPhoneNumber;
          listingId;
          messageText;
          timestamp = Time.now();
          isRead = false;
        };
        chatMessages.add(nextMessageId, message);
        nextMessageId += 1;
      };
    };
  };

  public query ({ caller }) func getConversation(
    phoneNumber1 : Text,
    phoneNumber2 : Text,
    listingId : Nat,
  ) : async [ChatMessage] {
    let filtered = List.empty<ChatMessage>();
    for ((_, message) in chatMessages.entries()) {
      if (
        message.listingId == listingId and (
          (message.senderPhoneNumber == phoneNumber1 and message.receiverPhoneNumber == phoneNumber2) or
          (message.senderPhoneNumber == phoneNumber2 and message.receiverPhoneNumber == phoneNumber1)
        )
      ) {
        filtered.add(message);
      };
    };
    filtered.toArray();
  };

  public shared ({ caller }) func markMessagesAsRead(senderPhoneNumber : Text, receiverPhoneNumber : Text, listingId : Nat) : async () {
    for ((id, message) in chatMessages.entries()) {
      if (
        message.senderPhoneNumber == senderPhoneNumber and
        message.receiverPhoneNumber == receiverPhoneNumber and
        message.listingId == listingId and
        not message.isRead
      ) {
        let updatedMessage : ChatMessage = {
          message with
          isRead = true;
        };
        chatMessages.add(id, updatedMessage);
      };
    };
  };

  public query ({ caller }) func getUnreadMessages(receiverPhoneNumber : Text) : async [ChatMessage] {
    let filtered = List.empty<ChatMessage>();
    for ((_, message) in chatMessages.entries()) {
      if (message.receiverPhoneNumber == receiverPhoneNumber and not message.isRead) {
        filtered.add(message);
      };
    };
    filtered.toArray();
  };
};
