import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, message } from "antd";
import axios from "axios";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../redux/alertsSlice";
import { Helmet } from "react-helmet";
import zxcvbn from 'zxcvbn';

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);

  const validatePassword = (password) => {
    const minLength = 8;
    const maxLength = 12;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) return "Password is too short!";
    if (password.length > maxLength) return "Password is too long!";
    if (!hasUpper) return "Password must include at least one uppercase letter!";
    if (!hasLower) return "Password must include at least one lowercase letter!";
    if (!hasNumber) return "Password must include at least one number!";
    if (!hasSpecial) return "Password must include at least one special character!";
    
    return null;
  };

  const onFinish = async (values) => {
    const { password, confirmPassword } = values;

    if (password !== confirmPassword) {
      message.error("Password and Confirm Password must be the same");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      message.error(passwordError);
      return;
    }

    try {
      dispatch(ShowLoading());
      const response = await axios.post("/api/auth/create-user", values);
      dispatch(HideLoading());
      if (response.data.success) {
        message.success(response.data.message);
        navigate("/login");
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const TogglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  const passwordStrength = () => {
    const result = zxcvbn(password);
    return result.score;
  };

  const getStrengthText = () => {
    const strength = passwordStrength();
    switch (strength) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "Unknown";
    }
  };

  return (
    <>
      <Helmet>
        <title>Register</title>
      </Helmet>
      <Form onFinish={onFinish}>
        <div className="h-screen flex">
          <div
            className="hidden lg:flex w-full lg:w-3/4"
            style={{
              backgroundSize: "cover",
              backgroundImage: `url("https://wallpapercave.com/wp/wp6913872.jpg")`,
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex items-center h-full w-full px-20 bg-gray-900 bg-opacity-40"></div>
          </div>
          <div className="from-gray-50 to-blue-500 bg-gradient-to-r flex w-full lg:w-1/2 justify-center items-center space-y-8">
            <div className="w-3/4 px-8 md:px-32 lg:px-24">
              <div className="flex flex-col items-center mb-10"></div>
              <h1 className="mb-8 text-5xl text-center font-bold italic">
                Register
              </h1>
              <Form.Item
                name="name"
                initialValue=""
                rules={[
                  {
                    required: true,
                    message: "Please input your fullname!",
                    validateTrigger: "onSubmit",
                    validateFirst: true,
                  },
                ]}
              >
                <div className="relative z-0 mb-6 w-full group">
                  <input
                    type="text"
                    name="floating_fullname"
                    id="floating_fullname"
                    className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-blue-500 dark:focus:border-blue-700 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="floating_fullname"
                    className="absolute text-sm text-gray-500 dark:text-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Full Name
                  </label>
                </div>
              </Form.Item>

              <Form.Item
                name="email"
                initialValue=""
                rules={[
                  {
                    required: true,
                    message: "Please input your email!",
                    validateTrigger: "onSubmit",
                  },
                ]}
              >
                <div className="relative z-0 mb-6 w-full group">
                  <input
                    type="email"
                    name="floating_email"
                    className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-300 appearance-none text-black dark:border-blue-500 dark:focus:border-blue-700 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="floating_email"
                    className="absolute text-sm text-gray-500 dark:text-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Email address
                  </label>
                </div>
              </Form.Item>
              <Form.Item
                name="password"
                initialValue=""
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                    min: 6,
                    validateTrigger: "onSubmit",
                  },
                ]}
              >
                <div className="relative z-0 mb-6 w-full group">
                  <input
                    type={passwordShown ? "text" : "password"}
                    name="floating_password"
                    className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-300 appearance-none text-black dark:border-blue-500 dark:focus:border-blue-700 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label
                    htmlFor="floating_password"
                    className="absolute text-sm text-gray-500 dark:text-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Password
                  </label>
                  <i
                    className="absolute right-0 top-0 mt-3 mr-4 text-black cursor-pointer"
                    onClick={TogglePassword}
                  >
                    {passwordShown ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </i>
                  <div className="mt-2 text-sm text-gray-500">
                    Password Strength: {getStrengthText()}
                  </div>
                </div>
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                initialValue=""
                rules={[
                  {
                    required: true,
                    message: "Please input your password again!",
                    min: 6,
                    validateTrigger: "onSubmit",
                  },
                ]}
              >
                <div className="relative z-0 mb-6 w-full group">
                  <input
                    type={passwordShown ? "text" : "password"}
                    name="floating_password"
                    className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-300 appearance-none text-black dark:border-blue-500 dark:focus:border-blue-700 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="floating_password"
                    className="absolute text-sm text-gray-500 dark:text-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Confirm Password
                  </label>
                  <i
                    className="absolute right-0 top-0 mt-3 mr-4 text-black cursor-pointer"
                    onClick={TogglePassword}
                  >
                    {passwordShown ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </i>
                </div>
              </Form.Item>
              <div className="flex justify-center mb-5">
                <button
                  type="submit"
                  className="relative inline-flex items-center justify-start
                  px-8 py-3 overflow-hidden font-bold rounded-full
                  group"
                >
                  <span className="relative w-full text-left text-black transition-colors duration-200 ease-in-out group-hover:text-white">
                    Create Account
                  </span>
                  <span className="absolute inset-0 border-2 border-blue-600 rounded-full"></span>
                </button>
              </div>
              <p className="text-center text-base text-gray-600 mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 font-bold hover:text-blue-700"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Form>
    </>
  );
}

export default Register;
