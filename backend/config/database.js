// config/database.js (CLEANED UP)
import mongoose from 'mongoose';

mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      return false;
    }

    if (mongoose.connection.readyState === 1) {
      return true;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    console.log('🎉', '='.repeat(50));
    console.log('✅ MongoDB Atlas Connected Successfully!');
    console.log('🏛️ Host:', conn.connection.host);
    console.log('📊 Database:', conn.connection.name);
    console.log('🔌 Connection State:', conn.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    console.log('🎉', '='.repeat(50));

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
};

export default connectDB;
