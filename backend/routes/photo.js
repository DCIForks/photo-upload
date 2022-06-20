/**
 * photo.js
 *
 * Provides a router object with POST and GET methods for saving
 * uploaded files and for retrieving them after they have been
 * saved.
 *
 * Inspiration from
 * https://flaviocopes.com/how-to-handle-file-uploads-node/
 */


// path is used to resolve relative paths to absolute paths,
// and to determine which file extension is used by each image.
const path = require('path')

const { Router } = require('express');
const router = Router()

// Define access to this script and to the saved images
const PORT        = process.env.PORT || 3000
const DOMAIN      = process.env.DOMAIN || "http://localhost"
const SAVED_AT    = process.env.SAVED_AT || "backend/images"
const END_POINT   = process.env.END_POINT || "/photo/"
const CLIENT_PATH = `${DOMAIN}:${PORT}${END_POINT}`


/**
 *
 */
router.post("/", (request, response) => {
  // console.log("request.files:", request.files);
  // { <user_id>: {<imageData>}, ... }
  const imagesEntries = Object.entries(request.files)

  const images = {}
  const fileMovePromises = []

  // Create an array of Promises, one for each file to be saved
  imagesEntries.forEach( imageEntry  => {
    const [ id, imageData ] = imageEntry
    // console.log("imageEntry:", imageEntry);
    // [ <string user_id>,
    //   { data: <Buffer>,
    //     encoding: '7bit',
    //     md5: '33b89440ecef82c5e01c5428be11ddc4',
    //     mimetype: 'image/png',
    //     mv: (filePath, callback) => {...},
    //     name: 'button.png',
    //     size: <Integer byte count>,
    //     tempFilePath: '',
    //     truncated: false
    //   }
    // ]

    // Calculate the name for saving the image locally. Several
    // users may choose images with the same name, but their
    // personal user_id will be unique.
    let { name } = imageData             // "image.png"
    const extension = path.extname(name) // ".png"
    name = id + extension                // "user_id.png"

    // Prepare to return a link for retrieving the image via the
    // GET method below
    const clientPath = CLIENT_PATH + name
    images[id] = clientPath

    // Use the `mv` function created by 'express-fileupload' in
    // the imageData object to save the image in the chosen
    // folder. The output is a Promise.
    const filePath = path.resolve(SAVED_AT, name)
    const fileMovePromise = imageData.mv(filePath)
    fileMovePromises.push(fileMovePromise)
  })

  // Prepare to handle resolution of the Promises
  let status
  let result

  const treatSuccess = () => {
    status = 200
    result = {
      status: 'success',
      images
    }
  }

  const treatError = error => {
    status = 500
    result = {
      status: 'error',
      error
    }
  }

  const sendResponse = () => {
    response.writeHead(
      status,
      {
      'Content-Type': 'application/json'
    })

    return response.end(JSON.stringify(result))
  }

  // Wait for all Promises to resolve, then respond as appropriate
  Promise.all(fileMovePromises)
  .then(treatSuccess)
  .catch(treatError)
  .finally(sendResponse)
})


router.get("/:name", (request, response) => {
  const { name } = request.params
  // console.log("name:", name);
  const filePath = path.resolve(SAVED_AT, name)

  // Use Express's built-in sendFile method
  response.sendFile(filePath)
})


module.exports = router
