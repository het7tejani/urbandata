import express from 'express';
import jwt from 'jsonwebtoken';
import { GoogleGenAI, Type } from "@google/genai";
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import Testimonial from '../models/testimonialModel.js';
import User from '../models/userModel.js';
import Wishlist from '../models/wishlistModel.js';
import Look from '../models/lookModel.js';
import Review from '../models/reviewModel.js';
import Order from '../models/orderModel.js';


const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// --- AUTH MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token format is invalid, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// --- ADMIN MIDDLEWARE ---
const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden: Admin access required.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error while verifying admin status.' });
    }
};


// --- CHATBOT ROUTE ---
router.post('/chatbot/query', async (req, res) => {
    const { message, history } = req.body;

    try {
        const allProducts = await Product.find({});
        const productCatalog = allProducts.map(p => ({
            _id: p._id.toString(),
            name: p.name,
            category: p.category,
            price: p.price,
            description: p.description
        }));
        
        const systemInstruction = `You are "PantryPal", a friendly and helpful AI personal shopper for UrbanPantry, an online store for modern home and kitchen products.
        Your goal is to help users find the perfect products by having a natural conversation.
        You have been provided with the entire product catalog in JSON format below. Use it as your knowledge base to answer questions.
        ---
        PRODUCT CATALOG:
        ${JSON.stringify(productCatalog)}
        ---
        Based on the user's request, you MUST identify suitable products and recommend them.
        When you recommend products, you MUST include their "_id" in the "recommendedProductIds" array in your response.
        Do not recommend products that are not in the provided catalog.
        Keep your text response conversational, concise, and helpful. If you can't find a suitable product, say so politely.
        If the user asks a general question not related to products, answer it helpfully in the context of being a shopping assistant.
        Your response must be a JSON object matching the provided schema.`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                responseText: {
                    type: Type.STRING,
                    description: "Your friendly, conversational response to the user."
                },
                recommendedProductIds: {
                    type: Type.ARRAY,
                    description: "An array of product _id strings that you are recommending. Only include IDs from the provided catalog.",
                    items: { type: Type.STRING }
                }
            }
        };
        
        // Combine history and new message for context.
        const fullPrompt = (history || [])
            .map(msg => `${msg.sender === 'ai' ? 'PantryPal' : 'User'}: ${msg.text}`)
            .join('\n') + `\nUser: ${message}`;
        
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt, // Simplified to a single string prompt
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
            }
        });

        const jsonResponse = JSON.parse(result.text);

        let recommendedProducts = [];
        if (jsonResponse.recommendedProductIds && jsonResponse.recommendedProductIds.length > 0) {
            recommendedProducts = await Product.find({
                '_id': { $in: jsonResponse.recommendedProductIds }
            });
        }
        
        res.json({
            text: jsonResponse.responseText,
            products: recommendedProducts
        });

    } catch (error) {
        console.error('Error with Gemini API:', error);
        const errorMessage = error.message || 'Sorry, I am having trouble connecting to my brain. Please try again later.';
        res.status(500).json({ message: errorMessage });
    }
});


// --- AUTH ROUTES ---

