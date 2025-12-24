// Template data for creating a new show
// This data will be pre-filled when creating a new show

export const showTemplateData = {
  // Basic Info
  name: "Sir Elton - At the Piano: The Music of Elton John",
  description: `<strong data-start="0" data-end="13" data-is-only-node="">Sir Elton</strong> stars pianist and vocalist <strong data-start="41" data-end="57">Jeff Burkett, </strong>performing Elton John's greatest hits live at the piano.`,
  short_description: `<strong data-start="0" data-end="13" data-is-only-node="">Sir Elton</strong> is the live Elton John Vegas tribute show starring Jeff Burkett!`,
  product_url: "shows/sir-elton/",
  product_slug: "sir-elton",
  product_id: "23573",
  currency_symbol: "&#36;",
  review_count: "0",

  // Pricing
  price: "99.95",
  discountedPrice: "44.95",
  percentage_fee: "8",

  // Images
  image_url: "https://ticketkite.com/wp-content/uploads/2025/05/se_800x533.jpg",
  cover_image: "https://ticketkite.com/wp-content/uploads/2025/05/se_1924x500.jpg",
  portrait_image: "https://ticketkite.com/wp-content/uploads/2025/05/se_326x444.jpg",

  // Venue & Category
  venue_id: null as number | null, // Will be set when venue is selected
  venue_name: "",
  category: "",

  // Status
  status: "active",

  // Duration
  duration: "65-70 Minutes",

  // Story content
  story_description: `<p class="" data-start="210" data-end="640"><strong data-start="210" data-end="223">Sir Elton</strong> is a powerful and personal live tribute to the legendary music of <strong data-start="290" data-end="304">Elton John</strong>, starring acclaimed pianist and vocalist <strong data-start="346" data-end="362">Jeff Burkett</strong>. Set in the intimate <strong data-start="397" data-end="428">Pegasus Showroom inside the Modern Showrooms at Alexis Park Resort Hotel</strong>, this one-of-a-kind performance invites audiences on a musical journey through Elton John's greatest hits — all performed live at the piano in a 100-seat venue designed for an unforgettable, up-close experience.</p>
<p class="" data-start="642" data-end="1164">Unlike large-scale impersonator acts or flashy stage spectacles, <strong data-start="707" data-end="720">Sir Elton</strong> focuses on the heart and soul of Elton's music. Jeff Burkett brings both musicianship and personality to the stage, delivering iconic songs like <em data-start="866" data-end="940">"Your Song," "Tiny Dancer," "Candle in the Wind," "Bennie and the Jets,"</em> and <em data-start="945" data-end="959">"Rocket Man"</em> with passion and authenticity.</p>
<p class="" data-start="1166" data-end="1528">Throughout the evening, Jeff incorporates <strong data-start="1208" data-end="1250">costume changes and light storytelling</strong>, paying tribute not only to Elton's music but to his legendary stage presence and charisma. Whether you're a lifelong fan or discovering Elton John's music for the first time, this show offers an immersive, heartfelt tribute that brings the magic of his timeless songs to life.</p>
<p class="" data-start="1530" data-end="1848">Located just off the Las Vegas Strip, <strong data-start="1568" data-end="1581">Sir Elton</strong> is the perfect evening for music lovers, date nights, tourists, and anyone looking for a more personal entertainment experience. With only 100 seats per performance, every show feels exclusive — like you're sitting in on a private concert with the Rocketman himself.</p>
<p class="" data-start="196" data-end="218"><strong data-start="196" data-end="218">About Jeff Burkett</strong></p>
<p class="" data-start="220" data-end="452"><span class="relative -mx-px my-[-0.2rem] rounded px-px py-[0.2rem] transition-colors duration-100 ease-in-out">Jeff Burkett is an internationally touring pianist, vocalist, and tribute artist best known for his acclaimed portrayal of Elton John in <em data-start="137" data-end="148">Sir Elton</em> and <em data-start="153" data-end="200">Candle In The Wind: The Elton John Experience</em>.</span> <span class="relative -mx-px my-[-0.2rem] rounded px-px py-[0.2rem] transition-colors duration-100 ease-in-out">With a career spanning over four decades, Jeff brings a powerful blend of musicianship and showmanship to the stage, authentically recreating Elton John&#8217;s iconic sound and style.</span> <span class="relative -mx-px my-[-0.2rem] rounded px-px py-[0.2rem] transition-colors duration-100 ease-in-out">A lifelong fan since age 12, Jeff was inspired by the <em data-start="54" data-end="81">Goodbye Yellow Brick Road</em> album to pursue a path in music.</span> <span class="relative -mx-px my-[-0.2rem] rounded px-px py-[0.2rem] transition-colors duration-100 ease-in-out">His performances feature live piano, dynamic vocals, and a deep reverence for the music, offering audiences an immersive tribute experience.</span> <span class="relative -mx-px my-[-0.2rem] rounded px-px py-[0.2rem] transition-colors duration-100 ease-in-out">Beyond his Elton John tributes, Jeff is a seasoned drummer and educator, with a diverse background in various musical genres.</span></p>
<h6 data-start="1530" data-end="1848">*Sir Elton is a live tribute show and is not affiliated with or endorsed by Elton John or his official entities.</h6>`,
  story_title: "Sir Elton – At the Piano: The Music of Elton John",
  story_sub_title: "",
  story_enable_description: "yes",

  // Additional fields
  series_id: "22793",
  series_code: "SirEltonAP",
  nliven_token: "fd6b61980fe34059914c6a53d91fd6cc",
  nliven_promo_code: "TICKETKITEVEGAS",

  // JSON fields
  categories: [
    { term_id: 357, name: "Alexis Park Resort" },
    { term_id: 42, name: "Featured Shows" },
    { term_id: 560, name: "Music Shows" },
    { term_id: 40, name: "Shows" },
    { term_id: 574, name: "Signature Shows" },
    { term_id: 71, name: "Tribute" }
  ] as Array<{ term_id: number; name: string }>,
  tags: [
    { term_id: 568, name: "Elton John" },
    { term_id: 570, name: "Jeff Burkett" },
    { term_id: 569, name: "Sir Elton" }
  ] as Array<{ term_id: number; name: string }>,
  
  show_features: {
    title: "",
    length: "3",
    details: [
      {
        title: "Duration",
        description: "65-70 Minutes",
        img_url: "https://ticketkite.com/wp-content/uploads/2024/01/noun-duration-2995228-FFFFFF.png"
      },
      {
        title: "The Hits",
        description: "Get Ready to Sing Along to Elton John's Top Hits",
        img_url: "https://ticketkite.com/wp-content/uploads/2025/05/noun-piano-7847770-FFD65B.png"
      },
      {
        title: "Age",
        description: "All Ages are Welcome; however due to loud sounds we recommend 5+",
        img_url: "https://ticketkite.com/wp-content/uploads/2023/11/noun-dance-6291413-FFFFFF.png"
      }
    ],
    tags: {
      length: "",
      details: []
    }
  },
  
  cast_members: [
    {
      title: "Jeff Burkett",
      description: "",
      img_url: "https://ticketkite.com/wp-content/uploads/2025/05/IMG_7873.jpeg"
    }
  ] as Array<{
    title: string;
    description: string;
    img_url: string;
  }>,
  
  gallery_images: [
    "https://ticketkite.com/wp-content/uploads/2025/05/332384259_511320637750763_7573778470119367884_n.jpg",
    "https://ticketkite.com/wp-content/uploads/2025/05/332506655_730121425329315_2413563551821677728_n.jpg",
    "https://ticketkite.com/wp-content/uploads/2025/05/471589220_28074848112159516_1494723626092123780_n.jpg",
    "https://ticketkite.com/wp-content/uploads/2025/05/473575491_8996467113721764_8660366478306246693_n.jpg",
    "https://ticketkite.com/wp-content/uploads/2025/05/480963431_9306400626113915_5160252759806072778_n.jpg",
    "https://ticketkite.com/wp-content/uploads/2025/05/IMG_7873.jpeg",
    "https://ticketkite.com/wp-content/uploads/2025/05/IMG_7872.jpeg",
    "https://ticketkite.com/wp-content/uploads/2025/05/IMG_7346.jpeg"
  ] as string[],
  
  gallery_videos: [] as string[],

  // Venue fields
  venue_title: "Modern Showrooms at Alexis Park Resort",
  venue_sub_title: "375 E. Harmon Ave, Las Vegas, NV 89069",
  venue_description: `Just off the busy Strip, the distinctive non-gaming, all-suite hotel known as Alexis Park Resort Hotel in Las Vegas provides  Tucked on verdant grounds, this peaceful hotel features more than 300 roomy apartments ranging from basic studios to opulent bi-level lofts, each with homey conveniences and many with kitchens.  One of the three glittering outdoor pools lets guests relax; another lets them enjoy a meal at the on-site restaurant; still another lets guests stay active in the gym.  Business conferences and special events frequent Alexis Park as it boasts large meeting and event venues.  Its handy location guarantees quick access to the energetic nightlife, entertainment, and culinary options known for Las Vegas, while still offering a quiet refuge free from casino noise.\r\n<br><br>\r\n<a href="https://expedia.com/affiliates/las-vegas-hotels-alexis-park-all-suite-resort.u5pgzAV" target="_blank"><B>Need a room at the Alexis Park Resort Hotel?</B></a><br>`,
  venue_enable_venue: "yes",
  venue_img_url: "https://ticketkite.com/wp-content/uploads/2023/12/3.jpg",
  venue_link: "https://ticketkite.com/all-venues/modern-showrooms-alexis-park-resort/",
  venue_google_map: `<div style="width: 100%"><iframe width="100%" height="600" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=+(Modern%20Showrooms%20at%20Alexis%20Park)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"><a href="https://www.gps.ie/">gps handsets</a></iframe></div>`,
  venue_seat_map: "",
  venue_series_data: {
    id: 22793,
    name: "Sir Elton @ Alexis Park",
    venue: {
      id: 1833,
      name: "Modern Showrooms at Alexis Park Resort Hotel",
      address1: "375 E Harmon",
      city: "Las Vegas",
      state: "NV",
      postalCode: "89169",
      currencySymbol: "$",
      currencyLocale: "en-US",
      timezone: "(UTC-08:00) Pacific Time (US & Canada)",
      timezoneInfo: {
        id: "Pacific Standard Time",
        displayName: "(UTC-08:00) Pacific Time (US & Canada)",
        baseUtcOffset: "-08:00:00",
        currentUtcOffset: "-07:00:00"
      }
    },
    seriesCode: "SirEltonAP",
    publicUrl: "https://tickets.ticketkite.com/tickets/series/SirEltonAP",
    isGASales: false,
    priceLevels: [
      { id: 86824, name: "General Admission Seat", label: "GA Seat" },
      { id: 86825, name: "VIP Seating", label: "VIP" },
      { id: 86826, name: "Front Row", label: "Front Row" }
    ],
    priceTypes: [
      { id: 39287, displayName: "Adult", isDefault: true }
    ],
    promotions: [
      { id: 100908, name: "777 TICKETS", code: "777TICKETS", requireEvenNumberOfTickets: false },
      { id: 100909, name: "EventBrite", code: "EVENTBRITE", requireEvenNumberOfTickets: false },
      { id: 100910, name: "FAB5LV", code: "FAB5LV", requireEvenNumberOfTickets: false },
      { id: 100912, name: "GET YOUR GUIDE", code: "GYG2025", requireEvenNumberOfTickets: false },
      { id: 100911, name: "GROUPON", code: "GROUPON", requireEvenNumberOfTickets: false },
      { id: 100913, name: "SPOTLIGHT27", code: "SPOT27", requireEvenNumberOfTickets: false },
      { id: 100914, name: "TicketKite", code: "TICKETKITEVEGAS", requireEvenNumberOfTickets: false },
      { id: 100915, name: "TIX 4 TONIGHT", code: "TIX4TONIGHT", requireEvenNumberOfTickets: false },
      { id: 100917, name: "VDC Full", code: "VDCFULL", requireEvenNumberOfTickets: false },
      { id: 100916, name: "VDCDISCREG", code: "VDCDISCREG", requireEvenNumberOfTickets: false },
      { id: 101394, name: "VDCFALL25", code: "VDCFALL25", requireEvenNumberOfTickets: false },
      { id: 100918, name: "VIATOR", code: "VIATOR", requireEvenNumberOfTickets: false },
      { id: 100919, name: "Victory Live", code: "VL2025", requireEvenNumberOfTickets: false },
      { id: 100920, name: "WYNDHAMUPGRADE", code: "WYNDHAMUPGRADE", requireEvenNumberOfTickets: false }
    ],
    seatAlerts: [
      {
        id: 952,
        name: "Entry for 4 guests.",
        description: "Each table selection is good for entry of up to 4 guests.",
        requireAcknowledgement: false,
        displayName: "Entry for 4 guests.",
        displayDescription: "Each table selection is good for entry of up to 4 guests."
      }
    ]
  },
  venue_details_array: [
    {
      title: "Free Parking",
      description: "Free Parking is located throughout the Alexis Park Resort property.",
      link_url: "#",
      img_url: "https://ticketkite.com/wp-content/uploads/2023/12/parking-sign.png"
    },
    {
      title: "ADA Seating",
      description: "Most seating sections allow for easy wheelchair access or transfer.  Please inquire with the box office or usher to assure your specific needs are addressed.",
      link_url: "javascript:void(0)",
      img_url: "https://ticketkite.com/wp-content/uploads/2023/12/wheelchair-1.png"
    },
    {
      title: "Steakhouse at Alexis Garden",
      description: "The Steakhouse at Alexis Gardens inspired by Chef Lance Cole is the perfect pairing with your show. Superior quality of a traditional steakhouse with delectable cuisine, upscale cocktails, and wine.\r\n\r\n5:00pm – 10:00pm Daily",
      link_url: "www.alexispark.com/dining/steak-house-at-alexis-gardens",
      img_url: "https://ticketkite.com/wp-content/uploads/2023/12/fork-spoon.png"
    },
    {
      title: "Pegasus Bar & Grill",
      description: "Enjoy a cocktail from our specialty menu or have your favorite selection from our fully-stocked bar.  The Pegasus Bar & Grill also offers some great food before or after your show. Hours of Operation Monday - Thursday 3pm - 12am, Friday - Sunday 12pm - 12am",
      link_url: "www.alexispark.com/dining/pegasus-bar",
      img_url: "https://ticketkite.com/wp-content/uploads/2023/12/cocktail.png"
    }
  ] as Array<{
    title: string;
    description: string;
    link_url: string;
    img_url: string;
  }>,

  // Show Features details
  show_features_title: "",
  show_features_details: [
    {
      title: "Duration",
      description: "65-70 Minutes",
      img_url: "https://ticketkite.com/wp-content/uploads/2024/01/noun-duration-2995228-FFFFFF.png"
    },
    {
      title: "The Hits",
      description: "Get Ready to Sing Along to Elton John's Top Hits",
      img_url: "https://ticketkite.com/wp-content/uploads/2025/05/noun-piano-7847770-FFD65B.png"
    },
    {
      title: "Age",
      description: "All Ages are Welcome; however due to loud sounds we recommend 5+",
      img_url: "https://ticketkite.com/wp-content/uploads/2023/11/noun-dance-6291413-FFFFFF.png"
    }
  ] as Array<{
    title: string;
    description: string;
    img_url: string;
  }>,

  // Yoast SEO fields
  yoast_focuskw: "Elton John Vegas",
  yoast_focuskeywords: "",
  yoast_metadesc: "Experience Sir Elton, a top-rated Elton John tribute show in Las Vegas, starring Jeff Burkett live at the piano. Enjoy Elton John's greatest hits with live vocals, drums, and a featured female singer in an intimate 100-seat showroom near the Strip.",
  yoast_title: "%%title%% %%sep%% %%sitename%%",
  yoast_seo: null as Record<string, unknown> | null,
  
  // Story object (for backward compatibility)
  story: null as Record<string, unknown> | null,
  
  // Venue details object (for backward compatibility)
  venue_details: null as Record<string, unknown> | null,
  
  // Additional info object (for backward compatibility)
  additional_info: null as Record<string, unknown> | null,
};

