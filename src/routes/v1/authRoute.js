import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { userService } from '~/services/userService';

const router = express.Router();
const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID');

// Hàm xác thực token Google
const verifyGoogleToken = async (token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: 'YOUR_GOOGLE_CLIENT_ID',
    });
    return ticket.getPayload();
};

// Endpoint xử lý xác thực Google
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;

        // Xác thực token Google
        const googleUserData = await verifyGoogleToken(token);

        // Đăng ký hoặc đăng nhập bằng Google
        const result = await userService.createUserWithGoogle({
            email: googleUserData.email,
            name: googleUserData.name,
            avatar: googleUserData.picture,
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: 'Google authentication failed.', error });
    }
});

export default authRoutes = router;
