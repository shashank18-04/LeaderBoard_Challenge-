const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Use the environment variable from Render, or fall back to a local one if not found.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/leaderboardDB';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected...');
    // The seedDatabase function is called here to add initial users if the DB is empty.
    seedDatabase();
  })
  .catch((err) => console.log('MongoDB connection error:', err));

// API Routes
app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

/**
 * Creates 10 random users in the database, but only if the 'users' collection is empty.
 * This prevents creating new users every time the server restarts.
 */
async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found. Seeding database with 10 random users...');
      
      const adjectives = ['Swift', 'Silent', 'Golden', 'Iron', 'Cosmic', 'Shadow', 'Crystal', 'Solar', 'Lunar', 'Crimson'];
      const nouns = ['Jaguar', 'Phoenix', 'Spectre', 'Golem', 'Voyager', 'Ninja', 'Dragon', 'Flare', 'Hunter', 'Warden'];
      
      const usersToCreate = [];
      const createdNames = new Set();

      while(usersToCreate.length < 10) {
          const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
          if (!createdNames.has(name)) {
              createdNames.add(name);
              usersToCreate.push({ name, points: 0 });
          }
      }

      await User.insertMany(usersToCreate);
      console.log('Database seeded successfully with 10 users.');
    } else {
      console.log('Database already contains users. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
