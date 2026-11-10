import { pages } from '../routes.js'
export { pages }

/*
  All website copy lives here. Components only render it.

  Content rules
  - Never claim booking, route discovery, live tracking, fares or operating routes exist.
  - No invented statistics, testimonials, ratings, earnings, partners or store links.
  - No em dashes or en dashes in copy.
  - Anything marked TODO needs real project information before the site is shared.

  Feature status values
  - live:     built in the current apps
  - building: being built (driver side)
  - next:     planned for a later stage

*/

export const site = {
  name: 'Saheli Safar',
  description:
    'A women-focused, scheduled, fixed-route transportation platform being designed for Karachi.',
  status: 'A Final Year Project in development. Not yet available to the public.',
}

/* ---------------- Pages, titles and navigation ---------------- */

// Header and mobile menu links, in order
export const nav = ['home', 'passengers', 'drivers', 'about', 'contact'].map(
  (key) => ({
    label: pages[key].label,
    href: pages[key].path,
  }),
)

export const ui = {
  skipLink: 'Skip to content',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
  status: {
    live: 'Implemented',
    building: 'In development',
    next: 'Next stage',
  },
}

/* ---------------- Home: hero ---------------- */

export const hero = {
  eyebrow: 'Women-focused scheduled travel in Karachi',
  headline: ['Her city.', 'Her journey.', 'Her way.'],
  text: "Discover a more thoughtful approach to scheduled travel, designed around women's journeys in Karachi.",
  primary: { label: 'Explore Saheli Safar', href: '/#introduction' },
  secondary: { label: 'See how it works', href: '/#how-it-works' },
  note: 'A Final Year Project in development',
  visual: {
    chips: [
      { text: 'Scheduled departures', icon: 'clock', position: 'top-0 left-0' },
      { text: 'Fixed routes', icon: 'route', position: 'right-0 bottom-0' },
      { text: 'Verified passengers', icon: 'shield', position: 'top-[18%] right-0' },
      { text: 'Women-focused travel', icon: 'users', position: 'top-[48%] left-0' },
      { text: 'Designed for Karachi', icon: 'mapPin', position: 'right-0 bottom-[20%]' },
    ],
    routeLabel: 'Illustrative route',
  },
}

/* ---------------- Home: introduction ---------------- */

export const intro = {
  id: 'introduction',
  eyebrow: 'Introduction',
  title: 'Built for the journeys that matter.',
  body: [
    'The trip to university, to work and back home again shapes every day. Saheli Safar is designed to make that trip something women can plan around, instead of something to worry about.',
    'It brings together three simple ideas: travel with other verified women, leave at set times, and follow routes that are known in advance.',
  ],
}

/* ---------------- How it works ---------------- */

export const howItWorks = {
  id: 'how-it-works',
  eyebrow: 'How it works',
  title: 'From sign up to seat, one clear path.',
  intro: 'The first two steps are built today. Exploring routes and reserving seats are the next stages.',
  steps: [
    {
      icon: 'mail',
      title: 'Create your account',
      text: 'Sign up with your email and confirm it with a one-time code.',
      status: 'live',
    },
    {
      icon: 'idCard',
      title: 'Complete verification',
      text: 'Submit your CNIC and a selfie. An admin reviews them and approves or rejects your account.',
      status: 'live',
    },
    {
      icon: 'route',
      title: 'Explore travel options',
      text: 'Browse scheduled, fixed routes and their departure times.',
      status: 'next',
    },
    {
      icon: 'seat',
      title: 'Reserve your seat',
      text: 'Book a seat on a scheduled ride and keep your ticket in the app.',
      status: 'next',
    },
  ],
}

/* ---------------- Safety ---------------- */

