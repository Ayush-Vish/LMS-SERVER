import app from './app.js'
import cloudinary from 'cloudinary'
const PORT = process.env.PORT || 5001
const HOSTNAME=process.env.HOSTNAME
cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET  
})
app.listen(PORT , () =>{
    console.log(`Server is listening on https://localhost:${PORT} `)
})