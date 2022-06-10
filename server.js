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
const RestaurantSchema = new mongoose.Schema({
        id: String,
        name: String,
        image_URL: String,
        description: String,
        address: String,
        opening_hours_mon: String,
        opening_hours_tue: String,
        opening_hours_thur: String,
        opening_hours_wed: String,
        opening_hours_fri: String,
        opening_hours_sat: String,
        opening_hours_sun: String,
        meals: Array,
        budget: Array,
        type_of_food: Array,
        dogfriendly: Boolean,
        portion_size: Array,
        target_audience: Array,
        outdoor_area: Boolean,
        restaurant_focus: Array,
        website: String
})

const Restaurant = mongoose.model('Restaurant', RestaurantSchema)




// User model with validation rules: username, password and default accessToken with crypto library

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    minlength: 3,
    maxlength: 20,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => {
        return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value)
      }
    }
  },
  password: {
    type: String,
    minlength: 8,
    required: true
  },
  profileImage: {
    name: String,
    imageURL: String
  },
  fullName: {
    type: String,
    unique: false
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  },
})

const User = mongoose.model('User', UserSchema)


const ReviewSchema = new mongoose.Schema({
  review: {
    type: String,
    minlength: 5,
    maxlength: 140,
    required: true,
    trim: true
  },
  like: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // author: {    /// Hur hämtar vi användarnamn automatiskt i inloggat läge?
  //   type: String,
  //   maxLength: 20,
  //   required: true,
  //   trim: true
  // },
  createdAt: {
    type: Date,
    default: () => new Date()
  },
})

const Review = mongoose.model('Review', ReviewSchema)

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
      accessToken: req.header('Authorization')})
    if (user) {
      req.user = user
      next()
    } else {
      res.status(401).json({ response: 'Please, log in', success: false })
    }
  } catch (error) {
    res.status(400).json({ response: 'Invalid request', error })
  }
}


//---------------------------STARTPAGE---------------------------//
app.get("/", (req, res) => {
  res.send(listEndpoints(app))
})


//-------------------------GET ALL RESTAURANTS-------------------------//
// app.get('/restaurants', authenticateUser)
app.get('/restaurants', (req, res) => {

  try{
    res.status(200).json({
      response: restaurants,         
      success: true
    })
  } catch (error) {
    res.status(400).json({ 
      response: error, 
      success: false })
  }
 
})
//----------------------GET A SPECIFIC RESTAURANT--------------------//

// endpoint for name
app.get('/restaurants/name/:name', async (req, res) => {
  const { name } = req.params

  try{
    const restaurantName = await Restaurant.findOne({ name: name })
    if(restaurantName){
      res.status(200).json({
        response: restaurantName,     
        success: true
      })
    } else {
      res.status(404).json({ 
        response: 'No data found',
        success: false  
      })
    }    
  } catch (error) {
    res.status(400).json({ 
      response: error, 
      success: false })
  }
})

// app.get('/restaurants/id/:id', authenticateUser)
app.get('/restaurants/:id', async (req, res) => {
  const { id } = req.params

  try{
    const restaurant = await Restaurant.findOne({ id: id })
    if(restaurant){
      res.status(200).json({
        response: restaurant,     
        success: true
      })
    } else {
      res.status(404).json({ 
        response: 'No data found',
        success: false  
      })
    }    
  } catch (error) {
    res.status(400).json({ 
      response: error, 
      success: false })
  }
})


//---------------------------PROFILE PROTECTED ENDPOINT---------------------------//
app.get('/profile/:id', authenticateUser)
app.get('/profile/:id', async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findById(id)
    if (user) {
      res.status(201).json({ 
        email: user.email, 
        fullName: user.fullName, 
        profileImage: user.profileImage, 
        password: user.password })
    } else {
      res.status(404).json({ 
      message: 'Could not find profile information',
      success: false  })
    }
  } catch (error) {
    res.status(400).json({ 
      message: error, 
      success: false})
  }

})

//--------------------------- PROFILE SETTINGS ENDPOINT---------------------------//
app.patch('/profile/:id', authenticateUser)
app.patch('/profile/:id', async (req, res) => {
  const { id } = req.params

  try {
    const updateUser = await User.findByIdAndUpdate(id, req.body, { new: true})

    if (updateUser) {
      res.status(201).json({ success: true, updateUser })
    } else {
      res.status(404).json({ success: false, message: 'Not found' })
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid request', error})
  }
})

//---------------------------SIGN UP ENDPOINT---------------------------//
app.post('/signup', async (req, res) => {
  const { username, password, email } = req.body

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
          email,
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
            // message: error,
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
      if (username === '') {                                //// Ska vi ha message, response, success? Eller ska response vara objektet som i de andra?
        res.status(404).json({
          message: 'Login failed: fill in username',
          response: error,
          success: false,
        })
      } else if (password === '') {
        res.status(404).json({
          message: 'Login failed: fill in password',
          response: error,
          success: false,
        })
      } else {
        res.status(404).json({
          message: 'Login failed: wrong username or password',
          response: error,
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


//------- POST REVIEW -------//
app.post('/reviews', authenticateUser, async (req, res) => {
  const { _id } = req.user
  const { review } = req.body

  try {
    const newReview = await new Review({
      review: review,
      userId: _id
    }).save()

    if(newReview){
      res.status(201).json({ 
        response: {
          _id: newReview._id,
          review: newReview.review,
          like: newReview.like,
          user: newReview.user,
          createdAt: newReview.createdAt
        },  
        success: true 
      })
    }else {
      res.status(404).json({ 
        response: 'Could not post review',
        success: false  
      })
    }
    
  } catch (error) {
    res.status(400).json({ 
      response: error, 
      success: false 
    })
  }
})


///--------DELETE REVIEWS----------///
app.delete('/reviews/:id', authenticateUser, async (req, res) => {
  const { id } = req.params
  
  try {
    const deleted = await Review.findOneAndDelete({_id: id})
    if (deleted) {
      res.status(200).json({
        response: deleted, 
        success: true})
    } else {
      res.status(404).json({
        response: 'Not found', 
        success: false})
    }
  } catch (error) {
    res.status(400).json({
      response: error, 
      success: false})
  }
})


///------LIST OF REVIEWS----------------///
app.get('/reviews', authenticateUser, async (req,res) => {
  // const {page, perPage} = req.query

  try {
    const allReviews = await Review.find({}).sort({createdAt: 'desc'}).limit(20)
    if (allReviews) {
    res.status(200).json(allReviews)
    } else {
    res.status(404).json({
      response: error, 
      success: false})
    }
  } catch (error) {
    res.status(400).json({
      response: error, 
      success: false})
  }
})


///------- LIKES----------///
app.post('/reviews/:id/like', authenticateUser, async (req, res) => {
  const { id } = req.params
  try {
    const updateLike = await Review.findByIdAndUpdate(id, {$inc: {like: 1}})
    if (updateLike) {
      res.status(200).json({
        response: 'You have liked this review', 
        success: true})
    } else {
      res.status(404).json({
        response: error, 
        success: false})
    }
  } catch (error) {
    res.status(400).json({
      response: error, 
      success: false})
  }
})


//-------------------------START SERVER-------------------------//
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
