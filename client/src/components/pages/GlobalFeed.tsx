import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import API from "@/api/axios";
import Story from "./Story";
import Post from "../post";
import CreatePostModal from "../createPostModal";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface PostType {
  _id: string;
  content: string;
  imageUrls: string[];
  postType: "text" | "image" | "text_with_image";
  createdAt: string;
  user: {
    _id: string;
    fullname: string;
    username: string;
    profileimagelink?: string;
  };
  likeCount: string[];
}

const GlobalFeed = () => {
  const user = useSelector((state: RootState) => state.user.value);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/post/feed");
      if (data.success) {
        setPosts(data.posts || []);
      } else {
        toast.error("Failed to load posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Error loading posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts(); // Refresh posts after creating a new one
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Story Section Skeleton */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex space-x-4 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="w-12 h-3 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            {/* Post Skeletons */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Updates
            </h1>
            <p className="text-gray-600 mt-1">
              See what's happening in your network
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </Button>
            <Button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
            >
              <Plus size={16} />
              Create Post
            </Button>
          </div>
        </div>

        {/* Stories Section */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
          <Story />
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Post key={post._id} post={post} onLike={fetchPosts} />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start connecting and see posts from your network!
                </p>
                <Button
                  onClick={() => setIsCreatePostModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Create First Post
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Load More */}
        {posts.length > 0 && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Load More
            </Button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default GlobalFeed;
