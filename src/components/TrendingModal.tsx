import { X, TrendingUp, Flame } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface TrendingModalProps {
  open: boolean;
  onClose: () => void;
  hashtags: Array<{ tag: string; count: number }>;
  onHashtagClick: (hashtag: string) => void;
}

const TrendingModal = ({ open, onClose, hashtags, onHashtagClick }: TrendingModalProps) => {
  const handleHashtagClick = (tag: string) => {
    onHashtagClick(tag);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-primary/30 max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <DialogTitle className="gradient-text text-2xl">Trending Topics</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Discover what everyone is talking about right now
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto">
          {hashtags.map((item, index) => (
            <div
              key={item.tag}
              className="glass-card p-4 cursor-pointer hover:bg-card/60 transition-all duration-300 group slide-up"
              onClick={() => handleHashtagClick(item.tag)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-bg-primary text-white font-bold text-lg neon-glow">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {item.tag}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.count} confessions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {index < 3 && (
                    <Badge variant="secondary" className="gap-1 neon-glow">
                      <Flame className="h-3 w-3" />
                      Hot
                    </Badge>
                  )}
                  <Badge variant="outline" className="group-hover:bg-primary/10">
                    View
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrendingModal;
