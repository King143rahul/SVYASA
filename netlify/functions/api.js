export async function handler(event, context) {
  const { httpMethod, path, body } = event;

  // Handle CORS
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  try {
    // Re-use connection if possible
    await establishConnection();
    await initializeDatabase();

    const db = getDatabase();
    const postsCollection = db.collection('posts');
    const commentsCollection = db.collection('comments');

    let result;
    let statusCode = 200;

    // FIX: Clean path handling
    // Remove the API prefix from the request path
    let cleanPath = path;
    if (cleanPath.startsWith('/.netlify/functions/api/')) {
      cleanPath = cleanPath.slice('/.netlify/functions/api'.length);
    } else if (cleanPath.startsWith('/api/')) {
      cleanPath = cleanPath.slice('/api'.length);
    }

    // Example: "/posts" -> ["posts"]
    // Example: "/posts/123" -> ["posts", "123"]
    const segments = cleanPath.split('/').filter(Boolean);

    const resource = segments[0]; // 'posts' or 'comments'
    const id = segments[1];       // id if present

    if (httpMethod === 'GET' && resource === 'posts') {
      const posts = await postsCollection.find({}).sort({ timestamp: -1 }).toArray();
      result = posts;
    } else if (httpMethod === 'POST' && resource === 'posts') {
      const post = JSON.parse(body);
      if (post.timestamp) post.timestamp = new Date(post.timestamp);
      const insertResult = await postsCollection.insertOne(post);
      result = insertResult;
    } else if (httpMethod === 'DELETE' && resource === 'posts' && id) {
      const deleteResult = await postsCollection.deleteOne({ id });
      await commentsCollection.deleteMany({ postId: id });
      result = deleteResult;
    } else if (httpMethod === 'GET' && resource === 'comments') {
      const comments = await commentsCollection.find({}).toArray();
      const commentsByPostId = {};
      comments.forEach(comment => {
        if (!commentsByPostId[comment.postId]) {
          commentsByPostId[comment.postId] = [];
        }
        commentsByPostId[comment.postId].push(comment);
      });
      Object.keys(commentsByPostId).forEach(postId => {
        commentsByPostId[postId].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });
      result = commentsByPostId;
    } else if (httpMethod === 'POST' && resource === 'comments' && id) {
      const postId = id;
      const comment = JSON.parse(body);
      if (comment.timestamp) comment.timestamp = new Date(comment.timestamp);
      const commentData = { ...comment, postId };
      const insertResult = await commentsCollection.insertOne(commentData);
      await postsCollection.updateOne({ id: postId }, { $inc: { commentCount: 1 } });
      result = insertResult;
    } else if (httpMethod === 'GET' && resource === 'notes') {
      const notesCollection = db.collection('notes');
      const notes = await notesCollection.find({}).sort({ timestamp: -1 }).toArray();
      result = notes;
    } else if (httpMethod === 'POST' && resource === 'notes') {
      const notesCollection = db.collection('notes');
      const note = JSON.parse(body);
      if (note.timestamp) note.timestamp = new Date(note.timestamp);
      const insertResult = await notesCollection.insertOne(note);
      result = insertResult;
    } else if (httpMethod === 'DELETE' && resource === 'notes' && id) {
      const notesCollection = db.collection('notes');
      const deleteResult = await notesCollection.deleteOne({ id });
      result = deleteResult;
    } else {
      statusCode = 404;
      result = { error: 'Not found' };
    }

    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
}
