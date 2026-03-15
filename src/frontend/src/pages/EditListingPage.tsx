import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useEditListing, useListing } from "../hooks/useQueries";

const CATEGORIES = [
  "Smartphones",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Vehicles",
  "Real Estate",
];
const MOBILE_BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Realme",
  "Vivo",
  "Oppo",
  "Other",
];

export default function EditListingPage() {
  const { id } = useParams({ from: "/edit-listing/$id" });
  const navigate = useNavigate();
  const { data: listing, isLoading } = useListing(BigInt(id));
  const editListing = useEditListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description);
      setPrice(listing.price.toString());
      setCategory(listing.category);
      setBrand(listing.brand || "");
      setImagePreview(listing.imageUrl.getDirectURL());
    }
  }, [listing]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    // Reset brand when category changes away from Smartphones
    if (newCategory !== "Smartphones") {
      setBrand("");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    if (listing) {
      setImageFile(null);
      setImagePreview(listing.imageUrl.getDirectURL());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!listing) return;

    try {
      let imageBlob: ExternalBlob;

      if (imageFile) {
        // New image uploaded
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array);
      } else {
        // Keep existing image
        imageBlob = listing.imageUrl;
      }

      await editListing.mutateAsync({
        listingId: listing.id,
        title,
        description,
        price: BigInt(Math.round(Number.parseFloat(price))),
        category,
        brand: category === "Smartphones" && brand ? brand : undefined,
        image: imageBlob,
      });

      toast.success("Ad updated successfully!");
      navigate({ to: "/profile" });
    } catch (error) {
      toast.error("Failed to update ad");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container max-w-3xl py-8">
        <p className="text-center text-muted-foreground">Ad not found</p>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: "/profile" })}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Edit Ad</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category - First Field */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={handleCategoryChange}
                disabled={editListing.isPending}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand - Only show for Smartphones category */}
            {category === "Smartphones" && (
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select
                  value={brand}
                  onValueChange={setBrand}
                  disabled={editListing.isPending}
                >
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOBILE_BRANDS.map((brandOption) => (
                      <SelectItem key={brandOption} value={brandOption}>
                        {brandOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., iPhone 13 Pro Max"
                maxLength={100}
                required
                disabled={editListing.isPending}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item in detail..."
                rows={5}
                maxLength={500}
                required
                disabled={editListing.isPending}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/500 characters
              </p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">
                Price (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="1"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                required
                disabled={editListing.isPending}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">
                Product Image <span className="text-destructive">*</span>
              </Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-64 w-full rounded-lg object-cover"
                  />
                  {imageFile && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={removeImage}
                      disabled={editListing.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="mt-2">
                    <label
                      htmlFor="image"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
                    >
                      <Upload className="h-4 w-4" />
                      Change Image
                    </label>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={editListing.isPending}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-12">
                  <label
                    htmlFor="image"
                    className="flex cursor-pointer flex-col items-center gap-2 text-center"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Click to upload image
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </span>
                  </label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={editListing.isPending}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={editListing.isPending}
            >
              {editListing.isPending ? "Updating Ad..." : "Update Ad"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
