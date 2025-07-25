import jwt from 'jsonwebtoken';

export const generateToken = user =>
    jwt.sign(
        {_id:user._id, role:user.role, email: user.email,
 username: user.username },
        process.env.JWT_SECRET,
        { expiresIn:process.env.JWT_EXPIRES_IN }
    );

