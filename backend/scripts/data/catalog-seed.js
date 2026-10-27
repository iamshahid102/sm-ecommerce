/**
 * Demo catalog for the book and clothing departments.
 *
 * Slugs are stable because the seed script uses them as idempotency keys.
 * Photos are Unsplash photo ids; the seed script downloads them into Supabase
 * Storage so the storefront does not depend on a third-party host at runtime.
 */

export const CATEGORY_SEED = [
  {
    slug: "books",
    name: "Books",
    parent: null,
    sort_order: 10,
    photo: "photo-1507842217343-583bb7270b66",
    description:
      "Fiction, non-fiction, Islamic titles, academic references, and Urdu literature for curious readers of every age.",
    meta_title: "Books online in Pakistan",
    meta_description:
      "Shop bestselling fiction, business, Islamic, academic, and Urdu books with Cash on Delivery across Pakistan.",
  },
  {
    slug: "clothing",
    name: "Clothing",
    parent: null,
    sort_order: 11,
    photo: "photo-1483985988355-763728e1935b",
    description:
      "Everyday wardrobe essentials, elevated layers, and accessories for men, women, and kids.",
    meta_title: "Clothing online in Pakistan",
    meta_description:
      "Shop men's, women's, and kids' clothing, outerwear, and accessories with Cash on Delivery.",
  },
  {
    slug: "fiction",
    name: "Fiction",
    parent: "books",
    sort_order: 20,
    photo: "photo-1544947950-fa07a98d237f",
    description:
      "Contemporary novels, literary classics, and unforgettable stories.",
    meta_title: "Fiction books",
    meta_description:
      "Browse bestselling novels, literary fiction, and modern classics at SM Store.",
  },
  {
    slug: "mens-clothing",
    name: "Men's Clothing",
    parent: "clothing",
    sort_order: 21,
    photo: "photo-1552374196-c4e7ffc6e126",
    description:
      "Reliable everyday staples, denim, shirting, and layering pieces for men.",
    meta_title: "Men's clothing",
    meta_description:
      "Shop men's t-shirts, jeans, shirts, hoodies, and outerwear with Cash on Delivery.",
  },
  {
    slug: "business-self-development",
    name: "Business & Self-Development",
    parent: "books",
    sort_order: 22,
    photo: "photo-1543002588-bfa74002ed7e",
    description:
      "Practical books on habits, leadership, money, and personal growth.",
    meta_title: "Business and self-development books",
    meta_description:
      "Shop business, productivity, leadership, and self-development books online.",
  },
  {
    slug: "womens-clothing",
    name: "Women's Clothing",
    parent: "clothing",
    sort_order: 23,
    photo: "photo-1496747611176-843222e1e57c",
    description:
      "Modern silhouettes, easy denim, dresses, and everyday essentials for women.",
    meta_title: "Women's clothing",
    meta_description:
      "Shop women's dresses, jeans, shirts, and everyday clothing with Cash on Delivery.",
  },
  {
    slug: "islamic-books",
    name: "Islamic Books",
    parent: "books",
    sort_order: 24,
    photo: "photo-1519682337058-a94d519337bc",
    description:
      "Authentic Islamic history, seerah, and guidance for everyday life.",
    meta_title: "Islamic books",
    meta_description:
      "Shop Islamic books, seerah, and authentic translations with Cash on Delivery.",
  },
  {
    slug: "outerwear",
    name: "Outerwear",
    parent: "clothing",
    sort_order: 25,
    photo: "photo-1544923246-77307dd654cb",
    description:
      "Jackets and layers built for changing weather and everyday movement.",
    meta_title: "Outerwear",
    meta_description:
      "Shop lightweight jackets, puffer jackets, and outerwear for men and women.",
  },
  {
    slug: "children-young-readers",
    name: "Children & Young Readers",
    parent: "books",
    sort_order: 26,
    photo: "photo-1503919545889-aef636e10ad4",
    description:
      "Picture books, early readers, and stories that make young imaginations grow.",
    meta_title: "Children's books",
    meta_description:
      "Shop children's books, picture books, and young reader favourites online.",
  },
  {
    slug: "accessories",
    name: "Accessories",
    parent: "clothing",
    sort_order: 27,
    photo: "photo-1590874103328-eac38a683ce7",
    description: "Bags and finishing touches that complete an everyday outfit.",
    meta_title: "Clothing accessories",
    meta_description:
      "Shop bags and everyday accessories to complete your look.",
  },
  {
    slug: "academic-reference",
    name: "Academic & Reference",
    parent: "books",
    sort_order: 28,
    photo: "photo-1495446815901-a7297e633e8d",
    description: "Dictionaries, study guides, and dependable reference titles.",
    meta_title: "Academic and reference books",
    meta_description:
      "Shop dictionaries, study guides, and academic reference books online.",
  },
  {
    slug: "kids-clothing",
    name: "Kids' Clothing",
    parent: "clothing",
    sort_order: 29,
    photo: "photo-1519238263530-99bdd11df2ea",
    description:
      "Comfortable, playful pieces made for school days and weekends.",
    meta_title: "Kids' clothing",
    meta_description:
      "Shop comfortable kids' t-shirts and everyday clothing with Cash on Delivery.",
  },
  {
    slug: "urdu-literature",
    name: "Urdu Literature",
    parent: "books",
    sort_order: 30,
    photo: "photo-1516979187457-637abb4f9353",
    description:
      "Popular Urdu novels, short stories, and literary voices from Pakistan.",
    meta_title: "Urdu literature",
    meta_description:
      "Shop popular Urdu novels and literature online with Cash on Delivery.",
  },
  {
    slug: "history-society",
    name: "History & Society",
    parent: "books",
    sort_order: 31,
    photo: "photo-1481627834876-b7833e8f5570",
    description:
      "Big ideas, world history, and books that explain how societies change.",
    meta_title: "History and society books",
    meta_description:
      "Shop history, society, and big-idea books from leading publishers.",
  },
];

