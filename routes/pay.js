const router = require("express").Router();
// require ("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY);
// const KEY = "sk_test_51KrNPtIP6rY7ZI59GrhSxAGOHDkbt2OnVKWM7QSJO5yfUawWFDXlF39cUorWz3dOmGHaHvSx7Xwb3qaeLsobvcov00n8JGO7JX";
// const stripe = require("stripe")(KEY);

router.post("/payment", (req, res) => {
  stripe.charges.create(
    {
      source: req.body.tokenId,
      amount: req.body.amount,
      currency: "NPR",
    },
    (stripeErr, stripeRes) => {
      if (stripeErr) {
        res.status(500).json(stripeErr);
      } else {
        res.status(200).json(stripeRes);
      }
    }
  );
});

module.exports = router;