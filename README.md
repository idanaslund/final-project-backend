# Final Project – Backend 🥘

Our idea is to create a web app for users to find fine dining restaurants in Stockholm. Here is our backend made with Node.js, Express, MongoDB among other tools.

## Our Endpoints

- Accessible for everyone:
  To get a list of all endpoints (method: get) -----> '/'
  To get a list of all the restaurants (method: get) -----> '/restaurants'

- For users that are logged in:
  To reach the user profile: (method: get) -----> '/profile/:id
  To sign up an account: (method: post) -----> '/signup'
  To login: (method: post) -----> '/login'
  Give review on a specific restaurant: (method: post) -----> '/review/:id'
  For user to delete their own specific review: (method: delete) -----> '/reviews/:id'
  To see a list of all restaurant reviews: (method: get) '/reviews'
  To be able to like a specific review: (method: post) -----> '/reviews/:id/like'

## View it live

https://restaurants-backend-database.herokuapp.com/
