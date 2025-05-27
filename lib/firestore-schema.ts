
import { collection, doc, getDocs, query, setDoc, where, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';

// Function to set up initial collections and sample data
export const setupFirestoreSchema = async () => {
  try {
    // First check if admin user already exists to avoid duplicates
    const usersRef = collection(db, "users");
    const adminQuery = query(usersRef, where("email", "==", "admin@uneswa.ac.sz"));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (adminSnapshot.empty) {
      console.log("Creating new schema and demo accounts...");
      
      // Create admin account in Auth
      try {
        await createUserWithEmailAndPassword(auth, "admin@uneswa.ac.sz", "password");
      } catch (err) {
        console.log("Admin auth account might already exist, continuing...");
      }
      
      // Create student account in Auth
      try {
        await createUserWithEmailAndPassword(auth, "student@uneswa.ac.sz", "password");
      } catch (err) {
        console.log("Student auth account might already exist, continuing...");
      }
      
      // 1. Sample admin user
      const adminData = {
        email: "admin@uneswa.ac.sz",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // 2. Sample student user
      const studentData = {
        email: "student@uneswa.ac.sz",
        firstName: "John",
        lastName: "Student",
        role: "student",
        studentId: "S12345",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // 3. Sample blocks
      const block1 = {
        name: "Block A",
        gender: "male",
        totalRooms: 50,
        description: "Male dormitory with single and double rooms",
        imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=600&h=400",
      };
      
      const block2 = {
        name: "Block B",
        gender: "female",
        totalRooms: 60,
        description: "Female dormitory with various room types",
        imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&h=400",
      };
      
      // 4. Sample rooms
      const room1 = {
        roomNumber: "A101",
        blockId: "block1",
        capacity: 2,
        occupied: 0,
        floor: 1,
        type: "double",
        amenities: ["bed", "desk", "wardrobe", "wifi"],
        status: "available",
      };
      
      const room2 = {
        roomNumber: "B201",
        blockId: "block2",
        capacity: 1,
        occupied: 0,
        floor: 2,
        type: "single",
        amenities: ["bed", "desk", "wardrobe", "wifi", "private bathroom"],
        status: "available",
      };
      
      // 5. Sample announcements
      const announcement1 = {
        title: "Room Selection Period Now Open",
        content: "The room selection period for the upcoming academic year is now open. Please submit your application before May 15, 2025.",
        authorId: "admin-123",
        isPublished: true,
        target: "all",
        publishDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=600&h=400"
      };
      
      // Add documents with specific IDs
      await setDoc(doc(db, "users", "admin-123"), adminData);
      await setDoc(doc(db, "users", "student-123"), studentData);
      await setDoc(doc(db, "blocks", "block1"), block1);
      await setDoc(doc(db, "blocks", "block2"), block2);
      await setDoc(doc(db, "rooms", "room1"), room1);
      await setDoc(doc(db, "rooms", "room2"), room2);
      await setDoc(doc(db, "announcements", "announcement1"), announcement1);
      
      console.log("Firestore schema setup completed successfully!");
    } else {
      console.log("Schema already exists. Skipping setup.");
    }
    
    return true;
  } catch (error) {
    console.error("Error setting up Firestore schema:", error);
    return false;
  }
};

// This function can be called to test Firestore connectivity
export const testFirestoreConnection = async () => {
  try {
    // Try to access a collection to check if connection works
    const testCollection = collection(db, "test");
    console.log("Firestore connection successful!", testCollection.id);
    return true;
  } catch (error) {
    console.error("Firestore connection failed:", error);
    return false;
  }
};

// Define collection names and their schema as TypeScript types for reference
export const COLLECTIONS = {
  USERS: 'users',
  BLOCKS: 'blocks',
  ROOMS: 'rooms',
  APPLICATIONS: 'applications',
  MAINTENANCE_REQUESTS: 'maintenance_requests',
  ANNOUNCEMENTS: 'announcements',
  NOTIFICATIONS: 'notifications',
};
