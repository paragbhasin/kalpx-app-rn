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
  rating?: number;
  description?: string;
  location?: string;
  details?: Record<string, string>;
};

export type HaatServicePackage = {
  id: number;
  serviceId: number;
  name: string;
  price: number;
  deposit: number;
  badge?: string;
  features: string[];
  included: string[];
  excluded: string[];
  addOns: {
    name: string;
    desc: string;
    price: number;
    selected?: boolean;
  }[];
  highlights: string[];
  slots: string[];
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
    name: "Diwali Decoration",
    image: "/haat-assets/service-card.png",
    provider: "Divine Floral Decoration Service",
    price: "Starting from 10,000",
    rating: 4,
    location: "Chennai",
    description:
      "Festive Diwali decoration with lights, floral arrangements, rangoli, and traditional decor to create an auspicious atmosphere at home or temple.",
    details: {
      "Setup Time": "2-3 Hours",
      "Service Mode": "At Your Location",
      "Team Size": "2 Members",
      "Cleanup Included": "Yes",
    },
  },
  {
    id: 2,
    name: "Pandit Booking for Home Pooja",
    image: "/haat-assets/service2.png",
    provider: "Om Pandit Seva Kendra",
    price: "Starting from 4,999",
    rating: 4.5,
    location: "Chennai",
    description:
      "Experienced pandits offering guided rituals, sankalpam, and complete pooja assistance at your location.",
    details: {
      "Setup Time": "1-2 Hours",
      "Service Mode": "At Your Location",
      "Team Size": "1 Pandit",
      "Cleanup Included": "No",
    },
  },
  {
    id: 3,
    name: "Temple Offering Assistance",
    image: "/haat-assets/service3.png",
    provider: "MA Decoration Service",
    price: "Starting from 2,999",
    rating: 4.5,
    location: "Chennai",
    description:
      "Complete offering support for temple visits, festive rituals, and doorstep arrangement of offerings.",
    details: {
      "Setup Time": "1 Hour",
      "Service Mode": "Temple / Doorstep",
      "Team Size": "2 Members",
      "Cleanup Included": "Yes",
    },
  },
];

export const haatServicePackages: HaatServicePackage[] = [
  {
    id: 1,
    serviceId: 1,
    name: "Basic Package",
    price: 12000,
    deposit: 2000,
    features: [
      "Traditional theme setup",
      "LED string lighting & diyas",
      "Entrance toran & backdrop",
      "On-site setup and cleanup",
    ],
    included: [
      "Traditional theme setup",
      "LED string lighting & diyas",
      "Entrance toran & backdrop",
    ],
    excluded: [
      "Floral rangoli setup at entrance",
      "Setup & takedown assistance",
      "Personal Expenses",
    ],
    addOns: [
      {
        name: "Extra rose flower",
        desc: "Extra rose Flower",
        price: 200,
        selected: true,
      },
      {
        name: "Extra Lighting",
        desc: "Extra Lighting",
        price: 1000,
      },
    ],
    highlights: [
      "Elegant, minimal Diwali-themed setup",
      "Quick 1-hour installation",
      "Ideal for home or small gatherings",
      "Traditional aesthetic with floral and diya elements",
      "Budget-friendly festive makeover",
      "Free cancellation up to 24 hours before service",
    ],
    slots: [
      "6.00 AM - 8.00 AM",
      "6.00 PM - 8.00 PM",
      "10.00 PM - 12.00 PM",
      "02.00 PM - 4.00 PM",
    ],
  },
  {
    id: 2,
    serviceId: 1,
    name: "Advance Package",
    price: 20000,
    deposit: 5000,
    badge: "PremiumPackage",
    features: [
      "Premium Diwali theme setup",
      "LED lights, lanterns, and diyas",
      "Floral entrance arch & stage backdrop",
      "Cleanup and material pickup included",
    ],
    included: [
      "Premium Diwali theme setup",
      "LED lights, lanterns, and diyas",
      "Floral entrance arch & stage backdrop",
    ],
    excluded: [
      "Personal shopping for external decor",
      "Live artist arrangements",
      "Personal Expenses",
    ],
    addOns: [
      {
        name: "Fresh marigold garlands",
        desc: "Stage and entrance upgrade",
        price: 1200,
        selected: true,
      },
      {
        name: "Extra diya lighting",
        desc: "100 additional diyas",
        price: 800,
      },
    ],
    highlights: [
      "Premium festive look for family events",
      "Floral and light styling included",
      "Best for larger home celebrations",
      "Cleanup handled by service team",
    ],
    slots: [
      "8.00 AM - 10.00 AM",
      "12.00 PM - 2.00 PM",
      "4.00 PM - 6.00 PM",
      "7.00 PM - 9.00 PM",
    ],
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
  return (
    [...trustedProductStores, ...trustedServiceStores].find(
      (item) => item.id === id,
    ) ?? trustedServiceStores[0]
  );
}

export function getHaatServiceById(id: number) {
  return haatServices.find((item) => item.id === id) ?? haatServices[0];
}

export function getHaatServicePackages(serviceId: number) {
  return haatServicePackages.filter((item) => item.serviceId === serviceId);
}

export function getHaatServicePackageById(packageId: number) {
  return haatServicePackages.find((item) => item.id === packageId) ?? haatServicePackages[0];
}
