export interface CategoryDef {
  name: string;
  slug: string;
  description: string;
  subCategories: string[];
  nouns: string[];
  attrs: string[];
  priceRange: [number, number];
  sizes?: string[];
  image: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Cutting-edge gadgets and devices",
    subCategories: ["Smartphones", "Laptops", "Tablets", "Accessories"],
    nouns: ["Smartphone", "Wireless Earbuds", "Laptop", "Smartwatch", "Tablet", "Bluetooth Speaker", "Power Bank", "4K Camera", "Headphones", "Gaming Console"],
    attrs: ["Pro", "Air", "Ultra", "Max", "X", "Neo", "Lite", "Plus", "Slim", "Elite"],
    priceRange: [199, 2999],
    image: "https://loremflickr.com/600/400/electronics?lock=1"
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Trendy apparel for every season",
    subCategories: ["Men", "Women", "Kids", "Winter Wear"],
    nouns: ["Jacket", "Hoodie", "Jeans", "T-Shirt", "Dress", "Shirt", "Sweater", "Blazer", "Shorts", "Trousers"],
    attrs: ["Classic", "Slim Fit", "Oversized", "Vintage", "Premium", "Casual", "Formal", "Sport", "Urban", "Comfort"],
    priceRange: [9.99, 299],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    image: "https://loremflickr.com/600/400/fashion?lock=1"
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Everything for a modern home",
    subCategories: ["Furniture", "Cookware", "Appliances", "Decor"],
    nouns: ["Air Fryer", "Coffee Maker", "Blender", "Cookware Set", "Vacuum Cleaner", "Rice Cooker", "Toaster", "Sofa", "Bookshelf", "Table Lamp"],
    attrs: ["Pro", "Smart", "Compact", "Deluxe", "Modern", "Retro", "Inverter", "Digital", "Stainless", "Premium"],
    priceRange: [19.99, 1499],
    image: "https://loremflickr.com/600/400/home?lock=1"
  },
  {
    name: "Beauty",
    slug: "beauty",
    description: "Skincare, makeup and fragrance",
    subCategories: ["Skincare", "Makeup", "Fragrance", "Hair Care"],
    nouns: ["Moisturizer", "Serum", "Face Cleanser", "Perfume", "Lipstick", "Foundation", "Shampoo", "Face Mask", "Sunscreen", "Eye Cream"],
    attrs: ["Organic", "Glow", "Daily", "Intense", "Hydrating", "Matte", "Natural", "Repair", "Radiance", "Gentle"],
    priceRange: [4.99, 199],
    image: "https://loremflickr.com/600/400/beauty?lock=1"
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Gear for every athlete",
    subCategories: ["Fitness", "Outdoor", "Team Sports", "Cycling"],
    nouns: ["Yoga Mat", "Dumbbell Set", "Treadmill", "Football", "Basketball", "Cycle", "Tennis Racket", "Resistance Bands", "Skipping Rope", "Water Bottle"],
    attrs: ["Pro", "Heavy Duty", "Foldable", "Pro-Grade", "Olympic", "Compact", "Elite", "Performance", "Trail", "Aero"],
    priceRange: [9.99, 1199],
    image: "https://loremflickr.com/600/400/sports?lock=1"
  },
  {
    name: "Books",
    slug: "books",
    description: "Bestsellers across genres",
    subCategories: ["Fiction", "Non-Fiction", "Business", "Children"],
    nouns: ["Novel", "Biography", "Self-Help Book", "Thriller", "Science Fiction", "Cookbook", "History Book", "Fantasy Series", "Guidebook", "Poetry Collection"],
    attrs: ["Bestseller", "Collector", "Illustrated", "Abridged", "Deluxe", "Classic", "Modern", "Box Set", "Signed", "International"],
    priceRange: [4.99, 89],
    image: "https://loremflickr.com/600/400/books?lock=1"
  },
  {
    name: "Toys & Games",
    slug: "toys-games",
    description: "Fun for kids and collectors",
    subCategories: ["Board Games", "Action Figures", "Building Sets", "Puzzles"],
    nouns: ["Board Game", "RC Car", "Action Figure", "Building Blocks", "Puzzle Set", "Drone", "Plush Toy", "Card Game", "Robot Kit", "Water Gun"],
    attrs: ["Deluxe", "Educational", "Remote Control", "Collector", "Family", "Mini", "Mega", "Soft", "Interactive", "Classic"],
    priceRange: [5.99, 499],
    image: "https://loremflickr.com/600/400/toys?lock=1"
  },
  {
    name: "Automotive",
    slug: "automotive",
    description: "Parts and accessories for your vehicle",
    subCategories: ["Car Accessories", "Motorbike", "Car Care", "Tools"],
    nouns: ["Car Cover", "Dash Cam", "Seat Covers", "Car Vacuum", "Tire Inflator", "Phone Mount", "LED Headlights", "Bike Helmet", "Engine Oil", "Car Mats"],
    attrs: ["Pro", "Universal", "Heavy Duty", "Solar", "HD", "Wireless", "Waterproof", "Anti-Slip", "Premium", "Rugged"],
    priceRange: [7.99, 899],
    image: "https://loremflickr.com/600/400/auto?lock=1"
  },
  {
    name: "Grocery",
    slug: "grocery",
    description: "Fresh daily essentials",
    subCategories: ["Snacks", "Beverages", "Organic", "Pantry"],
    nouns: ["Green Tea", "Coffee Beans", "Protein Bar", "Honey Jar", "Olive Oil", "Granola Mix", "Dark Chocolate", "Spice Set", "Detox Juice", "Nut Mix"],
    attrs: ["Organic", "Premium", "Imported", "Zero Sugar", "High Protein", "Cold Pressed", "Keto", "Vegan", "Artisanal", "Single Origin"],
    priceRange: [2.99, 99],
    image: "https://loremflickr.com/600/400/grocery?lock=1"
  },
  {
    name: "Health & Wellness",
    slug: "health-wellness",
    description: "Care for your body and mind",
    subCategories: ["Vitamins", "Fitness Trackers", "Massagers", "Sleep Care"],
    nouns: ["Vitamin Pack", "Massage Gun", "Fitness Tracker", "Blood Pressure Monitor", "Steam Inhaler", "Orthopedic Pillow", "Protein Powder", "Weighing Scale", "Hand Massager", "Glucose Monitor"],
    attrs: ["Smart", "Digital", "Portable", "Medical Grade", "Extra Soft", "Clinical", "Daily", "Advanced", "Pro", "Pocket"],
    priceRange: [6.99, 349],
    image: "https://loremflickr.com/600/400/health?lock=1"
  },
  {
    name: "Furniture",
    slug: "furniture",
    description: "Stylish pieces for every room",
    subCategories: ["Living Room", "Bedroom", "Office", "Outdoor"],
    nouns: ["Office Chair", "Desk", "Sofa Set", "Dining Table", "Bed Frame", "Wardrobe", "Bookshelf", "Recliner", "Coffee Table", "Patio Set"],
    attrs: ["Ergonomic", "Compact", "Luxury", "Rattan", "Industrial", "Adjustable", "Foldable", "Modern", "Vintage", "Multi-Purpose"],
    priceRange: [49, 2499],
    image: "https://loremflickr.com/600/400/furniture?lock=1"
  },
  {
    name: "Tools & DIY",
    slug: "tools-diy",
    description: "Professional-grade tooling",
    subCategories: ["Power Tools", "Hand Tools", "Gardening", "Safety"],
    nouns: ["Drill Kit", "Cordless Screwdriver", "Angle Grinder", "Toolbox Set", "Circular Saw", "Laser Level", "Hammer Set", "Workbench", "Jigsaw", "Screwdriver Set"],
    attrs: ["Cordless", "Heavy Duty", "Pro", "Multifunctional", "Impact", "Compact", "Digital", "Variable Speed", "Rugged", "Precision"],
    priceRange: [12.99, 799],
    image: "https://loremflickr.com/600/400/tools?lock=1"
  },
  {
    name: "Travel",
    slug: "travel",
    description: "Adventure-ready luggage and gear",
    subCategories: ["Luggage", "Backpacks", "Travel Accessories", "Camping"],
    nouns: ["Suitcase", "Backpack", "Duffel Bag", "Travel Pillow", "Passport Holder", "Camping Tent", "Luggage Set", "Power Adapter", "Travel Organizer", "Sleeping Bag"],
    attrs: ["Cabin", "Expandable", "Waterproof", "Anti-Theft", "Ultralight", "TSA Lock", "4-Wheel", "Hiking", "Compact", "Premium"],
    priceRange: [14.99, 599],
    image: "https://loremflickr.com/600/400/travel?lock=1"
  },
  {
    name: "Music",
    slug: "music",
    description: "Instruments and audio gear",
    subCategories: ["Guitars", "Keyboards", "Audio Gear", "Drums"],
    nouns: ["Acoustic Guitar", "Electric Guitar", "Keyboard Piano", "Ukulele", "Studio Headphones", "Turntable", "Amplifier", "Violin", "Drum Set", "Microphone"],
    attrs: ["Studio", "Beginner", "Pro", "Acoustic", "Vintage", "Digital", "Wireless", "Compact", "Deluxe", "Stage"],
    priceRange: [19.99, 1299],
    image: "https://loremflickr.com/600/400/music?lock=1"
  },
  {
    name: "Office Supplies",
    slug: "office-supplies",
    description: "Everything your workspace needs",
    subCategories: ["Stationery", "Printers", "Notebooks", "Storage"],
    nouns: ["Notebook Set", "Laser Printer", "Desk Organizer", "Fountain Pen", "Whiteboard", "Paper Cutter", "Stapler", "Folder Set", "Desk Lamp", "Marker Set"],
    attrs: ["Premium", "Frosted", "Refillable", "Eco", "Heavy Duty", "Slim", "Ergonomic", "A5", "Executive", "Compact"],
    priceRange: [3.99, 499],
    image: "https://loremflickr.com/600/400/office?lock=1"
  },
  {
    name: "Pets",
    slug: "pets",
    description: "Supplies for your furry friends",
    subCategories: ["Dogs", "Cats", "Birds", "Fish"],
    nouns: ["Dog Bed", "Cat Tower", "Pet Feeder", "Leash Set", "Pet Camera", "Grooming Kit", "Aquarium Filter", "Bird Cage", "Pet Carrier", "Chew Toys"],
    attrs: ["Interactive", "Waterproof", "Adjustable", "Deluxe", "Portable", "Premium", "Heavy Duty", "Comfort", "Smart", "Non-Toxic"],
    priceRange: [6.99, 399],
    image: "https://loremflickr.com/600/400/pets?lock=1"
  },
  {
    name: "Baby",
    slug: "baby",
    description: "Safe and soft for little ones",
    subCategories: ["Strollers", "Feeding", "Toys", "Nursery"],
    nouns: ["Baby Stroller", "Car Seat", "Baby Monitor", "Feeding Bottle Set", "Diaper Bag", "Crib", "Play Mat", "Baby Swing", "Walker", "Crib Mobile"],
    attrs: ["Foldable", "Lightweight", "Safe", "Adjustable", "Portable", "Deluxe", "Cozy", "Premium", "Non-Toxic", "Compact"],
    priceRange: [9.99, 799],
    image: "https://loremflickr.com/600/400/baby?lock=1"
  },
  {
    name: "Jewelry",
    slug: "jewelry",
    description: "Timeless pieces for any occasion",
    subCategories: ["Necklaces", "Rings", "Bracelets", "Earrings"],
    nouns: ["Necklace", "Ring", "Bracelet", "Earrings", "Pendant", "Charm Set", "Watch", "Anklet", "Cufflinks", "Brooch"],
    attrs: ["925 Silver", "Gold Plated", "Rose Gold", "Diamond Cut", "Minimalist", "Statement", "Antique", "Charm", "Swarovski", "Handcrafted"],
    priceRange: [8.99, 999],
    image: "https://loremflickr.com/600/400/jewelry?lock=1"
  },
  {
    name: "Shoes",
    slug: "shoes",
    description: "Footwear for every stride",
    subCategories: ["Running", "Casual", "Formal", "Sports"],
    nouns: ["Running Shoes", "Sneakers", "Loafers", "Boots", "Slippers", "Formal Shoes", "Hiking Boots", "Sandals", "High Tops", "Training Shoes"],
    attrs: ["Air Max", "Lightweight", "Waterproof", "Breathable", "Cushioned", "Classic", "Slip-On", "Grippy", "Retro", "Pro"],
    priceRange: [14.99, 449],
    sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
    image: "https://loremflickr.com/600/400/shoes?lock=1"
  },
  {
    name: "Cameras",
    slug: "cameras",
    description: "Capture every moment",
    subCategories: ["DSLR", "Mirrorless", "Action Cams", "Lenses"],
    nouns: ["DSLR Camera", "Mirrorless Camera", "Action Camera", "Camera Lens", "Tripod", "Drone Camera", "Instant Camera", "Webcam", "Camera Bag", "Gimbal"],
    attrs: ["4K", "Full Frame", "APS-C", "Ultra HD", "Stabilized", "Waterproof", "Vlogging", "Pro", "Compact", "Hybrid"],
    priceRange: [39.99, 3999],
    image: "https://loremflickr.com/600/400/cameras?lock=1"
  }
];

