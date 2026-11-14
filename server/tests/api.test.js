const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Admin = require('../src/models/Admin');
const State = require('../src/models/State');
const City = require('../src/models/City');
const Place = require('../src/models/Place');
const { seedAll } = require('../src/scripts/seed');

let mongoServer;
let adminCookie;
let adminToken;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_secret_key_12345';
  process.env.ADMIN_DEFAULT_EMAIL = 'admin@travelbharat.in';
  process.env.ADMIN_DEFAULT_PASSWORD = 'Admin@123456';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed data for tests
  await seedAll();

  // Log in as admin to retrieve auth cookie
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@travelbharat.in',
      password: 'Admin@123456',
    });

  expect(loginRes.status).toBe(200);
  expect(loginRes.body.success).toBe(true);
  adminToken = loginRes.body.token;

  // Extract cookie
  const cookies = loginRes.headers['set-cookie'];
  adminCookie = cookies;
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('1. Health Check Endpoint', () => {
  it('GET /api/health should return 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toContain('TravelBharat');
  });
});

describe('2. Public Visitor Endpoints (Read-Only)', () => {
  it('GET /api/states should return list of active states', async () => {
    const res = await request(app).get('/api/states');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('placesCount');
  });

  it('GET /api/states?type=State should filter only States', async () => {
    const res = await request(app).get('/api/states?type=State');
    expect(res.status).toBe(200);
    expect(res.body.data.every((s) => s.type === 'State')).toBe(true);
  });

  it('GET /api/states?type=Union Territory should filter only UTs', async () => {
    const res = await request(app).get('/api/states?type=Union Territory');
    expect(res.status).toBe(200);
    expect(res.body.data.every((s) => s.type === 'Union Territory')).toBe(true);
  });

  it('GET /api/states/:slug should return single state with its cities and places', async () => {
    const res = await request(app).get('/api/states/rajasthan');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Rajasthan');
    expect(Array.isArray(res.body.data.cities)).toBe(true);
    expect(Array.isArray(res.body.data.places)).toBe(true);
  });

  it('GET /api/states/non-existent-slug should return 404', async () => {
    const res = await request(app).get('/api/states/non-existent-slug');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/places should list tourist places', async () => {
    const res = await request(app).get('/api/places');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('category');
    expect(res.body.data[0]).toHaveProperty('state');
  });

  it('GET /api/places?category=Heritage should return only Heritage places', async () => {
    const res = await request(app).get('/api/places?category=Heritage');
    expect(res.status).toBe(200);
    expect(res.body.data.every((p) => p.category === 'Heritage')).toBe(true);
  });

  it('GET /api/places?q=Taj should find Taj Mahal', async () => {
    const res = await request(app).get('/api/places?q=Taj');
    expect(res.status).toBe(200);
    expect(res.body.data.some((p) => p.name.includes('Taj'))).toBe(true);
  });

  it('GET /api/places/:slug should return place details with images', async () => {
    const res = await request(app).get('/api/places/taj-mahal');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Taj Mahal');
    expect(Array.isArray(res.body.data.images)).toBe(true);
    expect(res.body.data.images.length).toBeGreaterThan(0);
  });

  it('GET /api/categories should return all 4 categories with counts', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(4);
    const catNames = res.body.data.map((c) => c.name);
    expect(catNames).toContain('Heritage');
    expect(catNames).toContain('Nature');
    expect(catNames).toContain('Adventure');
    expect(catNames).toContain('Religious');
  });

  it('GET /api/stats should return summary counts', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalStates');
    expect(res.body.data).toHaveProperty('totalUTs');
    expect(res.body.data).toHaveProperty('totalPlaces');
  });
});

describe('3. Admin Authentication & Cookie Handling', () => {
  it('POST /api/auth/login fails with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@travelbharat.in', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me fails when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me succeeds when passing httpOnly cookie', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('admin@travelbharat.in');
  });

  it('POST /api/auth/logout clears the token cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies.some((c) => c.includes('token=;'))).toBe(true);
  });
});

describe('4. Admin Protected CRUD Operations', () => {
  let createdStateId;
  let createdPlaceId;

  it('POST /api/states fails without auth', async () => {
    const res = await request(app)
      .post('/api/states')
      .send({
        name: 'Unauthorized State',
        type: 'State',
        capital: 'Test City',
        description: 'Testing unauth',
      });
    expect(res.status).toBe(401);
  });

  it('POST /api/states succeeds with admin cookie', async () => {
    const res = await request(app)
      .post('/api/states')
      .set('Cookie', adminCookie)
      .send({
        name: 'Sikkim',
        type: 'State',
        capital: 'Gangtok',
        description: 'A Himalayan wonderland bordered by Bhutan, Tibet, and Nepal.',
        heroImage: 'https://images.unsplash.com/test-sikkim.jpg',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('sikkim');
    createdStateId = res.body.data._id;
  });

  it('PUT /api/states/:id updates state details', async () => {
    const res = await request(app)
      .put(`/api/states/${createdStateId}`)
      .set('Cookie', adminCookie)
      .send({ capital: 'Gangtok (East Sikkim)' });

    expect(res.status).toBe(200);
    expect(res.body.data.capital).toBe('Gangtok (East Sikkim)');
  });

  it('POST /api/places creates a new place', async () => {
    const res = await request(app)
      .post('/api/places')
      .set('Cookie', adminCookie)
      .send({
        name: 'Nathula Pass',
        state: createdStateId,
        category: 'Adventure',
        description: 'A mountain pass in the Dongkya Range of the Himalayas on the Indo-China border.',
        bestTimeToVisit: 'May to October',
        entryFee: 'Permit required',
        images: [
          {
            url: 'https://images.unsplash.com/test-nathula.jpg',
            caption: 'Nathula Pass Indo-China Border at 14,140 ft',
            isPrimary: true,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('nathula-pass');
    createdPlaceId = res.body.data._id;
  });

  it('PUT /api/places/:id updates place details', async () => {
    const res = await request(app)
      .put(`/api/places/${createdPlaceId}`)
      .set('Cookie', adminCookie)
      .send({ entryFee: 'Permit ₹200' });

    expect(res.status).toBe(200);
    expect(res.body.data.entryFee).toBe('Permit ₹200');
  });

  it('DELETE /api/states/:id prevents deletion when places still exist', async () => {
    const res = await request(app)
      .delete(`/api/states/${createdStateId}`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('still has');
  });

  it('DELETE /api/places/:id deletes the place', async () => {
    const res = await request(app)
      .delete(`/api/places/${createdPlaceId}`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/states/:id deletes the state once clean', async () => {
    const res = await request(app)
      .delete(`/api/states/${createdStateId}`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
