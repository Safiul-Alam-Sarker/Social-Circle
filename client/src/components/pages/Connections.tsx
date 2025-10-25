import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import API from "@/api/axios";
import { Users, UserCheck, UserPlus, UserX, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Profile from "./MyFeed"; // Import your existing Profile component

interface ConnectionUser {
  _id: string;
  fullname: string;
  username: string;
  email: string;
  profileimagelink?: string;
  coverimglink?: string;
  bio?: string;
  location?: string;
}

interface ConnectionsData {
  connections: ConnectionUser[];
  followers: ConnectionUser[];
  following: ConnectionUser[];
  pendingConnection: ConnectionUser[];
}

type TabType = "connections" | "followers" | "following" | "pendingConnection";

const Connections = () => {
  const currentUser = useSelector((state: RootState) => state.user.value);
  const [activeTab, setActiveTab] = useState<TabType>("connections");
  const [connectionsData, setConnectionsData] = useState<ConnectionsData>({
    connections: [],
    followers: [],
    following: [],
    pendingConnection: [],
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ConnectionUser | null>(null);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/user/connections");
      if (data.success) {
        setConnectionsData({
          connections: data.connections || [],
          followers: data.followers || [],
          following: data.following || [],
          pendingConnection: data.pendingConnection || [],
        });
      } else {
        toast.error("Failed to load connections");
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Error loading connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleFollow = async (userId: string) => {
    try {
      setActionLoading(userId);
      const { data } = await API.post("/user/follow", { id: userId });
      if (data.success) {
        toast.success("Followed successfully");
        fetchConnections();
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
        fetchConnections();
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

  const handleAcceptConnection = async (userId: string) => {
    try {
      setActionLoading(userId);
      const { data } = await API.post("/user/accept", { id: userId });
      if (data.success) {
        toast.success("Connection accepted");
        fetchConnections();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Error accepting connection");
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
        fetchConnections();
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

  const handleUserClick = (user: ConnectionUser) => {
    setSelectedUser(user);
  };

  const handleBackToConnections = () => {
    setSelectedUser(null);
  };

  // If a user is selected, show the Profile component
  if (selectedUser) {
    return (
      <div>
        {/* Back Button */}
        <div className="p-4 bg-white border-b shadow-sm">
          <button
            onClick={handleBackToConnections}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Connections
          </button>
        </div>

        {/* Use the existing Profile component */}
        <Profile user={selectedUser} />
      </div>
    );
  }

  // User Card Component
  interface UserCardProps {
    user: ConnectionUser;
    showActions?: boolean;
    type: TabType;
  }

  const UserCard = ({
    user: connectionUser,
    showActions = true,
    type,
  }: UserCardProps) => {
    const isFollowing = connectionsData.following.some(
      (u) => u._id === connectionUser._id
    );
    const isConnected = connectionsData.connections.some(
      (u) => u._id === connectionUser._id
    );
    const isPending = connectionsData.pendingConnection.some(
      (u) => u._id === connectionUser._id
    );

    return (
      <div
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
        onClick={() => handleUserClick(connectionUser)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img
              src={
                connectionUser.profileimagelink ||
                "/src/assets/sample_profile.jpg"
              }
              alt={connectionUser.fullname}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {connectionUser.fullname}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              @{connectionUser.username}
            </p>
            {connectionUser.bio && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {connectionUser.bio}
              </p>
            )}
          </div>
        </div>

        {showActions && connectionUser._id !== currentUser?._id && (
          <div
            className="mt-3 flex flex-wrap gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {type === "pendingConnection" && (
              <button
                onClick={() => handleAcceptConnection(connectionUser._id)}
                disabled={actionLoading === connectionUser._id}
                className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <UserCheck size={14} />
                {actionLoading === connectionUser._id
                  ? "Accepting..."
                  : "Accept"}
              </button>
            )}

            {type === "followers" && !isFollowing && (
              <button
                onClick={() => handleFollow(connectionUser._id)}
                disabled={actionLoading === connectionUser._id}
                className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <UserPlus size={14} />
                {actionLoading === connectionUser._id
                  ? "Following..."
                  : "Follow"}
              </button>
            )}

            {type === "following" && (
              <button
                onClick={() => handleUnfollow(connectionUser._id)}
                disabled={actionLoading === connectionUser._id}
                className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <UserX size={14} />
                {actionLoading === connectionUser._id
                  ? "Unfollowing..."
                  : "Unfollow"}
              </button>
            )}

            {!isConnected && !isPending && type !== "pendingConnection" && (
              <button
                onClick={() => handleSendConnection(connectionUser._id)}
                disabled={actionLoading === connectionUser._id}
                className="flex-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <UserPlus size={14} />
                {actionLoading === connectionUser._id
                  ? "Sending..."
                  : "Connect"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Original Connections View
  const tabConfig: Array<{
    key: TabType;
    label: string;
    icon: any;
    count: number;
    color: string;
  }> = [
    {
      key: "connections",
      label: "Connections",
      icon: Users,
      count: connectionsData.connections.length,
      color: "text-blue-600",
    },
    {
      key: "followers",
      label: "Followers",
      icon: Users,
      count: connectionsData.followers.length,
      color: "text-green-600",
    },
    {
      key: "following",
      label: "Following",
      icon: Users,
      count: connectionsData.following.length,
      color: "text-purple-600",
    },
    {
      key: "pendingConnection",
      label: "Pending",
      icon: Clock,
      count: connectionsData.pendingConnection.length,
      color: "text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Connections
          </h1>
          <p className="text-gray-600">Manage your network and connections</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-1 mb-6 lg:mb-8 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {tabConfig.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 min-w-0 flex-1 lg:flex-none justify-center ${
                  activeTab === tab.key
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <tab.icon size={18} className={tab.color} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {connectionsData[activeTab].length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No{" "}
                {tabConfig
                  .find((tab) => tab.key === activeTab)
                  ?.label.toLowerCase()}{" "}
                found
              </h3>
              <p className="text-gray-500">
                {activeTab === "connections" &&
                  "You haven't connected with anyone yet."}
                {activeTab === "followers" && "No one is following you yet."}
                {activeTab === "following" &&
                  "You're not following anyone yet."}
                {activeTab === "pendingConnection" &&
                  "No pending connection requests."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {connectionsData[activeTab].map(
                (connectionUser: ConnectionUser) => (
                  <UserCard
                    key={connectionUser._id}
                    user={connectionUser}
                    type={activeTab}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connections;
