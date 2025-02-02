const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    // Check if authorization header exists
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(" ")[1]; // Extract token from header

    // Verify token
    JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({
          message: "Auth Failed",
          success: false,
        });
      } else {
        req.body.userId = decode.id;
        next();
      }
    });
  } catch (error) {
    console.log(error);
    if (!res.headersSent) {
      res.status(401).send({
        message: "Auth Failed",
        success: false,
      });
    }
  }
};





// const JWT = require("jsonwebtoken");

// module.exports = async (req, res, next) => {
//   try {
//     const token = req.headers["authorization"].split(" ")[1];
//     JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
//       if (err) {
//         res.status(200).send({
//           message: "Auth Failed",
//           success: false,
//         });
//         return next()
//       } else {
//         req.body.userId = decode.id;
//         next();
//       }
//     });
//   next();
//   } catch (error) {
//     console.log(error);
//     res.status(401).send({
//       message: "Auth Failed",
//       success: false,
//     });
//     return next()
//   }
// };


// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     if (!token) {
//       return res.status(401).send({
//         message: "Auth failed",
//         success: false,
//       });
//     }
//     const decodedToken = jwt.verify(token, "process.env.jwt_secret");
//     req.params.userId = decodedToken.userId;
//     next();
//   } catch (error) {
//     res.status(401).send({
//       message: "Auth failed",
//       success: false,
//     });
//   }
// };
