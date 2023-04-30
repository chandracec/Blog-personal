const express = require('express');
const mongoose = require('mongoose');
const route = require('./routes/route');
const app = express();

app.use(express.json());

mongoose.connect(
  "mongodb+srv://prajwalgaulkar78717:bXvJ3nSxWJSUIcpZ@cluster0.vdcbqqv.mongodb.net/group5Database",
  {
    useNewUrlParser: true,
  }
)
.then(()=>console.log("mongoDB is connected"))
.catch(err=>console.log(err))

app.use('/',route);
let port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is listing on port : ${port}`)
})
