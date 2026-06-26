import { useEffect, useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import {
  User,
  Recipe,
  Notification,
  MOCK_USERS,
  MOCK_RECIPES,
  MOCK_NOTIFICATIONS } from
'../data/mockData';
import { sanitizeText, sanitizeArray } from '../utils/sanitize';
import { addLike, removeLike, recordComment, getUserByEmail, createUser, ADMIN_EMAIL, onAuthStateChange, logoutUser, createRecipe, getAllRecipes, seedMockRecipes, followUser, unfollowUser, getComments, hasUserLiked, updateRecipe, deleteRecipe, deleteUser, addWarning, blockMachineId, getBlockedMachineIds, getUserWarnings, unblockMachineId, getUserById } from '../firebase/services';
type AppContextType = {
  currentUser: User | null;
  login: (
  method: string,
  userDetails?: {
    name: string;
    email: string;
    phone: string;
  })
  => void;
  logout: () => void;
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  addRecipe: (
  recipe: Omit<Recipe, 'id' | 'likes' | 'comments' | 'status' | 'createdAt'>)
  => void;
  updateRecipeStatus: (id: string, status: 'approved' | 'rejected') => void;
  addComment: (recipeId: string, text: string) => void;
  savedRecipeIds: string[];
  toggleSave: (id: string) => void;
  likedRecipeIds: string[];
  toggleLike: (id: string) => void;
  notifications: Notification[];
  markNotificationsRead: () => void;
  users: Record<string, User>;
  setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>;
  toggleFollow: (userId: string) => void;
  deleteRecipe: (recipeId: string) => void;
  editRecipe: (recipeId: string, updates: Partial<Recipe>) => void;
  deleteUser: (userId: string) => void;
  addWarning: (userId: string, reason: string) => void;
  blockMachineId: (machineId: string, reason: string) => void;
  unblockMachineId: (machineId: string) => void;
  blockedMachineIds: any[];
  loadBlockedMachineIds: () => void;
  userWarnings: Record<string, any[]>;
  loadUserWarnings: (userId: string) => void;
};
const AppContext = createContext<AppContextType | undefined>(undefined);
// Helper to load from localStorage
function loadState<T>(key: string, defaultVal: T): T {
  try {
    const saved = localStorage.getItem(`sethkusina_${key}`);
    return saved ? JSON.parse(saved) : defaultVal;
  } catch {
    return defaultVal;
  }
}
export function AppProvider({ children }: {children: ReactNode;}) {
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
  loadState('currentUser', null)
  );
  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  
  // Load recipes from Firebase on mount
  useEffect(() => {
    getAllRecipes().then(async (firebaseRecipes) => {
      if (firebaseRecipes.length > 0) {
        // Load all unique authors from the recipes
        const uniqueAuthorIds = [...new Set(firebaseRecipes.map(r => r.authorId))];
        const authorPromises = uniqueAuthorIds.map(authorId => getUserById(authorId));
        const firebaseUsers = await Promise.all(authorPromises);
        
        // Add loaded authors to users state
        const newUsers: Record<string, User> = {};
        firebaseUsers.forEach((fu) => {
          if (fu) {
            newUsers[fu.id] = {
              id: fu.id,
              username: fu.username,
              email: fu.email,
              phone: fu.phone,
              avatar: fu.avatar,
              followers: typeof fu.followers === 'number' ? fu.followers : 0,
              following: typeof fu.following === 'number' ? fu.following : 0,
              likes: fu.likes,
              role: fu.role,
              isVerified: fu.isVerified
            };
          }
        });
        
        if (Object.keys(newUsers).length > 0) {
          setUsers(prev => ({ ...prev, ...newUsers }));
        }
        
        // Convert Firebase recipes to app Recipe format
        const appRecipes: Recipe[] = await Promise.all(firebaseRecipes.map(async (fr) => {
          // Load comments for each recipe
          const comments = await getComments(fr.id);
          
          return {
            id: fr.id,
            title: fr.title,
            description: fr.description,
            authorId: fr.authorId,
            category: fr.category,
            image: fr.image,
            ingredients: fr.ingredients,
            steps: fr.steps,
            likes: fr.likes,
            comments: comments,
            status: fr.status,
            createdAt: fr.createdAt
          };
        }));
        setRecipes(appRecipes);
      } else {
        // No recipes in Firebase, seed with mock data
        seedMockRecipes(MOCK_RECIPES).then(() => {
          console.log('Mock recipes seeded to Firebase');
        }).catch((error) => {
          console.error('Failed to seed mock recipes:', error);
        });
      }
    }).catch((error) => {
      console.error('Failed to load recipes from Firebase:', error);
    });
  }, []);

  // Load user's liked recipes from Firebase on mount
  useEffect(() => {
    if (!currentUser) return;
    
    // Check which recipes the current user has liked
    recipes.forEach(async (recipe) => {
      const hasLiked = await hasUserLiked(recipe.id, currentUser.id);
      if (hasLiked) {
        setLikedRecipeIds((prev) => {
          if (!prev.includes(recipe.id)) {
            return [...prev, recipe.id];
          }
          return prev;
        });
      }
    });
  }, [currentUser, recipes]);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>(() =>
  loadState('saved', [])
  );
  const [likedRecipeIds, setLikedRecipeIds] = useState<string[]>(() =>
  loadState('liked', [])
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
  loadState('notifs', MOCK_NOTIFICATIONS)
  );
  const [users, setUsers] = useState<Record<string, User>>(() =>
  loadState('users', MOCK_USERS)
  );
  const [blockedMachineIds, setBlockedMachineIds] = useState<any[]>([]);
  const [userWarnings, setUserWarnings] = useState<Record<string, any[]>>({});
  // Persist state changes
  useEffect(() => {
    localStorage.setItem('sethkusina_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);
  
  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user && user.email) {
        // User is signed in with Firebase Auth
        getUserByEmail(user.email).then((firebaseUser) => {
          if (firebaseUser) {
            const appUser: User = {
              id: firebaseUser.id,
              username: firebaseUser.username,
              email: firebaseUser.email,
              phone: firebaseUser.phone,
              avatar: firebaseUser.avatar,
              followers: typeof firebaseUser.followers === 'number' ? firebaseUser.followers : 0,
              following: typeof firebaseUser.following === 'number' ? firebaseUser.following : 0,
              likes: firebaseUser.likes,
              role: firebaseUser.role,
              isVerified: firebaseUser.isVerified
            };
            setUsers((prev) => ({
              ...prev,
              [firebaseUser.id]: appUser
            }));
            setCurrentUser(appUser);
          } else {
            // Fallback: create user from Firebase Auth data if Firestore fetch fails
            const isAdmin = user.email === ADMIN_EMAIL;
            const appUser: User = {
              id: user.uid,
              username: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              phone: user.phoneNumber || '',
              avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
              followers: 0,
              following: 0,
              likes: 0,
              role: isAdmin ? 'admin' : 'user',
              isVerified: isAdmin
            };
            
            // Create user in Firestore with Firebase Auth UID as document ID
            createUser({
              username: appUser.username,
              email: appUser.email || '',
              phone: appUser.phone || '',
              avatar: appUser.avatar,
              followers: appUser.followers,
              following: appUser.following,
              likes: appUser.likes,
              role: appUser.role,
              isVerified: appUser.isVerified,
              firebaseUid: user.uid
            }).catch((error) => {
              console.error('Failed to create user in Firestore:', error);
            });
            
            setUsers((prev) => ({
              ...prev,
              [user.uid]: appUser
            }));
            setCurrentUser(appUser);
          }
        }).catch((error) => {
          console.error('Error fetching user from Firestore, using fallback:', error);
          // Fallback: create user from Firebase Auth data if Firestore fetch fails
          const isAdmin = user.email === ADMIN_EMAIL;
          const appUser: User = {
            id: user.uid,
            username: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            phone: user.phoneNumber || '',
            avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
            followers: 0,
            following: 0,
            likes: 0,
            role: isAdmin ? 'admin' : 'user',
            isVerified: isAdmin
          };
          
          // Create user in Firestore with Firebase Auth UID as document ID
          createUser({
            username: appUser.username,
            email: appUser.email || '',
            phone: appUser.phone || '',
            avatar: appUser.avatar,
            followers: appUser.followers,
            following: appUser.following,
            likes: appUser.likes,
            role: appUser.role,
            isVerified: appUser.isVerified,
            firebaseUid: user.uid
          }).catch((error) => {
            console.error('Failed to create user in Firestore:', error);
          });
          
          setUsers((prev) => ({
            ...prev,
            [user.uid]: appUser
          }));
          setCurrentUser(appUser);
        });
      } else {
        // User is signed out
        setCurrentUser(null);
      }
    });
    
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    localStorage.setItem('sethkusina_recipes', JSON.stringify(recipes));
  }, [recipes]);
  useEffect(() => {
    localStorage.setItem('sethkusina_saved', JSON.stringify(savedRecipeIds));
  }, [savedRecipeIds]);
  useEffect(() => {
    localStorage.setItem('sethkusina_liked', JSON.stringify(likedRecipeIds));
  }, [likedRecipeIds]);
  useEffect(() => {
    localStorage.setItem('sethkusina_notifs', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem('sethkusina_users', JSON.stringify(users));
  }, [users]);
  const login = (
  method: string,
  userDetails?: {
    name: string;
    email: string;
    phone: string;
  }) =>
  {
    if (method === 'admin') {
      setCurrentUser(users['admin']);
    } else if (userDetails) {
      // Check if user exists in Firebase
      getUserByEmail(userDetails.email).then((firebaseUser) => {
        if (firebaseUser) {
          // User exists in Firebase, use that data
          const user: User = {
            id: firebaseUser.id,
            username: firebaseUser.username,
            email: firebaseUser.email,
            phone: firebaseUser.phone,
            avatar: firebaseUser.avatar,
            followers: typeof firebaseUser.followers === 'number' ? firebaseUser.followers : 0,
            following: typeof firebaseUser.following === 'number' ? firebaseUser.following : 0,
            likes: firebaseUser.likes,
            role: firebaseUser.role,
            isVerified: firebaseUser.isVerified
          };
          setUsers((prev) => ({
            ...prev,
            [firebaseUser.id]: user
          }));
          setCurrentUser(user);
        } else {
          // Create new user in Firebase
          const isAdmin = userDetails.email === ADMIN_EMAIL;
          const newId = `u_${Date.now()}`;
          const newUser: User = {
            id: newId,
            username: sanitizeText(userDetails.name, 50),
            email: userDetails.email,
            phone: userDetails.phone,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userDetails.name}`,
            followers: 0,
            following: 0,
            likes: 0,
            role: isAdmin ? 'admin' : 'user',
            isVerified: isAdmin
          };
          
          // Save to Firebase
          createUser({
            username: newUser.username,
            email: newUser.email || '',
            phone: newUser.phone || '',
            avatar: newUser.avatar,
            followers: newUser.followers,
            following: newUser.following,
            likes: newUser.likes,
            role: newUser.role,
            isVerified: newUser.isVerified
          }).catch((error) => {
            console.error('Failed to create user in Firebase:', error);
          });
          
          setUsers((prev) => ({
            ...prev,
            [newId]: newUser
          }));
          setCurrentUser(newUser);
        }
      }).catch((error) => {
        console.error('Error checking user in Firebase:', error);
        // Fallback to local storage if Firebase fails
        const existingUser = Object.values(users).find(
          (u) => u.email === userDetails.email
        );
        if (existingUser) {
          setCurrentUser(existingUser);
        } else {
          const newId = `u_${Date.now()}`;
          const isAdmin = userDetails.email === ADMIN_EMAIL;
          const newUser: User = {
            id: newId,
            username: sanitizeText(userDetails.name, 50),
            email: userDetails.email,
            phone: userDetails.phone,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userDetails.name}`,
            followers: 0,
            following: 0,
            likes: 0,
            role: isAdmin ? 'admin' : 'user',
            isVerified: isAdmin
          };
          setUsers((prev) => ({
            ...prev,
            [newId]: newUser
          }));
          setCurrentUser(newUser);
        }
      });
    } else {
      setCurrentUser(users['u2']);
    }
  };
  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };
  const addRecipe = (
  recipeData: Omit<
    Recipe,
    'id' | 'likes' | 'comments' | 'status' | 'createdAt'>) =>

  {
    // SECURITY: Sanitize all user inputs before storing
    const newRecipe: Recipe = {
      title: sanitizeText(recipeData.title, 100),
      description: sanitizeText(recipeData.description, 1000),
      category: recipeData.category,
      image: recipeData.image,
      ingredients: sanitizeArray(recipeData.ingredients, 200),
      steps: sanitizeArray(recipeData.steps, 500),
      authorId: recipeData.authorId,
      id: `r${Date.now()}`,
      likes: 0,
      comments: [],
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Save to Firebase
    createRecipe({
      title: newRecipe.title,
      description: newRecipe.description,
      category: newRecipe.category,
      image: newRecipe.image,
      ingredients: newRecipe.ingredients,
      steps: newRecipe.steps,
      authorId: newRecipe.authorId,
      likes: newRecipe.likes,
      commentCount: newRecipe.comments.length,
      status: newRecipe.status,
      createdAt: newRecipe.createdAt
    }).then((firebaseId) => {
      // Update local state with Firebase ID
      setRecipes((prev) => prev.map((r) => 
        r.id === newRecipe.id ? { ...r, id: firebaseId } : r
      ));
    }).catch((error) => {
      console.error('Failed to save recipe to Firebase:', error);
    });
    
    setRecipes([newRecipe, ...recipes]);
  };
  const updateRecipeStatus = async (id: string, status: 'approved' | 'rejected') => {
    console.log('Updating recipe status:', id, 'to', status);
    
    // Update local state first for immediate feedback
    setRecipes(
      recipes.map((r) =>
      r.id === id ?
      {
        ...r,
        status
      } :
      r
      )
    );
    
    // Persist to Firebase
    try {
      await updateRecipe(id, { status });
      console.log('Successfully updated recipe in Firebase');
      
      // Reload recipes from Firebase to ensure sync
      const firebaseRecipes = await getAllRecipes();
      if (firebaseRecipes.length > 0) {
        const appRecipes = await Promise.all(firebaseRecipes.map(async (fr) => {
          const comments = await getComments(fr.id);
          return {
            id: fr.id,
            title: fr.title,
            description: fr.description,
            authorId: fr.authorId,
            category: fr.category,
            image: fr.image,
            ingredients: fr.ingredients,
            steps: fr.steps,
            likes: fr.likes,
            comments: comments,
            status: fr.status,
            createdAt: fr.createdAt
          };
        }));
        setRecipes(appRecipes);
        console.log('Reloaded recipes from Firebase:', appRecipes.length);
      }
    } catch (error) {
      console.error('Failed to update recipe status in Firebase:', error);
      // Revert local state on error
      setRecipes(
        recipes.map((r) =>
        r.id === id ?
        {
          ...r,
          status: r.status
        } :
        r
        )
      );
    }
  };
  const addComment = async (recipeId: string, text: string) => {
    if (!currentUser) return;
    // SECURITY: Sanitize comment text
    const cleanText = sanitizeText(text, 500);
    if (!cleanText) return;
    
    // Record comment to Firebase
    try {
      await recordComment(recipeId, {
        authorId: currentUser.id,
        text: cleanText,
        timestamp: 'Just now'
      });
      
      // Reload comments from Firebase
      const updatedComments = await getComments(recipeId);
      
      setRecipes(
        recipes.map((r) => {
          if (r.id === recipeId) {
            return {
              ...r,
              comments: updatedComments
            };
          }
          return r;
        })
      );
    } catch (error) {
      console.error('Failed to record comment to Firebase:', error);
      // Fallback to local state update
      setRecipes(
        recipes.map((r) => {
          if (r.id === recipeId) {
            return {
              ...r,
              comments: [
              ...r.comments,
              {
                id: `c${Date.now()}`,
                authorId: currentUser.id,
                text: cleanText,
                timestamp: 'Just now'
              }]

            };
          }
          return r;
        })
      );
    }
  };
  const toggleSave = (id: string) => {
    setSavedRecipeIds((prev) =>
    prev.includes(id) ?
    prev.filter((savedId) => savedId !== id) :
    [...prev, id]
    );
  };
  const toggleLike = async (id: string) => {
    if (!currentUser) return;
    
    console.log('toggleLike called for recipe:', id, 'currentUser:', currentUser);
    const isLiked = likedRecipeIds.includes(id);
    console.log('Is currently liked:', isLiked);
    
    // Optimistic UI update - update local state immediately
    setLikedRecipeIds((prev) => {
      return isLiked ? prev.filter((likedId) => likedId !== id) : [...prev, id];
    });
    
    setRecipes(
      recipes.map((r) =>
      r.id === id ?
      {
        ...r,
        likes: isLiked ? r.likes - 1 : r.likes + 1
      } :
      r
      )
    );
    
    // Record like to Firebase in the background
    try {
      if (isLiked) {
        await removeLike(id, currentUser.id);
      } else {
        await addLike(id, currentUser.id);
      }
    } catch (error) {
      console.error('Failed to record like to Firebase:', error);
      // Revert optimistic update on error
      setLikedRecipeIds((prev) => {
        return isLiked ? [...prev, id] : prev.filter((likedId) => likedId !== id);
      });
      setRecipes(
        recipes.map((r) =>
        r.id === id ?
        {
          ...r,
          likes: isLiked ? r.likes + 1 : r.likes - 1
        } :
        r
        )
      );
    }
  };
  const markNotificationsRead = () => {
    setNotifications(
      notifications.map((n) => ({
        ...n,
        read: true
      }))
    );
  };
  const toggleFollow = (userId: string) => {
    if (!currentUser) return;
    
    const followee = users[userId];
    if (!followee) return;
    
    // Check if already following by comparing follower/following counts
    // This is a simplified check - in production you'd use isFollowing
    const isFollowing = currentUser.following > 0 && followee.followers > 0;
    
    if (isFollowing) {
      // Unfollow
      unfollowUser(currentUser.id, userId).catch((error) => {
        console.error('Failed to unfollow user:', error);
      });
      
      setUsers((prev) => ({
        ...prev,
        [currentUser.id]: {
          ...prev[currentUser.id],
          following: prev[currentUser.id].following - 1
        },
        [userId]: {
          ...prev[userId],
          followers: prev[userId].followers - 1
        }
      }));
      
      setCurrentUser((prev) => prev ? { ...prev, following: prev.following - 1 } : null);
    } else {
      // Follow
      followUser(currentUser.id, userId).catch((error) => {
        console.error('Failed to follow user:', error);
      });
      
      setUsers((prev) => ({
        ...prev,
        [currentUser.id]: {
          ...prev[currentUser.id],
          following: prev[currentUser.id].following + 1
        },
        [userId]: {
          ...prev[userId],
          followers: prev[userId].followers + 1
        }
      }));
      
      setCurrentUser((prev) => prev ? { ...prev, following: prev.following + 1 } : null);
    }
  };
  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      await deleteRecipe(recipeId);
      setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };
  const handleEditRecipe = async (recipeId: string, updates: Partial<Recipe>) => {
    try {
      // Update local state first for immediate feedback
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipeId ? { ...r, ...updates } : r
        )
      );
      
      // Persist to Firebase
      await updateRecipe(recipeId, updates);
    } catch (error) {
      console.error('Failed to edit recipe:', error);
      // Revert local state on error
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipeId ? { ...r } : r
        )
      );
    }
  };
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers((prev) => {
        const newUsers = { ...prev };
        delete newUsers[userId];
        return newUsers;
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };
  const loadBlockedMachineIds = async () => {
    try {
      const blocked = await getBlockedMachineIds();
      setBlockedMachineIds(blocked);
    } catch (error) {
      console.error('Failed to load blocked machine IDs:', error);
    }
  };
  const handleLoadUserWarnings = async (userId: string) => {
    try {
      const warnings = await getUserWarnings(userId);
      setUserWarnings((prev) => ({
        ...prev,
        [userId]: warnings
      }));
    } catch (error) {
      console.error('Failed to load user warnings:', error);
    }
  };
  const handleAddWarning = async (userId: string, reason: string) => {
    try {
      await addWarning(userId, reason);
      // Fetch updated user data from Firebase to get the latest warning count
      const updatedUser = await getUserById(userId);
      if (updatedUser) {
        setUsers((prev) => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            warningCount: typeof updatedUser.warningCount === 'number' ? updatedUser.warningCount : (prev[userId].warningCount || 0) + 1
          }
        }));
      }
      handleLoadUserWarnings(userId);
    } catch (error) {
      console.error('Failed to add warning:', error);
    }
  };
  const handleBlockMachineId = async (machineId: string, reason: string) => {
    try {
      await blockMachineId(machineId, reason);
      await loadBlockedMachineIds();
    } catch (error) {
      console.error('Failed to block machine ID:', error);
    }
  };
  const handleUnblockMachineId = async (machineId: string) => {
    try {
      await unblockMachineId(machineId);
      await loadBlockedMachineIds();
    } catch (error) {
      console.error('Failed to unblock machine ID:', error);
    }
  };
  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        recipes,
        setRecipes,
        addRecipe,
        updateRecipeStatus,
        addComment,
        savedRecipeIds,
        toggleSave,
        likedRecipeIds,
        toggleLike,
        notifications,
        markNotificationsRead,
        users,
        setUsers,
        toggleFollow,
        deleteRecipe: handleDeleteRecipe,
        editRecipe: handleEditRecipe,
        deleteUser: handleDeleteUser,
        addWarning: handleAddWarning,
        blockMachineId: handleBlockMachineId,
        unblockMachineId: handleUnblockMachineId,
        blockedMachineIds,
        loadBlockedMachineIds,
        userWarnings,
        loadUserWarnings: handleLoadUserWarnings
      }}>
      
      {children}
    </AppContext.Provider>);

}
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}