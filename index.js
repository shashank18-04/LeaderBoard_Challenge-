const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const User = require('./models/User'); // Import User model to use for seeding

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://shasise22144:XcHLfPoKvbJxLAh8@cluster0.em5aim6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected...');
    // This function will run on every server start
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
      const createdNames = new Set(); // To avoid duplicate names in a single run

      // Loop until we have 10 unique names
      while(usersToCreate.length < 10) {
          const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
          // Ensure the generated name is unique for this seeding session
          if (!createdNames.has(name)) {
              createdNames.add(name);
              usersToCreate.push({ name, points: 0 });
          }
      }

      // Insert all the new users into the database at once
      await User.insertMany(usersToCreate);
      console.log('Database seeded successfully with 10 users.');
    } else {
      console.log('Database already contains users. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
