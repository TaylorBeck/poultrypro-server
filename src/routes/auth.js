import express from 'express';
import { auth, db } from '../config/firebase.js';

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate role
    if (role !== 'admin' && role !== 'customer') {
      return res
        .status(400)
        .json({ error: 'Invalid role. Must be either "admin" or "customer".' });
    }

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    // Prepare user data for Realtime Database
    const userData = {
      name,
      email,
      role,
      image: `https://s3-poultrypro.s3.us-west-2.amazonaws.com/face-1.png`,
      farms: {} // Initialize empty farms object
    };

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

    // If role is admin, create 3 default farms with detailed data
    if (role === 'admin') {
      for (let i = 1; i <= 3; i++) {
        const newFarmRef = db.ref('farms').push();
        const farmId = newFarmRef.key;
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
              token: `uniqueAccessToken${i}`,
              expiresAt: '2024-09-29T00:00:00Z'
            }
          }
        });
        userData.farms[farmId] = true;

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

        // Add 20 chickens
        for (let j = 1; j <= 20; j++) {
          await db.ref(`chickens/${farmId}/chicken${j}`).set({
            trackingCode: `CHK${i}${j}`,
            farmId: farmId,
            name: `${names[Math.floor(Math.random() * names.length)]}`,
            type: `${types[Math.floor(Math.random() * types.length)]}`,
            dateHatched: `2024-05-${15 + j}`,
            currentLocation: `Coop ${String.fromCharCode(64 + j)}`,
            eggColor: j % 2 === 0 ? 'white' : 'brown',
            currentWeight: 1 + j * 0.1,
            currentHeight: j,
            measurements: {
              measurement1: {
                weight: 1.5 + j * 0.1,
                height: j,
                date: `2024-08-${29 + j}`
              },
              measurement2: {
                weight: 1 + j * 0.1,
                height: j + 0.3,
                date: `2024-08-${28 + j}`
              },
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

        // Add inventory
        await db.ref(`inventory/${farmId}`).set({
          feed: {
            starter: {
              quantity: 5000 + i * 1000,
              unit: 'kg'
            },
            grower: {
              quantity: 3000 + i * 1000,
              unit: 'kg'
            }
          },
          equipment: {
            incubators: {
              total: 10 + i * 2,
              inUse: 8 + i,
              maintenance: 2 + i
            },
            brooders: {
              total: 20 + i * 2,
              inUse: 15 + i,
              available: 5 + i
            }
          }
        });

        // Add 5 orders
        for (let k = 1; k <= 5; k++) {
          await db.ref(`orders/order${i}${k}`).set({
            customerId: 'customer1',
            farmId: farmId,
            orderDate: `2024-08-${29 + k}`,
            status: k % 2 === 0 ? 'shipped' : 'processing',
            items: {
              chicks: {
                breed: `Breed${k}`,
                quantity: 500 + k * 100,
                price: 2.5 + k * 0.1
              },
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
              trackingNumber: `SHIP123456789${i}${k}`
            }
          });
        }
      }
    }

    // Store user data in Realtime Database
    await db.ref(`users/${userRecord.uid}`).set(userData);

    return res.status(201).json({
      message: 'User registered successfully',
      userId: userRecord.uid
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Fetch user data from Realtime Database
    const userSnapshot = await db.ref(`users/${uid}`).once('value');
    const userData = userSnapshot.val();

    const user = {
      uid: uid,
      email: decodedToken.email,
      name: userData.name,
      role: userData.role,
      farms: userData.farms
    };

    res.json({
      user
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

export default router;
