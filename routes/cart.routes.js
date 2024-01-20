const express = require("express");
const { ProductsModel } = require("../models/products.model");
const { errorHandler } = require("../middlewares/errorHandle.middleware");
const { UserModel } = require("../models/user.model");
const { handleResponse } = require("../utils/helper");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { CartModel } = require("../models/cart.model");
const cartRouter = express.Router();
require("dotenv").config();

// productRouter.use(errorHandler);


// Adding to Cart 

cartRouter.post('/addCart', authMiddleware, async (req, res) => {

    const { userID, productId, quantity } = req.body;
    // console.log("req.body", req.body)

    // return
    try {
        const userExists = await UserModel.findById(userID);

        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }
        const productExists = await ProductsModel.findById(productId);
        console.log("rpdocyExi789-", productExists)
        if (!productExists) {
            return res.status(404).json({ message: "Product not found" });
        }
        let cartCheck = await CartModel.findOne({ userID, productId })
        if (cartCheck) {
            cartCheck.quantity += quantity;
        } else {
            // If the entry doesn't exist, create a new one
            cartCheck = new CartModel({
                userID,
                productId,
                quantity,
            });
        }
        const cartSave = await cartCheck.save()
        // console.log("doc", cartSave);
        res.status(200).json({ message: "Product added to cart successfully", data: cartSave });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})



// Get Cart Mongoose Paginate 

cartRouter.post('/getCart', authMiddleware, async (req, res) => {

    try {
        const userID = req.body.userID;
        const cart = await CartModel.find({ userID: userID }).populate('productId');

        // console.log("req.bod in GET----", cart)



        if (!cart) {
            return res.status(404).json({ message: 'cart is empty' });
        }

        res.status(200).json({ data: cart, mesage: "Cart Fetched" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }




})


cartRouter.post('/increment/:id', authMiddleware, async (req, res) => {


    try {
        const userID = req.body.userID;
        const productId = req.query.id;

        // Check if the product is already in the cart
        const existingCartItem = await CartModel.findOne({ userID, productId });

        if (!existingCartItem) {
            return res.status(404).json({ message: 'Product not found in the cart' });
        }

        // Increment the quantity
        const updatedCartItem = await CartModel.findOneAndUpdate(
            { userID, productId },
            { $inc: { quantity: 1 } },
            { new: true }
        ).populate('productId');

        if (!updatedCartItem) {
            // If findOneAndUpdate did not return the updated document, fetch it separately
            const fetchedUpdatedCartItem = await CartModel.findOne({ userID, productId }).populate('productId');

            console.log("fetchedUpdatedCartItem", fetchedUpdatedCartItem);

            res.status(200).json({ data: fetchedUpdatedCartItem, message: 'Quantity incremented' });
        } else {
            console.log("updatedCartItem", updatedCartItem);
            res.status(200).json({ data: updatedCartItem, message: 'Quantity incremented' });
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }




})


cartRouter.post('/decrement/:id', authMiddleware, async (req, res) => {


    try {
        const userID = req.body.userID;
        const productId = req.query.id;

        // Check if the product is already in the cart
        const existingCartItem = await CartModel.findOne({ userID, productId });

        if (!existingCartItem) {
            return res.status(404).json({ message: 'Product not found in the cart' });
        }

        // Increment the quantity
        const updatedCartItem = await CartModel.findOneAndUpdate(
            { userID, productId },
            { $inc: { quantity: -1 } },
            { new: true }
        ).populate('productId');

        if (!updatedCartItem) {
            // If findOneAndUpdate did not return the updated document, fetch it separately
            const fetchedUpdatedCartItem = await CartModel.findOne({ userID, productId }).populate('productId');
            res.status(200).json({ data: fetchedUpdatedCartItem, message: 'Quantity incremented' });
        } else {
            console.log("updatedCartItem", updatedCartItem);
            res.status(200).json({ data: updatedCartItem, message: 'Quantity incremented' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }




})

cartRouter.delete('/remove/:id', authMiddleware, async (req, res) => {


    console.log({ body: req.body, query: req.query })


    // return
    try {
        const userID = req.body.userID;
        const productId = req.query.id;

        // Check if the product is already in the cart
        const existingCartItem = await CartModel.findOne({ userID, productId });

        if (!existingCartItem) {
            return res.status(404).json({ message: 'Product not found in the cart' });
        }

        // Increment the quantity
        const removeAction = await CartModel.findByIdAndRemove(existingCartItem._id);

        console.log("removeAction", removeAction)

        res.status(200).json({ message: 'Product removed from the cart' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})




module.exports = { cartRouter };

