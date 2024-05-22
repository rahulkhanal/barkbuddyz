
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user.js");
const authRoute = require("./routes/auth.js");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const wishlistRoute = require("./routes/wishlist");
const payRoute = require("./routes/pay");

const cors = require("cors");

dotenv.config();
mongoose.set('strictQuery', true)
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Successfully connected to the BarkBuddyz Database!"))
    .catch((err) => {
        console.log(err);
    });

app.use(cors({
    origin: "*"
}));
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute); 
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/checkout", payRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Backend server is running", PORT);
});

// app.get("/api/test", () => {
//     console.log("test is successful");
// });

app.get('/', (req, res) => {
    res.send("Welcome to the server side")
})
