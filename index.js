require('dotenv').config()
const express = require('express');
require('./events.js');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const server = express();
const app = require('http').createServer(server);
const io = require('socket.io')(app);
const path = require('path');
const productRouter = require('./routes/product')
const userRouter = require('./routes/user')
const jwt = require('jsonwebtoken');
const authRouter = require('./routes/auth')
const fs = require('fs');
const errorHandler = require("./middleware/errorHandler");

const publicKey = fs.readFileSync(path.resolve(__dirname,'./public.key'),'utf-8')

//db connection
main().catch(err => console.log(err));

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_SERVER_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Database connected');
    // Continue with your code here
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
}
//Schema








//bodyParser
const auth = (req,res,next)=>{
  
  try{
    const token = req.get('Authorization').split('Bearer ')[1];
    console.log(token);
    var decoded = jwt.verify(token,publicKey );
    if(decoded.email){
      next()
    }else{
      res.sendStatus(401)
    }
  }catch(err){
    res.sendStatus(401)
  }
  console.log(decoded)
  

};
io.on('connection', (socket) => { 
  console.log('socket',socket.id)

  socket.on('msg',(data)=>{
    console.log({data})
  })
  setTimeout(()=>{
    socket.emit('serverMsg',{server:'hi'})
  },4000)
});

server.use(cors());
server.use(express.json());
server.use(express.urlencoded());
server.use(morgan('default'));
server.use(express.static(path.resolve(__dirname,process.env.PUBLIC_DIR)));
server.use('/auth',authRouter.router)
server.use('/products',productRouter.router);
server.use('/users',auth,userRouter.router);
app.use(errorHandler);

server.use('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'build','index.html'))
})


app.listen(process.env.PORT, () => {
  console.log('server started');
});
