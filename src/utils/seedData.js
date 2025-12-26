import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const seedDummyData = async () => {
  const dummyGrievances = [
    {
      title: 'Large Pothole - HITEC City Road',
      description: 'Deep pothole near Mindspace junction causing traffic issues and vehicle damage',
      category: 'pothole',
      urgency: 'high',
      status: 'in-progress',
      location: { 
        latitude: 17.4419, 
        longitude: 78.3816,
        address: 'Near Mindspace, HITEC City'
      },
      photoURL: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300',
      userId: 'demo1',
      userName: 'Rahul Sharma'
    },
    {
      title: 'Street Light Not Working - Gachibowli',
      description: 'Light pole #45 not working for 5 days, making area unsafe at night',
      category: 'streetlight',
      urgency: 'medium',
      status: 'submitted',
      location: { 
        latitude: 17.4400, 
        longitude: 78.3480,
        address: 'Gachibowli Main Road'
      },
      photoURL: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w-400&h=300',
      userId: 'demo2',
      userName: 'Priya Singh'
    },
    {
      title: 'Garbage Overflow - Kondapur',
      description: 'Garbage bin overflowing for 3 days, attracting stray animals',
      category: 'garbage',
      urgency: 'high',
      status: 'resolved',
      location: { 
        latitude: 17.4750, 
        longitude: 78.3636,
        address: 'Kondapur Market Area'
      },
      photoURL: 'https://images.unsplash.com/photo-1578558288137-7207cb8c0e85?w=400&h=300',
      userId: 'demo3',
      userName: 'Arun Kumar'
    },
    {
      title: 'Water Logging - Madhapur',
      description: 'Heavy water logging after rain, difficult for pedestrians',
      category: 'drainage',
      urgency: 'medium',
      status: 'submitted',
      location: { 
        latitude: 17.4484, 
        longitude: 78.3915,
        address: 'Madhapur Road'
      },
      photoURL: 'https://images.unsplash.com/photo-1558470570-c9a5a5ade867?w=400&h=300',
      userId: 'demo4',
      userName: 'Sneha Reddy'
    }
  ];

  try {
    console.log('Adding dummy data...');
    for (const grievance of dummyGrievances) {
      await addDoc(collection(db, 'grievances'), {
        ...grievance,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('✅ Dummy data added successfully!');
    alert('Demo data loaded! Refresh the dashboard.');
  } catch (error) {
    console.error('Error adding dummy data:', error);
  }
};

// Run this function from browser console during development
// seedDummyData();