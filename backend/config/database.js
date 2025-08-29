// config/database.js (CLEANED UP)
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // ✅ REMOVED deprecated options
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log('🎉', '='.repeat(50));
    console.log('✅ MongoDB Atlas Connected Successfully!');
    console.log('🏛️ Host:', conn.connection.host);
    console.log('📊 Database:', conn.connection.name);
    console.log('🔌 Connection State:', conn.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    console.log('🎉', '='.repeat(50));

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
