{
type: uploaded file
fileName: king143rahul/svyasa/SVYASA-76983a21efddfc86d9d8c84451e3f27affabbaca/src/components/PostCard.tsx
fullContent:
import { MessageCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PostCardProps {
  id: string;
  nickname: string;
  avatar: string;
  content: string;
  hashtags: string[];
  department: string;
  year: string;
  timestamp: Date;
  expiresIn: string;
  commentCount: number;
  reactions?: Record<string, number>;
  onClick: () => void;
  onHashtagClick: (hashtag: string) => void;
  onReact?: (id: string, emoji: string) => void;
}

const PostCard = ({
  id,
  nickname,
  avatar,
  content,
  hashtags,
  department,
  year,
  timestamp,
  expiresIn,
  commentCount,
  reactions = {},
  onClick,
  onHashtagClick,
  onReact,
}: PostCardProps) => {
  const formatContent = (text: string) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onHashtagClick(part);
            }}
            className="hashtag"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const reactionEmojis = ["❤️", "😂", "🔥", "😮", "😢"];

  return (
    <Card
      className="glass-card-hover cursor-pointer p-6 slide-up"
      onClick={onClick}
    >
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 border-2 border-primary/30">
          <AvatarImage src={avatar} alt={nickname} />
          <AvatarFallback className="bg-gradient-bg-primary text-white">
            {nickname[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{nickname}</p>
              <p className="text-xs text-muted-foreground">
                {department} • {year} Year
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(timestamp).toLocaleDateString()} at{" "}
                {new Date(timestamp).toLocaleTimeString()}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs gap-1">
              <Clock className="h-3 w-3" />
              {expiresIn}
            </Badge>
          </div>

          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {formatContent(content)}
          </p>

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHashtagClick(tag);
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {reactionEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs hover:bg-secondary/50"
                  onClick={() => onReact && onReact(id, emoji)}
                >
                  <span className="mr-1">{emoji}</span>
                  <span>{reactions[emoji] || 0}</span>
                </Button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{commentCount} comments</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
}
