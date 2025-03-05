import { userModel } from "~/models/userModel";
import ApiError from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { boardModel } from "~/models/boardModel";
import { v2 as cloudinary } from "cloudinary";
import { OAuth2Client } from "google-auth-library";
import { env } from "~/config/environment";

const client = new OAuth2Client(env.googleClientId);

const loginUser = async (email, password) => {
  try {
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
    }

    const isPasswordValid = await userModel.comparePassword(user._id, password);
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
    }

    return user; // Trả về thông tin người dùng
  } catch (error) {
    throw error;
  }
};

const getAll = async () => {
  try {
    return await userModel.getAll();
  } catch (error) {
    throw error;
  }
};

const createUser = async (userData) => {
  try {
    const createdUser = await userModel.createUser(userData);
    return {
      ownerIds: createdUser.insertedId,
      message: "Sign Up successful!",
    };
  } catch (error) {
    throw error;
  }
};

const verifyGoogleToken = async (token) => {
    try {
      console.log('Token received for verification:', token);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: env.googleClientId, // Kiểm tra Client ID
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid Google token.");
    }
  };
  

  const loginWithGoogle = async (token) => {
    try {
        const googleUserData = await verifyGoogleToken(token);
        const { email, name, picture } = googleUserData;


        // Kiểm tra email trong cơ sở dữ liệu
        let user = await userModel.getUserByEmail(email);

        if (!user) {
            const newUser = {
                email,
                username: email.split('@')[0].toLowerCase(), // Tự động tạo `username` từ email
                displayName: name, // Chuyển `name` thành `displayName`
                avatar: picture,
                password: null, // Không cần mật khẩu
            };

            console.log('Creating new user:', newUser);
            user = await userModel.createUser(newUser);
        }

        return {
            message: 'Login with Google successful!',
            user,
        };
    } catch (error) {
        console.error('Google authentication error:', error);
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Google authentication failed.');
    }
};


const getUserDetails = async (userId) => {
  try {
    if (!userId || !userModel.isValidId(userId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid user ID.");
    }

    const user = await userModel.getUserDetails(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
    }

    return user;
  } catch (error) {
    throw error;
  }
};

const uploadImageToCloudinary = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Image upload failed.");
  }
};

const updateUser = async (userId, updateData) => {
  try {
    if (updateData.avatar) {
      updateData.avatar = await uploadImageToCloudinary(updateData.avatar);
    }

    return await userModel.updateUser(userId, updateData);
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    if (!userId || !userModel.isValidId(userId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid user ID.");
    }

    return await userModel.deleteUser(userId);
  } catch (error) {
    throw error;
  }
};

const getUserWithBoards = async (userId) => {
  try {
    if (!userId || !userModel.isValidId(userId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid user ID.");
    }

    const user = await userModel.getUserDetails(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
    }

    const userBoards = await boardModel.getUserBoards(userId);
    const filteredBoards = userBoards.filter((board) =>
      board.ownerIds.includes(userId) || board.memberIds.includes(userId)
    );

    return { ...user, boards: filteredBoards };
  } catch (error) {
    throw error;
  }
};

export const userService = {
  loginUser,
  getAll,
  createUser,
  loginWithGoogle,
  getUserDetails,
  updateUser,
  deleteUser,
  getUserWithBoards,
};
