import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useMarketplaceQueries';
import type { Product } from '../../backend';

interface VendorProductFormProps {
  product?: Product;
  onSuccess?: () => void;
}

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  imageUrl: string;
  category: string;
  isPublished: boolean;
}

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Health & Beauty',
  'Food & Beverage',
  'Art & Crafts',
  'Other',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

export default function VendorProductForm({ product, onSuccess }: VendorProductFormProps) {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [backendError, setBackendError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      title: product?.title || '',
      description: product?.description || '',
      price: product ? (Number(product.price) / 100).toFixed(2) : '',
      currency: product?.currency || 'USD',
      imageUrl: product?.imageUrl || '',
      category: product?.category || '',
      isPublished: product?.isPublished || false,
    },
  });

  const isPublished = watch('isPublished');

  const onSubmit = async (data: ProductFormData) => {
    setBackendError(null);
    
    try {
      const priceInCents = BigInt(Math.round(parseFloat(data.price) * 100));

      if (isEditing && product) {
        await updateProduct.mutateAsync({
          productId: product.id,
          title: data.title,
          description: data.description,
          price: priceInCents,
          currency: data.currency,
          imageUrl: data.imageUrl,
          category: data.category,
          isPublished: data.isPublished,
        });
      } else {
        await createProduct.mutateAsync({
          title: data.title,
          description: data.description,
          price: priceInCents,
          currency: data.currency,
          imageUrl: data.imageUrl,
          category: data.category,
          isPublished: data.isPublished,
        });
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Product operation error:', error);
      setBackendError(error.message || 'An error occurred while saving the product');
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {backendError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{backendError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Product Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="Enter product title"
          disabled={isPending}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description', { required: 'Description is required' })}
          placeholder="Describe your product"
          rows={4}
          disabled={isPending}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register('price', {
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' },
            })}
            placeholder="0.00"
            disabled={isPending}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select
            value={watch('currency')}
            onValueChange={(value) => setValue('currency', value)}
            disabled={isPending}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(currency => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={watch('category')}
          onValueChange={(value) => setValue('category', value)}
          disabled={isPending}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          {...register('imageUrl')}
          placeholder="https://example.com/image.jpg"
          disabled={isPending}
        />
        <p className="text-sm text-muted-foreground">
          Optional: Enter a URL to an image of your product
        </p>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="isPublished">Publish Product</Label>
          <p className="text-sm text-muted-foreground">
            Make this product visible to customers
          </p>
        </div>
        <Switch
          id="isPublished"
          checked={isPublished}
          onCheckedChange={(checked) => setValue('isPublished', checked)}
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