export const BRANDS: { name: string; slug: string; tagline: string }[] = [
  { name: "NovaTech", slug: "novatech", tagline: "Future-ready innovation" },
  { name: "Voltrix", slug: "voltrix", tagline: "Power that lasts" },
  { name: "AeroPeak", slug: "aeropeak", tagline: "Reach new heights" },
  { name: "Luminex", slug: "luminex", tagline: "Light up your world" },
  { name: "Zenith", slug: "zenith", tagline: "The best, perfected" },
  { name: "Craftora", slug: "craftora", tagline: "Handcrafted excellence" },
  { name: "BlueOrbit", slug: "blueorbit", tagline: "Beyond boundaries" },
  { name: "Solstice", slug: "solstice", tagline: "Premium essentials" },
  { name: "Hyperion", slug: "hyperion", tagline: "Bold by design" },
  { name: "Evermore", slug: "evermore", tagline: "Built to endure" },
  { name: "PulseTech", slug: "pulsetech", tagline: "Feel the pulse" },
  { name: "Aurora", slug: "aurora", tagline: "Color your life" },
  { name: "Vertex", slug: "vertex", tagline: "Engineered sharp" },
  { name: "Nimbus", slug: "nimbus", tagline: "Soft as a cloud" },
  { name: "Cascade", slug: "cascade", tagline: "Flowing quality" },
  { name: "IronCraft", slug: "ironcraft", tagline: "Strength redefined" },
  { name: "Skyline", slug: "skyline", tagline: "Urban essentials" },
  { name: "Terra", slug: "terra", tagline: "Grounded in quality" },
  { name: "EcoNest", slug: "econest", tagline: "Sustainable living" },
  { name: "Fusion", slug: "fusion", tagline: "Where tech meets life" },
  { name: "Orbit", slug: "orbit", tagline: "Revolutionary design" },
  { name: "Crystal", slug: "crystal", tagline: "Clarity in every detail" },
  { name: "Marvelux", slug: "marvelux", tagline: "Luxury, unlocked" },
  { name: "Stride", slug: "stride", tagline: "Step into comfort" },
  { name: "Boldline", slug: "boldline", tagline: "Make a statement" },
  { name: "PureDrop", slug: "puredrop", tagline: "Purity in every drop" },
  { name: "SwiftGear", slug: "swiftgear", tagline: "Fast. Reliable. Ready." },
  { name: "GlowUp", slug: "glowup", tagline: "Your glow, amplified" },
  { name: "TrueNorth", slug: "truenorth", tagline: "Direction in design" },
  { name: "Vantage", slug: "vantage", tagline: "See the difference" },
  { name: "ComfortCo", slug: "comfortco", tagline: "Comfort first" },
  { name: "Apex", slug: "apex", tagline: "At the top, always" },
  { name: "Radiant", slug: "radiant", tagline: "Shine through" },
  { name: "Quantix", slug: "quantix", tagline: "Quantum leaps in tech" },
  { name: "StoneBridge", slug: "stonebridge", tagline: "Solid. Dependable." },
  { name: "Vireo", slug: "vireo", tagline: "Vivid living" },
  { name: "Zephyr", slug: "zephyr", tagline: "Light and breezy" },
  { name: "Midnight", slug: "midnight", tagline: "Elegance in dark" },
  { name: "Solaris", slug: "solaris", tagline: "Powered by the sun" },
  { name: "Cobalt", slug: "cobalt", tagline: "Deep tech, deep blue" },
  { name: "Maven", slug: "maven", tagline: "For the experts" },
  { name: "NovaWave", slug: "novawave", tagline: "Ride the wave" },
  { name: "RedStone", slug: "redstone", tagline: "Fiery performance" },
  { name: "Silverline", slug: "silverline", tagline: "The finer line" },
  { name: "UltraFiber", slug: "ultrafiber", tagline: "Technology in fabric" },
  { name: "Ventura", slug: "ventura", tagline: "Adventure awaits" },
  { name: "GoldLeaf", slug: "goldleaf", tagline: "A touch of gold" },
  { name: "NexGen", slug: "nexgen", tagline: "The next generation" },
  { name: "Quantum", slug: "quantum", tagline: "Intelligent choices" },
  { name: "Summit", slug: "summit", tagline: "At the peak" },
  { name: "Trailblaze", slug: "trailblaze", tagline: "Go first, go far" },
  { name: "UrbanFlow", slug: "urbanflow", tagline: "City life, smooth" },
  { name: "Harmony", slug: "harmony", tagline: "Balance in design" },
  { name: "Vivid", slug: "vivid", tagline: "Life in full color" },
  { name: "Everest", slug: "everest", tagline: "The ultimate climb" },
  { name: "Celestia", slug: "celestia", tagline: "Heavenly products" },
  { name: "PrimeEdge", slug: "primeedge", tagline: "Cutting-edge quality" },
  { name: "SwiftByte", slug: "swiftbyte", tagline: "Speed in tech" },
  { name: "Grandeur", slug: "grandeur", tagline: "Grand by nature" },
  { name: "PixelPro", slug: "pixelpro", tagline: "Professional pixels" }
];

