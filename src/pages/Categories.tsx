import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../data/mockData';
import { CategoryIcon } from '../data/categoryIcons';
import { useAppContext } from '../context/AppContext';
import { RecipeCard } from '../components/RecipeCard';
import { Utensils } from 'lucide-react';
export function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategoryId = searchParams.get('id') || CATEGORIES[0].id;
  const { recipes } = useAppContext();
  const activeCategory = CATEGORIES.find((c) => c.id === activeCategoryId);
  const filteredRecipes = recipes.filter(
    (r) => r.category === activeCategoryId && r.status === 'approved'
  );
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-stone-900 mb-6">
          Mga Kategorya
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() =>
                setSearchParams({
                  id: cat.id
                })
                }
                className={`p-4 rounded-2xl text-left transition-all ${isActive ? 'ring-2 ring-primary-500 shadow-md bg-white' : 'bg-white hover:bg-stone-50 border border-stone-100'}`}>
                
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${cat.color} bg-opacity-20`}>
                  
                  <CategoryIcon id={cat.id} className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-tight">
                  {cat.name}
                </h3>
              </button>);

          })}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-sm min-h-[500px]">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-stone-100">
          {activeCategory &&
          <span
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeCategory.color} bg-opacity-20`}>
            
              <CategoryIcon id={activeCategory.id} className="w-6 h-6" />
            </span>
          }
          <h2 className="text-2xl font-display font-bold text-stone-900">
            {activeCategory?.name}
          </h2>
        </div>

        {filteredRecipes.length > 0 ?
        <div className="grid sm:grid-cols-2 gap-6">
            {filteredRecipes.map((recipe, i) =>
          <RecipeCard key={recipe.id} recipe={recipe} index={i} />
          )}
          </div> :

        <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
              <Utensils className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">
              Wala pang luto dito
            </h3>
            <p className="text-stone-500">
              Ikaw na maunang mag-upload ng luto dito, boss!
            </p>
          </div>
        }
      </div>
    </div>);

}