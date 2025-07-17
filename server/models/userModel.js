import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username:String,
    email:{type:String, unique:true},
    password:String,
    role:{type:String, enum:['admin','editor','viewer'], default:'viewer'}
});

userSchema.pre('save', async function () {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 12);
    }
});

export default mongoose.model('User', userSchema);