import jwt from 'jsonwebtoken';

export const generateToken = user =>
    jwt.sign(
        {id:user._id, role:user.role, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn:process.env.JWT_EXPIRES_IN }
    );

