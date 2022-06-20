require('dotenv').config()

const express = require('express')
const fileupload = require('express-fileupload')
const cors = require('cors')
const app = express()

const photo = require('./routes/photo')

const PORT = process.env.PORT || 3000
const DOMAIN = process.env.DOMAIN || "http://localhost"


app.listen(PORT, () => {
  console.log(`Backend running at ${DOMAIN}:${PORT}`)
})

app.use(cors())
app.use(fileupload());


app.get("/", (request, response) => {
  response
    .status(200)
    .send(`Connected to the backend at ${DOMAIN}:${PORT}`)
})


app.use("/photo", photo)