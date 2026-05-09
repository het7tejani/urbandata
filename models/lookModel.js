import mongoose from 'mongoose';

const lookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    mainImage: { type: String, required: true },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
}, { timestamps: true });

const Look = mongoose.model('Look', lookSchema);

export default Look;
