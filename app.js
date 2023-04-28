const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const fs=require("fs");

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Create Express app
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port=process.env.port ||2000;
// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const static_path=path.join(__dirname,"../","public");

app.use(express.static(static_path));



const secret = speakeasy.generateSecret();
console.log("secret is", secret);
const secretBase32 = secret.base32;
console.log("secretbase32 is" , secretBase32)
const otpauthURL = speakeasy.otpauthURL({
  secret: secret.ascii,
  label: 'MyApp',
  issuer: 'MyApp'
});

// console.log("otpauthUrl is" , otpauthURL)
qrcode.toDataURL(otpauthURL, (err, data_url) => {
    if (err) {
      console.error('Failed to generate QR code:', err);
    } else {
      app.locals.qrcode = data_url;
     
    }
  });

  app.get('/qrcode', (req, res) => {
    res.render('qrcode',{ otpauthUrl:otpauthURL });
  });
  


  

  app.post('/verify-otp', (req, res) => {
    const otp = req.body.otp;
    const verified = speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token: otp
    });
  
    if (verified) {
      res.send('2FA verified successfully!');
    } else {
      res.send('Invalid OTP code');
    }
  });












  
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });