const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Product Model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  details: [{ key: String, value: String }],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

const products = [
  // --- KITCHEN (10) ---
  {
    name: "Artisanal Glass Storage Set",
    description: "Premium borosilicate glass jars with airtight bamboo lids. Perfect for kitchen organization.",
    price: 1299,
    category: "Kitchen",
    featured: true,
    images: ["https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Borosilicate Glass" }, { key: "Lid", value: "Bamboo" }]
  },
  {
    name: "Minimalist Wooden Serving Board",
    description: "Handcrafted acacia wood board for serving or prep work.",
    price: 899,
    category: "Kitchen",
    featured: true,
    images: ["https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Acacia Wood" }, { key: "Dimensions", value: "14x10 inches" }]
  },
  {
    name: "Modern Matte White Fruit Bowl",
    description: "A sculptural centerpiece for any kitchen countertop.",
    price: 1499,
    category: "Kitchen",
    featured: false,
    images: ["https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Ceramic" }, { key: "Finish", value: "Matte White" }]
  },
  {
    name: "Sleek Stainless Steel Utensils",
    description: "Professional grade stainless steel utensils with a minimalist design.",
    price: 1999,
    category: "Kitchen",
    featured: false,
    images: ["https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "304 Stainless Steel" }, { key: "Pieces", value: "5 Set" }]
  },
  {
    name: "Glass Oil Dispenser",
    description: "Clean lines and non-drip spout for your modern kitchen.",
    price: 699,
    category: "Kitchen",
    featured: false,
    images: ["https://images.pexels.com/photos/3741314/pexels-photo-3741314.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Glass" }, { key: "Capacity", value: "500ml" }]
  },
  {
    name: "Minimalist Bread Box",
    description: "Keep your bread fresh with this stylish matte finished container.",
    price: 1599,
    category: "Kitchen",
    featured: false,
    images: ["https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Body", value: "Coated Steel" }, { key: "Lid", value: "Bamboo" }]
  },
  {
    name: "Ceramic Salt & Pepper Cellars",
    description: "A minimalist duo for your tabletop seasoning needs.",
    price: 499,
    category: "Kitchen",
    featured: false,
    images: ["https://images.pexels.com/photos/2724745/pexels-photo-2724745.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Ceramic" }]
  },
  {
    name: "Hand-Woven Table Runner",
    description: "Natural textures for a grounded dining experience.",
    price: 799,
    category: "Kitchen",
    featured: false,
    images: ["https://images.pexels.com/photos/2062427/pexels-photo-2062427.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Linen/Cotton" }]
  },
  {
    name: "Stacked Bento Box",
    description: "Organized meals on the go with a clean, modular design.",
    price: 1199,
    category: "Kitchen",
    featured: false,
    images: ["https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Layers", value: "2 Tiers" }]
  },
  {
    name: "Matte Black French Press",
    description: "The perfect morning starts with precision brewing and timeless style.",
    price: 2499,
    category: "Kitchen",
    featured: false,
    images: ["https://images.pexels.com/photos/4064826/pexels-photo-4064826.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Stainless Steel" }, { key: "Finish", value: "Matte Black" }]
  },

  // --- LIGHTING (10) ---
  {
    name: "Nordic Pendant Light",
    description: "Soft ambient lighting with a clean geometric profile.",
    price: 3499,
    category: "Lighting",
    featured: true,
    images: ["https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Style", value: "Nordic" }, { key: "Material", value: "Metal" }]
  },
  {
    name: "Minimalist Floor Lamp",
    description: "Slim silhouette that blends into any modern interior.",
    price: 5999,
    category: "Lighting",
    featured: true,
    images: ["https://images.pexels.com/photos/2428290/pexels-photo-2428290.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Height", value: "150cm" }]
  },
  {
    name: "Sculptural Table Lamp",
    description: "Functional art for your bedside or workspace.",
    price: 2199,
    category: "Lighting",
    featured: false,
    images: ["https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Type", value: "LED" }]
  },
  {
    name: "Glass Globe Sconce",
    description: "Diffuse light through frosted glass for a warm glow.",
    price: 1899,
    category: "Lighting",
    featured: false,
    images: ["https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Glass & Brass" }]
  },
  {
    name: "Industrial Work Lamp",
    description: "Precision task lighting with an adjustable swing arm.",
    price: 1699,
    category: "Lighting",
    featured: false,
    images: ["https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Iron" }]
  },
  {
    name: "Opal Glass Pendant",
    description: "A single drop of light to illuminate your space.",
    price: 2899,
    category: "Lighting",
    featured: false,
    images: ["https://images.pexels.com/photos/1123259/pexels-photo-1123259.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Opal Glass" }]
  },
  {
    name: "Matte Black Desk Light",
    description: "Geometric simplicity for the modern office.",
    price: 1499,
    category: "Lighting",
    featured: false,
    images: ["https://images.pexels.com/photos/2428292/pexels-photo-2428292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Finish", value: "Matte Black" }]
  },
  {
    name: "Aesthetic Arc Lamp",
    description: "Graceful curves that redefine your living room layout.",
    price: 7499,
    category: "Lighting",
    featured: false,
    images: ["https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Type", value: "Arc" }]
  },
  {
    name: "Concrete Table Lamp",
    description: "Industrial materials meet organic light.",
    price: 1299,
    category: "Lighting",
    featured: false,
    images: ["https://images.pexels.com/photos/1123258/pexels-photo-1123258.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Base", value: "Concrete" }]
  },
  {
    name: "Lantern Pendant Duo",
    description: "Woven textures for a natural, grounded atmosphere.",
    price: 4299,
    category: "Lighting",
    featured: false,
    images: ["https://images.pexels.com/photos/1112597/pexels-photo-1112597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Bamboo" }]
  },

  // --- DECOR (10) ---
  {
    name: "Abstract Stone Sculpture",
    description: "Organic forms for your bookshelf or mantle.",
    price: 1899,
    category: "Decor",
    featured: true,
    images: ["https://images.pexels.com/photos/2092058/pexels-photo-2092058.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Stone" }]
  },
  {
    name: "Minimalist Wall Clock",
    description: "Time kept simply. Silent movement, clean face.",
    price: 1199,
    category: "Decor",
    featured: true,
    images: ["https://images.pexels.com/photos/1099816/pexels-photo-1099816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Movement", value: "Silent" }]
  },
  {
    name: "Ceramic Bud Vase",
    description: "A single stem's perfect companion.",
    price: 599,
    category: "Decor",
    featured: false,
    images: ["https://images.pexels.com/photos/2092055/pexels-photo-2092055.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Ceramic" }]
  },
  {
    name: "Woven Storage Basket",
    description: "Natural organization for blankets or toys.",
    price: 1499,
    category: "Decor",
    featured: false,
    images: ["https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Seagrass" }]
  },
  {
    name: "Matte Black Candle Holder",
    description: "Slim, elegant holders for a minimalist table setting.",
    price: 899,
    category: "Decor",
    featured: false,
    images: ["https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Iron" }]
  },
  {
    name: "Terra Cotta Planter",
    description: "Timeless vessel for your favorite indoor plants.",
    price: 799,
    category: "Decor",
    featured: false,
    images: ["https://images.pexels.com/photos/2092057/pexels-photo-2092057.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Terra Cotta" }]
  },
  {
    name: "Decorative Mirror - Brass",
    description: "Reflect light and style into your entryway.",
    price: 3499,
    category: "Decor",
    featured: false,
    images: ["https://images.pexels.com/photos/2092056/pexels-photo-2092056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Frame", value: "Brass" }]
  },
  {
    name: "Linen Throw Pillow",
    description: "Soft textures in muted, earthy tones.",
    price: 699,
    category: "Decor",
    featured: false,
    images: ["https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Fabric", value: "Linen" }]
  },
  {
    name: "Architectural Bookends",
    description: "Geometric precision for your home library.",
    price: 1299,
    category: "Decor",
    featured: false,
    images: ["https://images.pexels.com/photos/2092054/pexels-photo-2092054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Marble" }]
  },
  {
    name: "Aesthetic Scented Candle",
    description: "Notes of sandalwood and cedar in a glass jar.",
    price: 549,
    category: "Decor",
    featured: false,
    images: ["https://images.pexels.com/photos/2092053/pexels-photo-2092053.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Wax", value: "Soy" }]
  },

  // --- BEDDING (10) ---
  {
    name: "Luxury Linen Bedding Set",
    description: "Breathable, high-quality linen for the perfect night's sleep.",
    price: 6499,
    category: "Bedding",
    featured: true,
    images: ["https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "100% Linen" }]
  },
  {
    name: "Cloud-Soft Duvet",
    description: "All-season comfort with a minimalist quilted design.",
    price: 4599,
    category: "Bedding",
    featured: true,
    images: ["https://images.pexels.com/photos/1034584/pexels-photo-1034584.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Fill", value: "Microfiber" }]
  },
  {
    name: "Textured Cotton Throw",
    description: "Warmth and texture for your bed or sofa.",
    price: 1599,
    category: "Bedding",
    featured: false,
    images: ["https://images.pexels.com/photos/90317/pexels-photo-90317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Cotton" }]
  },
  {
    name: "Velvet Accent Pillow",
    description: "Rich colors and soft touch for a luxury feel.",
    price: 899,
    category: "Bedding",
    featured: false,
    images: ["https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Velvet" }]
  },
  {
    name: "Geometric Quilt",
    description: "A modern take on a classic bedroom essential.",
    price: 3299,
    category: "Bedding",
    featured: false,
    images: ["https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Style", value: "Geometric" }]
  },
  {
    name: "Satin Silk Pillowcase",
    description: "Indulgent softness for hair and skin.",
    price: 799,
    category: "Bedding",
    featured: false,
    images: ["https://images.pexels.com/photos/210604/pexels-photo-210604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Satin Silk" }]
  },
  {
    name: "Hand-Tufted Rug",
    description: "Softness underfoot for a cozy bedroom vibe.",
    price: 8999,
    category: "Bedding",
    featured: false,
    images: ["https://images.pexels.com/photos/2029670/pexels-photo-2029670.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Material", value: "Wool" }]
  },
  {
    name: "Minimalist Bed Runner",
    description: "A final touch of elegance for your bed setup.",
    price: 1299,
    category: "Bedding",
    featured: false,
    images: ["https://images.pexels.com/photos/164596/pexels-photo-164596.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Fabric", value: "Linen Blend" }]
  },
  {
    name: "Weighted Calming Blanket",
    description: "Relieve stress with distributed pressure.",
    price: 5499,
    category: "Bedding",
    featured: false,
    images: ["https://images.pexels.com/photos/279747/pexels-photo-279747.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Weight", value: "7kg" }]
  },
  {
    name: "Embroidered Accent Set",
    description: "Subtle detailing that makes a statement.",
    price: 1899,
    category: "Bedding",
    featured: false,
    images: ["https://images.pexels.com/photos/210603/pexels-photo-210603.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
    details: [{ key: "Details", value: "Hand Embroidered" }]
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Cleared!');

    console.log(`Inserting ${products.length} products...`);
    await Product.insertMany(products);
    console.log('Seeding successful!');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
