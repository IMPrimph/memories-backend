import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import postRoutes from './routes/posts.js';
import userRoutes from './routes/user.js';
import dotenv from 'dotenv'

dotenv.config()

const app = express();

app.use(bodyParser.json({
    limit: "30mb",
    extended: true
}))
app.use(bodyParser.urlencoded({
    limit: "30mb",
    extended: true
}))
app.use(cors())

app.use('/', (req, res) => {
    res.send("Hello to memories app")
});
app.use("/posts", postRoutes);
app.use("/user", userRoutes);

const DB_CONNECTION_URL = process.env.DB_CONNECTION_URL;
const PORT = process.env.PORT || 5005;

mongoose.connect(DB_CONNECTION_URL).then(() => {
    app.listen(PORT, () => {
        console.log(`Server started running on PORT: ${PORT}`)
    })
}).catch((err) => {
    console.log(err.message)
})
