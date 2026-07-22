export const getGatewayUser = (req) => {
    const userId =
        req.headers['x-user-id'] ??
        req.headers['x-auth-user-id'] ??
        null;

    if (!userId) {
        return null;
    }

    return {
        id: String(userId),
        _id: String(userId),
        role: String(req.headers['x-user-role'] || 'user'),
        email: req.headers['x-user-email'] || null,
    };
};