export const SELLERS: string[] = [
  "GlobalMart", "UrbanKart", "MegaDeals", "TechHaven", "StyleHub", "HomeNest", "ShopSphere",
  "TrendyCart", "ValueVault", "EliteBazaar", "PrimePick", "CityStore", "RapidRetail", "FusionFinds",
  "SmartChoice", "BestBoutique", "DailyDiscounts", "AceOutlet", "StarSupply", "ZenMarket",
  "NovoStore", "CornerShop", "BrightBuy", "MetroMall", "PrestigeShop", "EasyEmporium", "QuickCart",
  "NobleNook", "PinnacleStore", "SummitShop", "BreezyMarket", "ClassicCorner", "EvergreenGoods",
  "LuckyLoot", "TrueTrade", "GoldenGate Goods", "SilverStores", "OasisOutlet", "VantageVendor", "HarborHome"
];

export const LOCATIONS: string[] = [
  "New York", "Los Angeles", "Chicago", "Houston", "San Francisco", "Seattle", "Austin",
  "Boston", "Denver", "Miami", "Atlanta", "Dallas", "Portland", "San Diego", "Phoenix",
  "Philadelphia", "Nashville", "Minneapolis", "Detroit", "Tampa", "Las Vegas", "Orlando",
  "Charlotte", "Columbus", "Indianapolis", "Sacramento", "Kansas City", "Pittsburgh", "St. Louis", "Milwaukee"
];

