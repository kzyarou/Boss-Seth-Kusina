import React from 'react';
import { Bookmark } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { RecipeCard } from '../components/RecipeCard';
export function Saved() {
  const { recipes, savedRecipeIds, currentUser } = useAppContext();
  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">
          Mag-login ka muna para makita ang mga naka-save, boss.
        </h2>
      </div>);

  }
  const savedRecipes = recipes.filter((r) => savedRecipeIds.includes(r.id));
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-stone-900 mb-2">
          Mga Naka-Save na Luto
        </h1>
        <p className="text-stone-500">
          Ang personal mong listahan ng mga paboritong luto.
        </p>
      </div>

      {savedRecipes.length > 0 ?
      <div className="grid sm:grid-cols-2 gap-6">
          {savedRecipes.map((recipe, i) =>
        <RecipeCard key={recipe.id} recipe={recipe} index={i} />
        )}
        </div> :

      <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-900 mb-2">
            Wala ka pang naka-save
          </h3>
          <p className="text-stone-500">
            Mag-ikot-ikot ka muna at i-save ang mga trip mong lutuin mamaya!
          </p>
        </div>
      }
    </div>);

}