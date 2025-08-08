import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import userRoutes from './routes/users.js';
import bookRoutes from './routes/books.js';
import cartRoutes from './routes/carts.js';
import orderRoutes from './routes/orders.js';
import paymentsRoute from './routes/payments.js';
import notificationRoute from './routes/notifications.js';

const app = express();

//Middleware

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cors({origin:'http://localhost:4200', credentials:true})); //frontend url (angular)

//MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) =>  console.error(err));

//Routes
app.use('/api/users/', userRoutes);
app.use('/api/books/', bookRoutes);
app.use('/api/cart/', cartRoutes);
app.use('/api/orders/',orderRoutes);
app.use('/api/payments/',paymentsRoute);
app.use('/api/notifications/', notificationRoute);


//server
const PORT = process.env.PORT;
app.listen(PORT, ()=>{ 
console.log(`server running on port ${PORT}`);
});
