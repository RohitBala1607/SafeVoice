const jwt = require('jsonwebtoken');

exports.verifyUser = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};

exports.verifyAuthority = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "authority") {
            return res.status(403).json({ success: false, message: "Access denied. Action requires Authority privileges." });
        }

        req.authority = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: "Token is not valid" });
    }
};
