import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { name, phone, city } = req.body;
    
    // Log the lead (Simulating database save)
    console.log('New Lead Captured:', { name, phone, city, date: new Date().toISOString() });

    // In a real production app, you would save this to a cloud database
    // Examples: Supabase, Firebase, MongoDB Atlas, PlanetScale
    
    return res.status(200).json({ 
      success: true, 
      message: 'Lead saved successfully (simulated)',
      id: Date.now()
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
