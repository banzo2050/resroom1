import { auth, db } from '../main';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';

interface AdminSetupResult {
  success: boolean;
  message: string;
  credentials?: {
    email: string;
    password: string;
  };
  error?: any;
}

// This function is only used during development to ensure we have an admin user for testing
export const createDefaultAdmin = async (): Promise<AdminSetupResult> => {
  console.log("Checking if default admin exists...");
  
  try {
    // Check if the default admin exists
    const adminQuery = query(
      collection(db, 'profiles'),
      where('role', '==', 'admin')
    );
    
    const adminSnapshot = await getDocs(adminQuery);
    
    // Log what we found
    if (!adminSnapshot.empty) {
      // Create an email from the student ID
      const adminEmail = adminSnapshot.docs[0].data().student_id + '@uneswa.ac.sz';
      console.log("Admin user found:", adminEmail);
      return {
        success: true,
        message: 'Admin user already exists',
      };
    }
    
    // Create default admin if none exists
    console.log("No admin found. Creating default admin...");
    
    // Default admin credentials
    const adminEmail = 'admin@uneswa.ac.sz';
    const adminPassword = 'Admin@123';
    
    // Create admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    // Create admin profile in Firestore
    await setDoc(doc(db, 'profiles', user.uid), {
      full_name: 'System Administrator',
      student_id: 'admin',
      role: 'admin',
      email: adminEmail,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // Also create in users collection for consistency
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email: adminEmail,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Return admin credentials
    return {
      success: true,
      message: 'Default admin credentials were created',
      credentials: {
        email: adminEmail,
        password: adminPassword
      }
    };
  } catch (error) {
    console.error("Error in createDefaultAdmin:", error);
    return {
      success: false,
      message: 'Error checking for admin users',
      error
    };
  }
};
