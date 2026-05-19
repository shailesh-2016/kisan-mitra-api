const mongoose = require('mongoose');
require('dotenv').config();

async function fixDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    const result = await mongoose.connection.collection('users').dropIndex('mobile_1');
    console.log('Dropped mobile_1 index:', result);
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index mobile_1 already dropped or not found.');
    } else {
      console.error('Error dropping index:', err);
    }
  } finally {
    mongoose.connection.close();
  }
}
fixDb();
