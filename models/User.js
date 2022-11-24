const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
// const crypto = require('crypto')

const userSchema = new mongoose.Schema({
 email: {
  type: String,
  unique: true,
  required: true
 },
 password: {
  type: String,
  required: true,
  select: false
 },
 active: {
  type: Boolean,
  default: false
 },
 resetPasswordOtp: {
  type: String,
 },
 resetPasswordOtpExpires: {
  type: Date,
 },
 emailToken: {
  type: String,
 },
 emailTokenExpires: {
  type: Date,
 }
},
 {
  timestamps: {
   createdAt: "createdAt",
   updatedAt: "updatedAt",
  },
 })

userSchema.pre('save', async function (next) {
 if (!this.isModified('password')) {
  next()
 }
 const salt = await bcrypt.genSalt(10)
 this.password = await bcrypt.hash(this.password, salt)
})


// userSchema.methods.sendEmailToken = function () {
//  const code = Math.floor(1000 + Math.random() * 9000).toString()
//  this.emailToken = crypto.createHash('sha256').update(code).digest('hex')
//  this.emailTokenExpires = Date.now() + 15 * 60 * 1000;
//  return code;
// }



userSchema.methods.comparePassword = async function (enteredPassword) {
 return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)