export const safety = {
  id: 'safety',
  eyebrow: 'Safety and trust',
  title: 'Your journey deserves thoughtful care.',
  intro:
    'Safety in Saheli Safar starts long before a ride: with who can join, how they are checked and who is accountable for each decision.',
  items: [
    {
      icon: 'mail',
      title: 'Email verification',
      text: 'Every account is confirmed with a one-time code sent to its email address.',
    },
    {
      icon: 'idCard',
      title: 'Identity review',
      text: 'Passengers submit a CNIC and a selfie. An admin reviews them before the account is approved.',
    },
    {
      icon: 'steering',
      title: 'Reviewed driver onboarding',
      text: 'Drivers submit their documents and vehicle details for review before they can drive.',
    },
    {
      icon: 'lock',
      title: 'Account security',
      text: 'Password sign in, with recovery through a code sent to your email.',
    },
    {
      icon: 'heart',
      title: 'Emergency Contact',
      text: 'Passengers keep a trusted person on their profile, so someone close is always on record.',
    },
  ],
  note: 'Saheli Safar is still in development and is not a replacement for emergency services.',
  cta: { label: 'Read more about safety', href: '/#safety' },
}

/* ---------------- Passenger experience ---------------- */

export const passengers = {
  eyebrow: 'Passenger experience',
  title: 'Made for your everyday journey.',
  intro:
    'The Passenger app keeps the important things in one place: your account, your verification and the people you trust.',
  live: [
    'Create an account and confirm your email',
    'Verify your identity once, reviewed by an admin',
    'Manage your profile and Emergency Contact',
    'Recover your password with an email code',
  ],
  next: 'Route discovery and seat booking come in the next stage.',
  cta: { label: 'More for passengers', href: '/passengers' },
}

/* ---------------- Driver experience ---------------- */

export const drivers = {
  eyebrow: 'Driver experience',
  title: 'Be part of the journey forward.',
  intro:
    'Saheli Safar needs dependable drivers who share its commitment to careful, scheduled travel. The Driver app is built around a reviewed onboarding process.',
  steps: [
    { title: 'Register', text: 'Create a driver account and confirm it with a one-time code.' },
    { title: 'Secure your account', text: 'Set a password for signing in.' },
    { title: 'Submit documents', text: 'Upload the documents needed for review.' },
    { title: 'Add your vehicle', text: 'Share your vehicle details.' },
    { title: 'Admin review', text: 'An admin reviews your application before you can drive.' },
  ],
  status: 'building',
  note: 'The Driver app is in development and is not yet open for applications.',
  cta: { label: 'Interested in driving? Contact us', href: '/contact' },
  more: { label: 'More for drivers', href: '/drivers' },
}

/* ---------------- Karachi ---------------- */

export const karachi = {
  eyebrow: 'Service area',
  title: 'Designed with Karachi in mind.',
  intro:
    'Karachi is a city of long distances and busy roads. Saheli Safar is being shaped around the everyday trips that matter most: to university, to work and back home.',
  points: [
    { title: 'Everyday destinations', text: 'Fixed routes planned around the places people travel to every day.' },
    { title: 'Set departure times', text: 'Know when your ride leaves, so the day can be planned.' },
    { title: 'Announced when confirmed', text: 'Service areas and routes will only be published once they are confirmed.' },
  ],
  mapNote: 'Illustration only. No routes or service areas have been announced yet.',
  mapLabels: { sea: 'Arabian Sea', city: 'Karachi' },
}

/* ---------------- App showcase ---------------- */

export const showcase = {
  eyebrow: 'The platform',
  title: 'Your journey, thoughtfully connected.',
  intro:
    'Explore the Passenger and Driver apps, supported by admin-reviewed accounts and verification.',
  parts: [
    { title: 'Passenger app', text: 'Accounts, verification and Emergency Contact.', status: 'live' },
    { title: 'Driver app', text: 'Registration and reviewed onboarding.', status: 'building' },
    { title: 'Admin Dashboard', text: 'Reviews verifications and manages accounts.', status: 'live' },
  ],
}

/* ---------------- About ---------------- */

export const about = {
  eyebrow: 'About',
  title: 'A new perspective on everyday travel.',
  body: [
    'Saheli Safar is a Final Year Project built around a simple question: what would the daily commute look like if it were designed around women from the start?',
    'The answer we are building is calm and predictable: verified passengers, reviewed drivers, set departure times and routes known in advance.',
  ],
  values: [
    { title: 'Purpose first', text: 'Every feature has to make a real journey safer or easier.' },
    { title: 'Honest progress', text: 'We only describe what is built, and say clearly what comes next.' },
    { title: 'People accountable', text: 'Reviews and approvals are made by people, not left to chance.' },
  ],
  cta: { label: 'More about the project', href: '/about' },
}

