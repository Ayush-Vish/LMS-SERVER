import nodemailer from 'nodemailer'

const sendEmail = async function (email, subject, message ) {
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth : {
            user:process.env.USER_EMAIL,
            pass:process.env.USER_PASSWORD
        } 
    })
    const mailOptions =  {
        from:process.env.USER_EMAIL,
        to:email,
        subject:subject,
        text:message
    }
    transporter.sendMail(mailOptions , (error ,info) => {
        if(error) {
            console.log("error Occured" , error.message)
        }
        else {
            console.log("Email send Successfully" , info.response)
        }
    })
}
export default sendEmail