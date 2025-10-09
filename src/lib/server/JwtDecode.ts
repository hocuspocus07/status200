import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest): string => {
    try {
        // 1. Retrieve the token from the 'Authorization' header
        // The header is expected to be in the format "Bearer <token>"
        const authHeader = request.headers.get("authorization");


        if (!authHeader) {
            throw new Error("No authentication token provided.");
        }

        const token = authHeader.split(" ")[1];

        // 2. Verify the token using your JWT_SECRET
        // The '!' tells TypeScript that you are certain process.env.JWT_SECRET is not undefined.
        // Ensure this variable is set in your .env file.
        const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);
        console.log("key checking:", process.env.JWT_SECRET);

        // 3. Return the user ID from the token's payload
        return decodedToken.id;

    } catch (error: any) {
        // This will catch errors like an expired token, an invalid signature, etc.
        throw new Error(error.message);
    }
};