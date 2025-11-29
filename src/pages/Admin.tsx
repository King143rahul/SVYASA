import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { getPosts, deletePost, updatePost, getNotes, addNote, deleteNote, Post } from "@/lib/data";

const Admin = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  
  // Edit State
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editForm, setEditForm] = useState({
    nickname: "",
    department: "",
    year: "",
    content: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    const p = await getPosts();
    setPosts(p);
    const n = await getNotes();
    setNotes(n);
  };

  const handleLogin = () => {
    if (password === "KNOX1234") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this confession?")) {
      await deletePost(id);
      loadData();
    }
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setEditForm({
      nickname: post.nickname,
      department: post.department,
      year: post.year,
      content: post.content,
    });
  };

  const handleSaveEdit = async () => {
    if (editingPost) {
      // Extract new hashtags if content changed
      const extractHashtags = (text: string) => {
        const matches = text.match(/#\w+/g);
        return matches ? [...new Set(matches)] : [];
      };
      
      const hashtags = extractHashtags(editForm.content);

      await updatePost(editingPost.id, {
        ...editForm,
        hashtags,
      });
      setEditingPost(null);
      loadData();
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim()) {
      await addNote({ text: newNote.trim(), timestamp: new Date() });
      loadData();
      setNewNote("");
    }
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    loadData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-bg-soft">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleLogin} className="w-full">
                    Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg-soft">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold gradient-text mb-4">Admin Panel</h2>
        <p>You are logged in as admin. Total confessions: {posts.length}</p>
        <Button onClick={() => setIsAuthenticated(false)} className="mt-4 mb-6">
          Logout
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>All Confessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nickname</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.nickname}</TableCell>
                    <TableCell>{post.department}</TableCell>
                    <TableCell>{post.year}</TableCell>
                    <TableCell className="max-w-xs truncate">{post.content}</TableCell>
                    <TableCell>{post.timestamp.toLocaleString()}</TableCell>
                    <TableCell>{post.ip}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(post)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Confession</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nickname" className="text-right">
                  Nickname
                </Label>
                <Input
                  id="nickname"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Dept
                </Label>
                <Select 
                  value={editForm.department} 
                  onValueChange={(val) => setEditForm({ ...editForm, department: val })}
                >
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="year" className="text-right">
                  Year
                </Label>
                <Select 
                  value={editForm.year} 
                  onValueChange={(val) => setEditForm({ ...editForm, year: val })}
                >
                  <SelectTrigger className="col-span-3">
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
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes / Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newNote">Add a new note</Label>
                  <Textarea
                    id="newNote"
                    placeholder="Enter your note or announcement..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddNote}>
                  Add Note
                </Button>
              </div>
              <div className="mt-6 space-y-2">
                {notes.map((note) => (
                  <div key={note.id} className="flex justify-between items-start border p-3 rounded">
                    <div>
                      <p className="text-sm">{note.text}</p>
                      <p className="text-xs text-muted-foreground">{new Date(note.timestamp).toLocaleString()}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-muted-foreground">No notes yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
