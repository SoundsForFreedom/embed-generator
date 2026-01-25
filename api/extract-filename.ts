// Vercel Serverless Function - Google Drive Filename Extractor
// Uses Google Drive API v3 for reliable filename extraction

export const config = {
  runtime: 'edge',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async function handler(request: Request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return new Response(JSON.stringify({ error: 'fileId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_DRIVE_API_KEY environment variable is not set');
      return new Response(JSON.stringify({ 
        error: 'API key not configured. Please add GOOGLE_DRIVE_API_KEY to Vercel environment variables.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use Google Drive API v3 to get file metadata
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?key=${apiKey}&fields=name`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Drive API error:', response.status, errorData);

      if (response.status === 404) {
        return new Response(JSON.stringify({ 
          error: 'File not found. Make sure the file exists and is publicly accessible.' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (response.status === 403) {
        return new Response(JSON.stringify({ 
          error: 'Access denied. Make sure the file is shared publicly or API key has correct permissions.' 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Failed to fetch file info from Google Drive' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    // Remove file extension from filename
    let filename = data.name || '';
    filename = filename.replace(/\.[^.]+$/, '');

    console.log(`Successfully fetched filename for ${fileId}: ${filename}`);

    return new Response(JSON.stringify({ filename, fileId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
