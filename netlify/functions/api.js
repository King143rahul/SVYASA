import { MongoClient } from 'mongodb';

// Cache the client to reuse connections
let cachedClient = null;
let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

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
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const { db } = await connectToDatabase();
    const postsCollection = db.collection('posts');
    const commentsCollection = db.collection('comments');
    const notesCollection = db.collection('notes');

    const { httpMethod, path, body } = event;

    const segments = path
      .split('/')
      .filter(s => s && s !== '.netlify' && s !== 'functions' && s !== 'api');

    const resource = segments[0]; // 'posts', 'comments', 'notes'
    const id = segments[1];       

    let result;

    // --- API ROUTING LOGIC ---

    // POSTS
    if (resource === 'posts') {
      if (httpMethod === 'GET') {
        result = await postsCollection.find({}).sort({ timestamp: -1 }).toArray();
      } else if (httpMethod === 'POST') {
        const post = JSON.parse(body);
        post.timestamp = post.timestamp ? new Date(post.timestamp) : new Date();
        post.reactions = post.reactions || {};
        result = await postsCollection.insertOne(post);
      } else if (httpMethod === 'PUT' && id) {
        // Full update (Edit Post)
        const updateData = JSON.parse(body);
        delete updateData._id; // prevent mongo error
        await postsCollection.updateOne({ id }, { $set: updateData });
        result = { success: true };
      } else if (httpMethod === 'PATCH' && id) {
        // Reactions
        const updateData = JSON.parse(body);
        if (updateData.reaction) {
          const field = `reactions.${updateData.reaction}`;
          await postsCollection.updateOne({ id }, { $inc: { [field]: 1 } });
        } else {
          await postsCollection.updateOne({ id }, { $set: updateData });
        }
        result = { success: true };
      } else if (httpMethod === 'DELETE' && id) {
        await postsCollection.deleteOne({ id });
        await commentsCollection.deleteMany({ postId: id });
        result = { success: true };
      }
    } 
    // COMMENTS
    else if (resource === 'comments') {
      if (httpMethod === 'GET') {
        const comments = await commentsCollection.find({}).toArray();
        const commentsByPostId = {};
        comments.forEach(c => {
          if (!commentsByPostId[c.postId]) commentsByPostId[c.postId] = [];
          commentsByPostId[c.postId].push(c);
        });
        Object.keys(commentsByPostId).forEach(pid => {
          commentsByPostId[pid].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        });
        result = commentsByPostId;
      } else if (httpMethod === 'POST' && id) {
        const comment = JSON.parse(body);
        comment.timestamp = comment.timestamp ? new Date(comment.timestamp) : new Date();
        const commentData = { ...comment, postId: id };
        result = await commentsCollection.insertOne(commentData);
        await postsCollection.updateOne({ id }, { $inc: { commentCount: 1 } });
      }
    }
    // NOTES
    else if (resource === 'notes') {
      if (httpMethod === 'GET') {
        result = await notesCollection.find({}).toArray();
      } else if (httpMethod === 'POST') {
        const note = JSON.parse(body);
        result = await notesCollection.insertOne(note);
      } else if (httpMethod === 'DELETE' && id) {
        result = await notesCollection.deleteOne({ id });
      }
    }
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
