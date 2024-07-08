const express = require('express')
const router = require('./router')
const app = express();
app.use(express.json())
app.use('/v1',router)

app.listen(8000,()=>{
    console.log("server run on port:-8000")
})