interface Comment {
  id: string;
  nickname: string;
  avatar: string;
  content: string;
  timestamp: Date;
  postId: string; // Added for MongoDB collection
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
  ip?: string; // Added IP field
  deviceInfo?: string; // Added device info
}

const generateAvatar = (seed: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

const apiCall = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE}/api${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
};



export const getPosts = async (): Promise<Post[]> => {
  try {
    const posts = await apiCall('/posts');
    return posts.map((post: any) => ({
      ...post,
      timestamp: new Date(post.timestamp),
    })).sort((a: Post, b: Post) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const getComments = async (): Promise<Record<string, Comment[]>> => {
  try {
    const comments = await apiCall('/comments');
    const commentsMap: Record<string, Comment[]> = {};
    comments.forEach((comment: any) => {
      if (!commentsMap[comment.postId]) {
        commentsMap[comment.postId] = [];
      }
      commentsMap[comment.postId].push({
        ...comment,
        timestamp: new Date(comment.timestamp),
      });
    });
    // Sort comments by timestamp desc
    Object.keys(commentsMap).forEach(postId => {
      commentsMap[postId].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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
