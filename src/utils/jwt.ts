const jwt = require('jsonwebtoken');



// Function to verify a JWT token
export const verifyToken = async (token: string) => {
    const tokenDetail = jwt.decode(token);
  
    if (process.env.ENABLEJWT === "true") {
        return await jwt.verify(token, process.env.JWT_SECRET);
    }
    return true;
};

