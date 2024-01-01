//jshint esversion:6
import 'dotenv/config'
import express from 'express'
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser"
import pg from "pg";
import bcrypt from "bcrypt"
import crypto from "crypto"
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const port=3000;
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "USERA",
    password: "Sahil1234,",
    port: 5432,
  });
  db.connect();

const algorithm = 'aes-256-cbc';

// Function to encrypt data
function encrypt(data) {
  const cipher = crypto.createCipher(algorithm, process.env.SECRET);
  let encrypted = cipher.update(data, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Function to decrypt data
function decrypt(encryptedData) {
  const decipher = crypto.createDecipher(algorithm, process.env.SECRET);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

// Example usage
;
app.listen(port,()=>{
    console.log(`The Port ${port} is listening`)
})
app.get("/",(req,res)=>{
    res.render("home.ejs")
})
app.get("/login",(req,res)=>{
    res.render("login.ejs")
})

app.post("/login",async(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    const myPlaintextPassword=password;
    try {
        let user = await db.query('SELECT * FROM udetails WHERE username = $1', [username]);
        user = user.rows[0];
    
        if (user) {
          const hash = user.password;
          const dd=decrypt(hash);
          if(dd==myPlaintextPassword){
            res.render("secrets.ejs");
          }else{
            console.log("incorrect password")
          }
          // Compare hashed passwords
        
      
        } else {
          console.log('Failure: User not found');
          res.send('Failure: User not found');
        }
      } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
      }
})
app.get("/register",(req,res)=>{
    res.render("register.ejs")
})
app.post("/register",async(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    const myPlaintextPassword=password;
    const hp=encrypt(myPlaintextPassword);
    await db.query("INSERT INTO udetails(username, password) VALUES ($1, $2)", [
      username,
      hp  // Use the actual user-provided password here
    ]);
    res.redirect("/");
   
   
})