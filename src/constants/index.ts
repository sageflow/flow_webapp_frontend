// API Configuration
// In development, Vite proxy forwards requests to the backend
// In production, set VITE_API_URL environment variable
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Authentication Constants
export const AUTH_CONSTANTS = {
  TOKEN_KEY: 'sageflow_token',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes
} as const;

// Form Validation Constants
export const VALIDATION_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_NOTES_LENGTH: 500,
} as const;

// Pagination Constants
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// Date Constants
export const DATE_CONSTANTS = {
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  DEFAULT_TIMEZONE: 'UTC',
} as const;

// Assessment Constants
export const ASSESSMENT_CONSTANTS = {
  TYPES: {
    IQ: 'IQ',
    EQ: 'EQ',
    PERSONALITY: 'PERSONALITY',
  } as const,
  QUESTION_TYPES: {
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    SCALE: 'SCALE',
    TEXT: 'TEXT',
  } as const,
  DEFAULT_DURATION: 30, // minutes
  DEFAULT_PASSING_SCORE: 70,
} as const;

// Pulse Check Constants
export const PULSE_CHECK_CONSTANTS = {
  QUESTION_TYPES: {
    MOOD: 'MOOD',
    STRESS: 'STRESS',
    ENERGY: 'ENERGY',
    SLEEP: 'SLEEP',
    SOCIAL: 'SOCIAL',
  } as const,
  SCALE_RANGE: {
    MIN: 1,
    MAX: 5,
  } as const,
  TRENDS: {
    IMPROVING: 'IMPROVING',
    STABLE: 'STABLE',
    DECLINING: 'DECLINING',
  } as const,
} as const;

// Daily Routine Constants
export const ROUTINE_CONSTANTS = {
  ACTIVITY_CATEGORIES: {
    ACADEMIC: 'ACADEMIC',
    PHYSICAL: 'PHYSICAL',
    MENTAL: 'MENTAL',
    SOCIAL: 'SOCIAL',
    RELAXATION: 'RELAXATION',
  } as const,
  PRIORITIES: {
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
  } as const,
  DEFAULT_DURATION: 30, // minutes
} as const;

// Exercise Constants
export const EXERCISE_CONSTANTS = {
  INTENSITY_LEVELS: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
  } as const,
  DEFAULT_DURATION: 30, // minutes
  DEFAULT_CALORIES_PER_MINUTE: 5,
} as const;

// Complaint Constants
export const COMPLAINT_CONSTANTS = {
  STATUSES: {
    PENDING: 'PENDING',
    INVESTIGATING: 'INVESTIGATING',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
  } as const,
  PRIORITIES: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  } as const,
  CATEGORIES: {
    BULLYING: 'BULLYING',
    HARASSMENT: 'HARASSMENT',
    ACADEMIC: 'ACADEMIC',
    BEHAVIORAL: 'BEHAVIORAL',
    OTHER: 'OTHER',
  } as const,
} as const;

// Gender Constants
export const GENDER_CONSTANTS = [
  'MALE',
  'FEMALE',
  'OTHER',
  'PREFER_NOT_TO_SAY',
] as const;

// Grade Level Constants (API format)
export const GRADE_LEVEL_CONSTANTS = [
  'Kindergarten',
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
  '11th',
  '12th',
  'UG',
  'PG',
  'Diploma',
  'Other',
] as const;

// Academic Status Constants (API format)
export const ACADEMIC_STATUS_CONSTANTS = [
  'Good Standing',
  'Probation',
  'Suspended',
  'Warning',
  'Honors',
] as const;

// Medical Condition Constants
export const MEDICAL_CONDITION_CONSTANTS = [
  'ASTHMA',
  'ALLERGIES',
  'ADHD',
  'ANXIETY',
  'DEPRESSION',
  'DIABETES',
  'EPILEPSY',
  'VISION_IMPAIRMENT',
  'HEARING_IMPAIRMENT',
  'MOBILITY_ISSUES',
  'LEARNING_DISABILITIES',
  'AUTISM_SPECTRUM',
  'DYSLEXIA',
  'DYSCALCULIA',
  'DYSGRAPHIA',
  'OCD',
  'BIPOLAR_DISORDER',
  'EATING_DISORDERS',
  'SLEEP_DISORDERS',
  'CHRONIC_PAIN',
  'ARTHRITIS',
  'HEART_CONDITIONS',
  'NONE',
  'OTHER',
] as const;

