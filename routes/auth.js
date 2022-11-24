const express = require('express')
const { signup, signin, activateUser, forgotPassword, resetPassword } = require('../controllers/auth')
const router = express.Router()

router.post('/signup', signup)
router.post('/signin', signin)
router.patch('/user/activate', activateUser)
router.post('/forgot', forgotPassword)
router.post('/reset', resetPassword)

module.exports = router