// POST /api/users/register - Register a new user
router.post('/users/register', async (req, res) => {
    const { fullName, username, email, password } = req.body;
    try {
        const lowerCaseEmail = email.toLowerCase();
        let user = await User.findOne({ $or: [{ email: lowerCaseEmail }, { username }] });
        if (user) {
            return res.status(400).json({ message: 'User with that email or username already exists' });
        }
        
        // The password will be hashed automatically by the pre-save hook in the User model
        user = new User({ fullName, username, email: lowerCaseEmail, password });
        
        await user.save();
        
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token, user: { id: user.id, fullName: user.fullName, username: user.username, email: user.email, role: user.role } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/users/login - Authenticate user and get token
router.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email, case-insensitively
        const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') }).select('+password');
        
        if (!user) {
            console.log(`[AUTH DEBUG] Login attempt for non-existent user: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log(`[AUTH DEBUG] Password mismatch for user: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, fullName: user.fullName, username: user.username, email: user.email, role: user.role } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- WISHLIST ROUTES ---

// GET /api/wishlist - Get user's wishlist
router.get('/wishlist', authMiddleware, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
        if (!wishlist) {
            return res.json({ products: [] });
        }
        res.json(wishlist);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/wishlist/add - Add a product to wishlist
router.post('/wishlist/add', authMiddleware, async (req, res) => {
    const { productId } = req.body;
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user.id, products: [productId] });
        } else {
            const productExists = wishlist.products.some(id => id.toString() === productId);
            if (!productExists) {
                wishlist.products.push(productId);
            }
        }
        await wishlist.save();
        res.status(200).json(wishlist);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/wishlist/remove - Remove a product from wishlist
router.post('/wishlist/remove', authMiddleware, async (req, res) => {
    const { productId } = req.body;
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        if (wishlist) {
            wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
            await wishlist.save();
        }
        res.status(200).json(wishlist);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- "SHOP THE LOOK" ROUTES ---

// GET /api/looks - Get all looks
router.get('/looks', async (req, res) => {
    try {
        const looks = await Look.find().sort({ createdAt: -1 });
        res.json(looks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/looks - Create a new look (ADMIN ONLY)
router.post('/looks', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, description, mainImage, products } = req.body;
        const newLook = new Look({
            title,
            description,
            mainImage,
            products
        });
        const look = await newLook.save();
        res.status(201).json(look);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/looks/:id - Get a single look by ID
router.get('/looks/:id', async (req, res) => {
    try {
        const look = await Look.findById(req.params.id).populate('products');
        if (!look) {
            return res.status(404).json({ msg: 'Look not found' });
        }
        res.json(look);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/looks/:id - Update an existing look (ADMIN ONLY)
router.put('/looks/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const look = await Look.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!look) {
            return res.status(404).json({ msg: 'Look not found' });
        }
        res.json(look);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/looks/:id - Delete a look (ADMIN ONLY)
router.delete('/looks/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const look = await Look.findByIdAndDelete(req.params.id);
        if (!look) {
            return res.status(404).json({ msg: 'Look not found' });
        }
        res.json({ msg: 'Look removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- PRODUCT ROUTES ---

// GET /api/products/search - Search for products
router.get('/products/search', async (req, res) => {
    try {
        const { q, minPrice, maxPrice, rating } = req.query;
        if (!q) {
            return res.status(400).json({ msg: 'Search query is required' });
        }
        
        const searchRegex = new RegExp(q, 'i'); // i for case-insensitive
        
        const query = {
            $or: [
                { name: searchRegex },
                { description: searchRegex }
            ]
        };

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (rating) {
            query.rating = { $gte: Number(rating) };
        }
        
        const products = await Product.find(query);
        
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// GET /api/products - Get all products, with optional filtering and sorting
router.get('/products', async (req, res) => {
    try {
        const { category, featured, limit, sort, minPrice, maxPrice, rating } = req.query;

        // Special logic for homepage's "Best Sellers" (when `featured` is true)
        if (featured === 'true') {
            const numLimit = parseInt(limit, 10) || 4;

            // 1. Get explicitly featured products
            let products = await Product.find({ featured: true })
                .sort({ createdAt: -1 })
                .limit(numLimit);
            
            // 2. If not enough featured products, get most recent ones to fill up
            if (products.length < numLimit) {
                const needed = numLimit - products.length;
                const existingIds = products.map(p => p._id);
                
                const recentProducts = await Product.find({ _id: { $nin: existingIds } })
                    .sort({ createdAt: -1 })
                    .limit(needed);

                // Combine and ensure we don't exceed the limit
                products = [...products, ...recentProducts];
            }
            
            return res.json(products);
        }

        // Original logic for all other product fetching
        const filter = {};
        
        if (category) filter.category = category;
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (rating) {
            filter.rating = { $gte: Number(rating) };
        }

        const sortOption = {};
        if (sort === 'price-asc') {
            sortOption.price = 1;
        } else if (sort === 'price-desc') {
            sortOption.price = -1;
        } else { // Default sort for category pages etc.
            sortOption.createdAt = -1;
        }

        let query = Product.find(filter).sort(sortOption);
        if (limit) query = query.limit(parseInt(limit));

        const products = await query;
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/products/:id/reviews - Get reviews for a product
router.get('/products/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.id }).populate('user', 'fullName').sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/products/:id/reviews - Create a new review for a product
router.post('/products/:id/reviews', authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Authentication error: User not found.' });
        }
        const userId = req.user.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const alreadyReviewed = await Review.findOne({ product: productId, user: userId });
        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }
        
        const review = new Review({
            rating,
            comment,
            product: productId,
            user: userId,
        });

        await review.save();

        // Recalculate and update product's average rating more safely
        const allReviewsForProduct = await Review.find({ product: productId });
        const numReviews = allReviewsForProduct.length;
        const newRating = numReviews > 0
            ? allReviewsForProduct.reduce((acc, item) => item.rating + acc, 0) / numReviews
            : 0;

        await Product.findByIdAndUpdate(productId, {
            rating: newRating,
            numReviews: numReviews,
        });
        
        res.status(201).json({ message: 'Review added successfully' });

    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) { // Mongoose duplicate key error
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).send('Server Error');
    }
});


// GET /api/products/:id - Get a single product by ID
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// POST /api/products - Create a new product (ADMIN ONLY)
router.post('/products', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, price, images, category, featured, description, details } = req.body;
        const newProduct = new Product({
            name,
            price,
            images,
            category,
            featured,
            description,
            details
        });
        const product = await newProduct.save();
        res.status(201).json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/products/:id - Update an existing product (ADMIN ONLY)
router.put('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/products/:id - Delete a product (ADMIN ONLY)
router.delete('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- CATEGORY ROUTES ---

router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- TESTIMONIAL ROUTES ---

router.get('/testimonials', async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        res.json(testimonials);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/testimonials - Create a new testimonial (ADMIN ONLY)
router.post('/testimonials', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { quote, author } = req.body;
        const newTestimonial = new Testimonial({ quote, author });
        const testimonial = await newTestimonial.save();
        res.status(201).json(testimonial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/testimonials/:id - Update a testimonial (ADMIN ONLY)
router.put('/testimonials/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!testimonial) {
            return res.status(404).json({ msg: 'Testimonial not found' });
        }
        res.json(testimonial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/testimonials/:id - Delete a testimonial (ADMIN ONLY)
router.delete('/testimonials/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ msg: 'Testimonial not found' });
        }
        res.json({ msg: 'Testimonial removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- ORDER ROUTES ---

// POST /api/orders - Create a new order
router.post('/orders', authMiddleware, async (req, res) => {
    const { orderItems, shippingAddress, totalPrice } = req.body;
    try {
        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }
        const order = new Order({
            user: req.user.id,
            orderItems: orderItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                image: item.images[0], // Use the first image for the order snapshot
                price: item.price,
                product: item._id,
            })),
            shippingAddress,
            totalPrice,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/orders/myorders - Get logged in user's orders
router.get('/orders/myorders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// GET /api/orders/:id - Get order by ID
router.get('/orders/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'fullName email');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Ensure user is authorized to see this order
        const user = await User.findById(req.user.id);
        if (order.user._id.toString() !== req.user.id && user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- ADMIN ORDER ROUTES ---
// GET /api/orders - Get all orders (ADMIN ONLY)
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id fullName').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/orders/:id/status - Update order status (ADMIN ONLY)
router.put('/orders/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


export default router;