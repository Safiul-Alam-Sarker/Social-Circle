import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

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

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: StoryType[];
  initialStoryIndex: number;
}

const StoryViewerModal = ({
  isOpen,
  onClose,
  stories,
  initialStoryIndex,
}: StoryViewerModalProps) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentStory = stories[currentStoryIndex];

  useEffect(() => {
    if (!isOpen) return;

    setCurrentStoryIndex(initialStoryIndex);
    setProgress(0);
    setIsPlaying(true);
  }, [isOpen, initialStoryIndex]);

  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story
          if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
            return 0;
          } else {
            // Close modal when all stories are viewed
            onClose();
            return 0;
          }
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total for each story (50ms * 100 = 5000ms)

    return () => clearInterval(interval);
  }, [isPlaying, currentStoryIndex, stories.length, isOpen, onClose]);

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "Escape") onClose();
  };

  if (!isOpen || !currentStory) return null;

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-gray-600 rounded-full">
            <div
              className={`h-full rounded-full ${
                index === currentStoryIndex
                  ? "bg-white"
                  : index < currentStoryIndex
                  ? "bg-white"
                  : "bg-gray-600"
              }`}
              style={{
                width:
                  index === currentStoryIndex
                    ? `${progress}%`
                    : index < currentStoryIndex
                    ? "100%"
                    : "0%",
                transition:
                  index === currentStoryIndex ? "width 0.05s linear" : "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={24} />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute top-4 left-4 z-10 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Navigation Buttons */}
      {currentStoryIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {currentStoryIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Story Content */}
      <div className="w-full h-full flex items-center justify-center">
        {currentStory.mediaType === "text" ? (
          <div
            className="w-full h-full flex items-center justify-center p-8"
            style={{
              backgroundColor: currentStory.backgroundColor[0] || "#6366f1",
            }}
          >
            <div className="text-white text-center max-w-md">
              <p className="text-2xl md:text-4xl font-bold leading-relaxed">
                {currentStory.content}
              </p>
            </div>
          </div>
        ) : currentStory.mediaType === "image" ? (
          <img
            src={currentStory.mediaUrl}
            alt="Story"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            src={currentStory.mediaUrl}
            className="w-full h-full object-contain"
            autoPlay
            controls={!isPlaying}
            onEnded={handleNext}
          />
        )}
      </div>

      {/* User Info */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3">
        <img
          src={
            currentStory.user.profileimagelink ||
            "/src/assets/sample_profile.jpg"
          }
          alt={currentStory.user.fullname}
          className="w-10 h-10 rounded-full border-2 border-white"
        />
        <div className="text-white">
          <p className="font-semibold">{currentStory.user.fullname}</p>
          <p className="text-sm text-gray-300">@{currentStory.user.username}</p>
        </div>
      </div>
    </div>
  );
};

export default StoryViewerModal;
