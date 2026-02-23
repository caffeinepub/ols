import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useListing, useEditListing } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import { ArrowLeft, Upload } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Vehicles', 'Real Estate', 'Fashion', 'Home & Garden'];

export default function EditListingPage() {
  const { id } = useParams({ from: '/edit-listing/$id' });
  const navigate = useNavigate();
  const { data: listing, isLoading } = useListing(BigInt(id));
  const editListing = useEditListing();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description);
      setPrice(listing.price.toString());
      setCategory(listing.category);
      setImagePreview(listing.image.getDirectURL());
    }
  }, [listing]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
        imageBlob = listing.image;
      }

      await editListing.mutateAsync({
        listingId: listing.id,
        title,
        description,
        price: BigInt(Math.round(parseFloat(price))),
        category,
        image: imageBlob,
      });

      toast.success('Ad updated successfully!');
      navigate({ to: '/profile' });
    } catch (error) {
      toast.error('Failed to update ad');
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
        onClick={() => navigate({ to: '/profile' })}
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
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., iPhone 13 Pro Max"
                required
                disabled={editListing.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item in detail..."
                rows={5}
                required
                disabled={editListing.isPending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                  disabled={editListing.isPending}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={editListing.isPending}
                />
                <label 
                  htmlFor="image" 
                  className={`cursor-pointer ${editListing.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      {!editListing.isPending && (
                        <p className="text-sm text-muted-foreground">
                          Click to change image
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload an image
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={editListing.isPending}
            >
              {editListing.isPending ? 'Updating...' : 'Update Ad'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
