export type User = {
  id: string;
  username: string;
  avatar: string;
  followers: number;
  following: number;
  likes: number;
  isVerified?: boolean;
  role: 'user' | 'admin';
  email?: string;
  phone?: string;
  warningCount?: number;
};

export type Comment = {
  id: string;
  authorId: string;
  text: string;
  timestamp: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  authorId: string;
  category: string;
  image: string;
  ingredients: string[];
  steps: string[];
  likes: number;
  comments: Comment[];
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
};

export type Notification = {
  id: string;
  type: 'like' | 'comment' | 'feature' | 'system';
  text: string;
  read: boolean;
  timestamp: string;
};

export const MOCK_USERS: Record<string, User> = {
  u1: {
    id: 'u1',
    username: 'Boss Seth',
    avatar: '/Boss seth pfp.jpg',
    followers: 450000,
    following: 12,
    likes: 5400000,
    isVerified: true,
    role: 'admin',
    email: 'seth@sethkusina.com',
    phone: '0905 579 5929'
  },
  u2: {
    id: 'u2',
    username: 'ChefJuan',
    avatar:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    followers: 120,
    following: 45,
    likes: 532,
    role: 'user',
    email: 'juan@example.com',
    phone: '09181234567'
  },
  u3: {
    id: 'u3',
    username: 'MariaCooks',
    avatar:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    followers: 890,
    following: 120,
    likes: 3400,
    role: 'user',
    email: 'maria@example.com',
    phone: '09191234567'
  },
  admin: {
    id: 'admin',
    username: 'Admin',
    avatar:
    'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80',
    followers: 0,
    following: 0,
    likes: 0,
    role: 'admin',
    email: 'admin@sethkusina.com',
    phone: '09201234567'
  }
};

export const CATEGORIES = [
{
  id: 'boss-seth',
  name: 'Mga Trip ni Boss Seth',
  color: 'bg-primary-100 text-primary-700'
},
{
  id: 'community',
  name: 'Eksperimento ng Bayan',
  color: 'bg-purple-100 text-purple-700'
},
{
  id: 'budget',
  name: 'Petsa de Peligro Meals',
  color: 'bg-green-100 text-green-700'
},
{
  id: 'traditional',
  name: 'Luto ni Nanay',
  color: 'bg-blue-100 text-blue-700'
}];


export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'r5',
    title: 'Matcha Fried Chicken',
    description: 'Unique green tea fried chicken na may subtle matcha flavor. Perfect sa mga adventurous eaters!',
    authorId: 'u1',
    category: 'boss-seth',
    image: '/Matcha Fried Chicken.jfif',
    ingredients: [
      'chicken',
      'matcha',
      'breading mix'
    ],
    steps: [
      'Prepare the chicken pieces.',
      'Mix matcha powder with breading mix.',
      'Coat chicken in the matcha breading mixture.',
      'Fry until golden brown and crispy.',
      'Serve hot and enjoy!'
    ],
    likes: 0,
    comments: [],
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'r6',
    title: 'Mango Graham (Hilaw na Manga)',
    description: 'Classic mango graham cake na gumagamit ng hilaw na manga para sa tamang asim at tamis!',
    authorId: 'u1',
    category: 'boss-seth',
    image: '/Mango Graham (Hilaw na mangga).jfif',
    ingredients: [
      'manga',
      'graham cracker',
      'crashed graham',
      'evaporated milk',
      'all purpose cream'
    ],
    steps: [
      'Slice the mangoes thinly.',
      'Crush graham crackers into fine crumbs.',
      'Mix evaporated milk and all-purpose cream.',
      'Layer graham crackers at the bottom.',
      'Add cream mixture on top.',
      'Add mango slices on top.',
      'Repeat layers.',
      'Chill for at least 4 hours before serving.'
    ],
    likes: 0,
    comments: [],
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'r7',
    title: 'Ulo-Ulo Q',
    description: 'Crispy chicken heads na perfect sa inuman! Street food favorite!',
    authorId: 'u1',
    category: 'boss-seth',
    image: '/ulo ulo q.jfif',
    ingredients: [
      'ulo ng manok',
      'stick',
      'sugar'
    ],
    steps: [
      'Clean the chicken heads thoroughly.',
      'Put on sticks for easy handling.',
      'Deep fry until golden brown and crispy.',
      'Sprinkle with sugar while hot.',
      'Serve with your favorite dipping sauce.'
    ],
    likes: 0,
    comments: [],
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'r8',
    title: 'Milk Fish Tapioca',
    description: 'Unique dessert na combination ng bangus at tapioca! Sweet and creamy!',
    authorId: 'u1',
    category: 'boss-seth',
    image: '/Fish Tapioca.jfif',
    ingredients: [
      'bangus',
      'gatas',
      'asuka',
      'sago'
    ],
    steps: [
      'Cook the bangus and flake the meat.',
      'Prepare sago pearls according to package.',
      'Mix milk and sugar in a pot.',
      'Add flaked bangus to the milk mixture.',
      'Add cooked sago pearls.',
      'Simmer until thickened.',
      'Serve warm or chilled.'
    ],
    likes: 0,
    comments: [],
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'r9',
    title: 'Tinolang Chicken Nuggets',
    description: 'Fusion dish na naghalo ang crispy chicken nuggets sa classic tinola flavor!',
    authorId: 'u1',
    category: 'boss-seth',
    image: '/Tinolang chicken nuggets.jfif',
    ingredients: [
      'chicken nuggets',
      'ginger',
      'garlic',
      'onion',
      'papaya',
      'chili leaves',
      'fish sauce',
      'water'
    ],
    steps: [
      'Sauté ginger, garlic, and onion.',
      'Add chicken nuggets and cook until brown.',
      'Add water and fish sauce.',
      'Add papaya and simmer until tender.',
      'Add chili leaves last.',
      'Serve hot with rice.'
    ],
    likes: 0,
    comments: [],
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'r10',
    title: 'Sinigang sa Yakee',
    description: 'Sinigang na may special twist gamit ang yakee! Unique flavor combination!',
    authorId: 'u1',
    category: 'boss-seth',
    image: '/Sinigang sa yakee.jfif',
    ingredients: [
      'pork',
      'yakee',
      'water',
      'onion',
      'tomatoes',
      'radish',
      'eggplant',
      'string beans',
      'fish sauce'
    ],
    steps: [
      'Boil pork in water until tender.',
      'Add yakee and simmer for flavor.',
      'Add onions and tomatoes.',
      'Add vegetables in order: radish, eggplant, string beans.',
      'Season with fish sauce.',
      'Simmer until vegetables are cooked.',
      'Serve hot with rice.'
    ],
    likes: 0,
    comments: [],
    status: 'approved',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [];