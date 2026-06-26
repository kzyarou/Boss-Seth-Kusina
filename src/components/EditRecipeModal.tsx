import React, { useState } from 'react';
import { X, Plus, Trash2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { Recipe } from '../data/mockData';

interface EditRecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export function EditRecipeModal({ recipe, onClose }: EditRecipeModalProps) {
  const { editRecipe } = useAppContext();
  const [formData, setFormData] = useState({
    title: recipe.title,
    description: recipe.description,
    category: recipe.category,
    image: recipe.image,
    ingredients: [...recipe.ingredients],
    steps: [...recipe.steps]
  });
  const [imageError, setImageError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      setImageError('JPEG, PNG, o WEBP lang pwede.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Masyadong malaki ang file (max 5MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleArrayChange = (
    field: 'ingredients' | 'steps',
    index: number,
    value: string
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const addArrayItem = (field: 'ingredients' | 'steps') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayItem = (field: 'ingredients' | 'steps', index: number) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData({
        ...formData,
        [field]: newArray
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editRecipe(recipe.id, {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      image: formData.image,
      ingredients: formData.ingredients.filter((i) => i.trim() !== ''),
      steps: formData.steps.filter((s) => s.trim() !== '')
    });
    toast.success('Recipe updated successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-stone-900">
            Edit Recipe
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-stone-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1.5">
              Pangalan ng Luto
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value
                })
              }
              className="w-full bg-stone-50 border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl py-3 px-4 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1.5">
              Kwento ng Luto
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value
                })
              }
              rows={3}
              className="w-full bg-stone-50 border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl py-3 px-4 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1.5">
              Kategorya
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value
                })
              }
              className="w-full bg-stone-50 border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl py-3 px-4 outline-none transition-all appearance-none">
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1.5">
              Litrato ng Luto
            </label>
            {formData.image ? (
              <div className="relative rounded-2xl overflow-hidden border border-stone-200">
                <img
                  src={formData.image}
                  alt="Recipe preview"
                  className="w-full h-56 object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      image: ''
                    })
                  }
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 w-full h-56 bg-stone-50 border-2 border-dashed border-stone-300 hover:border-primary-400 hover:bg-primary-50/40 rounded-2xl cursor-pointer transition-colors text-stone-500">
                <UploadCloud className="w-8 h-8 text-stone-400" />
                <span className="font-semibold text-stone-700">
                  I-tap para mag-upload
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
            {imageError && <p className="text-sm text-red-500 mt-2">{imageError}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-xl text-stone-900">
                Mga Sahog
              </h3>
              <button
                type="button"
                onClick={() => addArrayItem('ingredients')}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Dagdag Sahog
              </button>
            </div>
            <div className="space-y-3">
              {formData.ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    required
                    type="text"
                    value={ing}
                    onChange={(e) =>
                      handleArrayChange('ingredients', i, e.target.value)
                    }
                    className="flex-1 bg-stone-50 border border-stone-200 focus:border-primary-500 rounded-xl py-2.5 px-4 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('ingredients', i)}
                    className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-xl text-stone-900">
                Paano Lutuin
              </h3>
              <button
                type="button"
                onClick={() => addArrayItem('steps')}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Dagdag Hakbang
              </button>
            </div>
            <div className="space-y-3">
              {formData.steps.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-10 flex-shrink-0 flex items-center justify-center font-bold text-stone-400 bg-stone-50 rounded-xl border border-stone-200">
                    {i + 1}
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={step}
                    onChange={(e) =>
                      handleArrayChange('steps', i, e.target.value)
                    }
                    className="flex-1 bg-stone-50 border border-stone-200 focus:border-primary-500 rounded-xl py-2.5 px-4 outline-none resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('steps', i)}
                    className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors h-fit">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <button
              type="submit"
              className="w-full bg-primary-500 text-white font-bold text-lg py-4 rounded-2xl hover:bg-primary-600 active:scale-[0.98] transition-all">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
