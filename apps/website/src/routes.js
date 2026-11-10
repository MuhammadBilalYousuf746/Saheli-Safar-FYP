export const pages = {
  home: {
    path: '/',
    label: 'Home',
    title: 'Saheli Safar | Scheduled travel designed around women in Karachi',
    description:
      'Saheli Safar is a women-focused, scheduled, fixed-route transportation platform being designed for Karachi.',
  },
  passengers: {
    path: '/passengers',
    label: 'Passengers',
    title: 'For passengers | Saheli Safar',
    description: 'What the Saheli Safar Passenger app does today and what it will do next.',
  },
  drivers: {
    path: '/drivers',
    label: 'Drivers',
    title: 'For drivers | Saheli Safar',
    description: 'How the Saheli Safar Driver app and its reviewed onboarding process are being built.',
  },
  about: {
    path: '/about',
    label: 'About',
    title: 'About | Saheli Safar',
    description: 'Why Saheli Safar exists and the journeys it is being designed for in Karachi.',
  },
  contact: {
    path: '/contact',
    label: 'Contact',
    title: 'Contact | Saheli Safar',
    description: 'Get in touch with the Saheli Safar project team.',
  },
  notFound: {
    title: 'Page not found | Saheli Safar',
    description: 'This page does not exist.',
    eyebrow: 'Error 404',
    heading: 'This page took a wrong turn.',
    text: 'The link may be old or mistyped. The home page is a good place to start again.',
    cta: 'Back to home',
  },
}

// Compatibility redirects preserve existing incoming links.
export const legacyRoutes = [
  { path: '/how-it-works', to: '/#how-it-works' },
  { path: '/safety', to: '/#safety' },
  { path: '/faqs', to: '/#faqs' },
]

export const publicPaths = Object.values(pages).filter(page => page.path).map(page => page.path)
