{
type: uploaded file
fileName: king143rahul/svyasa/SVYASA-76983a21efddfc86d9d8c84451e3f27affabbaca/netlify/functions/api.js
fullContent:
import { MongoClient } from 'mongodb';

// Cache the client outside the handler to reuse connections
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

    const { httpMethod, path, body } = event;

    const segments = path
      .split('/')
      .filter(s => s && s !== '.netlify' && s !== 'functions' && s !== 'api');

    const resource = segments[0]; 
    const id = segments[1];       

    let result;

    if (httpMethod === 'GET' && resource === 'posts') {
      result = await postsCollection.find({}).sort({ timestamp: -1 }).toArray();
    }
    else if (httpMethod === 'POST' && resource === 'posts') {
      const post = JSON.parse(body);
      if (post.timestamp) post.timestamp = new Date(post.timestamp);
      else post.timestamp = new Date();
      result = await postsCollection.insertOne(post);
    }
    else if (httpMethod === 'PATCH' && resource === 'posts' && id) {
      const updateData = JSON.parse(body);
      if (updateData.reaction) {
         // Atomic increment for reactions
         const field = `reactions.${updateData.reaction}`;
         result = await postsCollection.updateOne({ id }, { $inc: { [field]: 1 } });
      } else {
         result = await postsCollection.updateOne({ id }, { $set: updateData });
      }
    }
    else if (httpMethod === 'DELETE' && resource === 'posts' && id) {
      await postsCollection.deleteOne({ id });
      await commentsCollection.deleteMany({ postId: id });
      result = { success: true };
    }
    else if (httpMethod === 'GET' && resource === 'comments') {
      const comments = await commentsCollection.find({}).toArray();
      const commentsByPostId = {};
      comments.forEach(c => {
        if (!commentsByPostId[c.postId]) commentsByPostId[c.postId] = [];
        commentsByPostId[c.postId].push(c);
      });
      result = commentsByPostId;
    }
    else if (httpMethod === 'POST' && resource === 'comments' && id) {
      const comment = JSON.parse(body);
      if (comment.timestamp) comment.timestamp = new Date(comment.timestamp);
      else comment.timestamp = new Date();

      const commentData = { ...comment, postId: id };
      result = await commentsCollection.insertOne(commentData);

      await postsCollection.updateOne({ id }, { $inc: { commentCount: 1 } });
    }
    else {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Route not found: ${resource}` })
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
      body: JSON.stringify({ error: error.message, stack: error.stack }),
    };
  }
}
}
