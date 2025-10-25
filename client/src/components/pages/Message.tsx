import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import API from "@/api/axios";
import { Search, MessageCircle } from "lucide-react";
import ChatWindow from "./ChatWindow";
import toast from "react-hot-toast";
import { getSocket } from "@/socket/socket";

interface User {
  _id: string;
  fullname: string;
  username: string;
  profileimagelink?: string;
  bio?: string;
}

interface Conversation {
  _id: string;
  lastMessage: {
    _id: string;
    text: string;
    messageType: "text" | "image";
    createdAt: string;
    from_user_id: string;
    seen: boolean;
  };
  user: User;
  unreadCount: number;
}

const Message = () => {
  const user = useSelector((state: RootState) => state.user.value);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchRecentConversations = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/message/recent");
      if (data.success) {
        setConversations(data.conversations || []);
      } else {
        toast.error(data.message || "Failed to load conversations");
      }
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      toast.error(
        error.response?.data?.message || "Error loading conversations"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentConversations();

    // Set up socket listener for real-time updates
    const socket = getSocket();
    if (socket) {
      socket.on("recent_messages_updated", fetchRecentConversations);
      socket.on("receive_message", fetchRecentConversations);

      return () => {
        socket.off("recent_messages_updated", fetchRecentConversations);
        socket.off("receive_message", fetchRecentConversations);
      };
    }
  }, [fetchRecentConversations]);

  // Debounced search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data } = await API.post("/user/discover", {
        input: searchQuery.trim(),
      });
      if (data.success) {
        // Filter out current user from search results
        const filteredUsers =
          data.users?.filter((u: User) => u._id !== user?._id) || [];
        setSearchResults(filteredUsers);
      } else {
        toast.error(data.message || "Search failed");
      }
    } catch (error: any) {
      console.error("Error searching users:", error);
      toast.error(error.response?.data?.message || "Error searching users");
    } finally {
      setSearching(false);
    }
  };

  // Start new conversation
  const startNewChat = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setSearchQuery("");
    setSearchResults([]);
  };

  // When closing chat window
  const handleBackFromChat = () => {
    setSelectedUser(null);
    fetchRecentConversations(); // Refresh the recent messages list
  };

  // Format last message preview
  const formatMessagePreview = (conversation: Conversation): string => {
    const { lastMessage } = conversation;
    if (!lastMessage) return "No messages yet";

    if (lastMessage.messageType === "image") {
      return "📷 Image";
    }

    const text = lastMessage.text || "";
    return text.length > 30 ? `${text.substring(0, 30)}...` : text;
  };

  // Format time with better readability
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Get profile image URL
  const getProfileImage = (profileimagelink?: string): string => {
    return profileimagelink?.startsWith("http")
      ? profileimagelink
      : "/src/assets/sample_profile.jpg";
  };

  // Render loading state
  if (loading && conversations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // If a user is selected, show the ChatWindow
  if (selectedUser) {
    return (
      <ChatWindow
        recipientId={selectedUser._id}
        recipientName={selectedUser.fullname}
        recipientUsername={selectedUser.username}
        recipientAvatar={getProfileImage(selectedUser.profileimagelink)}
        onBack={handleBackFromChat}
      />
    );
  }

  // Otherwise, show the messages list
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            Chat with your connections and friends
          </p>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users by name, username, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium disabled:cursor-not-allowed transition-colors duration-200 min-w-[120px]"
            >
              {searching ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </div>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Search Results ({searchResults.length})
              </h3>
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 border border-gray-100"
                  onClick={() => startNewChat(user)}
                >
                  <img
                    src={getProfileImage(user.profileimagelink)}
                    alt={user.fullname}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {user.fullname}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      @{user.username}
                    </p>
                  </div>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 flex-shrink-0">
                    <MessageCircle size={16} />
                    Chat
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !searching && (
            <div className="text-center text-gray-500 py-6">
              <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No users found matching "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Recent Chats */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Conversations
            </h3>
            {conversations.length > 0 && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {conversations.length} conversation
                {conversations.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No conversations yet
              </h4>
              <p className="text-gray-500 max-w-sm mx-auto">
                Start a conversation by searching for users above or connect
                with your followers.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                  onClick={() => startNewChat(conversation.user)}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={getProfileImage(conversation.user.profileimagelink)}
                      alt={conversation.user.fullname}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium shadow-sm">
                        {conversation.unreadCount > 9
                          ? "9+"
                          : conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 truncate pr-2">
                        {conversation.user.fullname}
                      </h4>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate pr-2 ${
                          conversation.unreadCount > 0
                            ? "text-gray-900 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        {formatMessagePreview(conversation)}
                      </p>
                      {!conversation.lastMessage?.seen &&
                        conversation.lastMessage?.from_user_id !==
                          user?._id && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
