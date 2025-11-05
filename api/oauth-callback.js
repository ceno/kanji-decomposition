// Serverless function to handle GitHub OAuth callback
// Deploy this to Vercel, Netlify, or similar platform

module.exports = async (req, res) => {
    // Enable CORS - restrict to your deployed domain for production
    // For local development and GitHub Pages, allow specific origins
    const allowedOrigins = [
        'http://localhost:8080',
        'http://localhost:3000',
        'https://ceno.github.io',
        process.env.ALLOWED_ORIGIN // Custom origin from environment variable
    ].filter(Boolean);
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const { code } = req.query;
    
    if (!code) {
        res.status(400).json({ error: 'Missing authorization code' });
        return;
    }
    
    // Get client ID and secret from environment variables
    const client_id = process.env.GITHUB_CLIENT_ID;
    const client_secret = process.env.GITHUB_CLIENT_SECRET;
    
    if (!client_id || !client_secret) {
        res.status(500).json({ error: 'OAuth app not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.' });
        return;
    }
    
    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id,
                client_secret,
                code
            })
        });
        
        const data = await tokenResponse.json();
        
        if (data.access_token) {
            res.status(200).json({ token: data.access_token });
        } else {
            res.status(400).json({ error: data.error_description || 'Failed to get access token' });
        }
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
