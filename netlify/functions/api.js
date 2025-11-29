import { MongoClient } from 'mongodb';

// Cache the client to reuse connections (Critical for serverless performance)
let cachedClient = null;
let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // NOTE: Ensure 'MONGODB_URI' is set in your Netlify "Environment variables" settings
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is MISSING in Netlify settings.');
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const db = client.db('sv-secrets');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

export async function handler(event, context) {
  // 1. Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const { db } = await connectToDatabase();
    const postsCollection = db.collection('posts');
    const commentsCollection = db.collection('comments');

    const { httpMethod, path, body } = event;

    // 2. Parse the path to get resource (posts/comments) and ID
    // Path comes in as "/.netlify/functions/api/posts" or "/api/posts"
    const segments = path
      .split('/')
      .filter(s => s && s !== '.netlify' && s !== 'functions' && s !== 'api');

    const resource = segments[0]; // 'posts' or 'comments'
    const id = segments[1];       // '123' or undefined

    console.log(`Request: ${httpMethod} /${resource}/${id || ''}`);

    let result;

    // --- API ROUTING LOGIC ---

    // GET /posts
    if (httpMethod === 'GET' && resource === 'posts') {
      result = await postsCollection.find({}).sort({ timestamp: -1 }).toArray();
    }
    // POST /posts
    else if (httpMethod === 'POST' && resource === 'posts') {
      const post = JSON.parse(body);
      if (post.timestamp) post.timestamp = new Date(post.timestamp);
      else post.timestamp = new Date();
      
      // Ensure reactions object exists
      post.reactions = post.reactions || {};
      
      result = await postsCollection.insertOne(post);
    }
    // PATCH /posts/:id (Reactions)
    else if (httpMethod === 'PATCH' && resource === 'posts' && id) {
      const updateData = JSON.parse(body);
      
      if (updateData.reaction) {
        // Atomic increment for specific reaction emoji
        const field = `reactions.${updateData.reaction}`;
        await postsCollection.updateOne({ id }, { $inc: { [field]: 1 } });
        result = { success: true };
      } else {
        await postsCollection.updateOne({ id }, { $set: updateData });
        result = { success: true };
      }
    }
    // DELETE /posts/:id
    else if (httpMethod === 'DELETE' && resource === 'posts' && id) {
      await postsCollection.deleteOne({ id });
      await commentsCollection.deleteMany({ postId: id });
      result = { success: true };
    }
    // GET /comments
    else if (httpMethod === 'GET' && resource === 'comments') {
      const comments = await commentsCollection.find({}).toArray();
      const commentsByPostId = {};
      comments.forEach(c => {
        if (!commentsByPostId[c.postId]) commentsByPostId[c.postId] = [];
        commentsByPostId[c.postId].push(c);
      });
      // Sort comments by timestamp
      Object.keys(commentsByPostId).forEach(pid => {
        commentsByPostId[pid].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });
      result = commentsByPostId;
    }
    // POST /comments/:postId
    else if (httpMethod === 'POST' && resource === 'comments' && id) {
      const comment = JSON.parse(body);
      if (comment.timestamp) comment.timestamp = new Date(comment.timestamp);
      else comment.timestamp = new Date();

      const commentData = { ...comment, postId: id };
      result = await commentsCollection.insertOne(commentData);

      // Increment comment count on the post
      await postsCollection.updateOne(
        { id },
        { $inc: { commentCount: 1 } }
      );
    }
    // 404 Not Found
    else {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Route not found: ${httpMethod} /${resource}` })
      };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
}