export const BRAND_SEED = [
  {
    slug: "penguin-books",
    name: "Penguin Books",
    sort_order: 10,
    description:
      "A world-famous publisher of literary fiction, classics, and thoughtful non-fiction.",
  },
  {
    slug: "penguin-random-house",
    name: "Penguin Random House",
    sort_order: 12,
    description:
      "One of the world's largest trade publishers, home to bestselling fiction and non-fiction.",
  },
  {
    slug: "harpercollins",
    name: "HarperCollins",
    sort_order: 14,
    description:
      "A leading publisher of fiction, business, history, and children's books.",
  },
  {
    slug: "bloomsbury",
    name: "Bloomsbury",
    sort_order: 16,
    description:
      "Publisher of literary fiction, academic titles, and the Harry Potter series.",
  },
  {
    slug: "oxford-university-press",
    name: "Oxford University Press",
    sort_order: 18,
    description:
      "Trusted reference, academic, and English-language learning resources.",
  },
  {
    slug: "darussalam",
    name: "Darussalam",
    sort_order: 20,
    description:
      "Specialist publisher of authentic Islamic books, translations, and seerah.",
  },
  {
    slug: "ferozsons",
    name: "Ferozsons",
    sort_order: 22,
    description:
      "A long-established Pakistani publisher with a strong Urdu literature list.",
  },
  {
    slug: "plata-publishing",
    name: "Plata Publishing",
    sort_order: 24,
    description:
      "Publisher of personal-finance and business titles by Robert Kiyosaki.",
  },
  {
    slug: "hachette",
    name: "Hachette",
    sort_order: 26,
    description:
      "International publisher of business, lifestyle, and general non-fiction.",
  },
  {
    slug: "uniqlo",
    name: "Uniqlo",
    sort_order: 30,
    description:
      "Everyday clothing built around simple design, comfortable fabrics, and dependable quality.",
  },
  {
    slug: "levis",
    name: "Levi's",
    sort_order: 32,
    description:
      "The original denim brand, known for durable jeans and everyday classics.",
  },
  {
    slug: "nike",
    name: "Nike",
    sort_order: 34,
    description:
      "Performance-inspired sportswear and everyday staples for active lives.",
  },
  {
    slug: "adidas",
    name: "Adidas",
    sort_order: 36,
    description:
      "Sportswear and streetwear designed for movement, comfort, and everyday wear.",
  },
  {
    slug: "cos",
    name: "COS",
    sort_order: 38,
    description:
      "Considered, modern wardrobe pieces with clean lines and elevated fabrics.",
  },
  {
    slug: "mango",
    name: "Mango",
    sort_order: 40,
    description:
      "Contemporary women's fashion with a focus on polished everyday style.",
  },
  {
    slug: "the-north-face",
    name: "The North Face",
    sort_order: 42,
    description:
      "Outdoor-ready outerwear and technical layers built for cold and changing weather.",
  },
  {
    slug: "hm",
    name: "H&M",
    sort_order: 44,
    description: "Affordable everyday fashion for women, men, and kids.",
  },
  {
    slug: "zara",
    name: "Zara",
    sort_order: 46,
    description:
      "Trend-led clothing and accessories with a modern, city-ready point of view.",
  },
];

