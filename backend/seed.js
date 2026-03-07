import mongoose from 'mongoose';

// Seed sample apartments into database
const sampleApartments = [
  {
    title: 'Alt-Berliner Eckkneipe - Feuchte Ecke',
    description: 'Historic bar and guesthouse in the heart of Berlin Kreuzberg. Authentic Berlin atmosphere with cozy rooms above the legendary pub. Perfect for travelers seeking the real Berlin experience. Walking distance to Checkpoint Charlie, Museum Island, and vibrant nightlife.',
    city: 'Berlin',
    address: 'Mehringdamm 34-38, 10961 Berlin-Kreuzberg',
    price: 55,
    beds: 1,
    baths: 1,
    maxGuests: 2,
    amenities: ['WiFi', 'Shared Kitchen', 'Shared Bathroom', 'Bar Access', 'Central Location', 'Heating'],
    available: true,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1631049307038-da0ec629540d?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=1200&h=600&fit=crop'
    ]
  },
  {
    title: 'Spacious 2BR in Munich',
    description: 'Beautiful 2-bedroom apartment near the city center',
    city: 'Munich',
    address: 'Marienplatz 15, Munich',
    price: 75,
    beds: 2,
    baths: 1,
    maxGuests: 4,
    amenities: ['WiFi', 'Kitchen', '2 Bathrooms', 'Balcony'],
    available: true
  },
  {
    title: 'Luxury Penthouse in Hamburg',
    description: 'Stunning penthouse with panoramic city view',
    city: 'Hamburg',
    address: 'Binnenalster 1, Hamburg',
    price: 120,
    beds: 3,
    baths: 2,
    maxGuests: 6,
    amenities: ['WiFi', 'Luxury Kitchen', '2 Bathrooms', 'Terrace', 'Gym'],
    available: true
  },
  {
    title: 'Cozy 1BR in Frankfurt',
    description: 'Comfortable 1-bedroom in a peaceful neighborhood',
    city: 'Frankfurt',
    address: 'Main Street 99, Frankfurt',
    price: 55,
    beds: 1,
    baths: 1,
    maxGuests: 2,
    amenities: ['WiFi', 'Kitchen', 'Bathroom', 'Quiet Area'],
    available: true
  },
  {
    title: 'Modern 2BR in Cologne',
    description: 'Contemporary apartment with modern amenities',
    city: 'Cologne',
    address: 'Rhine View 28, Cologne',
    price: 65,
    beds: 2,
    baths: 1,
    maxGuests: 4,
    amenities: ['WiFi', 'Kitchen', 'Riverside View', 'Parking'],
    available: true
  },
  {
    title: '3BR Family Home in Dresden',
    description: 'Spacious family apartment with garden',
    city: 'Dresden',
    address: 'Altstadt 55, Dresden',
    price: 85,
    beds: 3,
    baths: 2,
    maxGuests: 6,
    amenities: ['WiFi', 'Kitchen', 'Garden', 'Parking', 'Laundry'],
    available: true
  },
  {
    title: 'Cozy Flat in Stuttgart',
    description: 'Charming apartment in the heart of Stuttgart',
    city: 'Stuttgart',
    address: 'Königstraße 25, Stuttgart',
    price: 60,
    beds: 1,
    baths: 1,
    maxGuests: 2,
    amenities: ['WiFi', 'Kitchen', 'Central Location'],
    available: true
  },
  {
    title: 'Luxury Apt in Düsseldorf',
    description: 'Premium apartment in the Rhine district',
    city: 'Düsseldorf',
    address: 'Rhine Promenade 10, Düsseldorf',
    price: 95,
    beds: 2,
    baths: 2,
    maxGuests: 4,
    amenities: ['WiFi', 'Luxury Kitchen', 'River View', 'Gym Access'],
    available: true
  }
];

export async function seedApartments() {
  try {
    const Apartment = mongoose.model('Apartment');
    const count = await Apartment.countDocuments();
    
    if (count === 0) {
      await Apartment.insertMany(sampleApartments);
      console.log('✓ Sample apartments added to database');
    } else {
      console.log(`✓ Database already contains ${count} apartments`);
    }
  } catch (error) {
    console.error('Error seeding apartments:', error);
  }
}

export default seedApartments;
