{
type: uploaded file
fileName: king143rahul/svyasa/SVYASA-76983a21efddfc86d9d8c84451e3f27affabbaca/src/lib/data.ts
fullContent:
interface Comment {
  id: string;
  nickname: string;
  avatar: string;
  content: string;
  timestamp: Date;
  postId: string;
}

type CommentInput = Omit<Comment, 'postId'>;

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
  reactions?: Record<string, number>; // Added for emoji feature
}

const generateAvatar = (seed: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE}/api${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`API call error for ${url}:`, error);
    throw error;
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    const posts = await apiCall('/posts');
    return posts.map((post: any) => ({
      ...post,
      timestamp: new Date(post.timestamp),
      reactions: post.reactions || {},
    })).sort((a: Post, b: Post) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const getComments = async (): Promise<Record<string, Comment[]>> => {
  try {
    const commentsMap = await apiCall('/comments');
    // Fix: Iterate over object keys instead of using forEach on the object itself
    Object.keys(commentsMap).forEach((postId) => {
      commentsMap[postId] = commentsMap[postId].map((comment: any) => ({
        ...comment,
        timestamp: new Date(comment.timestamp),
      })).sort((a: Comment, b: Comment) => b.timestamp.getTime() - a.timestamp.getTime());
    });
    return commentsMap;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return {};
  }
};

export const deletePost = async (id: string) => {
  try {
    await apiCall(`/posts/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting post:', error);
  }
};

export const addPost = async (post: Post) => {
  try {
    await apiCall('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  } catch (error) {
    console.error('Error adding post:', error);
  }
};

export const addComment = async (postId: string, comment: Omit<Comment, 'postId'>) => {
  try {
    await apiCall(`/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

export const reactToPost = async (postId: string, emoji: string) => {
  try {
    await apiCall(`/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify({ reaction: emoji }),
    });
  } catch (error) {
    console.error('Error reacting to post:', error);
  }
};

// Notes functions
interface Note {
  id?: string;
  text: string;
  timestamp: Date;
}

export const getNotes = async (): Promise<Note[]> => {
  try {
    const notes = await apiCall('/notes');
    return notes.map((note: any) => ({
      ...note,
      timestamp: new Date(note.timestamp),
    })).sort((a: Note, b: Note) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

export const addNote = async (note: Omit<Note, 'id'>) => {
  try {
    const noteData = { ...note, id: Date.now().toString() };
    await apiCall('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  } catch (error) {
    console.error('Error adding note:', error);
  }
};

export const deleteNote = async (id: string) => {
  try {
    await apiCall(`/notes/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};
}
