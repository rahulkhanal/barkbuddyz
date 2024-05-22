const router = require("express").Router();
const Product = require("../models/Product");
const { verifyTokenAndAdmin } = require("./verifyToken");

//CREATE PRODUCT

router.post("/", async (req, res) => {
  console.log(req.body);
  const newProduct = new Product(req.body);

  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  }
  catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE PRODUCT

router.patch("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE PRODUCT

router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  }
  catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT

router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  }
  catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL PRODUCTS

router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
    } else {
      products = await Product.find();
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const type = req.query.type;
  const Category = req.query.category;
  const InStock = req.query.inStock;

  try {
    let products;
    if (type) {
      products = await Product.find({
        type: {
          $in: type,
        },
      });
    }
    else if (Category) {
      products = await Product.find({
        category: {
          $in: Category,
        },
      });
    }
    else if (InStock) {
      products = await Product.find({
        inStock: {
          $in: InStock,
        },
      });
    }
    else {
      products = await Product.find().sort({ createdAt: 1 });
    }
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});


//SEARCH
router.get("/search", async (req, res) => {
  const { query } = req;
  const searchQuery = query.query || '';

  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
        name: {
          $regex: searchQuery,
          $options: 'i',
        },
      }
      : {};

  const products = await Product.find({
    ...queryFilter
  })

  res.send({
    products
  });
});


module.exports = router