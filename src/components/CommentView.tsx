import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Comment {
  id: string;
  nickname: string;
  avatar: string;
  content: string;
  timestamp: Date;
}

interface CommentViewProps {
  post: {
    id: string;
    nickname: string;
    avatar: string;
    content: string;
    hashtags: string[];
    timestamp: Date;
    expiresIn: string;
  };
  comments: Comment[];
  onBack: () => void;
  onAddComment: (content: string) => void;
}

const CommentView = ({ post, comments, onBack, onAddComment }: CommentViewProps) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="sticky top-0 z-10 border-b border-border/50 glass-card">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="neon-glow-hover">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold gradient-text">Confession</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="flex gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/30">
                <AvatarImage src={post.avatar} alt={post.nickname} />
                <AvatarFallback className="bg-gradient-bg-primary text-white">
                  {post.nickname[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground">{post.nickname}</p>
                  <Badge variant="secondary" className="text-xs">
                    {post.expiresIn}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.timestamp).toLocaleDateString()} at{" "}
                  {new Date(post.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>

            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {comments.length} Comments
            </h3>

            {comments.map((comment) => (
              <div key={comment.id} className="glass-card p-4 slide-up">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={comment.avatar} alt={comment.nickname} />
                    <AvatarFallback className="bg-gradient-bg-soft text-foreground">
                      {comment.nickname[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-foreground">
                        {comment.nickname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border/50 glass-card">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="glass-card border-primary/30 resize-none"
              rows={2}
              maxLength={300}
            />
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="gradient-bg-primary neon-glow-hover"
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentView;
