// ══════════════════════════════════════════════════════════════════
//  WEDDING APP CONFIG — Edit this file to personalise the entire app
// ══════════════════════════════════════════════════════════════════

export const WEDDING = {
  // ── Couple ────────────────────────────────────────────────────
  groomName:    'Nav',
  brideName:    'Sanjna',
  coupleShort:  'Nav & Sanju',          // used in top nav
  tagline:      'Vows & Vermillion',
  subTagline:   'The Digital Heirloom Experience',
  heroSubtitle: 'Welcome to our wedding space, a home for our story, moments and everything in between.',

  // ── Our Story section (Home page) ────────────────────────────
  ourStory: {
    photo: 'https://oxmhdnheylqekqekkwnk.supabase.co/storage/v1/object/public/gallery/couple/our-story-2.png',
    text:
      'What began as a simple volunteer event and playful banter over UNO blossomed into something beautiful. ' +
      'From puppy yoga to quiet, cherished moments, we didn\'t just grow together — we became each other\'s home.\n\n' +
      'We are so excited to start our most beautiful chapter with all of you…, because, picture abhi baaki hai mere dost! ❤️',
  },

  // ── Wedding date (used for live countdown) ────────────────────
  weddingDate:  new Date('2027-02-19'),

  // ── Couple quote shown on Home page ──────────────────────────
  coupleQuote:
    '"Some love stories are written in the stars - ours just needed a little time to find its way. ' +
    'So come, be part of our story, our madness, and all the love we are about to celebrate."',

  // ── Hero carousel on Home page ────────────────────────────────
  //    Add as many photo URLs as you want — they crossfade every 4s.
  //    Upload photos to Supabase Storage → gallery bucket, then
  //    paste the public URLs here.
  //    If you only have one photo, just leave one item in the array.
  heroPhotos: [
    '/images/home-hero.png',
    // 'https://your-photo-2.jpg',
    // 'https://your-photo-3.jpg',
  ],

  // Fallback single image (used by event preview cards)
  heroImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA_vKhx4oaR_51DY4crKdlsVgQysYZvRJRS31SkCmBKOVcwjhTbjAzfMeCJyoyRm7o4MyQFyYG4AzAvhtjfRcb3wZ4HRlRACVIayZCX4okmhdRfLvigh2xqT9logp-hb1OVaxpu0AJupNAAXcLKXElTpZLIBLZlmYE9Db16BIBieEsodkI-B6WeeLi4uf_5j1wdjRng5UmRX4rMALCNRxYAzN-mQ7KFAt5cirPT_8jbK9Tl3Qlmxs_MwKhWQU9c1hGPALbtyZQ0dqA',

  // ── Stay / Hotel info ─────────────────────────────────────────
  hotel: {
    name:      'Roche Harbor',
    address:   'Ramgarh Rd, near sector 28, Mubarakpur, Dera Bassi, Bir Pir Machhalia, Punjab 140201, India',
    image:     'https://lh3.googleusercontent.com/aida-public/AB6AXuBTUPQrPGi7kfjmXpfKfCrauU0gwCbr1qcrU4gfwIhv_WIGDnl6km90RRBmXzuZeFBMBTjcH8lNNiiIUxJv6TBfQpy1fJAztos8Lt8CaD7NKjug87PuHvhC7o9Y3HdQ_ujYrKSUznohVHtFieyXetvP5zFsBUoc_8kaBDbcxY16mJKmfOGBIOx4RY-ZUQHhinVpzTNXY4kYzdbYSEz1VIAlp5_DO4LLnJXMpLFBOI1HlfiDU-OVZ82STpPUVRuo3K7JPc3mM7Ckvtw',
    checkIn:   '14:00',
    checkOut:  '12:00',
    mapsQuery: 'Roche+Harbor+Ramgarh+Rd+Dera+Bassi+Punjab+India',
  },

  // ── Upcoming events shown on Stay Info page ───────────────────
  stayItinerary: [
    { when: 'Feb 17, 12:00', title: 'Mehndi Ceremony', location: 'Kernal', active: true  },
    { when: 'Feb 18, 20:00', title: 'Cocktail Night', location: 'Roche Harbor', active: false },
    { when: 'Feb 19, 12:00', title: 'Haldi Ceremony', location: 'Roche Harbor', active: false },
    { when: 'Feb 19, 20:00', title: 'The Wedding Day', location: 'Roche Harbor', active: false },
  ],

  // ── Event images ──────────────────────────────────────────────
  //    Keys must match the slug in your Supabase events table
  eventImages: {
    haldi:    '/images/event-haldi.png',
    cocktail: '/images/event-cocktail.png',
    mehndi:   '/images/event-mehndi.png',
    wedding:  '/images/event-wedding.png',
  },

  // ── Events (Celebration Itinerary page) ──────────────────────
  //    Edit name, dates, times, venues and descriptions here.
  //    slug must be unique and match eventImages keys above.
  events: [
    {
      slug:         'mehndi',
      name:         'Green Chapter',
      ceremony_label: 'Mehndi',
      event_date:   '2027-02-17',
      event_time:   '11:00 AM onwards',
      theme_label:  'WED MORNING',
      venue_name:   'TBD',
      venue_address:'Karnal, Haryana',
      dress_code:   'Green Festive / Ethnic',
      description:  '    Mehndi ka glow, emotions on show, let the wedding madness flow-flow-flow',
      icon:         'draw',
      
    },
    {
      slug:         'cocktail',
      name:         'Cocktail Night',
      ceremony_label: 'Sangeet',
      event_date:   '2027-02-18',
      event_time:   '7:00 PM onwards',
      theme_label:  'THU NIGHT',
      venue_name:   'Sangeet Suite',
      venue_address:'Roche Harbour, Chandigarh, Punjab',
      dress_code:   'Tuxedo / Glamorous',
      description:  'Dhols hit hard, vibes go far — suddenly everyone’s a superstar 💃',
      icon:         'wine_bar',
    },
    { slug:         'haldi',
      name:         'Turmeric Tales',
      ceremony_label: 'Haldi',
      event_date:   '2027-02-19',           // YYYY-MM-DD
      event_time:   'Starts at 11:00 AM',
      theme_label:  'FRI MORNING',
      venue_name:   'Sunlit Courtyard',
      venue_address:'Roche Harbour, Chandigarh, Punjab',
      dress_code:   'Yellow Festive / Ethnic',
      description:  'Yellow outfits ready?\nKyuki iss Haldi mein sirf rang nahi, poora vibe udega',
      icon:         'brightness_7',
    },
    {
      slug:         'wedding',
      name:         'The D-Day',
      ceremony_label: 'Pheras',
      event_date:   '2027-02-19',
      event_time:   '7:00 PM onwards',
      theme_label:  'FRI NIGHT',
      venue_name:   'Waterside Mandap',
      venue_address:'Roche Harbour, Chandigarh, Punjab',
      dress_code:   'Formal / Ethnic Formal',
      description:  'We said “let’s see where it goes”… it went straight to mandap 💍',
      icon:         'favorite',
    },
  ],

  // ── Wedding day timeline (shown on /events/wedding) ───────────
  weddingTimeline: [
    { time: '18:30', label: 'Evening', title: 'Baraat Arrival',     desc: "Join the groom's grand procession with traditional drums and dance." },
    { time: '21:00', label: 'Night',  title: 'Varmala',            desc: 'The exchange of floral garlands signifying acceptance.' },
    { time: '23:00', label: 'Night',   title: 'Sacred Pheras',      desc: 'The solemn seven rounds around the holy fire.' },
  ],
}
