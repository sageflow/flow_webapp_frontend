// Date utilities
export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', String(day));
};

export const getDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return formatDate(today) === formatDate(checkDate);
};

export const isThisWeek = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  
  return checkDate >= weekStart && checkDate <= weekEnd;
};

export const isThisMonth = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return today.getMonth() === checkDate.getMonth() && 
         today.getFullYear() === checkDate.getFullYear();
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const generateTrackingCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Number utilities
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const roundToDecimal = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return roundToDecimal((value / total) * 100);
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const groupBy = <T, K extends string | number>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = key(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const sortBy = <T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Object utilities
export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Indian phone number format: starts with 6-9, exactly 10 digits
  const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(cleanedPhone);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && 
         /[a-z]/.test(password) && 
         /[A-Z]/.test(password) && 
         /\d/.test(password);
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
};

// Storage utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Error handling utilities
export const handleError = (error: unknown, context: string = 'Unknown'): string => {
  console.error(`Error in ${context}:`, error);
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('Network') || 
           error.message.includes('fetch') ||
           error.message.includes('timeout');
  }
  return false;
};

// Color utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const getContrastColor = (hexColor: string): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// Time utilities
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

// URL utilities
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

export const parseQueryString = (queryString: string): Record<string, string> => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

// Constant conversion utilities
export const formatConstantToLabel = (constant: string): string => {
  return constant
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatConstantToDisplayValue = (constant: string): string => {
  // If constant already contains spaces or is in display format, return as-is
  if (constant.includes(' ') || constant.match(/^[a-z]/i)) {
    return constant;
  }
  if (constant.includes('_GRADE')) {
    return constant.replace('_GRADE', ' Grade');
  }
  if (constant === 'PREFER_NOT_TO_SAY') {
    return 'Prefer not to say';
  }
  return formatConstantToLabel(constant);
};

export const getConstantOptions = (constants: readonly string[]): Array<{ value: string; label: string }> => {
  return constants.map(constant => ({
    value: constant,
    label: formatConstantToDisplayValue(constant),
  }));
};

// Map display names to enum names for Hobby
export const hobbyDisplayNameToEnum = (displayName: string): string => {
  const hobbyMap: Record<string, string> = {
    'Soccer ⚽': 'SOCCER',
    'Basketball 🏀': 'BASKETBALL',
    'Baseball ⚾': 'BASEBALL',
    'Hockey 🏒': 'HOCKEY',
    'Volleyball 🏐': 'VOLLEYBALL',
    'Swimming 🏊': 'SWIMMING',
    'Running 🏃': 'RUNNING',
    'Gymnastics 🤸': 'GYMNASTICS',
    'Karate 🥋': 'KARATE',
    'Taekwondo 🥋': 'TAEKWONDO',
    'Judo 🥋': 'JUDO',
    'Skateboarding 🛹': 'SKATEBOARDING',
    'Cycling 🚴': 'CYCLING',
    'Horseback Riding 🏇': 'HORSEBACK_RIDING',
    'Tennis 🎾': 'TENNIS',
    'Golf ⛳': 'GOLF',
    'Hiking 🥾': 'HIKING',
    'Camping ⛺': 'CAMPING',
    'Climbing 🧗': 'CLIMBING',
    'Fishing 🎣': 'FISHING',
    'Ballet 🩰': 'BALLET',
    'Hip Hop 🕺': 'HIP_HOP',
    'Jazz 🎷': 'JAZZ',
    'Tap 👟': 'TAP',
    'Contemporary 💃': 'CONTEMPORARY',
    'Cultural Dances 🌍': 'CULTURAL_DANCES',
    'Park Play 🏞️': 'PARK_PLAY',
    'Trampolining 🤸': 'TRAMPOLINING',
    'Tag 🏃‍♂️': 'TAG',
    'Drawing ✏️': 'DRAWING',
    'Painting 🎨': 'PAINTING',
    'Coloring 🖍️': 'COLORING',
    'Sculpting 🗿': 'SCULPTING',
    'Crafting ✂️': 'CRAFTING',
    'Playing Instrument 🎵': 'PLAYING_INSTRUMENT',
    'Singing 🎤': 'SINGING',
    'Listening To Music 🎧': 'LISTENING_TO_MUSIC',
    'Acting 🎭': 'ACTING',
    'Magic Tricks 🎩': 'MAGIC_TRICKS',
    'Puppetry 🧸': 'PUPPETRY',
    'Lego Building 🧱': 'LEGO_BUILDING',
    'Model Building 🏗️': 'MODEL_BUILDING',
    'Woodworking 🪚': 'WOODWORKING',
    'Digital Art 💻': 'DIGITAL_ART',
    'Animation 🎬': 'ANIMATION',
    'Video Editing 📹': 'VIDEO_EDITING',
    'Music Composition 🎼': 'MUSIC_COMPOSITION',
    'Creative Writing 📝': 'CREATIVE_WRITING',
    'Journaling 📔': 'JOURNALING',
    'Comic Book Creation 📚': 'COMIC_BOOK_CREATION',
    'Jigsaw Puzzles 🧩': 'JIGSAW_PUZZLES',
    'Logic Puzzles 🧠': 'LOGIC_PUZZLES',
    'Brain Teasers 🤔': 'BRAIN_TEASERS',
    'Board Games 🎲': 'BOARD_GAMES',
    'Card Games 🃏': 'CARD_GAMES',
    'Chess ♟️': 'CHESS',
    'Checkers ⚫': 'CHECKERS',
    'Strategy Games 🎯': 'STRATEGY_GAMES',
    'Sports Cards 🏈': 'SPORTS_CARDS',
    'Trading Cards 🎴': 'TRADING_CARDS',
    'Collecting Stickers ⭐': 'COLLECTING_STICKERS',
    'Rock Collecting 🪨': 'ROCK_COLLECTING',
    'Coin Collecting 🪙': 'COIN_COLLECTING',
    'Stamp Collecting 📮': 'STAMP_COLLECTING',
    'Action Figure Collecting 🤖': 'ACTION_FIGURE_COLLECTING',
    'Toy Collecting 🧸': 'TOY_COLLECTING',
    'Leaf Collecting 🍃': 'LEAF_COLLECTING',
    'Shell Collecting 🐚': 'SHELL_COLLECTING',
    'Video Gaming 🎮': 'VIDEO_GAMING',
    'Online Gaming 🖥️': 'ONLINE_GAMING',
    'Coding 💻': 'CODING',
    'Robotics 🤖': 'ROBOTICS',
    'Watching Youtube 📺': 'WATCHING_YOUTUBE',
    'Watching Twitch 📱': 'WATCHING_TWITCH',
    'Listening To Podcasts 🎙️': 'LISTENING_TO_PODCASTS',
    'Photography 📷': 'PHOTOGRAPHY',
    'Videography 🎥': 'VIDEOGRAPHY',
    'Gardening 🌱': 'GARDENING',
    'Pet Care 🐕': 'PET_CARE',
    'Bird Watching 🔭': 'BIRD_WATCHING',
    'Insect Observing 🔍': 'INSECT_OBSERVING',
    'Nature Exploring 🌲': 'NATURE_EXPLORING',
    'Plant Identifying 🌿': 'PLANT_IDENTIFYING',
    'Bird Identifying 🐦': 'BIRD_IDENTIFYING',
    'Insect Identifying 🦋': 'INSECT_IDENTIFYING',
    'Star Gazing ⭐': 'STAR_GAZING',
    'Astronomy 🔭': 'ASTRONOMY',
    'Reading Fiction 📖': 'READING_FICTION',
    'Reading Comics 📚': 'READING_COMICS',
    'Reading Manga 📘': 'READING_MANGA',
    'Reading Nonfiction 📗': 'READING_NONFICTION',
    'Cooking 👨‍🍳': 'COOKING',
    'Baking 🧁': 'BAKING',
    'Scale Modeling 🏠': 'SCALE_MODELING',
    'Tabletop Role Playing 🎲': 'TABLETOP_ROLE_PLAYING',
    'Socializing 👥': 'SOCIALIZING',
    'Watching Sports 📺': 'WATCHING_SPORTS',
    'Watching Movies 🎬': 'WATCHING_MOVIES',
    'Watching Tv Series 📺': 'WATCHING_TV_SERIES',
  };
  
  // If already an enum name, return as is
  if (displayName === displayName.toUpperCase() && displayName.includes('_')) {
    return displayName;
  }
  
  // Try to find in map, otherwise try to convert display name
  return hobbyMap[displayName] || displayName.toUpperCase().replace(/\s+/g, '_');
};

// Map display names to enum names for Profession
export const professionDisplayNameToEnum = (displayName: string): string => {
  const professionMap: Record<string, string> = {
    'Actor 🎭': 'ACTOR',
    'Comic Artist 📚': 'COMIC_ARTIST',
    'Dancer 💃': 'DANCER',
    'Director 🎬': 'DIRECTOR',
    'Magician 🎩': 'MAGICIAN',
    'Movie Star 🌟': 'MOVIE_STAR',
    'Musician 🎵': 'MUSICIAN',
    'Painter 🎨': 'PAINTER',
    'Rockstar 🎸': 'ROCKSTAR',
    'Singer 🎤': 'SINGER',
    'Youtuber 📹': 'YOUTUBER',
    'Architect 📐': 'ARCHITECT',
    'Astronaut 👨‍🚀': 'ASTRONAUT',
    'Astronomer 🔭': 'ASTRONOMER',
    'Biologist 🔬': 'BIOLOGIST',
    'Chemist ⚗️': 'CHEMIST',
    'Computer Programmer 💻': 'COMPUTER_PROGRAMMER',
    'Engineer ⚙️': 'ENGINEER',
    'Game Developer 🎮': 'GAME_DEVELOPER',
    'Marine Biologist 🐠': 'MARINE_BIOLOGIST',
    'Palaeontologist 🦕': 'PALAEONTOLOGIST',
    'Scientist 🔬': 'SCIENTIST',
    'Video Game Tester 🕹️': 'VIDEO_GAME_TESTER',
    'Website Designer 💻': 'WEBSITE_DESIGNER',
    'Zoologist 🦁': 'ZOOLOGIST',
    'Dentist 🦷': 'DENTIST',
    'Doctor 👩‍⚕️': 'DOCTOR',
    'Nurse 👨‍⚕️': 'NURSE',
    'Veterinarian 👩‍⚕️': 'VETERINARIAN',
    'Detective 🕵️': 'DETECTIVE',
    'Firefighter 🚒': 'FIREFIGHTER',
    'Judge ⚖️': 'JUDGE',
    'Lawyer ⚖️': 'LAWYER',
    'Police Officer 👮': 'POLICE_OFFICER',
    'Politician 🏛️': 'POLITICIAN',
    'Soldier 🪖': 'SOLDIER',
    'President 🏛️': 'PRESIDENT',
    'Prime Minister 🏛️': 'PRIME_MINISTER',
    'Princess 👸': 'PRINCESS',
    'Prince 🤴': 'PRINCE',
    'Queen 👑': 'QUEEN',
    'King 👑': 'KING',
    'Athlete 🏃': 'ATHLETE',
    'Racecar Driver 🏎️': 'RACECAR_DRIVER',
    'Soccer Player ⚽': 'SOCCER_PLAYER',
    'Author ✍️': 'AUTHOR',
    'Fashion Designer 👗': 'FASHION_DESIGNER',
    'Journalist 📰': 'JOURNALIST',
    'Photographer 📷': 'PHOTOGRAPHER',
    'Social Media Influencer 📱': 'SOCIAL_MEDIA_INFLUENCER',
    'Writer 📝': 'WRITER',
    'Baker 🥖': 'BAKER',
    'Chef 👨‍🍳': 'CHEF',
    'Construction Worker 👷': 'CONSTRUCTION_WORKER',
    'Farmer 👨‍🌾': 'FARMER',
    'Flight Attendant ✈️': 'FLIGHT_ATTENDANT',
    'Mechanic 🔧': 'MECHANIC',
    'Pilot 👨‍✈️': 'PILOT',
    'Teacher 👩‍🏫': 'TEACHER',
    'Zookeeper 🦓': 'ZOOKEEPER',
  };
  
  // If already an enum name, return as is
  if (displayName === displayName.toUpperCase() && displayName.includes('_')) {
    return displayName;
  }
  
  // Try to find in map, otherwise try to convert display name
  return professionMap[displayName] || displayName.toUpperCase().replace(/\s+/g, '_');
};

// Map enum names to display names for Hobby (reverse mapping)
export const hobbyEnumToDisplayName = (enumName: string): string => {
  const reverseMap: Record<string, string> = {
    'SOCCER': 'Soccer ⚽',
    'BASKETBALL': 'Basketball 🏀',
    'BASEBALL': 'Baseball ⚾',
    'HOCKEY': 'Hockey 🏒',
    'VOLLEYBALL': 'Volleyball 🏐',
    'SWIMMING': 'Swimming 🏊',
    'RUNNING': 'Running 🏃',
    'GYMNASTICS': 'Gymnastics 🤸',
    'KARATE': 'Karate 🥋',
    'TAEKWONDO': 'Taekwondo 🥋',
    'JUDO': 'Judo 🥋',
    'SKATEBOARDING': 'Skateboarding 🛹',
    'CYCLING': 'Cycling 🚴',
    'HORSEBACK_RIDING': 'Horseback Riding 🏇',
    'TENNIS': 'Tennis 🎾',
    'GOLF': 'Golf ⛳',
    'HIKING': 'Hiking 🥾',
    'CAMPING': 'Camping ⛺',
    'CLIMBING': 'Climbing 🧗',
    'FISHING': 'Fishing 🎣',
    'BALLET': 'Ballet 🩰',
    'HIP_HOP': 'Hip Hop 🕺',
    'JAZZ': 'Jazz 🎷',
    'TAP': 'Tap 👟',
    'CONTEMPORARY': 'Contemporary 💃',
    'CULTURAL_DANCES': 'Cultural Dances 🌍',
    'PARK_PLAY': 'Park Play 🏞️',
    'TRAMPOLINING': 'Trampolining 🤸',
    'TAG': 'Tag 🏃‍♂️',
    'DRAWING': 'Drawing ✏️',
    'PAINTING': 'Painting 🎨',
    'COLORING': 'Coloring 🖍️',
    'SCULPTING': 'Sculpting 🗿',
    'CRAFTING': 'Crafting ✂️',
    'PLAYING_INSTRUMENT': 'Playing Instrument 🎵',
    'SINGING': 'Singing 🎤',
    'LISTENING_TO_MUSIC': 'Listening To Music 🎧',
    'ACTING': 'Acting 🎭',
    'MAGIC_TRICKS': 'Magic Tricks 🎩',
    'PUPPETRY': 'Puppetry 🧸',
    'LEGO_BUILDING': 'Lego Building 🧱',
    'MODEL_BUILDING': 'Model Building 🏗️',
    'WOODWORKING': 'Woodworking 🪚',
    'DIGITAL_ART': 'Digital Art 💻',
    'ANIMATION': 'Animation 🎬',
    'VIDEO_EDITING': 'Video Editing 📹',
    'MUSIC_COMPOSITION': 'Music Composition 🎼',
    'CREATIVE_WRITING': 'Creative Writing 📝',
    'JOURNALING': 'Journaling 📔',
    'COMIC_BOOK_CREATION': 'Comic Book Creation 📚',
    'JIGSAW_PUZZLES': 'Jigsaw Puzzles 🧩',
    'LOGIC_PUZZLES': 'Logic Puzzles 🧠',
    'BRAIN_TEASERS': 'Brain Teasers 🤔',
    'BOARD_GAMES': 'Board Games 🎲',
    'CARD_GAMES': 'Card Games 🃏',
    'CHESS': 'Chess ♟️',
    'CHECKERS': 'Checkers ⚫',
    'STRATEGY_GAMES': 'Strategy Games 🎯',
    'SPORTS_CARDS': 'Sports Cards 🏈',
    'TRADING_CARDS': 'Trading Cards 🎴',
    'COLLECTING_STICKERS': 'Collecting Stickers ⭐',
    'ROCK_COLLECTING': 'Rock Collecting 🪨',
    'COIN_COLLECTING': 'Coin Collecting 🪙',
    'STAMP_COLLECTING': 'Stamp Collecting 📮',
    'ACTION_FIGURE_COLLECTING': 'Action Figure Collecting 🤖',
    'TOY_COLLECTING': 'Toy Collecting 🧸',
    'LEAF_COLLECTING': 'Leaf Collecting 🍃',
    'SHELL_COLLECTING': 'Shell Collecting 🐚',
    'VIDEO_GAMING': 'Video Gaming 🎮',
    'ONLINE_GAMING': 'Online Gaming 🖥️',
    'CODING': 'Coding 💻',
    'ROBOTICS': 'Robotics 🤖',
    'WATCHING_YOUTUBE': 'Watching Youtube 📺',
    'WATCHING_TWITCH': 'Watching Twitch 📱',
    'LISTENING_TO_PODCASTS': 'Listening To Podcasts 🎙️',
    'PHOTOGRAPHY': 'Photography 📷',
    'VIDEOGRAPHY': 'Videography 🎥',
    'GARDENING': 'Gardening 🌱',
    'PET_CARE': 'Pet Care 🐕',
    'BIRD_WATCHING': 'Bird Watching 🔭',
    'INSECT_OBSERVING': 'Insect Observing 🔍',
    'NATURE_EXPLORING': 'Nature Exploring 🌲',
    'PLANT_IDENTIFYING': 'Plant Identifying 🌿',
    'BIRD_IDENTIFYING': 'Bird Identifying 🐦',
    'INSECT_IDENTIFYING': 'Insect Identifying 🦋',
    'STAR_GAZING': 'Star Gazing ⭐',
    'ASTRONOMY': 'Astronomy 🔭',
    'READING_FICTION': 'Reading Fiction 📖',
    'READING_COMICS': 'Reading Comics 📚',
    'READING_MANGA': 'Reading Manga 📘',
    'READING_NONFICTION': 'Reading Nonfiction 📗',
    'COOKING': 'Cooking 👨‍🍳',
    'BAKING': 'Baking 🧁',
    'SCALE_MODELING': 'Scale Modeling 🏠',
    'TABLETOP_ROLE_PLAYING': 'Tabletop Role Playing 🎲',
    'SOCIALIZING': 'Socializing 👥',
    'WATCHING_SPORTS': 'Watching Sports 📺',
    'WATCHING_MOVIES': 'Watching Movies 🎬',
    'WATCHING_TV_SERIES': 'Watching Tv Series 📺',
  };
  
  return reverseMap[enumName] || enumName;
};

// Map enum names to display names for Profession (reverse mapping)
export const professionEnumToDisplayName = (enumName: string): string => {
  const reverseMap: Record<string, string> = {
    'ACTOR': 'Actor 🎭',
    'COMIC_ARTIST': 'Comic Artist 📚',
    'DANCER': 'Dancer 💃',
    'DIRECTOR': 'Director 🎬',
    'MAGICIAN': 'Magician 🎩',
    'MOVIE_STAR': 'Movie Star 🌟',
    'MUSICIAN': 'Musician 🎵',
    'PAINTER': 'Painter 🎨',
    'ROCKSTAR': 'Rockstar 🎸',
    'SINGER': 'Singer 🎤',
    'YOUTUBER': 'Youtuber 📹',
    'ARCHITECT': 'Architect 📐',
    'ASTRONAUT': 'Astronaut 👨‍🚀',
    'ASTRONOMER': 'Astronomer 🔭',
    'BIOLOGIST': 'Biologist 🔬',
    'CHEMIST': 'Chemist ⚗️',
    'COMPUTER_PROGRAMMER': 'Computer Programmer 💻',
    'ENGINEER': 'Engineer ⚙️',
    'GAME_DEVELOPER': 'Game Developer 🎮',
    'MARINE_BIOLOGIST': 'Marine Biologist 🐠',
    'PALAEONTOLOGIST': 'Palaeontologist 🦕',
    'SCIENTIST': 'Scientist 🔬',
    'VIDEO_GAME_TESTER': 'Video Game Tester 🕹️',
    'WEBSITE_DESIGNER': 'Website Designer 💻',
    'ZOOLOGIST': 'Zoologist 🦁',
    'DENTIST': 'Dentist 🦷',
    'DOCTOR': 'Doctor 👩‍⚕️',
    'NURSE': 'Nurse 👨‍⚕️',
    'VETERINARIAN': 'Veterinarian 👩‍⚕️',
    'DETECTIVE': 'Detective 🕵️',
    'FIREFIGHTER': 'Firefighter 🚒',
    'JUDGE': 'Judge ⚖️',
    'LAWYER': 'Lawyer ⚖️',
    'POLICE_OFFICER': 'Police Officer 👮',
    'POLITICIAN': 'Politician 🏛️',
    'SOLDIER': 'Soldier 🪖',
    'PRESIDENT': 'President 🏛️',
    'PRIME_MINISTER': 'Prime Minister 🏛️',
    'PRINCESS': 'Princess 👸',
    'PRINCE': 'Prince 🤴',
    'QUEEN': 'Queen 👑',
    'KING': 'King 👑',
    'ATHLETE': 'Athlete 🏃',
    'RACECAR_DRIVER': 'Racecar Driver 🏎️',
    'SOCCER_PLAYER': 'Soccer Player ⚽',
    'AUTHOR': 'Author ✍️',
    'FASHION_DESIGNER': 'Fashion Designer 👗',
    'JOURNALIST': 'Journalist 📰',
    'PHOTOGRAPHER': 'Photographer 📷',
    'SOCIAL_MEDIA_INFLUENCER': 'Social Media Influencer 📱',
    'WRITER': 'Writer 📝',
    'BAKER': 'Baker 🥖',
    'CHEF': 'Chef 👨‍🍳',
    'CONSTRUCTION_WORKER': 'Construction Worker 👷',
    'FARMER': 'Farmer 👨‍🌾',
    'FLIGHT_ATTENDANT': 'Flight Attendant ✈️',
    'MECHANIC': 'Mechanic 🔧',
    'PILOT': 'Pilot 👨‍✈️',
    'TEACHER': 'Teacher 👩‍🏫',
    'ZOOKEEPER': 'Zookeeper 🦓',
  };
  
  return reverseMap[enumName] || enumName;
};
