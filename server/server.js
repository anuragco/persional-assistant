const express = require('express');
const cors = require('cors');
const https = require('https');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

const openaiApiKey = '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';

const db = mysql.createConnection({
  host: 'localhost',
  port: 4306,
  user: 'root',
  password: '',
  database: 'jarvis',
});

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to the GPT-3 Server');
});

app.get('/gpt3', async (req, res) => {
  try {
    const prompt = req.query.prompt;

    if (!prompt) {
      throw new Error('Prompt is missing in the request.');
    }

    // Check if the prompt already exists in the database
    const [rows] = await db.promise().query('SELECT response FROM data WHERE prompt = ?', [prompt]);

    if (rows.length > 0) {
      // If the prompt exists in the database, send the stored response to the client
      const storedResponse = rows[0].response;
      res.json({ storedResponse, message: 'Response retrieved from the database.' });
    } else {
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

        response.on('end', async () => {
          try {
            const apiResponse = JSON.parse(data);

            if (apiResponse.choices && apiResponse.choices.length > 0) {
              const textResponse = apiResponse.choices[0].text;
              res.json(apiResponse);

              // Save the prompt and response to the database
              await db.promise().query('INSERT INTO data (prompt, response) VALUES (?, ?)', [prompt, textResponse]);
            } else {
              throw new Error('Invalid response from GPT-3 API.');
            }

          } catch (error) {
            console.error('Error parsing GPT-3 API response:', error);
            res.status(500).json({ error: 'Internal Server Error', details: 'Error parsing GPT-3 API response' });
          }
        });
      });

      request.on('error', (error) => {
        console.error('Error in GPT-3 request:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
      });

      request.on('aborted', () => {
        console.error('GPT-3 request aborted');
        res.status(500).json({ error: 'Internal Server Error', details: 'GPT-3 request aborted' });
      });

      request.on('timeout', () => {
        console.error('GPT-3 request timeout');
        res.status(500).json({ error: 'Internal Server Error', details: 'GPT-3 request timeout' });
      });

      request.write(JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt,
        max_tokens: 150,
        temperature: 0.7,
      }));
      request.end();
    }
  } catch (error) {
    console.error('Error in GPT-3 request:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