// Hobby Constants
export const HOBBY_CONSTANTS = [
  'READING',
  'WRITING',
  'DRAWING',
  'PAINTING',
  'PHOTOGRAPHY',
  'MUSIC',
  'DANCING',
  'SINGING',
  'GAMING',
  'CODING',
  'COOKING',
  'GARDENING',
  'COLLECTING',
  'PUZZLES',
  'BOARD_GAMES',
  'CARD_GAMES',
  'MAGIC_TRICKS',
  'ORIGAMI',
  'KNITTING',
  'SEWING',
  'WOODWORKING',
  'MODEL_BUILDING',
  'SCIENCE_EXPERIMENTS',
  'ASTRONOMY',
  'BIRD_WATCHING',
  'FISHING',
  'HIKING',
  'CAMPING',
  'CYCLING',
  'SKATEBOARDING',
  'ROLLER_SKATING',
  'SWIMMING',
  'MARTIAL_ARTS',
  'YOGA',
  'MEDITATION',
  'JOURNALING',
  'BLOGGING',
  'VLOGGING',
  'PODCASTING',
  'SOCIAL_MEDIA',
  'ONLINE_COMMUNITIES',
  'VOLUNTEERING',
  'PET_CARE',
] as const;

// Profession Constants
export const PROFESSION_CONSTANTS = [
  'DOCTOR',
  'ENGINEER',
  'TEACHER',
  'LAWYER',
  'ARTIST',
  'MUSICIAN',
  'ACTOR',
  'WRITER',
  'JOURNALIST',
  'SCIENTIST',
  'RESEARCHER',
  'ARCHITECT',
  'DESIGNER',
  'CHEF',
  'PILOT',
  'POLICE_OFFICER',
  'FIREFIGHTER',
  'NURSE',
  'DENTIST',
  'VETERINARIAN',
  'PSYCHOLOGIST',
  'THERAPIST',
  'SOCIAL_WORKER',
  'BUSINESS_OWNER',
  'ENTREPRENEUR',
  'MANAGER',
  'CONSULTANT',
  'SALES_REPRESENTATIVE',
  'MARKETING_SPECIALIST',
  'FINANCIAL_ADVISOR',
  'ACCOUNTANT',
  'DATA_SCIENTIST',
  'SOFTWARE_DEVELOPER',
  'WEB_DEVELOPER',
  'GAME_DEVELOPER',
  'GRAPHIC_DESIGNER',
  'INTERIOR_DESIGNER',
  'FASHION_DESIGNER',
  'PHOTOGRAPHER',
  'VIDEOGRAPHER',
  'CONTENT_CREATOR',
  'INFLUENCER',
  'ATHLETE',
  'COACH',
  'TRAINER',
] as const;

// Device Type Constants
export const DEVICE_TYPE_CONSTANTS = [
  'MOBILE',
  'TABLET',
  'LAPTOP',
  'DESKTOP',
  'TV',
] as const;

// Media Platform Constants
export const MEDIA_PLATFORM_CONSTANTS = [
  'YOUTUBE',
  'INSTAGRAM',
  'TIKTOK',
  'REDDIT',
  'TWITTER',
  'FACEBOOK',
  'SNAPCHAT',
  'PINTEREST',
  'TWITCH',
  'NETFLIX',
  'DISNEY_PLUS',
  'AMAZON_PRIME',
  'VIDEO_GAMES',
  'PODCASTS',
  'AUDIOBOOKS',
  'EBOOKS',
  'ONLINE_NEWS',
  'BLOGS',
  'EDUCATIONAL_APPS',
  'OTHER',
] as const;

// Language Constants
export const LANGUAGE_CONSTANTS = [
  'ENGLISH',
  'SPANISH',
  'FRENCH',
  'GERMAN',
  'CHINESE',
  'ARABIC',
  'HINDI',
  'OTHER',
] as const;

// Relationship Constants
export const RELATIONSHIP_CONSTANTS = [
  'PARENT',
  'GUARDIAN',
  'GRANDPARENT',
  'SIBLING',
  'OTHER',
] as const;

