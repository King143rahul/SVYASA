import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrendingSidebarProps {
  hashtags: Array<{ tag: string; count: number }>;
  onHashtagClick: (hashtag: string) => void;
}

const TrendingSidebar = ({ hashtags, onHashtagClick }: TrendingSidebarProps) => {
  return (
    <div className="space-y-4">
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg gradient-text">Trending Now</h3>
        </div>

        <div className="space-y-3">
          {hashtags.map((item, index) => (
            <div
              key={item.tag}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
              onClick={() => onHashtagClick(item.tag)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.tag}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.count} posts
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="neon-glow">
                {index < 3 ? "🔥" : ""}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass-card p-6 gradient-bg-soft">
        <h4 className="font-semibold mb-2 gradient-text">About Svyasa Secrets</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Share your thoughts anonymously. All posts automatically delete after 48 hours.
          Express yourself freely in a safe, judgment-free space.
        </p>
      </Card>
    </div>
  );
};

export default TrendingSidebar;
