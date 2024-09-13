import { db } from '../config/firebase.js';

const cities = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'San Jose'
];
const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA'];
const farmTypes = ['Hatchery', 'Feed Mill', 'Poultry Farm'];
const farmSizes = ['Small', 'Medium', 'Large'];
const names = [
  'Henrietta',
  'Benedict',
  'Clarissa',
  'Dahlia',
  'Ethan',
  'Flora',
  'Gus',
  'Hattie',
  'Iris',
  'Jasper',
  'Kai',
  'Luna',
  'Milo',
  'Nala',
  'Oreo',
  'Penny',
  'Quincy',
  'Ruby',
  'Sasha',
  'Toby',
  'Uma',
  'Violet',
  'Winston',
  'Xena',
  'Yara',
  'Zoe'
];
const types = ['Broiler', 'Layer', 'Dual-purpose'];

export async function seedAdminData(name, userData) {
  for (let i = 1; i <= 3; i++) {
    const newFarmRef = db.ref('farms').push();
    const farmId = newFarmRef.key;
    // Create a guest token id between 100 and 10000
    const tokenId = Math.floor(Math.random() * (10000 - 100 + 1)) + 100;
    await newFarmRef.set({
      name: `${name}'s Farm ${i}`,
      type: farmTypes[Math.floor(Math.random() * farmTypes.length)],
      size: farmSizes[Math.floor(Math.random() * farmSizes.length)],
      imageUrl: `https://s3-poultrypro.s3.us-west-2.amazonaws.com/farm-${i}.png`,
      location: {
        address: `123 Farm Road ${i}`,
        city: cities[Math.floor(Math.random() * cities.length)],
        state: states[Math.floor(Math.random() * states.length)],
        country: 'USA'
      },
      guestAccess: {
        guest1: {
          token: `uniqueAccessToken${tokenId}`,
          expiresAt: '2024-09-29T00:00:00Z'
        }
      }
    });
    userData.farms[farmId] = true;

    await seedChickens(farmId, i);
    await seedInventory(farmId, i);
    await seedOrders(farmId, i);
  }
}

async function seedChickens(farmId, farmIndex) {
  for (let j = 1; j <= 20; j++) {
    await db.ref(`chickens/${farmId}/chicken${j}`).set({
      trackingCode: `CHK${farmIndex}${j}`,
      farmId: farmId,
      name: `${names[Math.floor(Math.random() * names.length)]}`,
      type: `${types[Math.floor(Math.random() * types.length)]}`,
      dateHatched: `2024-05-${15 + j}`,
      currentLocation: `Coop ${String.fromCharCode(64 + j)}`,
      eggColor: j % 2 === 0 ? 'white' : 'brown',
      currentWeight: 1 + j * 0.1,
      currentHeight: j,
      measurements: {
        measurement1: { weight: 1.5 + j * 0.1, height: j, date: `2024-08-${29 + j}` },
        measurement2: { weight: 1 + j * 0.1, height: j + 0.3, date: `2024-08-${28 + j}` },
        measurement3: {
          weight: 0.8 + j * 0.1,
          height: j + 0.6,
          date: `2024-08-${27 + j}`
        },
        measurement4: {
          weight: 0.6 + j * 0.1,
          height: j + 0.9,
          date: `2024-08-${26 + j}`
        },
        measurement5: {
          weight: 0.4 + j * 0.1,
          height: j + 1.2,
          date: `2024-08-${25 + j}`
        }
      },
      imageUrl: `https://s3-poultrypro.s3.us-west-2.amazonaws.com/chick-${
        Math.floor(Math.random() * 11) + 1
      }.png`,
      popularity: 42 + j
    });
  }
}

async function seedInventory(farmId, farmIndex) {
  await db.ref(`inventory/${farmId}`).set({
    feed: {
      starter: { quantity: 5000 + farmIndex * 1000, unit: 'kg' },
      grower: { quantity: 3000 + farmIndex * 1000, unit: 'kg' }
    },
    equipment: {
      incubators: {
        total: 10 + farmIndex * 2,
        inUse: 8 + farmIndex,
        maintenance: 2 + farmIndex
      },
      brooders: {
        total: 20 + farmIndex * 2,
        inUse: 15 + farmIndex,
        available: 5 + farmIndex
      }
    }
  });
}

async function seedOrders(farmId, farmIndex) {
  for (let k = 1; k <= 5; k++) {
    await db.ref(`orders/order${farmIndex}${k}`).set({
      customerId: 'customer1',
      farmId: farmId,
      orderDate: `2024-08-${29 + k}`,
      status: k % 2 === 0 ? 'shipped' : 'processing',
      items: {
        chicks: { breed: `Breed${k}`, quantity: 500 + k * 100, price: 2.5 + k * 0.1 },
        feed: {
          type: k % 2 === 0 ? 'grower' : 'starter',
          quantity: 100 + k * 100,
          unit: 'kg',
          price: 0.5 + k * 0.1
        }
      },
      totalAmount: 1300 + k * 300,
      shippingDetails: {
        method: k % 2 === 0 ? 'standard' : 'express',
        address: `456 Poultry Lane, Eggtown, CT 0651${k}`,
        trackingNumber: `SHIP123456789${farmIndex}${k}`
      }
    });
  }
}