// Monitoring Preference Constants
export const MONITORING_PREFERENCE_CONSTANTS = [
  'ACADEMIC_PROGRESS',
  'MENTAL_HEALTH',
  'HABITS_TRACKING',
  'SOCIAL_ACTIVITIES',
  'BEHAVIORAL_ISSUES',
] as const;

// Communication Preference Constants
export const COMMUNICATION_PREFERENCE_CONSTANTS = [
  'EMAIL',
  'SMS',
  'PHONE_CALL',
  'IN_APP_NOTIFICATIONS',
  'WEEKLY_REPORTS',
] as const;

// Engagement Activity Constants
export const ENGAGEMENT_ACTIVITY_CONSTANTS = [
  'READING', 'WRITING', 'MATH_PRACTICE', 'SCIENCE_EXPERIMENTS', 'HOMEWORK', 'STUDY_GROUPS',
  'DRAWING', 'PAINTING', 'MUSIC', 'DANCING', 'CRAFTING', 'WRITING_STORIES',
  'SPORTS', 'YOGA', 'WALKING', 'CYCLING', 'SWIMMING', 'GAMING', 'CODING',
  'COOKING', 'GARDENING', 'COLLECTING', 'PUZZLES', 'BOARD_GAMES', 'MAGIC_TRICKS',
  'ORIGAMI', 'KNITTING', 'SEWING', 'WOODWORKING', 'MODEL_BUILDING', 'ASTRONOMY',
  'BIRD_WATCHING', 'FISHING', 'HIKING', 'CAMPING', 'MARTIAL_ARTS', 'MEDITATION',
  'JOURNALING', 'BLOGGING', 'VLOGGING', 'PODCASTING', 'SOCIAL_MEDIA', 'VOLUNTEERING',
] as const;

// Mood Constants
export const MOOD_CONSTANTS = [
  'EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'ANXIOUS', 'EXCITED', 'CALM', 'STRESSED',
  'HAPPY', 'SAD', 'ANGRY', 'CONFUSED', 'INSPIRED', 'MOTIVATED', 'TIRED', 'ENERGETIC',
] as const;

// Social Interaction Constants
export const SOCIAL_INTERACTION_CONSTANTS = [
  'ONE_ON_ONE_CONVERSATIONS', 'GROUP_DISCUSSIONS', 'TEAMWORK', 'LEADERSHIP_ROLES',
  'MENTORING', 'BEING_MENTORED', 'CONFLICT_RESOLUTION', 'ACTIVE_LISTENING',
  'SHARING_OPINIONS', 'RECEIVING_FEEDBACK', 'GIVING_FEEDBACK', 'COLLABORATION',
  'NETWORKING', 'SOCIAL_SUPPORT', 'EMOTIONAL_EXPRESSION', 'EMPATHY_DEMONSTRATION',
] as const;

// Learning Style Constants
export const LEARNING_STYLE_CONSTANTS = [
  'VISUAL_LEARNING', 'AUDITORY_LEARNING', 'KINESTHETIC_LEARNING', 'READING_WRITING',
  'HANDS_ON_PRACTICE', 'GROUP_STUDY', 'INDIVIDUAL_STUDY', 'ONLINE_LEARNING',
  'INTERACTIVE_EXERCISES', 'PROJECT_BASED_LEARNING', 'LECTURE_STYLE', 'DISCUSSION_BASED',
  'PROBLEM_SOLVING', 'EXPERIMENTAL_LEARNING', 'MEMORIZATION', 'ANALYTICAL_THINKING',
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  SIGNUP: 'Account created successfully!',
  UPDATE: 'Updated successfully!',
  DELETE: 'Deleted successfully!',
  CREATE: 'Created successfully!',
  SUBMIT: 'Submitted successfully!',
} as const;

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// File Upload Constants
export const FILE_UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  MAX_FILES: 5,
} as const;

// Cache Constants
export const CACHE_CONSTANTS = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 100,
  STALE_WHILE_REVALIDATE: 1 * 60 * 1000, // 1 minute
} as const;

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300, // milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds
  THROTTLE_DELAY: 100, // milliseconds
  INFINITE_SCROLL_THRESHOLD: 100, // pixels
  MODAL_BACKDROP_OPACITY: 0.5,
} as const;
