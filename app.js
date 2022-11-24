const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const authRoutes = require('./routes/auth')
dotenv.config()


const app = express()


app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
app.use('/api/v1', authRoutes)


mongoose.connect(process.env.MONGO_URI, {

}).then(() => {
 console.log('db connected')

}).catch((err) => {
 console.log(err);
})

const PORT = process.env.PORT || 4590

app.listen(PORT, console.log(`app conneted to ${PORT}`))
