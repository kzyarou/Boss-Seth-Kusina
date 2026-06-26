import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  CheckCircle2,
  ChevronLeft,
  Send,
  Edit2,
  Trash2 } from
'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { CategoryIcon } from '../data/categoryIcons';
import { checkRateLimit, formatRemainingTime } from '../utils/rateLimit';
import { EditRecipeModal } from '../components/EditRecipeModal';
import { getRecipeById, getComments, getUserById } from '../firebase/services';

// Helper to safely convert timestamp to string
function formatTimestamp(timestamp: any): string {
  if (!timestamp) return 'Just now';
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  if (timestamp instanceof Date) return timestamp.toLocaleString();
  return 'Just now';
}

export function RecipeDetail() {
  const { id } = useParams();
  const {
    recipes,
    users,
    likedRecipeIds,
    savedRecipeIds,
    toggleLike,
    toggleSave,
    currentUser,
    addComment,
    deleteRecipe,
    setUsers
  } = useAppContext();
  const [newComment, setNewComment] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchedRecipe, setFetchedRecipe] = useState<any>(null);
  const [fetchedAuthor, setFetchedAuthor] = useState<any>(null);
  const [authorNotFound, setAuthorNotFound] = useState(false);
  const recipe = fetchedRecipe || recipes.find((r) => r.id === id);
  const author = fetchedAuthor || users[recipe?.authorId];

  // Fetch recipe and author from Firebase
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!id) return;

      try {
        const firebaseRecipe = await getRecipeById(id);
        
        if (!isMounted) return;
        
        if (firebaseRecipe) {
          // Always fetch author
          const fetchedAuthorData = await getUserById(firebaseRecipe.authorId);
          
          if (!isMounted) return;
          
          if (fetchedAuthorData) {
            setFetchedAuthor({
              id: fetchedAuthorData.id,
              username: fetchedAuthorData.username,
              email: fetchedAuthorData.email,
              phone: fetchedAuthorData.phone,
              avatar: fetchedAuthorData.avatar,
              followers: typeof fetchedAuthorData.followers === 'number' ? fetchedAuthorData.followers : 0,
              following: typeof fetchedAuthorData.following === 'number' ? fetchedAuthorData.following : 0,
              likes: fetchedAuthorData.likes,
              role: fetchedAuthorData.role,
              isVerified: fetchedAuthorData.isVerified
            });
            
            // Also update global users state
            setUsers((prev: Record<string, any>) => ({
              ...prev,
              [fetchedAuthorData.id]: {
                id: fetchedAuthorData.id,
                username: fetchedAuthorData.username,
                email: fetchedAuthorData.email,
                phone: fetchedAuthorData.phone,
                avatar: fetchedAuthorData.avatar,
                followers: typeof fetchedAuthorData.followers === 'number' ? fetchedAuthorData.followers : 0,
                following: typeof fetchedAuthorData.following === 'number' ? fetchedAuthorData.following : 0,
                likes: fetchedAuthorData.likes,
                role: fetchedAuthorData.role,
                isVerified: fetchedAuthorData.isVerified
              }
            }));
          } else {
            // Author not found in Firebase - set a placeholder
            setAuthorNotFound(true);
          }
          
          // Only fetch recipe if not already in global state
          if (!recipes.find((r) => r.id === id)) {
            // Load comments for the recipe
            const comments = await getComments(id);
            
            if (!isMounted) return;
            
            // Set fetched recipe state
            setFetchedRecipe({
              id: firebaseRecipe.id,
              title: firebaseRecipe.title,
              description: firebaseRecipe.description,
              authorId: firebaseRecipe.authorId,
              category: firebaseRecipe.category,
              image: firebaseRecipe.image,
              ingredients: firebaseRecipe.ingredients,
              steps: firebaseRecipe.steps,
              likes: firebaseRecipe.likes,
              comments: comments,
              status: firebaseRecipe.status,
              createdAt: firebaseRecipe.createdAt
            });
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Failed to fetch recipe:', error);
        if (isMounted) {
          setNotFound(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  if (notFound || !recipe) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">
          Walang ganyang luto dito
        </h2>
        <Link to="/" className="text-primary-500 hover:underline">
          Uwi na sa Home
        </Link>
      </div>);
  }
  
  const handleShare = () => {
    const url = `${window.location.origin}/recipe/${recipe.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy URL');
    });
  };

  const handleDelete = () => {
    if (confirm('Sigurado ka na gusto mong burahin ang recipe na ito?')) {
      deleteRecipe(recipe.id);
      toast.success('Recipe deleted successfully!');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  };

  const isOwnRecipe = currentUser?.id === recipe?.authorId;
  const category = CATEGORIES.find((c) => c.id === recipe.category);
  const isLiked = likedRecipeIds.includes(recipe.id);
  const isSaved = savedRecipeIds.includes(recipe.id);

  // Use a default author if author is not loaded
  const displayAuthor = author || {
    id: recipe.authorId,
    username: authorNotFound ? 'Deleted User' : 'Unknown User',
    email: '',
    phone: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=deleted',
    followers: 0,
    following: 0,
    likes: 0,
    role: 'user',
    isVerified: false
  };
  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-6 transition-colors">
        
        <ChevronLeft className="w-5 h-5" />
        <span>Balik</span>
      </Link>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100">
        <div className="relative h-64 sm:h-96">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
              'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
            }} />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Share button */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
            <Share2 className="w-5 h-5 text-stone-900" />
          </button>
          
          <div className="absolute bottom-6 left-6 right-6">
            {category &&
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 ${category.color} bg-opacity-90 backdrop-blur-sm`}>
              
                <CategoryIcon id={category.id} className="w-3.5 h-3.5" />
                {category.name}
              </span>
            }
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
              {recipe.title}
            </h1>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Author & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-8 border-b border-stone-100">
            <Link
              to={`/user/${displayAuthor.id}`}
              className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              
              <img
                src={displayAuthor.avatar}
                alt={displayAuthor.username}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary-500 transition-all" />
              
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-stone-900 text-lg">
                    {displayAuthor.username}
                  </span>
                  {displayAuthor.isVerified &&
                  <CheckCircle2 className="w-5 h-5 text-primary-500" />
                  }
                </div>
                <span className="text-sm text-stone-500">
                  {displayAuthor.followers.toLocaleString()} followers
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {isOwnRecipe && (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 rounded-full font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-full font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${isFollowing ? 'bg-stone-100 text-stone-900 hover:bg-stone-200' : 'bg-stone-900 text-white hover:bg-stone-800'}`}>
                
                {isFollowing ? 'Fina-follow' : 'I-Follow'}
              </button>
            </div>
          </div>

          <p className="text-lg text-stone-700 leading-relaxed mb-8">
            {recipe.description}
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Ingredients */}
            <div className="md:col-span-1">
              <h3 className="font-display font-bold text-xl text-stone-900 mb-4">
                Mga Sahog
              </h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient: string, i: number) =>
                <li key={i} className="flex items-start gap-2 text-stone-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                    <span>{ingredient}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Steps */}
            <div className="md:col-span-2">
              <h3 className="font-display font-bold text-xl text-stone-900 mb-4">
                Paano Lutuin
              </h3>
              <div className="space-y-6">
                {recipe.steps.map((step: string, i: number) =>
                <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-stone-700 pt-1 leading-relaxed">
                      {step}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-stone-100 pt-8">
            <h3 className="font-display font-bold text-xl text-stone-900 mb-6">
              Mga Chika ({recipe.comments.length})
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!currentUser) {
                  alert('Mag-login muna para makapag-comment.');
                  return;
                }
                if (!newComment.trim()) return;
                const limit = checkRateLimit({
                  key: 'comment',
                  maxAttempts: 1,
                  windowMs: 3000
                });
                if (!limit.allowed) {
                  alert(
                    `Masyadong mabilis! Wait ${formatRemainingTime(limit.remainingMs!)}`
                  );
                  return;
                }
                addComment(recipe.id, newComment);
                setNewComment('');
              }}
              className="flex gap-4 mb-8">
              
              <img
                src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80'
                }
                alt="You"
                className="w-10 h-10 rounded-full object-cover" />
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Mag-comment ka na..."
                  className="w-full bg-stone-100 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-full py-2.5 pl-4 pr-12 outline-none transition-all" />
                
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary-500 hover:bg-primary-50 rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors">
                  
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="space-y-6">
              {recipe.comments.map((comment: any) => {
                const commentAuthor = users[comment.authorId];
                if (!commentAuthor) return null;
                return (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={commentAuthor.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shrink-0" />

                    <div className="flex-1 bg-stone-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-stone-900 text-sm">
                          {commentAuthor.username}
                        </span>
                        <span className="text-xs text-stone-500">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-stone-700 text-sm">{comment.text}</p>
                    </div>
                  </div>);

              })}
              {recipe.comments.length === 0 &&
              <p className="text-stone-500 text-center py-4">
                  Walang comments yet. Be the first to share your thoughts!
                </p>
              }
            </div>
          </div>
        </div>
      </div>
      
      {showEditModal && (
        <EditRecipeModal recipe={recipe} onClose={() => setShowEditModal(false)} />
      )}
    </div>);

}