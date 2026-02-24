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

const CATEGORIES = ['Smartphones', 'Electronics', 'Fashion', 'Home & Garden', 'Vehicles', 'Real Estate'];
const MOBILE_BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo', 'Other'];

export function CreateListingPage() {
  const navigate = useNavigate();
  const { phoneNumber } = useMobileAuth();
  const createListing = useCreateListing();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    // Reset brand when category changes away from Smartphones
    if (newCategory !== 'Smartphones') {
      setBrand('');
    }
  };

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

    if (!category) {
      newErrors.push('Category is required');
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
        brand: category === 'Smartphones' && brand ? brand : undefined,
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
            {/* Category - First Field */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={handleCategoryChange} disabled={createListing.isPending}>
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

            {/* Brand - Second Field (Only show for Smartphones category) */}
            {category === 'Smartphones' && (
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select value={brand} onValueChange={setBrand} disabled={createListing.isPending}>
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
                    disabled={createListing.isPending}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={createListing.isPending}
            >
              {createListing.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Ad...
                </>
              ) : (
                'Create Ad'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
