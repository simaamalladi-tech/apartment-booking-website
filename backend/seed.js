import mongoose from 'mongoose';

// Seed sample apartments into database
const sampleApartments = [
  {
    title: 'Alt-Berliner Eckkneipe - "Feuchte Ecke"',
    description: 'Spacious ground-floor apartment in a converted historic Berlin corner pub (Eckkneipe). This unique 90 m² two-bedroom apartment features original character with parquet floors, a private terrace with inner courtyard views, and an outdoor dining area. Fully equipped with a modern kitchen including dishwasher, oven, microwave, and coffee maker. Located in a quiet Berlin neighborhood with excellent tram connections — reach Museum Island and Alexanderplatz in about 30 minutes. Non-smoking property with free WiFi, air conditioning, and washing machine. Rated 9.3/10 "Superb" by guests.',
    city: 'Berlin',
    address: 'Gustav-Adolf-Straße 146A, 13086 Berlin',
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
      '/images/apartment-01.jpg',
      '/images/apartment-02.jpg',
      '/images/apartment-03.jpg',
      '/images/apartment-04.jpg',
      '/images/apartment-05.jpg',
      '/images/apartment-06.jpg',
      '/images/apartment-07.jpg',
      '/images/apartment-08.jpg',
      '/images/apartment-09.jpg',
      '/images/apartment-10.jpg',
      '/images/apartment-11.jpg',
      '/images/apartment-12.jpg',
      '/images/apartment-13.jpg',
      '/images/apartment-14.jpg',
      '/images/apartment-15.jpg',
      '/images/apartment-16.jpg',
      '/images/apartment-17.jpg',
      '/images/apartment-18.jpg',
      '/images/apartment-19.jpg',
      '/images/apartment-20.jpg',
      '/images/apartment-21.jpg',
      '/images/apartment-22.jpg',
      '/images/apartment-23.jpg',
      '/images/apartment-24.jpg',
      '/images/apartment-25.jpg',
      '/images/apartment-26.jpg',
      '/images/apartment-27.jpg',
      '/images/apartment-28.jpg',
      '/images/apartment-29.jpg',
      '/images/apartment-30.jpg',
      '/images/apartment-31.jpg',
      '/images/apartment-32.jpg',
      '/images/apartment-33.jpg',
      '/images/apartment-34.jpg',
      '/images/apartment-35.jpg'
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
