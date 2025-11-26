import { MongoClient } from 'mongodb';

// Mock data for testing - return mock data for now
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

const mockComments = {
  "1": [
    {
      id: "c1",
      nickname: "NightWatcher",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=commenter1",
      content: "I feel this so much. You're not alone! 💜",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      postId: "1",
    },
  ],
  "2": []
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

  const cleanPath = path.replace('/.netlify/functions/api', '');
  const segments = cleanPath.split('/').filter(s => s);

  let result;
  let statusCode = 200;

  try {
    if (httpMethod === 'GET' && segments[0] === 'posts') {
      result = mockPosts;
      console.log('Returning mock posts:', mockPosts.length);
    } else if (httpMethod === 'POST' && segments[0] === 'posts') {
      result = { acknowledged: true };
      console.log('Mock post creation successful');
    } else if (httpMethod === 'DELETE' && segments[0] === 'posts' && segments[1]) {
      result = { acknowledged: true };
      console.log('Mock post delete successful');
    } else if (httpMethod === 'GET' && segments[0] === 'comments') {
      result = mockComments;
      console.log('Returning mock comments');
    } else if (httpMethod === 'POST' && segments[0] === 'comments' && segments[1]) {
      result = { acknowledged: true };
      console.log('Mock comment creation successful');
    } else {
      statusCode = 404;
      result = { error: 'Not found' };
    }
  } catch (error) {
    console.error('Error in function:', error);
    result = { error: 'Internal server error' };
    statusCode = 500;
  }

  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(result),
  };
}
