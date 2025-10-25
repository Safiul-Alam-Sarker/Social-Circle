import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import API from "@/api/axios";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";

interface PostProps {
  post: {
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
  };
  onLike?: () => void;
}

const Post = ({ post, onLike }: PostProps) => {
  const user = useSelector((state: RootState) => state.user.value);
  const [isLiked, setIsLiked] = useState(
    post.likeCount.includes(user?._id || "")
  );
  const [likes, setLikes] = useState(post.likeCount.length);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data } = await API.post("/post/like", { postId: post._id });

      if (data.success) {
        setIsLiked(!isLiked);
        setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
        onLike?.(); // Refresh parent if needed
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Error liking post");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.user.profileimagelink || "/src/assets/sample_profile.jpg"}
            alt={post.user.fullname}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
          />
          <div>
            <h3 className="font-semibold text-gray-900">
              {post.user.fullname}
            </h3>
            <p className="text-gray-500 text-sm">@{post.user.username}</p>
            <p className="text-gray-400 text-xs">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Images */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div
          className={`mb-4 rounded-xl overflow-hidden ${
            post.imageUrls.length > 1 ? "grid grid-cols-2 gap-2" : ""
          }`}
        >
          {post.imageUrls.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`Post image ${index + 1}`}
              className="w-full h-auto max-h-96 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Post Stats */}
      <div className="flex items-center text-gray-500 text-sm mb-4">
        <span className="mr-4">{likes} likes</span>
        <span>0 comments</span> {/* You can add comments count if available */}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center space-x-2 transition-colors ${
            isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
          } disabled:opacity-50`}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          <span>Like</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
          <Share size={20} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default Post;
