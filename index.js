const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./authRouter')

const PORT = process.env.PORT || 5600

const app = express()

app.use(express.json())
app.use('/auth', authRouter)

const start = async () => {
    try {
        await mongoose.connect(`mongodb+srv://admin:root@cluster0.alttu.mongodb.net/auth_jwt?retryWrites=true&w=majority`)
        app.listen(PORT, () => console.log('Server started on port ' +PORT))
    } catch (e) {
        console.log(e)
    }
}

start()
