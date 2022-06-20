import React, { useState } from 'react';
import './App.css';

const BASE_URL = process.env.REACT_APP_BASE_URL
                      || "http://localhost"
const BACKEND_PORT     = process.env.REACT_APP_BACKEND_PORT
                      || 3000
const BACKEND_ENDPOINT = process.env.REACT_APP_BACKEND_ENDPOINT
                      || "/photo"

const App = () => {
  const [ userName, setUserName ] = useState("")

  const [ fileList, setFileList ] = useState([])
  const [ imageUrls, setImageUrls ] = useState([])

  // console.log("fileList:", fileList);
  // console.log("imageUrls:", imageUrls);


  const uploadEndpoint =
    `${BASE_URL}:${BACKEND_PORT}${BACKEND_ENDPOINT}`


  const set_user_name = (event) => {
    setUserName(event.target.value)
  }

  const setFile = event => {
    setFileList(event.target.files)
  }


  const scaledSize = (number) => {
    if (number < 1024) {
      return number + " bytes"
    } else if (number < 1048576) {
      return Math.round(number / 1024) + " KB"
    } else {
      return Math.round(number / 1048576) + " MB"
    }
  }


  const getUploadPreview = () => {
    if (fileList.length === 0) {
      return <p>No files currently selected for upload</p>
    }

    const fileArray = Object.values(fileList)

    const imageList = fileArray.map( file => (
      <li
        key={file.name}
      >
        <figure>
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
          />
          <figcaption>
            Local File Name: {file.name} | File Size: {scaledSize(file.size)}
          </figcaption>
        </figure>
      </li>
    ))

    return <div id="to-upload">
      <h3>Images to be uploaded</h3>
      <ul>{imageList}</ul>
    </div>
  }


  const uploadFile = (event) => {
    event.preventDefault()

    const formData = new FormData()
    const fileArray = Object.values(fileList)
    fileArray.forEach(( fileData, index ) => {
      const key = userName + (
        index ? "_"+index : ""
      )
      formData.append(key, fileData)
    })

    // // console.log("image", formData.getAll("image"))


    const fetchOptions = {
      method: 'POST',
      body: formData
    }

    fetch(uploadEndpoint, fetchOptions)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setImageUrls(data.images)
      })
      .catch(error => {
        console.error(error)
      })
  }


  const getUploadedPreview = () => {
    if (imageUrls.length === 0) {
      return <p>No files uploaded yet</p>
    }

    const imageEntries = Object.entries(imageUrls)

    const imageList = imageEntries.map( imageEntry => {
      const [ key, path ] = imageEntry
      return (
        <li
          key={key}
        >
          <figure>
            <img
              src={path}
              alt={key}
            />
            <figcaption>
              Image key: {key} | Image URL: {path}
            </figcaption>
          </figure>
        </li>
      )
    })

    return <div id="uploaded">
      <h3>Uploaded images</h3>
      <ul>{imageList}</ul>
    </div>
  }


  return (
    <form>
    <label htmlFor="username">
      <span>User name:</span>
      <input
        type="text"
        name="username"
        id="username"
        onChange={set_user_name}
        />
      </label>

      <label htmlFor="upload">
        <span>Choose a picture:</span>
        <input
          type="file"
          name="upload"
          id="upload"
          accept="image/png, image/jpeg"
          multiple={true}
          onChange={setFile}
          />
      </label>
      {getUploadPreview()}
      <input
        type="button"
        disabled={!fileList.length || !userName}
        onClick={uploadFile}
        value="Upload"
      />
      {getUploadedPreview()}
    </form>
  );
}

export default App;

