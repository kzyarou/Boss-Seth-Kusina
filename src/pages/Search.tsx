import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { RecipeCard } from '../components/RecipeCard';
export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const { recipes } = useAppContext();
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      q: query
    });
  };
  const searchResults = recipes.filter((r) => {
    if (r.status !== 'approved') return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.ingredients.some((i) => i.toLowerCase().includes(q)));

  });
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-stone-900 mb-6">
          Mga Nahanap
        </h1>
        <div className="relative md:hidden mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hanap ka ng luto, sahog, o chef..."
            className="w-full bg-white border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all shadow-sm" />
          
        </div>

        {query &&
        <p className="text-stone-600">
            <span className="font-bold text-stone-900">
              {searchResults.length}
            </span>{' '}
            na luto ang nahanap para sa "{query}"
          </p>
        }
      </div>

      {searchResults.length > 0 ?
      <div className="grid sm:grid-cols-2 gap-6">
          {searchResults.map((recipe, i) =>
        <RecipeCard key={recipe.id} recipe={recipe} index={i} />
        )}
        </div> :

      <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <SearchIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-900 mb-2">
            Walang nahanap, boss
          </h3>
          <p className="text-stone-500">
            Ibang keyword naman o baka mali spelling mo.
          </p>
        </div>
      }
    </div>);

}