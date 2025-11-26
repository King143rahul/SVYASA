import { useState, useEffect } from "react";
import { Plus, Filter } from "lucide-react";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import CreatePostModal from "@/components/CreatePostModal";
import CommentView from "@/components/CommentView";
import TrendingSidebar from "@/components/TrendingSidebar";
import TrendingModal from "@/components/TrendingModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPosts, getComments, addPost as addPosToData, addComment as addCommToData, getNotes } from "@/lib/data";

interface Post {
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
  ip?: string;
  deviceInfo?: string;
}

interface Comment {
  id: string;
  nickname: string;
  avatar: string;
  content: string;
  timestamp: Date;
}

const generateAvatar = (seed: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

const trendingHashtags = [
  { tag: "#confession", count: 234 },
  { tag: "#truth", count: 189 },
  { tag: "#thoughts", count: 156 },
  { tag: "#deepthoughts", count: 142 },
  { tag: "#innerworld", count: 98 },
];

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTrendingModalOpen, setIsTrendingModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      const fetchedComments = await getComments();
      setComments(fetchedComments);
      const fetchedNotes = await getNotes();
      setAdminNotes(fetchedNotes);
    };
    loadData();
  }, []);

  const handleCreatePost = async (data: { nickname: string; content: string; hashtags: string[]; department: string; year: string }) => {
    const newPost: Post = {
      id: Date.now().toString(),
      nickname: data.nickname,
      avatar: generateAvatar(data.nickname),
      content: data.content,
      hashtags: data.hashtags,
      department: data.department,
      year: data.year,
      timestamp: new Date(),
      expiresIn: "48h left",
      commentCount: 0,
      ip: "192.168.1.0", // Simulated for new posts
      deviceInfo: "Unknown Device",
    };
    await addPosToData(newPost);
    const updatedPosts = await getPosts();
    setPosts(updatedPosts);
  };

  const handleAddComment = async (content: string) => {
    if (!selectedPost) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      nickname: `Anonymous${Math.floor(Math.random() * 1000)}`,
      avatar: generateAvatar(`comment${Date.now()}`),
      content,
      timestamp: new Date(),
    };

    await addCommToData(selectedPost.id, newComment);
    const updatedPosts = await getPosts();
    setPosts(updatedPosts);
    const updatedComments = await getComments();
    setComments(updatedComments);
  };

  const filteredPosts = selectedHashtag
    ? posts.filter((post) => post.hashtags.includes(selectedHashtag))
    : posts;

  if (selectedPost) {
    return (
      <CommentView
        post={selectedPost}
        comments={comments[selectedPost.id] || []}
        onBack={() => setSelectedPost(null)}
        onAddComment={handleAddComment}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg-soft">
      <Header onTrendingClick={() => setIsTrendingModalOpen(true)} />

      {/* Admin Notes Section */}
      {adminNotes.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mx-4 mt-6">
          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">📢 Announcements</h3>
          <div className="space-y-3">
            {adminNotes.map((note) => (
              <div key={note.id} className="bg-white dark:bg-gray-800 rounded-md p-3 shadow-sm">
                <p className="text-gray-800 dark:text-gray-200 text-sm">{note.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(note.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instagram Banner */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white py-2">
        <div className="container mx-auto px-4 text-center">
          <a
            href="https://instagram.com/svyasa_secrets"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity font-medium"
          >
            📸 Follow us on Instagram @SVYASA_SECRETS
          </a>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold gradient-text mb-1">
                  {selectedHashtag ? `Posts tagged ${selectedHashtag}` : "Latest Confessions"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredPosts.length} anonymous secrets shared
                </p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="gradient-bg-primary neon-glow-hover"
              >
                <Plus className="h-5 w-5 mr-2" />
                Share Secret
              </Button>
            </div>

            {selectedHashtag && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSelectedHashtag(null)}
              >
                <Filter className="h-3 w-3 mr-1" />
                Clear filter
              </Badge>
            )}

            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  {...post}
                  onClick={() => setSelectedPost(post)}
                  onHashtagClick={setSelectedHashtag}
                />
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="glass-card p-12 text-center">
                <p className="text-muted-foreground">
                  No posts found with this hashtag. Be the first to share!
                </p>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <TrendingSidebar
              hashtags={trendingHashtags}
              onHashtagClick={setSelectedHashtag}
            />
          </div>
        </div>
      </main>

      <CreatePostModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        suggestedHashtags={trendingHashtags.slice(0, 5).map((h) => h.tag)}
      />

      <TrendingModal
        open={isTrendingModalOpen}
        onClose={() => setIsTrendingModalOpen(false)}
        hashtags={trendingHashtags}
        onHashtagClick={setSelectedHashtag}
      />

      <footer className="py-8 border-t border-border/50 mt-12">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Developer: <span className="font-medium gradient-text">RONALDO</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Follow us on Instagram{" "}
            <a
              href="https://instagram.com/svyasa_secrets"
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-text hover:underline font-medium"
            >
              @SVYASA_SECRETS
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            Contact on Instagram to delete posts
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
