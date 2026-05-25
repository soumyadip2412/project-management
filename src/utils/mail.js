import Mailgen from "mailgen";
import nodemailer from "nodemailer"


const sendEmail = async (options) =>{
    const mailgenerator=new Mailgen({
        theme: "default",
        product:{
            name: "Task Manager",
            link: "https://taskmanagerlink.com"
        }
    })
    const emailText = mailgenerator.generatePlaintext(options.mailgenContent)// mailgen jo hai woh ek module hi hai jo ki nodemailer jaise import karna padega that's in the package.json file 
    
    const emailHtml = mailgenerator.generate(options.mailgenContent)

    const transporter =nodemailer.createTransport({
        host: process.env.MAIL_TRAP_HOST,
        port: process.env.MAIL_TRAP_PORT,
        auth:{
            user:process.env.MAIL_TRAP_USER,
            pass:process.env.MAIL_TRAP_PASS 
        }
    })
    const mail = {
            from: "Mailtestingbbn@example.com",
            to:options.email,
            subject:options.subject,
            text: emailText,
            html: emailHtml
        }
    try {
        await transporter.sendMail(mail)

    } catch (error) {
        console.error("Email service failed silently.Make sure that you have provided your MAILTRAP credentials in the .env file")
        console.error("ERROR:",error)
    } 
}

const emailVerificationMailgenContent= (username,verificationURL) => {
    return {
        body:{
        name: username,
        intro: "Welcome to our application. We are excited to have you on Board.",
        action:{
            instructions: "To verify your email please click on the following button.",
            button:{
            color: "#2da050",
            text: "Verify your email",
            link: verificationURL
            },
        },
        outro: "Need help, or have questions? Just reply to this email, we'd love to help you. "
    }
}
}



const forgotPasswordMailgenContent= (username,passwordURL) => {
    return {
        body:{
        name: username,
        intro: "We got a request to reset the password of your account.",
        action:{
            instructions: "To reset yout password,please click on the following button.",
            button:{
            color: "#ac2420",
            text: "Verify your email",
            link: passwordURL
            },
        },
        outro: "Need help, or have questions? Just reply to this email, we'd love to help you. "
    }
}
}

export { emailVerificationMailgenContent,forgotPasswordMailgenContent,sendEmail } 
