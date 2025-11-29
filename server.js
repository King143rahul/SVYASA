import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(connectionString);
const db = client.db('sv-secrets');
const postsCollection = db.collection('posts');
const commentsCollection = db.collection('comments');

// Mock data for seeding
const mockPosts = [
  {
    id: "1",
    nickname: "MidnightDreamer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    content: "Sometimes I feel like I'm living two lives - the one everyone sees and the one only I know about. #confession #innerworld #thoughts",
    hashtags: ["#confession", "#innerworld", "#thoughts"],
    department: "computer-science",
    year: "3rd",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresIn: "22h left",
    commentCount: 2,
    reactions: { "❤️": 5, "🔥": 2 },
    ip: "192.168.1.100",
    deviceInfo: "Chrome on Windows 11",
  },
  {
    id: "2",
    nickname: "SilentObserver",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    content: "I've been scared to tell anyone, but I'm happier alone than in crowds. Is that weird? #introvert #truth #authentic",
    hashtags: ["#introvert", "#truth", "#authentic"],
    department: "information-technology",
    year: "2nd",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    expiresIn: "19h left",
    commentCount: 1,
    reactions: { "😮": 1 },
    ip: "192.168.1.101",
    deviceInfo: "Firefox on macOS",
  },
];

const mockComments = [
  {
    id: "c1",
    nickname: "NightWatcher",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=commenter1",
    content: "I feel this so much. You're not alone! 💜",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    postId: "1",
  },
  {
    id: "c2",
    nickname: "QuietSoul",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=commenter2",
    content: "This resonates deeply. Thank you for sharing.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    postId: "1",
  },
  {
    id: "c3",
    nickname: "AloneButNotLonely",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=commenter3",
    content: "Not weird at all! Solitude is underrated.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    postId: "2",
  },
];

async function initializeDatabase() {
  try {
    const existingPosts = await postsCollection.countDocuments();
    if (existingPosts === 0) {
      await postsCollection.insertMany(mockPosts);
      console.log('Mock posts seeded');
    }

    const existingComments = await commentsCollection.countDocuments();
    if (existingComments === 0) {
      await commentsCollection.insertMany(mockComments);
      console.log('Mock comments seeded');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// --- API ROUTES ---

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await postsCollection.find({}).sort({ timestamp: -1 }).toArray();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

// Create a post
app.post('/api/posts', async (req, res) => {
  try {
    const result = await postsCollection.insertOne(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error adding post' });
  }
});

// Update post (Reactions) - NEW FEATURE
app.patch('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.reaction) {
      // Atomic increment for specific reaction
      const field = `reactions.${updateData.reaction}`;
      await postsCollection.updateOne({ id }, { $inc: { [field]: 1 } });
      res.json({ success: true });
    } else {
      await postsCollection.updateOne({ id }, { $set: updateData });
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Error updating post' });
  }
});

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const result = await postsCollection.deleteOne({ id: req.params.id });
    await commentsCollection.deleteMany({ postId: req.params.id });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting post' });
  }
});

// Get comments
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await commentsCollection.find({}).toArray();
    const commentsByPostId = {};
    comments.forEach(comment => {
      if (!commentsByPostId[comment.postId]) {
        commentsByPostId[comment.postId] = [];
      }
      commentsByPostId[comment.postId].push(comment);
    });

    // Sort comments by timestamp desc for each post
    Object.keys(commentsByPostId).forEach(postId => {
      commentsByPostId[postId].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    });

    res.json(commentsByPostId);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

// Add comment
app.post('/api/comments/:postId', async (req, res) => {
  try {
    const comment = { ...req.body, postId: req.params.postId };
    const result = await commentsCollection.insertOne(comment);

    // Update comment count in post
    await postsCollection.updateOne(
      { id: req.params.postId },
      { $inc: { commentCount: 1 } }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// Notes routes (optional)
app.get('/api/notes', async (req, res) => {
    res.json([]); 
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

startServer();
