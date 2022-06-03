import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import listEndpoints from 'express-list-endpoints'
import crypto from 'crypto'
import bcrypt from 'bcrypt-nodejs'

import restaurants from "./data/restaurants.json"


const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise


// User model with validation rules: username, password and default accessToken with crypto library

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex'),
  },
})

const User = mongoose.model('User', UserSchema)


// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())


//----------------------IF ENABLED TO REACH DATABASE---------------------//
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: 'Service unavailable' })
  }
}) 

//-----LOOKS UP THE USER BASED ON ACCESSTOKEN STORED IN HEADER, THEN CALLING NEXT-----//
const authenticateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      accessToken: req.header('Authorization'),
    })
    if (user) {
      next()
    } else {
      res.status(401).json({
        message: 'Please, log in',
        response: 'Please, log in',
        success: false,
      })
    }
  } catch (error) {
    res.status(400).json({
      message: 'Error, could not authenticate user',
      response: error,
      success: false,
    })
  }
}


//---------------------------STARTPAGE---------------------------//
app.get("/", (req, res) => {
  res.send(listEndpoints(app))
})


//-------------------------GET ALL RESTAURANTS-------------------------//
app.get('/restaurants', (req, res) => {
  res.status(200).json({
    data: restaurants,
    success: true
  })
})


//---------------------------PROFILE PROTECTED ENDPOINT---------------------------//
// app.get('/endpointListedHere', authenticateUser)
// app.get('/endpointListedHere', (req, res) => {
//     res.status(200).json({
//       response: {
//           whateverWeLikeToShow: 'Here',
//       },
//       success: true
//   })
// })

//---------------------------SIGN UP ENDPOINT---------------------------//
app.post('/signup', async (req, res) => {
  const { username, password } = req.body

  try {
    // salt -> randomizer
    const salt = bcrypt.genSaltSync()

    if (password.length < 8) {
      res.status(400).json({
        response: "Your password must be at leat 8 characters long",
        success: false
      }) 

      } else {
        const newUser = await new User({
          username,
          password: bcrypt.hashSync(password, salt),
        }).save()
        res.status(201).json({
          response: {
            userId: newUser._id,
            username: newUser.username,
            accessToken: newUser.accessToken
          },
          success: true,
        })
      }
      } catch (error) {
        res.status(400).json({
            message: 'Validation failed: provide username',
            response: error,
            success: false
        })
      }
})


//---------------------------LOGIN ENDPOINT---------------------------//
app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })

    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({
        response: {
          userId: user._id,
          username: user.username,
          accessToken: user.accessToken,
        },
        success: true,
      })
    } else {
      if (username === '') {
        res.status(404).json({
          message: 'Login failed: fill in username',
          response: 'Login failed: fill in username',
          success: false,
        })
      } else if (password === '') {
        res.status(404).json({
          message: 'Login failed: fill in password',
          response: 'Login failed: fill in password',
          success: false,
        })
      } else {
        res.status(404).json({
          message: 'Login failed: wrong username or password',
          response: 'Login failed: wrong username or password',
          success: false,
        })
      }
    }
  } catch (error) {
    res.status(400).json({
      message: 'Invalid entry',
      response: error,
      success: false,
    })
  }
})


//-------------------------START SERVER-------------------------//
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
