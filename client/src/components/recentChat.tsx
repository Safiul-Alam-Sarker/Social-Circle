import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import API from "@/api/axios";
import { getSocket } from "@/socket/socket";

interface Conversation {
  _id: string;
  user: {
    _id: string;
    fullname: string;
    username: string;
    profileimagelink?: string;
  };
  lastMessage: {
    _id: string;
    from_user_id: string; // Add this
    to_user_id: string; // Add this
    text: string;
    messageType: string;
    createdAt: string;
    seen: boolean;
    from_user?: {
      // Add this if your backend populates it
      _id: string;
      fullname: string;
      username: string;
      profileimagelink?: string;
    };
  };
  unreadCount: number;
}

interface RecentChatProps {
  onSelectChat: (userId: string) => void;
}

const RecentChat = ({ onSelectChat }: RecentChatProps) => {
  const user = useSelector((state: RootState) => state.user.value);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentMessages = async () => {
    try {
      const { data } = await API.get("/user/recent-messages");
      if (data.success) {
        setConversations(data.conversations || []);
        // Debug: log the actual data structure
        if (data.conversations && data.conversations.length > 0) {
          console.log("Conversation data:", data.conversations[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching recent messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchRecentMessages();

      const socket = getSocket();
      if (socket) {
        // Add this null check
        socket.on("receive_message", (message) => {
          fetchRecentMessages();
        });

        return () => {
          socket.off("receive_message");
        };
      }

      return () => {}; // Return empty cleanup if no socket
    }
  }, [user?._id]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="hidden lg:block bg-white rounded-xl p-5 shadow-2xl mt-10">
        <h1 className="font-bold text-xl py-2">Recent Messages</h1>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-5 py-3 animate-pulse">
            <div className="h-[70px] w-[70px] bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="hidden lg:block bg-white rounded-xl p-5 shadow-2xl mt-10">
      <h1 className="font-bold text-xl py-2">Recent Messages</h1>

      {conversations.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No messages yet</p>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation._id}
            className="text-gray-600 flex gap-5 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            onClick={() => onSelectChat(conversation._id)}
          >
            <img
              src={
                conversation.user.profileimagelink ||
                "/src/assets/sample_profile.jpg"
              }
              alt={conversation.user.fullname}
              className="h-[70px] w-[70px] rounded-full object-cover"
            />
            <div className="flex flex-col justify-center w-full">
              <div className="flex justify-between items-center">
                <h2 className="text-gray-800 font-semibold">
                  {conversation.user.fullname}
                </h2>
                <p className="text-sm text-gray-500">
                  {formatTime(conversation.lastMessage.createdAt)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 truncate max-w-[150px]">
                  {conversation.lastMessage.from_user_id === user?._id &&
                    "You: "}
                  {conversation.lastMessage.text || "Sent an image"}
                </p>
                {conversation.unreadCount > 0 && (
                  <div className="bg-blue-600 w-6 h-6 text-white rounded-full flex justify-center items-center text-xs">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentChat;
