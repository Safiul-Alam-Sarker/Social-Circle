import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import API from "@/api/axios";
import { ArrowLeft, Send, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getSocket } from "../../socket/socket";
import toast from "react-hot-toast";

interface Message {
  _id: string;
  from_user_id: string;
  to_user_id: string;
  text: string;
  messageType: "text" | "image";
  mediaUrl?: string;
  seen: boolean;
  createdAt: string;
  from_user: {
    _id: string;
    fullname: string;
    username: string;
    profileimagelink?: string;
  };
}

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
  recipientUsername: string;
  recipientAvatar?: string;
  onBack: () => void;
}

const ChatWindow = ({
  recipientId,
  recipientName,
  recipientUsername,
  recipientAvatar,
  onBack,
}: ChatWindowProps) => {
  const user = useSelector((state: RootState) => state.user.value);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socket = getSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join socket room when component mounts
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit("join_user", user._id);
    }
  }, [socket, user?._id]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await API.post("/message/chat", {
          to_user_id: recipientId,
        });
        if (data.success) {
          setMessages(data.messages?.reverse() || []);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Error loading messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up socket listeners
    if (socket) {
      // Listen for new messages
      const handleReceiveMessage = (message: Message) => {
        console.log("Received message via socket:", message);

        // Check if this message belongs to current conversation
        if (
          (message.from_user_id === recipientId &&
            message.to_user_id === user?._id) ||
          (message.from_user_id === user?._id &&
            message.to_user_id === recipientId)
        ) {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((msg) => msg._id === message._id)) {
              return prev;
            }
            return [...prev, message];
          });

          // Mark as seen if it's from recipient
          if (message.from_user_id === recipientId && !message.seen) {
            markMessagesAsSeen();
          }
        }
      };

      // Listen for message seen updates
      const handleMessagesSeen = (data: {
        from_user_id: string;
        to_user_id: string;
      }) => {
        if (data.from_user_id === recipientId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.from_user_id === user?._id ? { ...msg, seen: true } : msg
            )
          );
        }
      };

      socket.on("receive_message", handleReceiveMessage);
      socket.on("messages_seen", handleMessagesSeen);

      return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("messages_seen", handleMessagesSeen);
      };
    }

    return () => {};
  }, [recipientId, user?._id, socket]);

  const markMessagesAsSeen = async () => {
    try {
      await API.post("/message/chat", { to_user_id: recipientId });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { data } = await API.post("/message/send", {
        to_user_id: recipientId,
        text: newMessage.trim(),
      });

      if (data.success) {
        setNewMessage("");
        // The message will be added via socket event
        console.log("Message sent successfully");
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Error sending message");
    } finally {
      setSending(false);
    }
  };

  const handleSendImage = async (file: File) => {
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("to_user_id", recipientId);
      formData.append("text", ""); // Empty text for image messages
      formData.append("image", file);

      const { data } = await API.post("/message/send", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        // Image message will be added via socket event
        console.log("Image sent successfully");
      } else {
        toast.error(data.message || "Failed to send image");
      }
    } catch (error: any) {
      console.error("Error sending image:", error);
      toast.error(error.response?.data?.message || "Error sending image");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <img
            src={recipientAvatar || "/src/assets/sample_profile.jpg"}
            alt={recipientName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{recipientName}</h3>
            <p className="text-sm text-gray-500">@{recipientUsername}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.from_user_id === user?._id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-3 ${
                  message.from_user_id === user?._id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.messageType === "image" ? (
                  <img
                    src={message.mediaUrl}
                    alt="Shared image"
                    className="max-w-full max-h-64 rounded-lg"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{message.text}</p>
                )}
                <p
                  className={`text-xs mt-1 ${
                    message.from_user_id === user?._id
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(message.createdAt)}
                  {message.from_user_id === user?._id && (
                    <span className="ml-2">
                      {message.seen ? "Seen" : "Sent"}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSendImage(file);
              // Reset file input
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
          >
            <Image size={18} />
          </Button>
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none"
            rows={1}
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
