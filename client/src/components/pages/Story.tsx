import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import API from "@/api/axios";
import { Plus } from "lucide-react";
import CreateStoryModal from "../createStoryModal";
import StoryViewerModal from "../storyViewerModal";
import toast from "react-hot-toast";

interface StoryType {
  _id: string;
  content: string;
  mediaUrl: string;
  mediaType: "text" | "image" | "video";
  backgroundColor: string[];
  createdAt: string;
  user: {
    _id: string;
    fullname: string;
    username: string;
    profileimagelink?: string;
  };
}

const Story = () => {
  const user = useSelector((state: RootState) => state.user.value);
  const [stories, setStories] = useState<StoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  const fetchStories = async () => {
    try {
      const { data } = await API.get("/story/get");
      if (data.success) {
        setStories(data.stories || []);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Error loading stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleStoryCreated = () => {
    fetchStories();
  };

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
    setIsViewerOpen(true);
  };

  if (loading) {
    return (
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center space-y-2 flex-shrink-0"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {/* Create Story Button */}
      <div className="flex flex-col items-center space-y-2 flex-shrink-0">
        <button
          onClick={() => setIsCreateStoryModalOpen(true)}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          <Plus size={24} className="text-white" />
        </button>
        <span className="text-xs text-gray-600">Your Story</span>
      </div>

      {/* Stories */}
      {stories.map((story, index) => (
        <div
          key={story._id}
          className="flex flex-col items-center space-y-2 flex-shrink-0"
        >
          <button
            onClick={() => handleStoryClick(index)}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-0.5 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="w-full h-full bg-white rounded-full p-0.5">
              <img
                src={
                  story.user.profileimagelink ||
                  "/src/assets/sample_profile.jpg"
                }
                alt={story.user.fullname}
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>
          </button>
          <span className="text-xs text-gray-600 max-w-16 truncate">
            {story.user._id === user?._id
              ? "You"
              : story.user.fullname.split(" ")[0]}
          </span>
        </div>
      ))}

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={isCreateStoryModalOpen}
        onClose={() => setIsCreateStoryModalOpen(false)}
        onStoryCreated={handleStoryCreated}
      />

      {/* Story Viewer Modal */}
      <StoryViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        stories={stories}
        initialStoryIndex={selectedStoryIndex}
      />
    </div>
  );
};

export default Story;