/* ---------------- FAQs ---------------- */

export const faqs = {
  "eyebrow": "FAQs",
  "title": "Before you get started.",
  "contactPrompt": "Have another question?",
  "contactLink": {
    "label": "Contact the team",
    "href": "/contact"
  },
  "items": [
    {
      "q": "Who can use it?",
      "a": "Passenger accounts are for women. Drivers join through a separate Driver app with its own review process."
    },
    {
      "q": "Is it available throughout Karachi?",
      "a": "Not yet. Service areas and routes have not been announced, and the platform is not operating."
    },
    {
      "q": "How can someone join as a driver?",
      "a": "The Driver app and its onboarding process are in development and not yet open for applications. If you are interested, contact the team."
    },
    {
      "q": "How are identity documents handled?",
      "a": "Your CNIC images and selfie are submitted for admin review as part of verification. They are never shown on this website or to other passengers. A full privacy policy will be published before any public launch."
    }
  ]
}

/* ---------------- Contact ---------------- */

export const contact = {
  businessCard: {
    names: 'Bilal and Ramiq',
    info: 'Final Year Project ? Women-focused transport',
    emails: ['bscs2380200@szabist.pk', 'bscs2380206@szabist.pk'],
  },
  eyebrow: 'Contact',
  title: "Let's talk about better journeys.",
  intro:
    'Questions, feedback or interest in the project? We would like to hear from students, families, drivers and anyone who cares about safer travel for women in Karachi.',

  // Public email is optional; enquiries use the backend contact form.
  email: null,
  emailLabel: 'Email the team',
  emailNote: 'Questions about the project, feedback and interest in driving are all welcome.',

  // Public API setting only; SMTP and recipient configuration stay on the backend.
  endpoint: `${(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')}/contact`,

  form: {
    title: 'Send us a message',
    fields: {
      name: { label: 'Your name', placeholder: 'Full name', autoComplete: 'name', type: 'text' },
      email: { label: 'Email address', placeholder: 'you@example.com', autoComplete: 'email', type: 'email' },
      phone: { label: 'Phone number', placeholder: '03XX XXXXXXX', autoComplete: 'tel', type: 'tel' },
      message: { label: 'What would you like to ask or say?', placeholder: 'Write your message here', autoComplete: 'off' },
    },
    errors: {
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
      phone: 'Please enter a valid phone number (10 to 15 digits).',
      message: 'Please write a message of at least 10 characters.',
    },
    submit: 'Send message',
    sending: 'Sending...',
    success: 'Thank you. Your message was accepted by our email service.',
    failure: 'Your message could not be sent. Please try again later.',
    notConnected:
      'This form is not connected yet, so messages cannot be sent from this page. It will be switched on once the team sets up where messages are delivered.',
    privacy: 'Your details are only used to reply to your message.',
  },

  details: [
    { icon: 'mapPin', title: 'Based in', text: 'Karachi, Pakistan' },
    { icon: 'calendar', title: 'Project status', text: 'Final Year Project in development' },
  ],
  band: {
    title: 'Have a question about Saheli Safar?',
    text: 'The team would be glad to hear from you.',
    cta: { label: 'Contact the team', href: '/contact' },
  },
}

/* ---------------- Footer ---------------- */

export const footer = {
  description:
    'A women-focused, scheduled, fixed-route transportation platform being designed for Karachi.',
  columns: [
    {
      title: 'Explore',
      links: [
        { label: 'Home', href: '/' },
        { label: 'How it works', href: '/#how-it-works' },
        { label: 'About', href: '/about' },
        { label: 'FAQs', href: '/#faqs' },
      ],
    },
    {
      title: 'Passengers',
      links: [
        { label: 'Passenger experience', href: '/passengers' },
        { label: 'Safety and trust', href: '/#safety' },

      ],
    },
    {
      title: 'Drivers',
      links: [
        { label: 'Driver experience', href: '/drivers' },
        { label: 'Contact the team', href: '/contact' },
      ],
    },
  ],
  legal: 'Saheli Safar is a FYP and made by Bilal and Ramiq.',
}
