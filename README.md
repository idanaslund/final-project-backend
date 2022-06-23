# Final Project – Backend 🥘

This the result of our final project for Technigo web Bootcamp, spring 2022. This was created as a group project and we have worked a lot with mob programming and git branches.

Our idea was to create a web app for the user to find fine dining restaurants in Stockholm. The goal and value for the user is to find something that matches pre-specified requirements, such as family friendly, price or portion size. The user can login, edit their profile information, filter restaurants using various checkboxes, read more about the restaurants and write reviews.

Here is our backend made with Node.js, Express, MongoDB among other tools.

## Our Endpoints

- Accessible for everyone:
  To get a list of all endpoints (method: get) -----> '/'

- For users that are logged in:
  To get a list of all the restaurants (method: get) -----> '/restaurants'
  To get one specific restaurant (method: get) -----> '/restaurants/:id'
  To reach the user profile: (method: get) -----> '/profile/:id'
  To update user data: (method: patch) -----> '/profile/:id'
  To sign up an account: (method: post) -----> '/signup'
  To login: (method: post) -----> '/login'
  Give reviews: (method: post) -----> '/reviews'
  To see a list of all restaurant reviews: (method: get) '/reviews'

## View it live

https://restaurants-backend-database.herokuapp.com/

Repo for frontend: https://github.com/idanaslund/final-project-frontend

// Joanna Lodell, Emma Lindell, Ida Näslund
