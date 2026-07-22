import jwt from 'jsonwebtoken';

export const requireGatewayAuth = (requiredRole = null) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    message: 'Authorization token is missing or invalid',
                });
            }

            if (!process.env.SECRET_KEY) {
                return res.status(500).json({
                    success: false,
                    message: 'Gateway SECRET_KEY is not configured',
                });
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (!decoded?.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token payload',
                });
            }

            const role = decoded.role || 'user';
            if (requiredRole && role !== requiredRole) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: admins only',
                });
            }

            req.auth = {
                id: String(decoded.id),
                role,
            };

            req.headers['x-user-id'] = req.auth.id;
            req.headers['x-user-role'] = req.auth.role;

            next();
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired',
                });
            }

            return res.status(401).json({
                success: false,
                message: 'access token is missing or invalid',
            });
        }
    };
};
