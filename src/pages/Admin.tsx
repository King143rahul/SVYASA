import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { getPosts, deletePost, getNotes, addNote, deleteNote } from "@/lib/data";

const Admin = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      getPosts().then(setPosts);
      getNotes().then(setNotes);
    }
  }, [isAuthenticated]);

  const navigate = useNavigate();

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
      const updatedPosts = await getPosts();
      setPosts(updatedPosts);
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim()) {
      await addNote({ text: newNote.trim(), timestamp: new Date() });
      const updatedNotes = await getNotes();
      setNotes(updatedNotes);
      setNewNote("");
    }
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    const updatedNotes = await getNotes();
    setNotes(updatedNotes);
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
                  <TableHead>Device Info</TableHead>
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
                    <TableCell>{post.deviceInfo}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
