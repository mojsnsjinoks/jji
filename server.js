require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getMenuData } = require('./menuData');
const { searchMenuWithGemini } = require('./geminiService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/**
 * GET /api/menu
 * Returns the current menu items dataset
 */
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await getMenuData();
    res.json({ success: true, menu });
  } catch (err) {
    console.error('Error fetching menu:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve menu items' });
  }
});

/**
 * POST /api/menu-search
 * AI-powered natural language menu search endpoint
 */
app.post('/api/menu-search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid search query.'
      });
    }

    const menu = await getMenuData();
    const result = await searchMenuWithGemini(query.trim(), menu);

    res.json({
      success: true,
      query: query.trim(),
      greeting: result.greeting || null,
      recommendations: result.recommendations || []
    });
  } catch (err) {
    console.error('Menu Search API Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Sorry, our AI menu assistant is temporarily unavailable. Please try again or browse the menu directly.',
      error: err.message
    });
  }
});

// Fallback to index.html for SPA routing if needed
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🍔 Burger House Artisan server running on http://localhost:${PORT}`);
});
