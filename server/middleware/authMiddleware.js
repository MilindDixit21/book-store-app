import jwt  from 'jsonwebtoken';

const authMiddleware =(req, res, next)=>{
    const header = req.headers.authorization;
    if(!header) return res.status(401).json({message:'unauthorized'});

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({message:'Invalid token'});
    }
};

export default authMiddleware;