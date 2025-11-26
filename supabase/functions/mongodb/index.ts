import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('MongoDB function called');
    
    const username = Deno.env.get('MONGODB_USERNAME');
    const password = Deno.env.get('MONGODB_PASSWORD');
    
    if (!username || !password) {
      console.error('MongoDB credentials not found');
      throw new Error('MongoDB credentials not configured');
    }

    const connectionString = `mongodb+srv://${username}:${password}@sv-secrets.lb0fj5n.mongodb.net/?appName=Sv-Secrets`;
    
    console.log('Connecting to MongoDB...');
    const client = new MongoClient();
    await client.connect(connectionString);

    const { action, database, collection, data, query } = await req.json();
    console.log(`Action: ${action}, Database: ${database}, Collection: ${collection}`);

    const db = client.database(database);
    const coll = db.collection(collection);

    let result;
    
    switch (action) {
      case 'find':
        result = await coll.find(query || {}).toArray();
        break;
      case 'insertOne':
        result = await coll.insertOne(data);
        break;
      case 'insertMany':
        result = await coll.insertMany(data);
        break;
      case 'updateOne':
        result = await coll.updateOne(query, { $set: data });
        break;
      case 'deleteOne':
        result = await coll.deleteOne(query);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log('MongoDB operation successful');
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('MongoDB function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
