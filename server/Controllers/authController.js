const User = require("../models/usersModel");
const userModel = require("../models/usersModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PasswordReset = require("../models/passwordResetModel");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// nodemailer transporter
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "funnybands001@gmail.com", // Replace with your email address
    pass: "ujgs nnaz lohy hlsy", // Replace with your email password
  },
});

// transporter verification
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});

// register new user

const CreateUser = async (req, res) => {
  try {
    const exisitingUser = await userModel.findOne({ email: req.body.email });
    if (exisitingUser) {
      return res
        .status(200)
        .send({ message: "User Already Exist", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      ...req.body,
      password: hashedPassword,
      previousPasswords: [hashedPassword],
      passwordCreationDate: Date.now()

    });
    await newUser.save();
    res.status(201).send({ message: "Register Sucessfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Create Controller ${error.message}`,
    });
  }
};

// const CreateUser = async (req, res) => {
//   try {
//     const existingUser = await User.findOne({ email: req.body.email });
//     if (existingUser) {
//       return res.send({
//         message: "User already exists",
//         success: false,
//         data: null,
//       });
//     }
//     const hashedPassword = await bcrypt.hash(req.body.password, 6);
//     req.body.password = hashedPassword;
//     const newUser = new User(req.body);
//     await newUser.save();
//     res.send({
//       message: "User created successfully",
//       success: true,
//       data: null,
//     });
//   } catch (error) {
//     res.send({
//       message: error.message,
//       success: false,
//       data: null,
//     });
//   }
// };

// login user

const Login = async (req, res) => {
  const MAX_FAILED_ATTEMPTS = 5; // Maximum failed login attempts
  const LOCKOUT_DURATION = 15 * 60 * 1000; // Lockout duration in milliseconds (e.g., 15 minutes)

  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    if (user.lockoutExpires && user.lockoutExpires > Date.now()) {
      return res.status(403).send({ message: "Account is locked. Please try again later.", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (isMatch) {
      // Reset failed login attempts and lockout status on successful login
      user.failedLoginAttempts = 0;
      user.lockoutExpires = null;
      await user.save();

      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
      return res.status(200).send({ message: "Login Success", success: true, token ,user: {
        _id: user._id,
        isAdmin: user.isAdmin,}});
    } else {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        // Lock the account if maximum attempts are reached
        user.lockoutExpires = Date.now() + LOCKOUT_DURATION;
        user.failedLoginAttempts = 0; // Optional: Reset attempts count after lockout
      }

      await user.save();
      return res.status(200).send({ message: "Invalid Email or Password", success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: `Error in Login Controller: ${error.message}`, success: false });
  }
};

// const Login = async (req, res) => {
//   try {
//     const existingUser = await User.findOne({ email: req.body.email });
//     if (!existingUser) {
//       return res.send({
//         message: "User does not exist",
//         success: false,
//         data: null,
//       });
//     }
//     const isPasswordCorrect = await bcrypt.compare(
//       req.body.password,
//       existingUser.password
//     );
//     if (!isPasswordCorrect) {
//       return res.send({
//         message: "Incorrect password",
//         success: false,
//         data: null,
//       });
//     }

//     const token = jwt.sign(
//       { userId: existingUser._id },
//       "process.env.jwt_secret",
//       {
//         expiresIn: "1h",
//       }
//     );
//     res.send({
//       message: "User logged in successfully",
//       success: true,
//       data: token,
//       user: existingUser,
//     });
//   } catch (error) {
//     res.send({
//       message: error.message,
//       success: false,
//       data: null,
//     });
//   }
// };


const ResetPassword = async (req, res) => {
  const { email } = req.body;
  const name = userModel.name;
  const redirectUrl = "https://localhost:3000/reset-password";

  // check if email exists
  userModel.find({ email })
    .then((data) => {
      if (data.length) {
        // user exists
        sendResetEmail(data[0], redirectUrl, res);
      } else {
        res.status(400).send({
          status: "FAILED",
          message: "Email does not exist",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send({
        status: "FAILED",
        message: "Something went wrong",
      });
    });

  // send reset email
  const sendResetEmail = ({ _id, email, name }, redirectUrl, res) => {
    const resetString = uuidv4() + _id;

    // First, we clear all existing reset records
    PasswordReset.deleteMany({ userId: _id })
      .then((result) => {
        // Reset records deleted successfully

        // Now, we create a new reset record

        // mail options
        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Password Reset",
          html: `
          Hello ${name},
          <br/>
          <br/>
          Please click on the link below to reset your password.
          <br/>
          <br/>
          <a href="${redirectUrl}/${_id}/${resetString}">Reset Password</a>
          the link will expire in 1 hour.
          <br/>
          <br/>
          If you did not request this, please ignore this email.
          <br/>
          <br/>
          Thank you.
          `,
        };

        // hash the reset string
        const saltRounds = 10;
        bcrypt
          .hash(resetString, saltRounds)
          .then((hashedResetString) => {
            // set values in password reset collection
            const newPasswordReset = new PasswordReset({
              userId: _id,
              resetString: hashedResetString,
              createdAt: Date.now(),
              expiresAt: Date.now() + 3600000,
            });

            newPasswordReset
              .save()
              .then(() => {
                transporter
                  .sendMail(mailOptions)
                  .then(() => {
                    // reset email sent and passsword reset record saved
                    res.status(200).send({
                      status: "PENDING",
                      message:
                        "Password reset email sent successfully please check your email",
                    });
                  })
                  .catch((error) => {
                    console.log(error);
                    res.status(400).send({
                      status: "FAILED",
                      message: "Password reset email failed",
                    });
                  });
              })
              .catch((error) => {
                console.log(error);
                res.status(500).send({
                  status: "FAILED",
                  message: "Cound't save password reset data!",
                });
              });
          })
          .catch((error) => {
            console.log(error);
            res.status(500).send({
              status: "FAILED",
              message:
                "An error occured while hashing the password reset data!",
            });
          });
      })
      .catch((error) => {
        // error while clearing existing reset records
        console.log(error);
        res.status(400).send({
          status: "FAILED",
          message: "Clearing existing password reset records failed",
        });
      });
  };
};

// actually reset password
const UpdatePassword = async (req, res) => {
  let { userId, resetString } = req.params;
  let { newPassword } = req.body;

  PasswordReset.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        // password reset record exists so we proceed

        const { expiresAt } = result[0];
        const hashedResetString = result[0].resetString;

        // checking for expired reset string
        if (expiresAt < Date.now()) {
          PasswordReset.deleteOne({ userId })
            .then(
              // Reset record deleted successfully
              () => {
                res.status(410).send({
                  status: "FAILED",
                  message: "Password reset link has expired",
                });
              }
            )
            .catch((error) => {
              // deletion failed
              console.log(error);
              res.status(400).send({
                status: "FAILED",
                message: "Clearing password reset record failed",
              });
            });
        } else {
          // valid reset record exists so we validate the reset string
          // First compare the hashed reset string

          bcrypt
            .compare(resetString, hashedResetString)
            .then((result) => {
              if (result) {
                // strings matched
                // hash password again
                const saltRounds = 10;
                bcrypt
                  .hash(newPassword, saltRounds)
                  .then((hashedNewPassword) => {
                    // update user password
                    userModel.updateOne(
                      { _id: userId },
                      { password: hashedNewPassword }
                    )
                      .then(() => {
                        // update complete. Now delete the reset record
                        PasswordReset.deleteOne({ userId })

                          .then(() => {
                            // both user record and reset record updated
                            res.status(200).send({
                              status: "SUCCESS",
                              message: "Password has been reset successfully.",
                            });
                          })
                          .catch((error) => {
                            console.log(error);
                            res.status(400).send({
                              status: "FAILED",
                              message:
                                "An error occured while finalizing password reset.",
                            });
                          });
                      })
                      .catch((error) => {
                        console.log(error);
                        res.status(400).send({
                          status: "FAILED",
                          message: "Updting user password failed.",
                        });
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    res.status(400).send({
                      status: "FAILED",
                      message:
                        "An error occured while hashing the new password.",
                    });
                  });
              } else {
                // Existing record but incorrect reset string passed.
                res.status(410).send({
                  status: "FAILED",
                  message: "Invalid password reset details passed.",
                });
              }
            })

            .catch((error) => {
              console.log(error);
              res.status(400).send({
                status: "FAILED",
                message: "Comparing password reset strings failed.",
              });
            });
        }
      } else {
        // Password reset record doesn't exist
        res.status(400).send({
          status: "FAILED",
          message: "Password link either doesn't exist or has expired.",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send({
        status: "FAILED",
        message: "Cheching for exsitng password reset records failed.",
      });
    });
};

module.exports = { CreateUser, Login,  UpdatePassword,ResetPassword };
