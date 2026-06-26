import React from 'react';
import { RecipeCard } from '../components/RecipeCard';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { CategoryIcon } from '../data/categoryIcons';
import { Link } from 'react-router-dom';
export function Home() {
  const { recipes } = useAppContext();
  const publicRecipes = recipes.filter((r) => r.status === 'approved');
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Feed */}
      <div className="lg:col-span-8 max-w-2xl mx-auto w-full">
        {/* Mobile Categories Scroll */}
        <div className="lg:hidden flex gap-3 overflow-x-auto hide-scrollbar pb-4 mb-4 -mx-4 px-4">
          {CATEGORIES.map((cat) =>
          <Link
            key={cat.id}
            to={`/categories?id=${cat.id}`}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium ${cat.color} bg-opacity-20`}>
            
              <CategoryIcon id={cat.id} className="w-4 h-4" />
              {cat.name}
            </Link>
          )}
        </div>

        <div className="space-y-6">
          {publicRecipes.map((recipe, index) =>
          <RecipeCard key={recipe.id} recipe={recipe} index={index} />
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:col-span-4 space-y-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 sticky top-24">
          <h3 className="font-display font-bold text-lg mb-4 text-stone-900">
            Silipin ang mga Kategorya
          </h3>
          <div className="space-y-3">
            {CATEGORIES.map((cat) =>
            <Link
              key={cat.id}
              to={`/categories?id=${cat.id}`}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 transition-colors group">
              
                <div className="flex items-center gap-3">
                  <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color} bg-opacity-20`}>
                  
                    <CategoryIcon id={cat.id} className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-stone-700 group-hover:text-stone-900">
                    {cat.name}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-6 text-white shadow-md">
          <h3 className="font-display font-bold text-xl mb-2">
            AI na Tagaisip ng Luto
          </h3>
          <p className="text-primary-100 text-sm mb-4">
            May mga weirdong sahog sa ref? Hayaan mong AI ang mag-imbento ng
            luto.
          </p>
          <button className="w-full bg-white text-primary-600 font-semibold py-2.5 rounded-xl hover:bg-primary-50 transition-colors">
            Malapit Na
          </button>
        </div>
      </div>
    </div>);

}