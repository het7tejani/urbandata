import mongoose from 'mongoose';

const lookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    mainImage: { type: String, required: true },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    hotspots: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        x: { type: Number, required: true }, // percentage from left
        y: { type: Number, required: true }, // percentage from top
    }],
}, { timestamps: true });

const Look = mongoose.model('Look', lookSchema);

export default Look;
