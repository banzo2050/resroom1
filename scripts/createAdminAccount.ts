import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const createAdminAccount = async () => {
  try {
    // Create admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@resroom.com',
      'Admin@123' // Default password
    );
    const user = userCredential.user;

    // Create admin profile in both collections
    const adminData = {
      id: user.uid,
      email: user.email,
      full_name: 'System Administrator',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create in profiles collection
    await setDoc(doc(db, 'profiles', user.uid), adminData);

    // Create in users collection
    await setDoc(doc(db, 'users', user.uid), {
      ...adminData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('Admin account created successfully!');
    console.log('Email:', 'admin@resroom.com');
    console.log('Password:', 'Admin@123');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin account already exists');
    } else {
      console.error('Error creating admin account:', error);
    }
  }
};

// Run the script
createAdminAccount(); 