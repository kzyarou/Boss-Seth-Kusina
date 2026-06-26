import { db, auth } from './config';
import { doc, getDoc, updateDoc, increment, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs, FieldValue, deleteDoc, Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as AuthUser } from 'firebase/auth';

// Helper to convert Firebase Timestamp to ISO string
function timestampToISO(timestamp: any): string {
  if (!timestamp) return new Date().toISOString();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  return new Date().toISOString();
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  timestamp: string;
}

export interface Like {
  userId: string;
  recipeId: string;
  timestamp: string;
}

export interface FirebaseUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  followers: number | FieldValue;
  following: number | FieldValue;
  likes: number;
  role: 'user' | 'admin';
  isVerified?: boolean;
  createdAt?: string;
  warningCount?: number | FieldValue;
}

export interface FirebaseRecipe {
  id: string;
  title: string;
  description: string;
  authorId: string;
  category: string;
  image: string;
  ingredients: string[];
  steps: string[];
  likes: number;
  commentCount: number;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

// Recipe operations
export async function createRecipe(recipe: Omit<FirebaseRecipe, 'id'>): Promise<string> {
  try {
    const recipesRef = collection(db, 'recipes');
    const docRef = await addDoc(recipesRef, {
      ...recipe,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
}

export async function getAllRecipes(): Promise<FirebaseRecipe[]> {
  try {
    const recipesRef = collection(db, 'recipes');
    const querySnapshot = await getDocs(recipesRef);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        authorId: data.authorId,
        category: data.category,
        image: data.image,
        ingredients: data.ingredients,
        steps: data.steps,
        likes: data.likes || 0,
        commentCount: data.commentCount || 0,
        status: data.status,
        createdAt: timestampToISO(data.createdAt)
      } as FirebaseRecipe;
    });
  } catch (error) {
    console.error('Error getting recipes:', error);
    return [];
  }
}

export async function getRecipeById(recipeId: string): Promise<FirebaseRecipe | null> {
  try {
    const recipeRef = doc(db, 'recipes', recipeId);
    const recipeDoc = await getDoc(recipeRef);
    
    if (!recipeDoc.exists()) {
      return null;
    }
    
    const data = recipeDoc.data();
    return {
      id: recipeDoc.id,
      title: data.title,
      description: data.description,
      authorId: data.authorId,
      category: data.category,
      image: data.image,
      ingredients: data.ingredients,
      steps: data.steps,
      likes: data.likes || 0,
      commentCount: data.commentCount || 0,
      status: data.status,
      createdAt: timestampToISO(data.createdAt)
    } as FirebaseRecipe;
  } catch (error) {
    console.error('Error getting recipe by ID:', error);
    return null;
  }
}

export async function updateRecipe(recipeId: string, updates: Partial<FirebaseRecipe>): Promise<void> {
  try {
    const recipeRef = doc(db, 'recipes', recipeId);
    await updateDoc(recipeRef, updates);
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
}

// Seed mock recipes to Firebase (call this once to populate the database)
export async function seedMockRecipes(recipes: any[]): Promise<void> {
  try {
    const existingRecipes = await getAllRecipes();
    
    if (existingRecipes.length > 0) {
      console.log('Recipes already exist in Firebase, skipping seed.');
      return;
    }
    
    console.log('Seeding mock recipes to Firebase...');
    
    for (const recipe of recipes) {
      await createRecipe({
        title: recipe.title,
        description: recipe.description,
        authorId: recipe.authorId,
        category: recipe.category,
        image: recipe.image,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        likes: recipe.likes,
        commentCount: recipe.comments?.length || 0,
        status: recipe.status,
        createdAt: recipe.createdAt
      });
    }
    
    console.log('Successfully seeded mock recipes to Firebase.');
  } catch (error) {
    console.error('Error seeding mock recipes:', error);
    throw error;
  }
}

// Add a like in Firebase
export async function addLike(recipeId: string, userId: string): Promise<void> {
  console.log('addLike called with recipeId:', recipeId, 'userId:', userId);
  const recipeRef = doc(db, 'recipes', recipeId);
  const likeRef = doc(db, 'likes', `${userId}_${recipeId}`);
  
  try {
    // Add the like document
    await setDoc(likeRef, {
      userId,
      recipeId,
      timestamp: serverTimestamp()
    });
    console.log('Like document created');
    
    // Increment the like count
    await updateDoc(recipeRef, {
      likes: increment(1)
    });
    console.log('Recipe likes incremented');
  } catch (error) {
    console.error('Error adding like:', error);
    throw error;
  }
}

// Remove a like in Firebase
export async function removeLike(recipeId: string, userId: string): Promise<void> {
  console.log('removeLike called with recipeId:', recipeId, 'userId:', userId);
  const recipeRef = doc(db, 'recipes', recipeId);
  const likeRef = doc(db, 'likes', `${userId}_${recipeId}`);
  
  try {
    // Remove the like document
    await deleteDoc(likeRef);
    console.log('Like document deleted');
    
    // Decrement the like count
    await updateDoc(recipeRef, {
      likes: increment(-1)
    });
    console.log('Recipe likes decremented');
  } catch (error) {
    console.error('Error removing like:', error);
    throw error;
  }
}

// Record a comment in Firebase
export async function recordComment(recipeId: string, comment: Omit<Comment, 'id'>): Promise<string> {
  const recipeRef = doc(db, 'recipes', recipeId);
  
  try {
    // Check if recipe exists in Firebase
    const recipeDoc = await getDoc(recipeRef);
    
    if (!recipeDoc.exists()) {
      console.warn(`Recipe ${recipeId} does not exist in Firebase. Comment not recorded.`);
      throw new Error('Recipe not found');
    }
    
    // Add comment to comments subcollection
    const commentsRef = collection(db, 'recipes', recipeId, 'comments');
    const docRef = await addDoc(commentsRef, {
      ...comment,
      timestamp: serverTimestamp()
    });
    
    // Update comment count on recipe
    await updateDoc(recipeRef, {
      commentCount: increment(1)
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error recording comment:', error);
    throw error;
  }
}

// Get comments for a recipe
export async function getComments(recipeId: string): Promise<Comment[]> {
  try {
    const commentsRef = collection(db, 'recipes', recipeId, 'comments');
    const querySnapshot = await getDocs(commentsRef);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        authorId: data.authorId,
        text: data.text,
        timestamp: timestampToISO(data.timestamp)
      } as Comment;
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

// Check if user has liked a recipe
export async function hasUserLiked(recipeId: string, userId: string): Promise<boolean> {
  try {
    const likeRef = doc(db, 'likes', `${userId}_${recipeId}`);
    const likeDoc = await getDoc(likeRef);
    return likeDoc.exists();
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
}

// User operations
export async function getUserByEmail(email: string): Promise<FirebaseUser | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      username: data.username,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar,
      followers: data.followers,
      following: data.following,
      likes: data.likes,
      role: data.role,
      isVerified: data.isVerified,
      createdAt: data.createdAt ? timestampToISO(data.createdAt) : undefined
    } as FirebaseUser;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function createUser(userData: Omit<FirebaseUser, 'id' | 'createdAt'> & { firebaseUid?: string }): Promise<string> {
  try {
    const usersRef = collection(db, 'users');
    
    // If firebaseUid is provided, use it as the document ID
    if (userData.firebaseUid) {
      const docRef = doc(usersRef, userData.firebaseUid);
      await setDoc(docRef, {
        ...userData,
        createdAt: serverTimestamp()
      });
      return userData.firebaseUid;
    }
    
    // Otherwise, let Firestore auto-generate an ID
    const docRef = await addDoc(usersRef, {
      ...userData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(userId: string, updates: Partial<FirebaseUser>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Follow/Unfollow operations
export async function followUser(followerId: string, followeeId: string): Promise<void> {
  try {
    // Increment following count for follower
    await updateUser(followerId, {
      following: increment(1)
    });
    
    // Increment followers count for followee
    await updateUser(followeeId, {
      followers: increment(1)
    });
    
    // Record follow relationship
    const followRef = doc(db, 'follows', `${followerId}_${followeeId}`);
    await setDoc(followRef, {
      followerId,
      followeeId,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

export async function unfollowUser(followerId: string, followeeId: string): Promise<void> {
  try {
    // Decrement following count for follower
    await updateUser(followerId, {
      following: increment(-1)
    });
    
    // Decrement followers count for followee
    await updateUser(followeeId, {
      followers: increment(-1)
    });
    
    // Note: In production, you'd want to delete the follow document
    // For simplicity, we're just decrementing the counts
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

export async function isFollowing(followerId: string, followeeId: string): Promise<boolean> {
  try {
    const followRef = doc(db, 'follows', `${followerId}_${followeeId}`);
    const followDoc = await getDoc(followRef);
    return followDoc.exists();
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

export async function getUserById(userId: string): Promise<FirebaseUser | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const data = userDoc.data();
    return {
      id: userDoc.id,
      username: data.username,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar,
      followers: data.followers,
      following: data.following,
      likes: data.likes,
      role: data.role,
      isVerified: data.isVerified,
      createdAt: data.createdAt ? timestampToISO(data.createdAt) : undefined
    } as FirebaseUser;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

// Special admin email
export const ADMIN_EMAIL = 'zacharyrapisss@gmail.com';

// Firebase Auth functions
export async function registerUser(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Delete recipe from Firebase
export async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    const recipeRef = doc(db, 'recipes', recipeId);
    await deleteDoc(recipeRef);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
}

// Delete user from Firebase
export async function deleteUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Add warning to user
export async function addWarning(userId: string, reason: string): Promise<void> {
  try {
    const warningRef = doc(db, 'warnings', `${userId}_${Date.now()}`);
    await setDoc(warningRef, {
      userId,
      reason,
      timestamp: serverTimestamp()
    });
    
    // Update user's warning count
    await updateUser(userId, {
      warningCount: increment(1)
    });
  } catch (error) {
    console.error('Error adding warning:', error);
    throw error;
  }
}

// Block machine ID
export async function blockMachineId(machineId: string, reason: string): Promise<void> {
  try {
    const blockRef = doc(db, 'blockedMachineIds', machineId);
    await setDoc(blockRef, {
      machineId,
      reason,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error blocking machine ID:', error);
    throw error;
  }
}

// Check if machine ID is blocked
export async function isMachineIdBlocked(machineId: string): Promise<boolean> {
  try {
    const blockRef = doc(db, 'blockedMachineIds', machineId);
    const blockDoc = await getDoc(blockRef);
    return blockDoc.exists();
  } catch (error) {
    console.error('Error checking machine ID block status:', error);
    return false;
  }
}

// Get all blocked machine IDs
export async function getBlockedMachineIds(): Promise<any[]> {
  try {
    const blockedRef = collection(db, 'blockedMachineIds');
    const querySnapshot = await getDocs(blockedRef);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        machineId: data.machineId,
        reason: data.reason,
        timestamp: timestampToISO(data.timestamp)
      };
    });
  } catch (error) {
    console.error('Error getting blocked machine IDs:', error);
    return [];
  }
}

// Get user warnings
export async function getUserWarnings(userId: string): Promise<any[]> {
  try {
    const warningsRef = collection(db, 'warnings');
    const q = query(warningsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        reason: data.reason,
        timestamp: timestampToISO(data.timestamp)
      };
    });
  } catch (error) {
    console.error('Error getting user warnings:', error);
    return [];
  }
}

// Unblock machine ID
export async function unblockMachineId(machineId: string): Promise<void> {
  try {
    const blockRef = doc(db, 'blockedMachineIds', machineId);
    await deleteDoc(blockRef);
  } catch (error) {
    console.error('Error unblocking machine ID:', error);
    throw error;
  }
}
