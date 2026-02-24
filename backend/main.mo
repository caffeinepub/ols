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
    sellerPhone : Text;
    imageUrl : Storage.ExternalBlob;
    createdAt : Int;
    status : Text;
    brand : ?Text;
  };

  module ProductListing {
    public func compare(listingA : ProductListing, listingB : ProductListing) : Order.Order {
      Nat.compare(listingA.id, listingB.id);
    };
  };

  let listings = Map.empty<Nat, ProductListing>();
  var nextListingId = 0;

  public query ({ caller }) func getAllListings() : async [ProductListing] {
    listings.values().toArray();
  };

  public shared ({ caller }) func createListing(
    sellerPhone : Text,
    title : Text,
    description : Text,
    price : Nat,
    category : Text,
    imageUrl : Storage.ExternalBlob,
    createdAt : Int,
    brand : ?Text,
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

    if (sellerPhone.size() == 0) {
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
      sellerPhone;
      imageUrl;
      createdAt;
      status = "active";
      brand;
    };

    listings.add(nextListingId, listing);
    Debug.print("createListing - Listing successfully created for id: " # nextListingId.toText());
    nextListingId += 1;
    listing.id;
  };

  public shared ({ caller }) func editListing(
    listingId : Nat,
    sellerPhone : Text,
    title : Text,
    description : Text,
    price : Nat,
    category : Text,
    imageUrl : Storage.ExternalBlob,
    brand : ?Text,
  ) : async () {
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) {
        if (listing.sellerPhone != sellerPhone) {
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
          imageUrl;
          brand;
        };
        listings.add(listingId, updatedListing);
      };
    };
  };

  public shared ({ caller }) func deleteListing(listingId : Nat, sellerPhone : Text) : async () {
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) {
        if (listing.sellerPhone != sellerPhone) {
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

  public query func getUserListings(sellerPhone : Text) : async [ProductListing] {
    let filtered = List.empty<ProductListing>();
    for ((_, listing) in listings.entries()) {
      if (listing.sellerPhone == sellerPhone) {
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
    let categories = List.empty<Text>();
    for ((_, listing) in listings.entries()) {
      categories.add(listing.category);
    };
    categories.toArray();
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
    senderPhone : Text;
    receiverPhone : Text;
    listingId : Nat;
    messageText : Text;
    timestamp : Int;
    isRead : Bool;
  };

  var nextMessageId = 0;

  let chatMessages = Map.empty<Nat, ChatMessage>();

  public shared ({ caller }) func sendMessage(
    senderPhone : Text,
    receiverPhone : Text,
    listingId : Nat,
    messageText : Text,
  ) : async () {
    if (senderPhone.size() == 0 or receiverPhone.size() == 0) {
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
          senderPhone;
          receiverPhone;
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
          (message.senderPhone == phoneNumber1 and message.receiverPhone == phoneNumber2) or
          (message.senderPhone == phoneNumber2 and message.receiverPhone == phoneNumber1)
        )
      ) {
        filtered.add(message);
      };
    };
    filtered.toArray();
  };

  public shared ({ caller }) func markMessagesAsRead(senderPhone : Text, receiverPhone : Text, listingId : Nat) : async () {
    for ((id, message) in chatMessages.entries()) {
      if (
        message.senderPhone == senderPhone and
        message.receiverPhone == receiverPhone and
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

  public query ({ caller }) func getUnreadMessages(receiverPhone : Text) : async [ChatMessage] {
    let filtered = List.empty<ChatMessage>();
    for ((_, message) in chatMessages.entries()) {
      if (message.receiverPhone == receiverPhone and not message.isRead) {
        filtered.add(message);
      };
    };
    filtered.toArray();
  };
};
