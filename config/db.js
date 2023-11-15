import mongoose from 'mongoose'
// ensures that values passed to our model constructor that
// were not specified in our schema do not get saved to the db
mongoose.set('strictQuery' , false) 
const connectToDB = async ()=>{
    await mongoose.connect(process.env.MONGO_URI)
        .then((conn) =>{
            console.log("Connected to Database:" + conn.connection.host)

        })
        .catch((err)=>{
            console.log("Error" + err)
            process.exit(1);
        })
}
export default connectToDB