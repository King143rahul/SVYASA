import { MongoClient } from 'mongodb';

let client = null;

const getClient = () => {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI);
  }
  return client;
};

const establishConnection = async () => {
  const client = getClient();
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
};

const getDatabase = () => {
  const client = getClient();
  return client.db('sv-secrets');
};

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

const initializeDatabase = async () => {
  const db = getDatabase();
  const postsCollection = db.collection('posts');
  const commentsCollection = db.collection('comments');

  const existingPosts = await postsCollection.countDocuments();
  if (existingPosts === 0) {
    await postsCollection.insertMany(mockPosts);
  }

  const existingComments = await commentsCollection.countDocuments();
  if (existingComments === 0) {
    await commentsCollection.insertMany(mockComments);
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export async function handler(event, context) {
  const { httpMethod, path, body } = event;

  // Handle CORS
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    await establishConnection();
    await initializeDatabase();

    const db = getDatabase();
    const postsCollection = db.collection('posts');
    const commentsCollection = db.collection('comments');

    let result;
    let statusCode = 200;

    const cleanPath = path.replace('/.netlify/functions/api', '');
    const segments = cleanPath.split('/').filter(s => s);

    if (httpMethod === 'GET' && segments[0] === 'posts') {
      if (segments[1]) {
        // GET /posts/:id - not implemented yet
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Not found' }),
        };
      } else {
        // GET /posts
        const posts = await postsCollection.find({}).sort({ timestamp: -1 }).toArray();
        result = posts;
      }
    } else if (httpMethod === 'POST' && segments[0] === 'posts') {
      // POST /posts
      const post = JSON.parse(body);
      const insertResult = await postsCollection.insertOne(post);
      result = insertResult;
    } else if (httpMethod === 'DELETE' && segments[0] === 'posts' && segments[1]) {
      // DELETE /posts/:id
      const id = segments[1];
      const deleteResult = await postsCollection.deleteOne({ id });
      await commentsCollection.deleteMany({ postId: id });
      result = deleteResult;
    } else if (httpMethod === 'GET' && segments[0] === 'comments') {
      // GET /comments
      const comments = await commentsCollection.find({}).toArray();
      const commentsByPostId = {};
      comments.forEach(comment => {
        if (!commentsByPostId[comment.postId]) {
          commentsByPostId[comment.postId] = [];
        }
        commentsByPostId[comment.postId].push(comment);
      });

      // Sort comments by timestamp desc
      Object.keys(commentsByPostId).forEach(postId => {
        commentsByPostId[postId].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });

      result = commentsByPostId;
    } else if (httpMethod === 'POST' && segments[0] === 'comments' && segments[1]) {
      // POST /comments/:postId
      const postId = segments[1];
      const comment = JSON.parse(body);
      const commentData = { ...comment, postId };
      const insertResult = await commentsCollection.insertOne(commentData);

      // Update comment count
      await postsCollection.updateOne(
        { id: postId },
        { $inc: { commentCount: 1 } }
      );

      result = insertResult;
    } else {
      statusCode = 404;
      result = { error: 'Not found' };
    }

    return {
      statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
        ...corsHeaders,
        'Content-Type': 'application/json',
