import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { Calendar, Edit, MapPin, Verified } from "lucide-react";
import coverPhoto from "../../assets/sample_cover.jpg";
import Profilepic from "../../assets/sample_profile.jpg";
import Post from "../post";
import EditProfileModal from "../EditProfileModal";
import API from "@/api/axios";

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

interface User {
  _id: string;
  fullname: string;
  username: string;
  email: string;
  profileimagelink?: string;
  coverimglink?: string;
  bio?: string;
  location?: string;
}

interface ProfileProps {
  user?: User; // Optional prop - if not provided, use current user
}

const Profile = ({ user: propUser }: ProfileProps) => {
  const currentUser = useSelector((state: RootState) => state.user.value);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });

  // Use prop user if provided, otherwise use current user
  const user = propUser || currentUser;
  const isOwnProfile = !propUser; // If no prop user, it's the current user's profile

  const fetchUserData = async () => {
    if (!user?._id) return;

    try {
      // Fetch user posts using the dedicated endpoint
      const postsResponse = await API.get(`/post/user/${user._id}`);
      if (postsResponse.data.success) {
        setUserPosts(postsResponse.data.posts || []);
        setStats((prev) => ({
          ...prev,
          posts: postsResponse.data.posts?.length || 0,
        }));
      }

      // Fetch connections stats
      const connectionsResponse = await API.get("/user/connections");
      if (connectionsResponse.data.success) {
        setStats((prev) => ({
          ...prev,
          followers: connectionsResponse.data.followers?.length || 0,
          following: connectionsResponse.data.following?.length || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchUserData();
    }
  }, [user?._id]);

  const handleProfileUpdate = () => {
    fetchUserData(); // Refresh data after profile update
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="pt-5 w-full">
        <div className="flex items-center justify-center">
          <div className="max-w-[1000px] px-2 w-full">
            {/* Profile Section */}
            <div className="pb-5 mb-10 bg-white shadow-xl flex flex-col justify-center w-full items-center rounded-2xl overflow-hidden">
              {/* Cover Photo */}
              <div
                className="relative w-full h-64 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${user?.coverimglink || coverPhoto})`,
                }}
              >
                <div className="absolute -bottom-16 left-8">
                  <img
                    src={user?.profileimagelink || Profilepic}
                    alt="profile pic"
                    className="rounded-full border-6 border-white shadow w-32 h-32 object-cover"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="ml-8 mt-20 w-full px-8">
                <div className="max-w-[650px]">
                  <div className="py-5 flex justify-between items-start">
                    <div>
                      <h1 className="font-bold text-3xl lg:text-5xl flex items-center gap-3">
                        {user?.fullname || "User"}
                        <Verified className="text-blue-700" size={28} />
                      </h1>
                      <p className="text-xl text-gray-600 mt-2">
                        @{user?.username || "username"}
                      </p>
                    </div>

                    {/* Only show edit button for own profile */}
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="cursor-pointer font-bold px-4 py-2 self-start rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <span className="flex gap-3 items-center">
                          <Edit size={18} /> Edit
                        </span>
                      </button>
                    )}
                  </div>

                  {user?.bio && (
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {user.bio}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-6 py-5 text-lg text-gray-600">
                    {user?.location && (
                      <p className="flex gap-3 items-center">
                        <MapPin size={18} /> {user.location}
                      </p>
                    )}
                    <p className="flex gap-3 items-center">
                      <Calendar size={18} /> Joined recently
                    </p>
                  </div>

                  <div className="flex gap-8 py-5 border-t-2 border-gray-100">
                    <div className="text-xl text-gray-600 flex items-center">
                      <span className="font-bold text-3xl text-black pr-2">
                        {stats.posts}
                      </span>
                      Posts
                    </div>
                    <div className="text-xl text-gray-600 flex items-center">
                      <span className="font-bold text-3xl text-black pr-2">
                        {stats.followers}
                      </span>
                      Followers
                    </div>
                    <div className="text-xl text-gray-600 flex items-center">
                      <span className="font-bold text-3xl text-black pr-2">
                        {stats.following}
                      </span>
                      Following
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {userPosts.length > 0 ? (
                userPosts.map((post) => <Post key={post._id} post={post} />)
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                  <p className="text-gray-500 text-lg">No posts yet</p>
                  <p className="text-gray-400 mt-2">
                    {isOwnProfile
                      ? "Share your first post with the world!"
                      : "This user hasn't shared any posts yet."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Modal - Only show for own profile */}
        {isOwnProfile && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onProfileUpdate={handleProfileUpdate}
          />
        )}
      </div>
    </>
  );
};

export default Profile;
