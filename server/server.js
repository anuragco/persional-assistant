const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const port = 5000;

// Replace with your actual OpenAI API key
const openaiApiKey = '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';

app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to the GPT-3 Server');
});

app.get('/gpt3', async (req, res) => {
  try {
    const prompt = req.query.prompt;

    if (!prompt) {
      throw new Error('Prompt is missing in the request.');
    }

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
    };

    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        res.json(JSON.parse(data)); // Assuming API response is JSON
      });
    });

    request.on('error', (error) => {
      // Handle request errors
      console.error('Error in GPT-3 request:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    });

    request.write(JSON.stringify({
      model: 'gpt-3.5-turbo-instruct',
      prompt,
      max_tokens: 150,
      temperature: 0.7,
    }));
    request.end();
  } catch (error) {
    // Handle other errors
    console.error('Error in GPT-3 request:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
