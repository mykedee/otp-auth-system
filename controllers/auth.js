const User = require('../models/User')
const { sendEmail } = require('../helper/mailers')
const crypto = require('crypto')
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(404).json({
        success: false,
        message: 'Email and Password is required'
      })
    }

    const user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Email is taken'
      })
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    const emailToken = crypto.createHash('sha256').update(code).digest('hex')
    const emailTokenExpires = Date.now() + 15 * 60 * 1000;
    const message = `This is your emai ${code}. It expires in 15 minutes`
    await sendEmail({ email, subject: 'Email verification', message })
    const newUser = await User.create({ email, password, code, emailToken, emailTokenExpires })
    res.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    })

  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }
}


exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Enter email and password'
      })
    }
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      })
    }
    if (!user.active) {
      return res.status(400).json({
        success: false,
        message: 'You must verify your email to activate your account'
      })
    }
    res.status(200).json({
      success: true,
      user
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
}



exports.activateUser = async (req, res) => {
  try {
    let { email, code } = req.body
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email and otp'
      })
    }
    const emailToken = crypto.createHash('sha256').update(code).digest('hex')
    const user = await User.findOne({
      email, emailToken,
      emailTokenExpires: { $gt: Date.now() }
    })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Cred'
      })

    } else {
      if (user.active)
        return res.status(400).json({
          success: false,
          message: 'Account already activated'
        })
    }

    user.emailToken = undefined;
    user.emailTokenExpires = undefined;
    user.active = true;
    await user.save({ validateBeforeSave: false })

    res.status(200).json({
      success: true,
      message: 'Account Activated'
    })

  } catch (err) {
    res.status(400).json({
      success: false,
      err: err.message
    })
  }
}



exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({
        message: "Please enter an email"
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({
        message: "This email does not exist in our database"
      })
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const hash = crypto.createHash('sha256').update(otp).digest('hex')

    const message = `Your are getting an otp ${otp}`

    await sendEmail({ email: user.email, subject: 'Password Reset', message })

    //email expires 15 minutes after
    let emailExpiry = Date.now() + 60 * 1000 * 15;
    user.resetPasswordOtp = hash;
    user.resetPasswordOtpExpires = emailExpiry;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Please check your email for otp code"
    })

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
}


exports.resetPassword = async (req, res, next) => {
  try {
    const { code, newPassword, confirmPassword } = req.body

    if (!code || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      })
    }
    let resetPasswordOtp = crypto.createHash('sha256').update(code).digest('hex')

    const user = await User.findOne({
      resetPasswordOtp,
      resetPasswordOtpExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        message: "Password reset token is invalid or expired"
      })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Password does not match. Please check and try again"
      })
    }

    user.password = req.body.newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully."
    })

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
}
