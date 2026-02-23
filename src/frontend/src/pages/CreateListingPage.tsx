import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, Loader2 } from 'lucide-react';
import { useCreateListing } from '../hooks/useQueries';
import { useMobileAuth } from '../hooks/useMobileAuth';
import { toast } from 'sonner';

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Vehicles', 'Real Estate'];

export function CreateListingPage() {
  const navigate = useNavigate();
  const { phoneNumber } = useMobileAuth();
  const createListing = useCreateListing();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!phoneNumber) {
      newErrors.push('You must be logged in to create an ad');
    }

    if (!title.trim()) {
      newErrors.push('Title is required');
    } else if (title.length > 100) {
      newErrors.push('Title must be 100 characters or less');
    }

    if (!description.trim()) {
      newErrors.push('Description is required');
    } else if (description.length > 500) {
      newErrors.push('Description must be 500 characters or less');
    }

    if (!price || parseFloat(price) <= 0) {
      newErrors.push('Valid price is required');
    }

    if (!category) {
      newErrors.push('Category is required');
    }

    if (!image) {
      newErrors.push('Product image is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      await createListing.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        image: image!,
      });

      toast.success('Ad created successfully!');
      navigate({ to: '/profile' });
    } catch (error) {
      console.error('Error creating listing:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create ad. Please try again.';
      
      if (errorMessage.includes('logged in')) {
        toast.error('Please log in to create an ad');
      } else if (errorMessage.includes('empty')) {
        toast.error('All fields are required');
      } else if (errorMessage.includes('image')) {
        toast.error('Failed to upload image. Please try again.');
      } else {
        toast.error(errorMessage);
      }
      
      setErrors([errorMessage]);
    }
  };

  const dismissErrors = () => {
    setErrors([]);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Ad</CardTitle>
        </CardHeader>
        <CardContent>
          {errors.length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <div className="flex items-start justify-between">
                <AlertDescription>
                  <ul className="list-inside list-disc space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={dismissErrors}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter product title"
                maxLength={100}
                disabled={createListing.isPending}
              />
              <p className="text-xs text-muted-foreground">{title.length}/100 characters</p>
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
                placeholder="Describe your product"
                rows={4}
                maxLength={500}
                disabled={createListing.isPending}
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                min="0"
                step="0.01"
                disabled={createListing.isPending}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory} disabled={createListing.isPending}>
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
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={removeImage}
                    disabled={createListing.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-12">
                  <label
                    htmlFor="image"
                    className="flex cursor-pointer flex-col items-center space-y-2"
                  >
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload image (max 5MB)
                    </span>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={createListing.isPending}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                disabled={createListing.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createListing.isPending} className="flex-1">
                {createListing.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Ad'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
