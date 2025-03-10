import React, { useState } from "react";
import { Button, TextField, Typography, Box, Divider, useMediaQuery } from "@mui/material";
import { signupAPI } from "~/apis";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 600px)");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await signupAPI({ email, password, username });
      localStorage.setItem('ownerIds', res.ownerIds);
      window.dispatchEvent(new Event("storage"));
      toast.success(res?.message);
      navigate('/boards', { state: { ownerIds: res.ownerIds } });
    } catch (err) {
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        flexDirection: { xs: "column", md: "row" },
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Left Video Section (Ẩn trên điện thoại) */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            maxWidth: "40%",
            position: "relative",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <video
            autoPlay
            muted
            loop
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          >
            <source
              src="https://res.cloudinary.com/ddmsl3meg/video/upload/v1734022899/tnelcibodjsy5ej8hzoo.mp4"
              type="video/mp4"
            />
          </video>
        </Box>
      )}

      {/* Right Form Section */}
      <Box
        sx={{
          flex: 1,
          maxWidth: { xs: "100%", md: "60%" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: { xs: "20px", md: "40px" },
          backgroundColor: "white",
          boxShadow: { md: "0px 4px 10px rgba(0, 0, 0, 0.1)" },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "600px",
            padding: { xs: "20px", md: "40px" },
            backgroundColor: "white",
            borderRadius: "8px",
          }}
        >
          <Typography
            variant="h5"
            color="#1565c0"
            fontWeight="bold"
            mb={3}
            textAlign="center"
          >
            Create your account
          </Typography>
          {error && (
            <Typography
              color="red"
              textAlign="center"
              sx={{ marginBottom: 2 }}
            >
              {error}
            </Typography>
          )}
          {success && (
            <Typography
              color="green"
              textAlign="center"
              sx={{ marginBottom: 2 }}
            >
              Account created successfully!
            </Typography>
          )}

          {/* Đăng ký với Google */}
          <Button
            variant="outlined"
            fullWidth
            sx={{
              marginBottom: 2,
              borderColor: "#d3d3d3",
              color: "black",
              textTransform: "none",
              padding: "10px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="https://cdn6.agoda.net/images/universal-login/google-logo-v2.svg?s=16x"
              alt="Google Logo"
              style={{
                width: "20px",
                height: "20px",
                marginRight: "10px",
              }}
            />
            Sign up with Google
          </Button>

          <Typography textAlign="center" color="gray" mb={2}>
            or sign up with email
          </Typography>

          {/* Input fields */}
          <TextField
            name="username"
            label="User Name"
            variant="outlined"
            fullWidth
            value={formData.username}
            onChange={handleChange}
            sx={{ marginBottom: 3 }}
          />
          <TextField
            name="email"
            label="Email Address"
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            sx={{ marginBottom: 3 }}
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            sx={{ marginBottom: 3 }}
          />
          <TextField
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            variant="outlined"
            fullWidth
            value={formData.confirmPassword}
            onChange={handleChange}
            sx={{ marginBottom: 2 }}
          />

          {/* Button Sign Up */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            sx={{
              backgroundColor: "#1565c0",
              color: "white",
              fontWeight: "bold",
              padding: "10px",
              borderRadius: "20px",
              marginBottom: 3,
              "&:hover": { backgroundColor: "#0984e3" },
            }}
          >
            Sign Up
          </Button>

          <Divider sx={{ marginY: 2, width: "100%" }} />

          {/* Chuyển sang trang đăng nhập */}
          <Typography textAlign="center">
            Already have an account?{" "}
            <Button
              href="/"
              sx={{
                color: "#1565c0",
                textTransform: "none",
                fontWeight: "bold",
                textDecoration: "underline",
                padding: 0,
                minWidth: "auto",
              }}
            >
              Sign in
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SignUp;
