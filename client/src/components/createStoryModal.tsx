import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import API from "@/api/axios";
import { X, Upload, Image, Video, Type } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

const CreateStoryModal = ({
  isOpen,
  onClose,
  onStoryCreated,
}: CreateStoryModalProps) => {
  const user = useSelector((state: RootState) => state.user.value);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState<"text" | "image" | "video">(
    "text"
  );
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#6366f1"); // Default purple

  if (!isOpen) return null;

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setMediaType("image");
      } else if (file.type.startsWith("video/")) {
        setMediaType("video");
      }
      setMediaFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mediaType === "text" && !content.trim()) {
      toast.error("Please write something for your story");
      return;
    }

    if ((mediaType === "image" || mediaType === "video") && !mediaFile) {
      toast.error("Please select a media file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("mediaType", mediaType);
      formData.append("backgroundColor", backgroundColor);

      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      const { data } = await API.post("/story/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success("Story created successfully");
        setContent("");
        setMediaFile(null);
        setMediaType("text");
        setBackgroundColor("#6366f1");
        onStoryCreated();
        onClose();
      } else {
        toast.error(data.message || "Failed to create story");
      }
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Error creating story");
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#ef4444",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Story</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Media Type Selection */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setMediaType("text")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                mediaType === "text"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              <Type size={18} />
              Text
            </button>
            <button
              type="button"
              onClick={() => setMediaType("image")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                mediaType === "image"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              <Image size={18} />
              Image
            </button>
            <button
              type="button"
              onClick={() => setMediaType("video")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                mediaType === "video"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              <Video size={18} />
              Video
            </button>
          </div>

          {/* Text Story */}
          {mediaType === "text" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Content
              </label>
              <div
                className="rounded-xl p-6 min-h-[200px] flex items-center justify-center"
                style={{ backgroundColor }}
              >
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's your story?"
                  className="bg-transparent border-none text-white placeholder-white text-center text-xl font-semibold resize-none h-auto"
                  rows={3}
                />
              </div>

              {/* Color Picker */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBackgroundColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        backgroundColor === color
                          ? "border-gray-800"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Media Story */}
          {(mediaType === "image" || mediaType === "video") && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload {mediaType === "image" ? "Image" : "Video"}
              </label>
              <input
                type="file"
                accept={mediaType === "image" ? "image/*" : "video/*"}
                onChange={handleMediaChange}
                className="hidden"
                id="story-media"
              />
              <label
                htmlFor="story-media"
                className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors block"
              >
                {mediaFile ? (
                  <div>
                    {mediaType === "image" ? (
                      <img
                        src={URL.createObjectURL(mediaFile)}
                        alt="Preview"
                        className="w-full max-h-64 object-cover rounded-lg mx-auto"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(mediaFile)}
                        className="w-full max-h-64 rounded-lg mx-auto"
                        controls
                      />
                    )}
                    <p className="mt-2 text-sm text-gray-600">
                      Click to change
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <Upload size={48} className="mx-auto mb-2" />
                    <p>
                      Click to upload{" "}
                      {mediaType === "image" ? "an image" : "a video"}
                    </p>
                  </div>
                )}
              </label>

              {/* Caption */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption (Optional)
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a caption to your story..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                (mediaType === "text" && !content.trim()) ||
                ((mediaType === "image" || mediaType === "video") && !mediaFile)
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {loading ? "Creating..." : "Create Story"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryModal;
