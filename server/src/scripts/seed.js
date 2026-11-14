require('dotenv').config();
const mongoose = require('mongoose');
const State = require('../models/State');
const City = require('../models/City');
const Place = require('../models/Place');
const Admin = require('../models/Admin');
const { statesData, citiesData, placesData } = require('./seedData');
const { connectDB, disconnectDB } = require('../config/db');

const seedAll = async () => {
  try {
    console.log('[Seed] Beginning database seeding...');
    
    // 1. Seed Admin
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@travelbharat.in').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456';

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await Admin.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`[Seed] Created default Admin user: ${adminEmail} (password: ${adminPassword})`);
    } else {
      console.log(`[Seed] Admin user already exists: ${adminEmail}`);
    }

    // 2. Seed States
    const stateMap = {}; // slug -> state doc
    for (const s of statesData) {
      const stateDoc = await State.findOneAndUpdate(
        { slug: s.slug },
        s,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      stateMap[s.slug] = stateDoc;
    }
    console.log(`[Seed] Seeded ${Object.keys(stateMap).length} States & Union Territories.`);

    // 3. Seed Cities
    const cityMap = {}; // slug -> city doc
    for (const c of citiesData) {
      const stateDoc = stateMap[c.stateSlug];
      if (stateDoc) {
        const cityDoc = await City.findOneAndUpdate(
          { slug: c.slug, state: stateDoc._id },
          {
            name: c.name,
            slug: c.slug,
            state: stateDoc._id,
            description: c.description,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        cityMap[`${c.stateSlug}_${c.slug}`] = cityDoc;
      }
    }
    console.log(`[Seed] Seeded ${Object.keys(cityMap).length} Cities.`);

    // 4. Seed Places
    let placeCount = 0;
    for (const p of placesData) {
      const stateDoc = stateMap[p.stateSlug];
      if (!stateDoc) continue;

      let cityId = null;
      if (p.cityName) {
        const cityDoc = await City.findOne({
          state: stateDoc._id,
          name: { $regex: new RegExp(`^${p.cityName}`, 'i') },
        });
        if (cityDoc) {
          cityId = cityDoc._id;
        }
      }

      await Place.findOneAndUpdate(
        { slug: p.slug },
        {
          name: p.name,
          slug: p.slug,
          state: stateDoc._id,
          city: cityId,
          category: p.category,
          description: p.description,
          historicalSignificance: p.historicalSignificance,
          bestTimeToVisit: p.bestTimeToVisit,
          entryFee: p.entryFee,
          timings: p.timings,
          mapLink: p.mapLink,
          images: p.images,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      placeCount++;
    }
    console.log(`[Seed] Seeded ${placeCount} Tourist Places.`);
    console.log('[Seed] Database seeding completed successfully!');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    throw err;
  }
};

// If run directly from CLI
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedAll();
      await disconnectDB();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}

module.exports = { seedAll };
