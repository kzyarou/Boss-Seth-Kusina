import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Settings, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { RecipeCard } from '../components/RecipeCard';
export function Profile() {
  const { id } = useParams();
  const { users, currentUser, recipes, logout, savedRecipeIds } = useAppContext();
  const [activeTab, setActiveTab] = useState<'recipes' | 'saved'>('recipes');
  const [isFollowing, setIsFollowing] = useState(false);
  // If no ID in URL, show current user profile
  const profileId = id || currentUser?.id;
  const profileUser = profileId ? users[profileId] : null;
  if (!profileUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">
          Walang ganyang user, boss
        </h2>
        <Link to="/" className="text-primary-500 hover:underline">
          Uwi na sa Home
        </Link>
      </div>);

  }
  const isOwnProfile = currentUser?.id === profileUser.id;
  const userRecipes = recipes.filter(
    (r) =>
    r.authorId === profileUser.id && (
    isOwnProfile || r.status === 'approved')
  );
  const displayedRecipes = activeTab === 'recipes' 
    ? userRecipes 
    : recipes.filter(r => savedRecipeIds.includes(r.id));
  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-100 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          <img
            src={profileUser.avatar}
            alt={profileUser.username}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-stone-50" />
          
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-3xl font-display font-bold text-stone-900">
                  {profileUser.username}
                </h1>
                {profileUser.isVerified &&
                <CheckCircle2 className="w-6 h-6 text-primary-500" />
                }
              </div>
              {isOwnProfile ?
              <>
                  <button
                  onClick={logout}
                  className="px-6 py-2 rounded-full font-semibold text-red-600 hover:bg-red-50 transition-colors">
                  
                    Mag-Log Out
                  </button>
                </> :

              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-8 py-2 rounded-full font-semibold transition-colors ${isFollowing ? 'bg-stone-100 text-stone-900 hover:bg-stone-200' : 'bg-stone-900 text-white hover:bg-stone-800'}`}>
                
                  {isFollowing ? 'Fina-follow' : 'I-Follow'}
                </button>
              }
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-8 text-stone-600">
              <div className="text-center sm:text-left">
                <div className="font-bold text-xl text-stone-900">
                  {userRecipes.length}
                </div>
                <div className="text-sm">Recipes</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="font-bold text-xl text-stone-900">
                  {profileUser.followers.toLocaleString()}
                </div>
                <div className="text-sm">Followers</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="font-bold text-xl text-stone-900">
                  {profileUser.id === 'u1' ? profileUser.phone : profileUser.likes.toLocaleString()}
                </div>
                <div className="text-sm">{profileUser.id === 'u1' ? 'Contact' : 'Likes'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      <div>
        <div className="flex border-b border-stone-200 mb-6">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex-1 sm:flex-none px-6 py-4 font-semibold text-sm sm:text-base transition-colors border-b-2 ${activeTab === 'recipes' ? 'border-primary-500 text-primary-600' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
            
            Mga Luto
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 sm:flex-none px-6 py-4 font-semibold text-sm sm:text-base transition-colors border-b-2 ${activeTab === 'saved' ? 'border-primary-500 text-primary-600' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
            
            Naka-Save
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {displayedRecipes.length > 0 ?
          displayedRecipes.map((recipe, i) =>
          <RecipeCard key={recipe.id} recipe={recipe} index={i} />
          ) :

          <div className="col-span-full text-center py-12 text-stone-500">
              {activeTab === 'recipes' ?
            'Wala pang luto.' :
            'Wala pang naka-save.'}
            </div>
          }
        </div>
      </div>
    </div>);

}