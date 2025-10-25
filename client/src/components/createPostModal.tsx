// components/modals/CreatePostModal.tsx
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import API from "@/api/axios";
import { X, Image } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal = ({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePostModalProps) => {
  const user = useSelector((state: RootState) => state.user.value);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [postImages, setPostImages] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + postImages.length > 4) {
      toast.error("You can only upload up to 4 images");
      return;
    }
    setPostImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setPostImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && postImages.length === 0) {
      toast.error("Please write something or add an image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("postType", postImages.length > 0 ? "image" : "text");

      postImages.forEach((image) => {
        formData.append("images", image);
      });

      const { data } = await API.post("/post/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success("Post created successfully");
        setContent("");
        setPostImages([]);
        onPostCreated();
        onClose();
      } else {
        toast.error(data.message || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Error creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* User Profile */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user?.profileimagelink || "/src/assets/sample_profile.jpg"}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
            />
            <div>
              <p className="font-semibold text-gray-900">{user?.fullname}</p>
              <p className="text-gray-500 text-sm">@{user?.username}</p>
            </div>
          </div>

          {/* Content */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[120px] border-none resize-none focus:ring-0 text-lg placeholder-gray-500"
            rows={4}
          />

          {/* Image Preview */}
          {postImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {postImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-6">
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="post-images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="post-images"
                className="cursor-pointer text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Image size={20} />
                <span>Add Images ({postImages.length}/4)</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || (!content.trim() && postImages.length === 0)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {loading ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
