import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Trash2 } from
'lucide-react';
import { Recipe } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { EditRecipeModal } from './EditRecipeModal';
export function RecipeCard({
  recipe,
  index = 0



}: {recipe: Recipe;index?: number;}) {
  const {
    users,
    likedRecipeIds,
    savedRecipeIds,
    toggleLike,
    toggleSave,
    currentUser,
    deleteRecipe
  } = useAppContext();
  const author = users[recipe.authorId];
  const isLiked = likedRecipeIds.includes(recipe.id);
  const isSaved = savedRecipeIds.includes(recipe.id);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const isOwnRecipe = currentUser?.id === recipe.authorId;

  // Return null if author is not loaded yet
  if (!author) {
    return null;
  }
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert('Mag-login ka muna bago pumindot, boss.'); // In a real app, trigger auth modal
      return;
    }
    action();
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/recipe/${recipe.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy URL');
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Sigurado ka na gusto mong burahin ang recipe na ito?')) {
      deleteRecipe(recipe.id);
      toast.success('Recipe deleted successfully!');
    }
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.4,
        delay: index * 0.1
      }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 mb-6 group">
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link
          to={`/user/${author.id}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          
          <img
            src={author.avatar}
            alt={author.username}
            className="w-10 h-10 rounded-full object-cover" />
          
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-stone-900">
                {author.username}
              </span>
              {author.isVerified &&
              <CheckCircle2 className="w-4 h-4 text-primary-500" />
              }
            </div>
            <span className="text-xs text-stone-500">Kanina lang</span>
          </div>
        </Link>
        
        {isOwnRecipe && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-stone-600" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-stone-100 py-2 z-10 min-w-[140px]">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(false);
                    setShowEditModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <Link
        to={`/recipe/${recipe.id}`}
        className="block relative aspect-[4/3] overflow-hidden bg-stone-100">
        
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src =
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
          }} />
        
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => handleAction(e, () => toggleLike(recipe.id))}
              className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-primary-500' : 'text-stone-600 hover:text-primary-500'}`}>
              
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{recipe.likes}</span>
            </button>
            <Link
              to={`/recipe/${recipe.id}`}
              className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors">
              
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium">{recipe.comments.length}</span>
            </Link>
            <button 
              onClick={handleShare}
              className="text-stone-600 hover:text-stone-900 transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={(e) => handleAction(e, () => toggleSave(recipe.id))}
            className={`transition-colors ${isSaved ? 'text-primary-500' : 'text-stone-400 hover:text-stone-900'}`}>
            
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        <Link
          to={`/recipe/${recipe.id}`}
          className="block group-hover:opacity-80 transition-opacity">
          
          <h3 className="text-xl font-display font-bold text-stone-900 mb-1">
            {recipe.title}
          </h3>
          <p className="text-stone-600 line-clamp-2 text-sm leading-relaxed">
            {recipe.description}
          </p>
        </Link>
      </div>
      
      {showEditModal && (
        <EditRecipeModal recipe={recipe} onClose={() => setShowEditModal(false)} />
      )}
    </motion.div>);

}