function skuToken(value) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildVariants(baseSku, sizes, colors, stockPerVariant) {
  const sizeList = sizes?.length ? sizes : [null];
  const colorList = colors?.length ? colors : [null];
  const variants = [];

  for (const size of sizeList) {
    for (const color of colorList) {
      const suffix = [size, color]
        .filter(Boolean)
        .map(skuToken)
        .filter(Boolean)
        .join("-");

      variants.push({
        size,
        color,
        sku: suffix ? `${baseSku}-${suffix}` : baseSku,
        price_delta: 0,
        stock: stockPerVariant,
        is_active: true,
        sort_order: variants.length,
      });
    }
  }

  return variants;
}

function clothingProduct({ sizes, colors, stockPerVariant, ...product }) {
  const variants = buildVariants(product.sku, sizes, colors, stockPerVariant);

  return {
    ...product,
    variants,
    stock: variants.reduce((total, variant) => total + variant.stock, 0),
  };
}

export const PRODUCT_SEED = [
  {
    slug: "the-midnight-library",
    title: "The Midnight Library",
    category: "fiction",
    brand: "penguin-books",
    price: 2495,
    discount_price: 1995,
    sku: "BK-FIC-001",
    stock: 18,
    is_featured: true,
    photo: "photo-1544947950-fa07a98d237f",
    short_description:
      "Matt Haig's moving bestseller about regret, possibility, and the lives we could have lived.",
    description:
      "Between life and death there is a library, and within it every book offers a different life.\n\nMatt Haig's beloved novel follows Nora Seed as she explores the choices that could have changed everything. A warm, uplifting read about hope, purpose, and second chances.\n\nFormat: Paperback\nLanguage: English\nPages: 304",
    variants: [],
  },
  {
    slug: "atomic-habits",
    title: "Atomic Habits",
    category: "business-self-development",
    brand: "penguin-random-house",
    price: 3495,
    discount_price: 2795,
    sku: "BK-BIZ-001",
    stock: 25,
    is_featured: true,
    photo: "photo-1543002588-bfa74002ed7e",
    short_description:
      "James Clear's practical framework for building good habits and breaking bad ones.",
    description:
      "A proven framework for getting 1% better every day.\n\nJames Clear explains how tiny changes in behaviour compound into remarkable results. Learn how to design cues, routines, and environments that make good habits easier and bad habits harder.\n\nFormat: Paperback\nLanguage: English\nPages: 320",
    variants: [],
  },
  {
    slug: "the-alchemist",
    title: "The Alchemist",
    category: "fiction",
    brand: "harpercollins",
    price: 1995,
    discount_price: 1595,
    sku: "BK-FIC-002",
    stock: 30,
    is_featured: true,
    photo: "photo-1512820790803-83ca734da794",
    short_description:
      "Paulo Coelho's timeless fable about following your dreams.",
    description:
      "A shepherd boy travels from Spain to the Egyptian desert in search of a treasure and discovers a deeper truth about purpose and possibility.\n\nPaulo Coelho's modern classic is a short, memorable fable about listening to your heart and recognising the opportunities already around you.\n\nFormat: Paperback\nLanguage: English\nPages: 208",
    variants: [],
  },
  {
    slug: "sapiens",
    title: "Sapiens: A Brief History of Humankind",
    category: "history-society",
    brand: "harpercollins",
    price: 3995,
    discount_price: 3295,
    sku: "BK-HIS-001",
    stock: 12,
    is_featured: false,
    photo: "photo-1519682337058-a94d519337bc",
    short_description:
      "Yuval Noah Harari's wide-ranging history of how Homo sapiens came to shape the world.",
    description:
      "How did Homo sapiens come to dominate the planet?\n\nYuval Noah Harari traces the cognitive, agricultural, and scientific revolutions that shaped human societies. A wide-ranging history for readers who enjoy big ideas and challenging questions.\n\nFormat: Paperback\nLanguage: English\nPages: 512",
    variants: [],
  },
  {
    slug: "the-sealed-nectar",
    title: "The Sealed Nectar (Ar-Raheeq Al-Makhtum)",
    category: "islamic-books",
    brand: "darussalam",
    price: 2795,
    discount_price: 2395,
    sku: "BK-ISL-001",
    stock: 20,
    is_featured: true,
    photo: "photo-1481627834876-b7833e8f5570",
    short_description:
      "An award-winning English biography of Prophet Muhammad (PBUH), based on authentic sources.",
    description:
      "An award-winning biography of Prophet Muhammad (PBUH), presented in clear, accessible English.\n\nThe Sealed Nectar combines authenticated sources with a readable narrative, covering the Prophet's life, character, and mission. A useful addition to any home library.\n\nFormat: Hardcover\nLanguage: English\nPages: 600",
    variants: [],
  },
  {
    slug: "rich-dad-poor-dad",
    title: "Rich Dad Poor Dad",
    category: "business-self-development",
    brand: "plata-publishing",
    price: 2195,
    discount_price: 1795,
    sku: "BK-BIZ-002",
    stock: 22,
    is_featured: false,
    photo: "photo-1524578271613-d550eacf6090",
    short_description:
      "Robert Kiyosaki's personal-finance classic about assets, income, and financial education.",
    description:
      'Robert Kiyosaki\'s personal-finance classic contrasts two very different approaches to money.\n\nThrough the lessons of his "rich dad" and "poor dad", Kiyosaki explores assets, income, financial education, and the habits that shape long-term wealth.\n\nFormat: Paperback\nLanguage: English\nPages: 336',
    variants: [],
  },
  {
    slug: "harry-potter-and-the-philosophers-stone",
    title: "Harry Potter and the Philosopher's Stone",
    category: "children-young-readers",
    brand: "bloomsbury",
    price: 2995,
    discount_price: 2495,
    sku: "BK-CHD-001",
    stock: 22,
    is_featured: false,
    photo: "photo-1497633762265-9d179a990aa6",
    short_description:
      "The first book in J.K. Rowling's beloved series about friendship, courage, and magic.",
    description:
      "The first book in J.K. Rowling's beloved series.\n\nOn his eleventh birthday, Harry Potter discovers that he is a wizard and begins his first year at Hogwarts. A page-turning introduction to friendship, courage, and magic for young readers and families.\n\nFormat: Paperback\nLanguage: English\nPages: 352",
    variants: [],
  },
  {
    slug: "peer-e-kamil",
    title: "Peer-e-Kamil (Urdu)",
    category: "urdu-literature",
    brand: "ferozsons",
    price: 1795,
    discount_price: 1495,
    sku: "BK-URD-001",
    stock: 15,
    is_featured: false,
    photo: "photo-1516979187457-637abb4f9353",
    short_description:
      "Umera Ahmed's bestselling Urdu novel about faith, identity, and transformation.",
    description:
      "Umera Ahmed's bestselling Urdu novel about faith, identity, and transformation.\n\nPeer-e-Kamil follows Salar and Imama through choices that test their beliefs and reshape their lives. A widely read modern Urdu classic.\n\nFormat: Paperback\nLanguage: Urdu\nPages: 608",
    variants: [],
  },
  {
    slug: "the-forty-rules-of-love",
    title: "The Forty Rules of Love",
    category: "fiction",
    brand: "penguin-books",
    price: 2195,
    discount_price: 1845,
    sku: "BK-FIC-003",
    stock: 17,
    is_featured: false,
    photo: "photo-1532012197267-da84d127e765",
    short_description:
      "Elif Shafak's novel about Rumi, Shams of Tabriz, and a life changed by a manuscript.",
    description:
      "A novel that moves between thirteenth-century Anatolia and contemporary America.\n\nElla Rubinstein begins a manuscript about Rumi and Shams of Tabriz, and the story gradually changes how she sees love, faith, and her own life. Elif Shafak blends history and fiction with warmth and insight.\n\nFormat: Paperback\nLanguage: English\nPages: 368",
    variants: [],
  },
  {
    slug: "deep-work",
    title: "Deep Work",
    category: "business-self-development",
    brand: "hachette",
    price: 3295,
    discount_price: 2745,
    sku: "BK-BIZ-003",
    stock: 14,
    is_featured: false,
    photo: "photo-1495446815901-a7297e633e8d",
    short_description:
      "Cal Newport's practical case for focused, distraction-free work in a busy world.",
    description:
      "Cal Newport argues that focused, distraction-free work is a rare and valuable skill.\n\nDeep Work offers practical rules for protecting attention, reducing shallow tasks, and producing meaningful work in a world full of notifications.\n\nFormat: Paperback\nLanguage: English\nPages: 304",
    variants: [],
  },
  {
    slug: "the-very-hungry-caterpillar",
    title: "The Very Hungry Caterpillar",
    category: "children-young-readers",
    brand: "penguin-random-house",
    price: 1595,
    discount_price: 1295,
    sku: "BK-CHD-002",
    stock: 25,
    is_featured: false,
    photo: "photo-1507842217343-583bb7270b66",
    short_description:
      "Eric Carle's timeless picture book about a tiny caterpillar with a very big appetite.",
    description:
      "Eric Carle's timeless picture book about a tiny caterpillar with a very big appetite.\n\nFollow the caterpillar through the week as it eats, grows, and finally becomes a beautiful butterfly. A gentle favourite for early readers and story time.\n\nFormat: Board book\nLanguage: English\nPages: 26",
    variants: [],
  },
  {
    slug: "oxford-advanced-learners-dictionary",
    title: "Oxford Advanced Learner's Dictionary (10th Edition)",
    category: "academic-reference",
    brand: "oxford-university-press",
    price: 4995,
    discount_price: 4495,
    sku: "BK-REF-001",
    stock: 10,
    is_featured: false,
    photo: "photo-1524995997946-a1c2e315a42f",
    short_description:
      "The definitive learner's dictionary for advanced English students.",
    description:
      "The definitive learner's dictionary for advanced English students.\n\nThe 10th edition includes clear definitions, example sentences, pronunciation guidance, and vocabulary support for academic and everyday English.\n\nFormat: Paperback\nLanguage: English\nPages: 1820",
    variants: [],
  },
  clothingProduct({
    slug: "classic-cotton-crew-tshirt",
    title: "Classic Cotton Crew Neck T-Shirt",
    category: "mens-clothing",
    brand: "uniqlo",
    price: 2490,
    discount_price: 1990,
    sku: "CL-MEN-001",
    is_featured: true,
    photo: "photo-1521572163474-6864f9cf17ab",
    short_description:
      "An everyday heavyweight cotton tee with a clean crew neck and comfortable regular fit.",
    description:
      "A clean, everyday crew neck made from soft heavyweight cotton.\n\nThe regular fit sits comfortably across the shoulders and body, while the ribbed collar keeps its shape. An easy base layer for jeans, chinos, or shorts.\n\nMaterial: 100% cotton\nFit: Regular\nCare: Machine wash cold",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Navy"],
    stockPerVariant: 4,
  }),
  clothingProduct({
    slug: "slim-fit-stretch-jeans",
    title: "Slim Fit Stretch Jeans",
    category: "mens-clothing",
    brand: "levis",
    price: 6990,
    discount_price: 5590,
    sku: "CL-MEN-002",
    is_featured: true,
    photo: "photo-1542272604-787c3835535d",
    short_description:
      "A modern slim fit with just enough stretch for all-day comfort.",
    description:
      "A modern slim fit with just enough stretch for all-day comfort.\n\nLevi's signature denim construction, a mid-rise waist, and a clean indigo finish make these jeans an easy choice for everyday wear.\n\nMaterial: 98% cotton, 2% elastane\nFit: Slim\nCare: Machine wash cold, inside out",
    sizes: ["30", "32", "34", "36"],
    colors: ["Indigo", "Black"],
    stockPerVariant: 4,
  }),
  clothingProduct({
    slug: "everyday-zip-hoodie",
    title: "Everyday Zip Hoodie",
    category: "mens-clothing",
    brand: "nike",
    price: 5990,
    discount_price: 4790,
    sku: "CL-MEN-003",
    is_featured: false,
    photo: "photo-1556821840-3a63f95609a7",
    short_description:
      "A soft zip-through hoodie for cool mornings and relaxed weekends.",
    description:
      "A soft zip-through hoodie for cool mornings and relaxed weekends.\n\nBrushed fleece inside, a full-length zip, and a roomy hood make this an easy layer over tees and shirts.\n\nMaterial: Cotton-rich fleece\nFit: Regular\nCare: Machine wash cold",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Heather Grey", "Black"],
    stockPerVariant: 3,
  }),
  clothingProduct({
    slug: "oversized-poplin-shirt",
    title: "Oversized Poplin Shirt",
    category: "womens-clothing",
    brand: "cos",
    price: 4990,
    discount_price: 3990,
    sku: "CL-WMN-001",
    is_featured: true,
    photo: "photo-1596755094514-f87e34085b2c",
    short_description:
      "An oversized poplin shirt with a crisp collar and relaxed drape.",
    description:
      "An oversized poplin shirt with a crisp collar and relaxed drape.\n\nWear it buttoned with tailored trousers or open over a simple tee. The clean silhouette works for the office and weekends alike.\n\nMaterial: Cotton poplin\nFit: Oversized\nCare: Machine wash cold",
    sizes: ["XS", "S", "M", "L"],
    colors: ["White", "Blue"],
    stockPerVariant: 3,
  }),
  clothingProduct({
    slug: "high-rise-straight-leg-jeans",
    title: "High-Rise Straight Leg Jeans",
    category: "womens-clothing",
    brand: "levis",
    price: 7490,
    discount_price: 5990,
    sku: "CL-WMN-002",
    is_featured: false,
    photo: "photo-1541099649105-f69ad21f3246",
    short_description:
      "A flattering high-rise jean with a straight leg and comfortable stretch.",
    description:
      "A flattering high-rise jean with a straight leg and comfortable stretch.\n\nThe clean waistband and classic five-pocket styling make these easy to dress up or down. Available in versatile blue and black washes.\n\nMaterial: Cotton blend with stretch\nFit: High-rise straight leg\nCare: Machine wash cold, inside out",
    sizes: ["26", "28", "30", "32"],
    colors: ["Blue", "Black"],
    stockPerVariant: 3,
  }),
  clothingProduct({
    slug: "ribbed-knit-midi-dress",
    title: "Ribbed Knit Midi Dress",
    category: "womens-clothing",
    brand: "mango",
    price: 6490,
    discount_price: 5190,
    sku: "CL-WMN-003",
    is_featured: false,
    photo: "photo-1595777457583-95e059d581b8",
    short_description:
      "A ribbed knit midi dress with a soft hand feel and flattering stretch.",
    description:
      "A ribbed knit midi dress with a soft hand feel and flattering stretch.\n\nThe simple neckline and clean lines make it easy to layer under a jacket or wear on its own. A comfortable choice for everyday plans.\n\nMaterial: Ribbed cotton blend\nFit: Body-skimming\nCare: Machine wash cold",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Olive"],
    stockPerVariant: 2,
  }),
  clothingProduct({
    slug: "lightweight-running-jacket",
    title: "Lightweight Running Jacket",
    category: "outerwear",
    brand: "adidas",
    price: 8990,
    discount_price: 7190,
    sku: "CL-OUT-001",
    is_featured: false,
    photo: "photo-1551028719-00167b16eac5",
    short_description:
      "A lightweight running jacket built for breezy morning runs and active days.",
    description:
      "A lightweight running jacket built for breezy morning runs and active days.\n\nThe smooth shell resists light wind, while the full zip and side pockets keep essentials close. Reflective details add visibility in low light.\n\nMaterial: Recycled polyester\nFit: Regular\nCare: Machine wash cold",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Blue"],
    stockPerVariant: 2,
  }),
  clothingProduct({
    slug: "water-repellent-puffer-jacket",
    title: "Water-Repellent Puffer Jacket",
    category: "outerwear",
    brand: "the-north-face",
    price: 16990,
    discount_price: 13590,
    sku: "CL-OUT-002",
    is_featured: true,
    photo: "photo-1544923246-77307dd654cb",
    short_description:
      "A warm, water-repellent puffer jacket for cold and unpredictable weather.",
    description:
      "A warm, water-repellent puffer jacket for cold and unpredictable weather.\n\nSynthetic insulation traps heat without excess weight, and the adjustable hood adds extra protection. Designed for city commutes and weekend trips.\n\nMaterial: Water-repellent shell with synthetic insulation\nFit: Regular\nCare: Machine wash cold, tumble dry low",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Beige"],
    stockPerVariant: 2,
  }),
  clothingProduct({
    slug: "relaxed-linen-blend-shirt",
    title: "Relaxed Linen Blend Shirt",
    category: "mens-clothing",
    brand: "hm",
    price: 3490,
    discount_price: 2790,
    sku: "CL-MEN-004",
    is_featured: false,
    photo: "photo-1602810318383-e386cc2a3ccf",
    short_description:
      "A relaxed linen-blend shirt with a soft, breathable finish.",
    description:
      "A relaxed linen-blend shirt with a soft, breathable finish.\n\nThe natural texture and easy cut make it a warm-weather favourite. Wear it buttoned or open over a vest or tee.\n\nMaterial: Linen-cotton blend\nFit: Relaxed\nCare: Machine wash cold, line dry",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "White"],
    stockPerVariant: 3,
  }),
  clothingProduct({
    slug: "cotton-cargo-joggers",
    title: "Cotton Cargo Joggers",
    category: "mens-clothing",
    brand: "zara",
    price: 4990,
    discount_price: 3990,
    sku: "CL-MEN-005",
    is_featured: false,
    photo: "photo-1552374196-c4e7ffc6e126",
    short_description:
      "Relaxed cargo joggers with a comfortable elastic waist and practical pockets.",
    description:
      "Relaxed cargo joggers with a comfortable elastic waist and practical pockets.\n\nThe soft cotton blend moves easily from errands to weekends, while the tapered leg keeps the silhouette clean.\n\nMaterial: Cotton blend\nFit: Relaxed tapered\nCare: Machine wash cold",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Khaki", "Black"],
    stockPerVariant: 3,
  }),
  clothingProduct({
    slug: "canvas-tote-bag",
    title: "Canvas Tote Bag",
    category: "accessories",
    brand: "uniqlo",
    price: 1990,
    discount_price: 1590,
    sku: "CL-ACC-001",
    is_featured: false,
    photo: "photo-1590874103328-eac38a683ce7",
    short_description:
      "A durable canvas tote for groceries, work essentials, and everyday errands.",
    description:
      "A durable canvas tote for groceries, work essentials, and everyday errands.\n\nThe wide base and reinforced handles carry comfortably, and the simple shape folds flat when not in use.\n\nMaterial: Cotton canvas\nSize: 38 x 42 cm\nCare: Spot clean",
    sizes: [],
    colors: ["Natural", "Black"],
    stockPerVariant: 10,
  }),
  clothingProduct({
    slug: "structured-leather-crossbody-bag",
    title: "Structured Leather Crossbody Bag",
    category: "accessories",
    brand: "mango",
    price: 6490,
    discount_price: 5190,
    sku: "CL-ACC-002",
    is_featured: false,
    photo: "photo-1553062407-98eeb64c6a62",
    short_description:
      "A structured crossbody bag with a clean, minimal finish.",
    description:
      "A structured crossbody bag with a clean, minimal finish.\n\nThe compact interior holds a phone, wallet, and daily essentials, while the adjustable strap can be worn across the body or on the shoulder.\n\nMaterial: Leather-look finish\nSize: 24 x 18 x 8 cm\nCare: Wipe with a soft dry cloth",
    sizes: [],
    colors: ["Tan", "Black"],
    stockPerVariant: 6,
  }),
  clothingProduct({
    slug: "kids-cotton-graphic-tshirt",
    title: "Kids Cotton Graphic T-Shirt",
    category: "kids-clothing",
    brand: "hm",
    price: 1490,
    discount_price: 1190,
    sku: "CL-KID-001",
    is_featured: false,
    photo: "photo-1519238263530-99bdd11df2ea",
    short_description:
      "A soft cotton t-shirt made for playgrounds, school days, and everything in between.",
    description:
      "A soft cotton t-shirt made for playgrounds, school days, and everything in between.\n\nThe relaxed fit and playful graphic print keep it comfortable, while the durable cotton holds up to repeated washes.\n\nMaterial: 100% cotton\nFit: Regular\nCare: Machine wash cold",
    sizes: ["4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    colors: ["Blue", "White"],
    stockPerVariant: 4,
  }),
];
