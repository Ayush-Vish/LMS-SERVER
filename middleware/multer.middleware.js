import path from 'path'
import multer from 'multer'
const upload  = multer({
    limits:{fileSize : 1024* 1024 *5000},
    storage:multer.diskStorage({}),
    fileFilter: (_req , file , cb ) => {
        console.log("dkasbkjasbfjasflnas")
        let ext =   path.extname (file.originalname)
        if(
            ext !== '.jpg' &&
            ext !== '.jpeg' &&
            ext !== '.wepg' &&
            ext !== '.png' &&
            ext !== '.mp4'
            
            ) {
                cb(new Error(`Unsupported File Format ${ext}` )  ,false)
                return 
            }
            console.log("dkasbkjasbfjasflnas")
        cb(null , true)
    },
})


export default upload