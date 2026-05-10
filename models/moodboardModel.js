import mongoose from 'mongoose';

const moodboardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true, default: 'My Moodboard' },
    elements: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        scale: { type: Number, default: 1 },
        rotation: { type: Number, default: 0 },
        zIndex: { type: Number, default: 1 }
    }],
    isPublic: { type: Boolean, default: false }
}, { timestamps: true });

const Moodboard = mongoose.model('Moodboard', moodboardSchema);

export default Moodboard;
