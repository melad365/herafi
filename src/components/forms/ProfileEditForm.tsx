"use client";

import { useActionState, useState, useEffect } from "react";
import { updateProfile, ProfileActionState } from "@/actions/profile";
import { uploadPortfolioImage, deletePortfolioImage } from "@/actions/upload-portfolio";
import AvatarCropModal from "./AvatarCropModal";
import { PortfolioImage, User } from "@prisma/client";
import { toast } from "sonner";

interface ProfileEditFormProps {
  user: User & {
    portfolioImages: PortfolioImage[];
  };
}

const initialState: ProfileActionState = { success: false };

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [portfolioImages, setPortfolioImages] = useState(user.portfolioImages);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAvatarSuccess = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
    toast.success("Avatar updated successfully!");
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (portfolioImages.length >= 6) {
      setPortfolioError("Maximum 6 portfolio images allowed");
      return;
    }

    setPortfolioUploading(true);
    setPortfolioError(null);

    const formData = new FormData();
    formData.append("image", file);

    const result = await uploadPortfolioImage(formData);

    if (result.success && result.image) {
      setPortfolioImages([...portfolioImages, result.image]);
      toast.success("Portfolio image added!");
    } else {
      setPortfolioError(result.error || "Failed to upload image");
      toast.error(result.error || "Failed to upload image");
    }

    setPortfolioUploading(false);
    // Reset file input
    e.target.value = "";
  };

  const handlePortfolioDelete = async (imageId: string) => {
    if (!confirm("Delete this portfolio image?")) return;

    const result = await deletePortfolioImage(imageId);

    if (result.success) {
      setPortfolioImages(portfolioImages.filter((img) => img.id !== imageId));
      toast.success("Portfolio image deleted");
    } else {
      setPortfolioError(result.error || "Failed to delete image");
      toast.error(result.error || "Failed to delete image");
    }
  };

  const getFieldError = (field: string) => {
    return state.fieldErrors?.[field]?.[0];
  };

  // Show toast on form submission success/error
  useEffect(() => {
    if (state.success) {
      toast.success("Profile updated successfully!");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state.success, state.error]);

  return (
    <div className="bg-white rounded-lg shadow-card p-8">

      <form action={formAction} className="space-y-8">
        {/* Avatar Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
          <AvatarCropModal currentAvatarUrl={avatarUrl} onSuccess={handleAvatarSuccess} />
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md px-3 py-2">
              herafi.com/u/
            </span>
            <input
              type="text"
              id="username"
              name="username"
              defaultValue={user.username || ""}
              className={`flex-1 rounded-r-md border ${
                getFieldError("username") ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-burgundy-500 focus:border-burgundy-500"
              } focus:border-transparent focus:ring-2 px-3 py-2`}
              placeholder="johndoe"
            />
          </div>
          {getFieldError("username") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("username")}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Choose a unique username for your profile URL
          </p>
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            defaultValue={user.displayName || ""}
            className={`w-full rounded-md border ${
              getFieldError("displayName") ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-burgundy-500 focus:border-burgundy-500"
            } focus:border-transparent focus:ring-2 px-3 py-2`}
            placeholder="John Doe"
          />
          {getFieldError("displayName") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("displayName")}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={user.bio || ""}
            maxLength={500}
            className={`w-full rounded-md border ${
              getFieldError("bio") ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-burgundy-500 focus:border-burgundy-500"
            } focus:border-transparent focus:ring-2 px-3 py-2`}
            placeholder="Tell us about yourself..."
          />
          {getFieldError("bio") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("bio")}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {user.bio?.length || 0} / 500 characters
          </p>
        </div>

        {/* Portfolio Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h2>

          {portfolioError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {portfolioError}
            </div>
          )}

          {/* Portfolio Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {portfolioImages.map((image) => (
              <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image.imageUrl}
                  alt={image.caption || "Portfolio image"}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handlePortfolioDelete(image.id)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Upload Button */}
            {portfolioImages.length < 6 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-burgundy-500 flex flex-col items-center justify-center cursor-pointer transition-colors">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="mt-2 text-sm text-gray-600">
                  {portfolioUploading ? "Uploading..." : "Add Image"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {portfolioImages.length}/6
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePortfolioUpload}
                  disabled={portfolioUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <p className="text-sm text-gray-500">
            Upload up to 6 images to showcase your work (max 5MB each)
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-burgundy-800 hover:bg-burgundy-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending && (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isPending ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
