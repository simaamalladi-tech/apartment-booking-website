import mongoose from 'mongoose';

// Seed sample apartments into database
const sampleApartments = [
  {
    title: 'Alt-Berliner Eckkneipe - "Feuchte Ecke"',
    description: 'Spacious ground-floor apartment in a converted historic Berlin corner pub (Eckkneipe). This unique 90 m² two-bedroom apartment features original character with parquet floors, a private terrace with inner courtyard views, and an outdoor dining area. Fully equipped with a modern kitchen including dishwasher, oven, microwave, and coffee maker. Located in a quiet Berlin neighborhood with excellent tram connections — reach Museum Island and Alexanderplatz in about 30 minutes. Non-smoking property with free WiFi, air conditioning, and washing machine. Rated 9.3/10 "Superb" by guests.',
    city: 'Berlin',
    address: '146A Gustav-Adolf-Straße, 13086 Berlin',
    price: 55,
    beds: 2,
    baths: 1,
    maxGuests: 4,
    size: 90,
    amenities: [
      'Free WiFi',
      'Air Conditioning',
      'Heating',
      'Fully Equipped Kitchen',
      'Dishwasher',
      'Oven & Microwave',
      'Coffee/Tea Maker',
      'Washing Machine',
      'Flat-Screen TV',
      'Private Terrace',
      'Inner Courtyard View',
      'Outdoor Dining Area',
      'Hair Dryer',
      'Iron',
      'Free Toiletries',
      'Parquet Floors',
      'Private Entrance',
      'Non-Smoking',
      'Pets Allowed',
      'Luggage Storage'
    ],
    available: true,
    images: [
      'https://aptaltberlinerecke.hotelberlino.net/data/Photos/OriginalPhoto/15081/1508113/1508113882/alt-berliner-eckkneipe-feuchte-ecke-berlin-photo-5.JPEG',
      'https://aptaltberlinerecke.hotelberlino.net/data/Photos/OriginalPhoto/14945/1494537/1494537313/alt-berliner-eckkneipe-feuchte-ecke-berlin-photo-2.JPEG',
      'https://aptaltberlinerecke.hotelberlino.net/data/Photos/OriginalPhoto/15081/1508113/1508113876/alt-berliner-eckkneipe-feuchte-ecke-berlin-photo-3.JPEG',
      'https://aptaltberlinerecke.hotelberlino.net/data/Photos/OriginalPhoto/15081/1508113/1508113879/alt-berliner-eckkneipe-feuchte-ecke-berlin-photo-4.JPEG',
      'https://aptaltberlinerecke.hotelberlino.net/data/Photos/OriginalPhoto/15383/1538387/1538387731/alt-berliner-eckkneipe-feuchte-ecke-berlin-photo-1.JPEG',
      'https://aptaltberlinerecke.hotelberlino.net/data/Photos/OriginalPhoto/15081/1508113/1508113897/alt-berliner-eckkneipe-feuchte-ecke-berlin-photo-6.JPEG',
      'https://aptaltberlinerecke.hotelberlino.net/data/Photos/OriginalPhoto/15081/1508113/1508113900/alt-berliner-eckkneipe-feuchte-ecke-berlin-photo-7.JPEG',
      'https://aptaltberlinerecke.hotelberlino.net/data/Photos/OriginalPhoto/15081/1508113/1508113924/alt-berliner-eckkneipe-feuchte-ecke-berlin-photo-8.JPEG',
      'https://aptaltberlinerecke.hotelberlino.net/data/Photos/OriginalPhoto/15081/1508113/1508113927/alt-berliner-eckkneipe-feuchte-ecke-berlin-photo-9.JPEG',
      'https://aptaltberlinerecke.hotelberlino.net/data/Photos/OriginalPhoto/15081/1508113/1508113930/alt-berliner-eckkneipe-feuchte-ecke-berlin-photo-10.JPEG'
    ]
  }
];

export async function seedApartments() {
  try {
    const Apartment = mongoose.model('Apartment');

    // Always upsert the main property with latest data
    const data = sampleApartments[0];
    await Apartment.findOneAndUpdate(
      { title: /Alt-Berliner/i },
      { $set: data },
      { upsert: true, new: true }
    );

    // Remove any other sample apartments that are no longer needed
    await Apartment.deleteMany({ title: { $not: /Alt-Berliner/i } });

    console.log('✓ Alt-Berliner Eckkneipe property data synced');
  } catch (error) {
    console.error('Error seeding apartments:', error);
  }
}

export default seedApartments;
