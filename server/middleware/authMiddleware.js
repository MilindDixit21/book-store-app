import jwt  from 'jsonwebtoken';

const authMiddleware =(req, res, next)=>{
    const header = req.headers.authorization;
    if(!header) return res.status(401).json({message:'authMiddleware ~ unauthorized'});

    const token = header && header.split(' ')[1];

      if (!token) return res.sendStatus(401);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('✅ authMiddleware user payload:', req.user);
        next();
    } catch(err) {
        res.status(403).json({message:'Invalid token', error:err.message});
    }
};

export default authMiddleware;