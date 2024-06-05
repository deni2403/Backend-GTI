require('dotenv').config()
const express = require('express')
const router = require('./routers/route.js')
const cors = require('cors')

const port = process.env.PORT

const app = express()
app.use(cors())
app.use(express.json())
app.use(router)
app.use('/uploads',express.static('uploads'));

app.listen(port,()=>{
    console.log(`server connected on http://localhost:${port}`);
})