export const COLORS: string[] = [
  "Black", "White", "Blue", "Red", "Green", "Silver", "Gold", "Purple", "Pink", "Gray",
  "Navy", "Teal", "Maroon", "Cream", "Orange", "Brown", "Beige", "Indigo", "Cyan", "Yellow"
];

export const TAG_POOL: string[] = [
  "Bestseller", "New Arrival", "Limited Edition", "Eco Friendly", "Handmade", "Imported",
  "Waterproof", "Wireless", "Smart", "Portable", "Durable", "Premium", "Budget", "Luxury",
  "Top Rated", "Trending", "Exclusive", "Refurbished", "Certified", "Award Winner"
];

export const REVIEW_COMMENTS: string[] = [
  "Absolutely love this {product}! Quality exceeded my expectations and delivery was fast.",
  "Solid product for the price. Would definitely recommend to friends and family.",
  "Took a while to arrive but worth the wait. Very happy with the purchase.",
  "Great build quality and works exactly as described. 5 stars.",
  "Decent product, does the job well. Packaging could be better though.",
  "Best {product} I have owned so far. The design is sleek and modern.",
  "Value for money. Not premium but does everything I need it to do.",
  "Excellent customer support and a fantastic product. Will buy again.",
  "The quality surprised me at this price point. Highly satisfied.",
  "Works flawlessly. Setup was straightforward and intuitive.",
  "Good product overall, but the color is slightly different from the photos.",
  "Very impressed with the durability. Survived a month of heavy use already.",
  "Exactly what I needed. No complaints at all.",
  "Beautiful design and sturdy construction. A great addition to my collection.",
  "Fast shipping and authentic product. Trustworthy seller.",
  "Wish it had a few more features, but for the price it is fantastic.",
  "My whole family loves this! Great purchase.",
  "Slightly heavier than expected but the performance makes up for it.",
  "Superb quality. You can tell it was made with care.",
  "Would buy again in another color. Highly recommend this item."
];

export const REVIEW_TITLES: string[] = [
  "Exceeded my expectations", "Great value", "Highly recommended", "Just perfect",
  "Solid buy", "Happy customer", "Better than expected", "Worth every penny",
  "Impressive quality", "Exactly as described", "Five star experience", "Must have"
];

export const SEARCH_POOL: string[] = [
  "wireless headphones", "laptop", "running shoes", "smartwatch", "yoga mat", "coffee maker",
  "perfume for men", "air fryer", "gaming console", "4k camera", "backpack", "office chair",
  "dumbbell set", "skincare serum", "baby stroller", "cat tower", "acoustic guitar",
  "noise cancelling", "bluetooth speaker", "denim jacket", "protein powder", "drone",
  "mechanical keyboard", "monitor", "hiking boots", "smart tv", "vacuum cleaner",
  "phone case", "solar power bank", "cookware set", "massage gun", "desk lamp",
  "water bottle", "fitness tracker", "leather wallet", "sunglasses", "tent",
  "wooden puzzle", "board games for adults", "succulent planter", "espresso machine",
  "puzzle for adults", "rc car", "portable charger", "walking treadmill", "camping gear",
  "kitchen knives", "organic tea", "white sneakers", "luxury watch"
];
