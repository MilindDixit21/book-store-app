
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title:String,
    author:String,
    genre:String,
    publishDate:Date,
    ISBN:String,
    summary:String,
    status: {type:String, enum:['draft', 'published'], default:'draft'},
    coverImage:String,
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    price:Number
});

export default mongoose.model('Book', bookSchema);
