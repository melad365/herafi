"use client";

import { useState, useTransition } from "react";
import { uploadGigImages, removeGigImage } from "@/actions/upload-gig-images";

type ImageUploadSectionProps = {
  gigSlug: string;
  initialImages: string[];
};

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ImageUploadSection({
  gigSlug,
  initialImages,
}: ImageUploadSectionProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Reset error
    setError(null);

    // Validate file count
    if (images.length + files.length > MAX_IMAGES) {
      setError(
        `Maximum ${MAX_IMAGES} images allowed. You can upload ${MAX_IMAGES - images.length} more.`
      );
      e.target.value = ""; // Reset input
      return;
    }

    // Validate file sizes
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`Each image must be under 5MB. "${file.name}" is too large.`);
        e.target.value = ""; // Reset input
        return;
      }
    }

    // Upload files
    startTransition(async () => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const result = await uploadGigImages(gigSlug, formData);

      if (result.success && result.imageUrls) {
        setImages([...images, ...result.imageUrls]);
        e.target.value = ""; // Reset input
      } else {
        setError(result.error ?? "Failed to upload images");
      }
    });
  };

  const handleRemove = async (imageUrl: string) => {
    setError(null);

    startTransition(async () => {
      const result = await removeGigImage(gigSlug, imageUrl);

      if (result.success) {
        setImages(images.filter((url) => url !== imageUrl));
      } else {
        setError(result.error ?? "Failed to remove image");
      }
    });
  };

  return (
    <div>
      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {images.map((imageUrl) => (
            <div key={imageUrl} className="relative group">
              <img
                src={imageUrl}
                alt="Gig image"
                className="aspect-square object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => handleRemove(imageUrl)}
                disabled={isPending}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors disabled:bg-gray-400"
                aria-label="Remove image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload section - only show if under limit */}
      {images.length < MAX_IMAGES && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images ({images.length}/{MAX_IMAGES})
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy-500 focus:border-burgundy-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            Max {MAX_IMAGES} images, up to 5MB each. Formats: JPG, PNG, WebP
          </p>
        </div>
      )}

      {/* Upload status */}
      {isPending && (
        <p className="mt-2 text-sm text-burgundy-700">Processing...</p>
      )}
    </div>
  );
}
