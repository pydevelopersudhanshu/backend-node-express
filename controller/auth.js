const jwt = require('jsonwebtoken');
const model = require('../model/user');
const User = model.User;
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const privateKey = fs.readFileSync(
  path.resolve(__dirname, '../private.key'),
  'utf-8'
);

exports.signUp = (req, res) => {
  console.log('req.body', req.body);
  const user = new User(req.body);
  console.log('user', user);
  let token = jwt.sign({ email: req.body.email }, privateKey, {
    algorithm: 'RS256',
  });
  const hash = bcrypt.hashSync(req.body.password, 10);
  user.token = token;
  user.password = hash;
  user.save((err, doc) => {
    console.log({ err, doc });
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(201).json({ token });
    }
  });
};

exports.login = async (req, res) => {
  try {
    const doc = await User.findOne({ email: req.body.email });
    const isAuth = bcrypt.compareSync(req.body.password, doc.password);
    if (isAuth) {
      let token = jwt.sign({ email: req.body.email }, privateKey, {
        algorithm: 'RS256',
      });
      doc.token = token;
      doc.save(() => {
        res.json({ token, })
      })

    } else {
      res.sendStatus(401);

    }
  } catch (err) {
    res.status(401).json(err);
  }
};

function sendPasswordResetEmail(email, token) {
  // Replace this with your actual email sending logic using Nodemailer
  console.log(`Sending password reset email to ${email} with token: ${token}`);
}

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.find((user) => user.email === email).exec();
  
    console.log('userrrrrrrrrrrrrr', user);
    if (!user) {
      return res.status(404).send('User not found');
    }
    const token = uuid.v4(); // Generate unique token
    console.log(token , 'ttttt');
    user.resetToken = token; // Store token in user object (in real scenario, this would be stored in the database)
    // Send password reset email
    await sendPasswordResetEmail(email, token);
    res.send({message:'Password reset instructions sent to your email'});
  } 
  catch (error) {
    res.status(401).json(error);
    
  }
};

exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = users.find(user => user.email === email && user.resetToken === token).e;
  if (!user) {
    return res.status(400).send('Invalid token');
  }

  // Update password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  user.password = hashedPassword;
  delete user.resetToken; // Remove reset token from user object
  res.send('Password reset successfully');
};

