import { useState } from "react";
import { X, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { nickname: string; content: string; hashtags: string[]; department: string; year: string }) => void;
  suggestedHashtags?: string[];
}

const CreatePostModal = ({ open, onClose, onSubmit, suggestedHashtags = [] }: CreatePostModalProps) => {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#\w+/g);
    return matches ? [...new Set(matches)] : [];
  };

  const handleSubmit = () => {
    if (!nickname.trim() || !content.trim()) return;

    const inlineHashtags = extractHashtags(content);
    const allHashtags = [...new Set([...inlineHashtags, ...selectedHashtags])];

    onSubmit({
      nickname: nickname.trim(),
      content: content.trim(),
      hashtags: allHashtags,
      department,
      year,
    });

    setNickname("");
    setContent("");
    setDepartment("");
    setYear("");
    setSelectedHashtags([]);
    onClose();
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-primary/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="gradient-text text-2xl">Share Your Secret</DialogTitle>
          <DialogDescription>Your confession will be completely anonymous</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Follow us on IG button */}
          <div className="text-center">
            <a
              href="https://instagram.com/svyasa_secrets"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.667.072 4.947.2 4.358 2.618 6.78 6.98 6.981.281.058.689.073 4.947.073 3.259 0 3.667-.014 4.947-.072 4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.358-2.618-6.78-6.98-6.981-.281-.058-.689-.073-4.947-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow us on Instagram
            </a>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Nickname
            </label>
            <Input
              placeholder="Anonymous123"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="glass-card border-primary/30"
              maxLength={20}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Department
              </label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="glass-card border-primary/30">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="btech">B.Tech</SelectItem>
                  <SelectItem value="btech-intelapath">B.Tech (Intelepath)</SelectItem>
                  <SelectItem value="btech-newton">B.Tech (Newton)</SelectItem>
                  <SelectItem value="bca">BCA</SelectItem>
                  <SelectItem value="mca">MCA</SelectItem>
                  <SelectItem value="bba">BBA</SelectItem>
                  <SelectItem value="mba">MBA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Year
              </label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="glass-card border-primary/30">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Year</SelectItem>
                  <SelectItem value="2nd">2nd Year</SelectItem>
                  <SelectItem value="3rd">3rd Year</SelectItem>
                  <SelectItem value="4th">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Your Confession
            </label>
            <Textarea
              placeholder="Share your thoughts... Use #hashtags to categorize"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="glass-card border-primary/30 min-h-[150px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/500 characters
            </p>
          </div>

          {suggestedHashtags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Popular Hashtags
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestedHashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedHashtags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => toggleHashtag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!nickname.trim() || !content.trim()}
              className="gradient-bg-primary neon-glow-hover"
            >
              <Send className="h-4 w-4 mr-2" />
              Post Anonymously
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
