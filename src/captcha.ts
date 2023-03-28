import express from 'express';
import { createWorker } from 'tesseract.js';
import mongoose from 'mongoose';

// Define the Captcha result schema
const captchaResultSchema = new mongoose.Schema({
  imageUrl: String,
  solvedText: String,
});

// Define the Captcha result model
const CaptchaResult = mongoose.model('CaptchaResult', captchaResultSchema);

// Initialize Tesseract.js worker
const worker = createWorker();

// Connect to MongoDB database
mongoose.connect('mongodb+srv://Rahul:myuser@rahul.fack9.mongodb.net/Mern?authSource=admin&replicaSet=atlas-117kuv-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true')
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB', error));

// Create Express.js app
const app = express();

// Define the route to solve a Captcha given an image URL
app.get('/solve-captcha', async (req:any, res:any) => {
  const { imageUrl } = req.query;

  // Load image from URL
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(imageUrl);

  // Save solved Captcha result to MongoDB
  const result = new CaptchaResult({ imageUrl, solvedText: text });
  await result.save();

  // Return solved Captcha result in response
  res.send(text);
});

// Start the Express.js server
const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
