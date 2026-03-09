import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { Product } from "../../backend";
import { ExternalBlob } from "../../backend";
import {
  useCreateProduct,
  useUpdateProduct,
} from "../../hooks/useMarketplaceQueries";

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
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports & Outdoors",
  "Books",
  "Toys & Games",
  "Health & Beauty",
  "Food & Beverage",
  "Art & Crafts",
  "Other",
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"];

export default function VendorProductForm({
  product,
  onSuccess,
}: VendorProductFormProps) {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [backendError, setBackendError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      title: product?.title || "",
      description: product?.description || "",
      price: product ? (Number(product.price) / 100).toFixed(2) : "",
      currency: product?.currency || "USD",
      imageUrl: product?.imageUrl || "",
      category: product?.category || "",
      isPublished: product?.isPublished || false,
    },
  });

  const isPublished = watch("isPublished");
  const imageUrl = watch("imageUrl");

  const handleTabChange = (tab: string) => {
    setImageTab(tab as "upload" | "url");
    // Clear current image URL when switching tabs to avoid stale URLs
    setValue("imageUrl", "");
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError(
        "Please select a valid image file (JPEG, PNG, GIF, WebP, etc.)",
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image must be smaller than 10 MB");
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setValue("imageUrl", "");

    try {
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(fileBytes).withUploadProgress(
        (pct) => {
          setUploadProgress(pct);
        },
      );
      const url = blob.getDirectURL();
      setUploadProgress(100);
      setValue("imageUrl", url);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to process image";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
  };

  const clearImage = () => {
    setValue("imageUrl", "");
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setBackendError(null);

    try {
      const priceInCents = BigInt(
        Math.round(Number.parseFloat(data.price) * 100),
      );

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
    } catch (error: unknown) {
      console.error("Product operation error:", error);
      setBackendError(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the product",
      );
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {backendError && (
        <Alert
          variant="destructive"
          data-ocid="vendor.product_form.error_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{backendError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Product Title *</Label>
        <Input
          id="title"
          {...register("title", { required: "Title is required" })}
          placeholder="Enter product title"
          disabled={isPending}
          data-ocid="vendor.product_form.title.input"
        />
        {errors.title && (
          <p
            className="text-sm text-destructive"
            data-ocid="vendor.product_form.title.error_state"
          >
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register("description", { required: "Description is required" })}
          placeholder="Describe your product"
          rows={4}
          disabled={isPending}
          data-ocid="vendor.product_form.description.textarea"
        />
        {errors.description && (
          <p
            className="text-sm text-destructive"
            data-ocid="vendor.product_form.description.error_state"
          >
            {errors.description.message}
          </p>
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
            {...register("price", {
              required: "Price is required",
              min: { value: 0, message: "Price must be positive" },
            })}
            placeholder="0.00"
            disabled={isPending}
            data-ocid="vendor.product_form.price.input"
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select
            value={watch("currency")}
            onValueChange={(value) => setValue("currency", value)}
            disabled={isPending}
          >
            <SelectTrigger
              id="currency"
              data-ocid="vendor.product_form.currency.select"
            >
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
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
          value={watch("category")}
          onValueChange={(value) => setValue("category", value)}
          disabled={isPending}
        >
          <SelectTrigger
            id="category"
            data-ocid="vendor.product_form.category.select"
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
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

      {/* ── Product Image Section ── */}
      <div className="space-y-3">
        <Label>Product Image</Label>

        <Tabs
          value={imageTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="upload"
              data-ocid="vendor.product_form.image.tab.upload"
              className="gap-2"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload File
            </TabsTrigger>
            <TabsTrigger
              value="url"
              data-ocid="vendor.product_form.image.tab.url"
              className="gap-2"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Use URL
            </TabsTrigger>
          </TabsList>

          {/* Upload File Tab */}
          <TabsContent value="upload" className="mt-3 space-y-3">
            {!imageUrl ? (
              <>
                {/* Drop zone — uses <label> wrapping a hidden file input for semantic HTML */}
                <label
                  data-ocid="vendor.product_form.image.dropzone"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                  htmlFor="product-image-file-input"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Drag & drop or{" "}
                      <span className="text-primary underline-offset-4 hover:underline">
                        browse files
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, GIF, WebP — max 10 MB
                    </p>
                  </div>
                  <input
                    id="product-image-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileInputChange}
                    disabled={isPending || isUploading}
                    aria-label="Choose image file"
                  />
                </label>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  disabled={isPending || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="vendor.product_form.image.upload_button"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isUploading ? "Processing…" : "Choose Image File"}
                </Button>
              </>
            ) : (
              /* Image preview after successful upload */
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    className="h-20 w-20 rounded-lg object-cover border border-border shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearImage();
                  }}
                  className="gap-2"
                  data-ocid="vendor.product_form.image.upload_button"
                >
                  <Upload className="h-4 w-4" />
                  Change Image
                </Button>
              </div>
            )}

            {/* Upload progress */}
            {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
              <div
                className="space-y-1.5"
                data-ocid="vendor.product_form.image.loading_state"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Processing image…</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}

            {/* Upload error */}
            {uploadError && (
              <Alert
                variant="destructive"
                data-ocid="vendor.product_form.image.error_state"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Use URL Tab */}
          <TabsContent value="url" className="mt-3 space-y-3">
            <div className="space-y-2">
              <Input
                id="imageUrl"
                {...register("imageUrl")}
                placeholder="https://example.com/image.jpg"
                disabled={isPending}
                data-ocid="vendor.product_form.imageUrl.input"
              />
              <p className="text-xs text-muted-foreground">
                Paste a direct link to an externally hosted image. The URL must
                start with{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
                  https://
                </code>{" "}
                and point directly to an image file (e.g. Imgur, Unsplash, your
                own CDN).
              </p>
            </div>

            {/* URL preview thumbnail */}
            {imageUrl && (
              <div className="flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt="Product thumbnail preview"
                  className="h-20 w-20 rounded-lg object-cover border border-border shadow-sm flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
                    {imageUrl}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive gap-1"
                    onClick={clearImage}
                  >
                    <X className="h-3 w-3" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Shared preview thumbnail below tabs when image is set */}
        {imageUrl && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Image ready
          </p>
        )}
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
          onCheckedChange={(checked) => setValue("isPublished", checked)}
          disabled={isPending}
          data-ocid="vendor.product_form.publish.switch"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={isPending}
          data-ocid="vendor.product_form.submit_button"
        >
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
