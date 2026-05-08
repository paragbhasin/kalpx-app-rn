export type HaatStore = {
  id: number;
  store_name: string;
  image: string;
  rating: string;
  time: string;
  distance: string;
  location?: string;
  description?: string;
  open?: string;
  close?: string;
  phoenNumber?: string;
};

export type HaatProduct = {
  id: number;
  name: string;
  price_minor: number;
  images: { url: string }[];
  store: { id: number; store_name: string };
  rating: number;
  description: string;
  attributes: Record<string, string>;
};

export type HaatService = {
  id: number;
  name: string;
  image: string;
  provider: string;
  price: string;
};

export type HaatOrder = {
  id: number;
  kind: "product" | "service";
  status: "delivered" | "in_progress" | "packaging" | "cancelled";
  title: string;
  seller: string;
  image: string;
  quantity?: number;
  priceLabel: string;
  bookingDate?: string;
  slot?: string;
};

export const trustedProductStores: HaatStore[] = [
  {
    id: 1,
    store_name: "Swami Sughandhlay",
    image:
      "https://images.unsplash.com/photo-1620619767323-b95a89183081?q=80&w=1200&auto=format&fit=crop",
    rating: "4.9+",
    time: "40-50 min",
    distance: "900m away",
    location: "Chennai",
    description: "High quality brass diyas perfect for festivals.",
    open: "9:00 AM",
    close: "9:00 PM",
    phoenNumber: "9876543210",
  },
  {
    id: 2,
    store_name: "Vedic Vibes",
    image:
      "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=1200&auto=format&fit=crop",
    rating: "4.7",
    time: "30-40 min",
    distance: "1.2km away",
    location: "Chennai",
    description: "Elegant brass diyas to light up your celebrations.",
    open: "9:00 AM",
    close: "9:00 PM",
    phoenNumber: "9876543210",
  },
  {
    id: 3,
    store_name: "Temple Basket",
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop",
    rating: "4.8",
    time: "25-35 min",
    distance: "1.0km away",
    location: "Delhi",
    description: "Curated pooja baskets and premium ritual essentials.",
    open: "9:00 AM",
    close: "9:00 PM",
    phoenNumber: "9898989898",
  },
];

export const trustedServiceStores: HaatStore[] = [
  {
    id: 4,
    store_name: "Divine Floral Decoration Service",
    image: "/haat-assets/service1.png",
    rating: "4.9+",
    time: "40-50 min",
    distance: "900m away",
    location: "123 Main Bazar",
    description:
      "Professional festive and ceremonial decoration services for puja, weddings, and special occasions.",
    open: "8 am",
    close: "11 pm",
    phoenNumber: "982345672",
  },
  {
    id: 5,
    store_name: "Om Pandit Seva Kendra",
    image: "/haat-assets/service2.png",
    rating: "4.7",
    time: "30-40 min",
    distance: "1.2km away",
    location: "Chennai",
    description:
      "Experienced pandits offering a wide range of religious services and rituals for all occasions.",
    open: "9:00 AM",
    close: "9:00 PM",
    phoenNumber: "9876543210",
  },
  {
    id: 6,
    store_name: "MA Decoration Service",
    image: "/haat-assets/service3.png",
    rating: "4.8",
    time: "35-45 min",
    distance: "1.4km away",
    location: "Chennai",
    description:
      "Expert decoration services for festivals, weddings, and special events with a focus on quality and creativity.",
    open: "9:00 AM",
    close: "9:00 PM",
    phoenNumber: "9876543210",
  },
];

export const haatProducts: HaatProduct[] = [
  {
    id: 1,
    name: "Brass Diya Set",
    price_minor: 499,
    images: [
      {
        url: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    store: { id: 1, store_name: "Swami Sughandhlay" },
    rating: 4.9,
    description:
      "Handcrafted short diyas made from fine brass, perfect for daily pooja and festive lighting. Compact, elegant, and designed to spread a warm, peaceful glow in any sacred space.",
    attributes: {
      material: "Brass",
      "Product Height": "3 cm",
      colour: "Golden",
      weight: "100 g",
    },
  },
  {
    id: 2,
    name: "Premium Pooja Kit",
    price_minor: 899,
    images: [
      {
        url: "https://images.unsplash.com/photo-1516632664305-eda5d0702cfd?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    store: { id: 3, store_name: "Temple Basket" },
    rating: 4.2,
    description: "Elegant brass diyas to light up your celebrations.",
    attributes: {
      material: "Brass",
      "Product Height": "Large",
      colour: "Golden",
      weight: "750 g",
    },
  },
  {
    id: 3,
    name: "Essential Oil Combo",
    price_minor: 649,
    images: [
      {
        url: "https://images.unsplash.com/photo-1611071536594-7f4f3fe46d63?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    store: { id: 2, store_name: "Vedic Vibes" },
    rating: 4.2,
    description: "Elegant brass diyas to light up your celebrations.",
    attributes: {
      material: "Brass",
      "Product Height": "Large",
      colour: "Golden",
      weight: "750 g",
    },
  },
];

export const haatServices: HaatService[] = [
  {
    id: 1,
    name: "Pandit Booking for Home Pooja",
    image:
      "https://images.unsplash.com/photo-1604608672516-f1b6bb27f5c2?q=80&w=1200&auto=format&fit=crop",
    provider: "Om Pandit Seva Kendra",
    price: "Starts at ₹1499",
  },
  {
    id: 2,
    name: "Festival Floral Decoration",
    image:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200&auto=format&fit=crop",
    provider: "Divine Floral Decoration Service",
    price: "Starts at ₹2499",
  },
  {
    id: 3,
    name: "Temple Offering Assistance",
    image:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=1200&auto=format&fit=crop",
    provider: "MA Decoration Service",
    price: "Starts at ₹999",
  },
];

export const haatOrders: HaatOrder[] = [
  {
    id: 1,
    kind: "product",
    status: "delivered",
    title: "Chandan AgarBatti",
    seller: "Pooja Bhandar",
    image:
      "https://images.unsplash.com/photo-1633457896880-6f23d83fc0f9?q=80&w=800&auto=format&fit=crop",
    quantity: 1,
    priceLabel: "₹120/-",
  },
  {
    id: 2,
    kind: "service",
    status: "in_progress",
    title: "Pandal Decoration",
    seller: "Pooja Bhandar",
    image:
      "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=800&auto=format&fit=crop",
    priceLabel: "₹12,000/-",
    bookingDate: "23 Dec 2025",
    slot: "8 AM - 10 PM",
  },
];

export function getHaatProductById(id: number) {
  return haatProducts.find((item) => item.id === id) ?? haatProducts[0];
}

export function getHaatStoreById(id: number) {
  return [...trustedProductStores, ...trustedServiceStores].find(
    (item) => item.id === id,
  ) ?? trustedServiceStores[0];
}
