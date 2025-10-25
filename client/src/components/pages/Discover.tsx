import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import API from "@/api/axios";
import { Plus, SearchIcon, User, UserCheck, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface DiscoverUser {
  _id: string;
  fullname: string;
  username: string;
  email: string;
  profileimagelink?: string;
  bio?: string;
  location?: string;
}

const Discover = () => {
  const user = useSelector((state: RootState) => state.user.value);
  const [searchInput, setSearchInput] = useState("");
  const [discoveredUsers, setDiscoveredUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connections, setConnections] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  // Fetch user's connections and following data
  const fetchUserConnections = async () => {
    try {
      const { data } = await API.get("/user/connections");
      if (data.success) {
        setConnections(data.connections?.map((u: DiscoverUser) => u._id) || []);
        setFollowing(data.following?.map((u: DiscoverUser) => u._id) || []);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  useEffect(() => {
    fetchUserConnections();
  }, []);

  // Search users with debounce
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchInput.trim()) {
        setDiscoveredUsers([]);
        return;
      }

      try {
        setLoading(true);
        const { data } = await API.post("/user/discover", {
          input: searchInput,
        });
        if (data.success) {
          setDiscoveredUsers(data.users || []);
        } else {
          toast.error("Failed to search users");
        }
      } catch (error) {
        console.error("Error searching users:", error);
        toast.error("Error searching users");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 500);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handleFollow = async (userId: string) => {
    try {
      setActionLoading(userId);
      const { data } = await API.post("/user/follow", { id: userId });
      if (data.success) {
        toast.success("Followed successfully");
        setFollowing((prev) => [...prev, userId]);
        fetchUserConnections(); // Refresh connections data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Error following user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      setActionLoading(userId);
      const { data } = await API.post("/user/unfollow", { id: userId });
      if (data.success) {
        toast.success("Unfollowed successfully");
        setFollowing((prev) => prev.filter((id) => id !== userId));
        fetchUserConnections(); // Refresh connections data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Error unfollowing user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendConnection = async (userId: string) => {
    try {
      setActionLoading(userId);
      const { data } = await API.post("/user/connect", { id: userId });
      if (data.success) {
        toast.success("Connection request sent");
        fetchUserConnections(); // Refresh connections data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error sending connection:", error);
      toast.error("Error sending connection");
    } finally {
      setActionLoading(null);
    }
  };

  const UserCard = ({ user: discoveredUser }: { user: DiscoverUser }) => {
    const isCurrentUser = discoveredUser._id === user?._id;
    const isConnected = connections.includes(discoveredUser._id);
    const isFollowing = following.includes(discoveredUser._id);

    return (
      <div className="bg-white flex flex-col items-center gap-4 shadow-lg p-6 rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 max-w-md w-full mx-auto">
        <div className="flex flex-col justify-center items-center w-full">
          <img
            src={
              discoveredUser.profileimagelink ||
              "/src/assets/sample_profile.jpg"
            }
            alt="profile pic"
            className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 shadow-md"
          />

          <h1 className="font-semibold text-xl mt-4 text-gray-900 text-center">
            {discoveredUser.fullname}
          </h1>
          <p className="text-gray-600 text-lg">@{discoveredUser.username}</p>

          {discoveredUser.location && (
            <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
              <span>📍</span> {discoveredUser.location}
            </p>
          )}

          {discoveredUser.bio && (
            <p className="text-gray-700 text-center mt-3 line-clamp-3 leading-relaxed">
              {discoveredUser.bio}
            </p>
          )}

          <div className="w-full flex items-center justify-between gap-3 mt-6">
            <button className="text-white flex-1 rounded-xl p-4 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center gap-2 font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
              <User size={18} />
              View Profile
            </button>

            {!isCurrentUser && (
              <button
                onClick={() => {
                  if (isConnected) {
                    // Already connected - no action needed
                    return;
                  } else if (isFollowing) {
                    handleUnfollow(discoveredUser._id);
                  } else {
                    handleFollow(discoveredUser._id);
                  }
                }}
                disabled={actionLoading === discoveredUser._id || isConnected}
                className={`rounded-xl p-4 flex items-center justify-center gap-2 font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                  isConnected
                    ? "bg-green-600 text-white cursor-default"
                    : isFollowing
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionLoading === discoveredUser._id ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isConnected ? (
                  <UserCheck size={18} />
                ) : isFollowing ? (
                  <User size={18} />
                ) : (
                  <UserPlus size={18} />
                )}
              </button>
            )}

            {!isCurrentUser && !isConnected && (
              <button
                onClick={() => handleSendConnection(discoveredUser._id)}
                disabled={actionLoading === discoveredUser._id}
                className="rounded-xl p-4 bg-gray-100 text-gray-700 flex items-center justify-center gap-2 font-medium hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 lg:mb-12 text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Discover People
          </h1>
          <p className="text-gray-600 text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0">
            Connect with amazing people and grow your network
          </p>
        </div>

        {/* Search Section */}
        <div className="flex justify-center mb-8 lg:mb-12">
          <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <InputGroup>
              <InputGroupInput
                placeholder="Search people by name, username, bio, or location..."
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchInput(e.target.value)
                }
              />
              <InputGroupAddon>
                <SearchIcon className="text-gray-500" />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : searchInput.trim() && discoveredUsers.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-500">
                Try searching with different keywords or browse all users
              </p>
            </div>
          ) : !searchInput.trim() ? (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Start searching
              </h3>
              <p className="text-gray-500">
                Enter a name, username, bio, or location to discover people
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {discoveredUsers.map((discoveredUser) => (
                <UserCard key={discoveredUser._id} user={discoveredUser} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
