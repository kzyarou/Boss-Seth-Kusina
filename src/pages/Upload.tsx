import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  UploadCloud,
  X } from
'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
export function Upload() {
  const { addRecipe, currentUser } = useAppContext();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[1].id,
    image: '',
    ingredients: [''],
    steps: ['']
  });
  const [imageError, setImageError] = useState('');
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');
    // Validate MIME type
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      setImageError('JPEG, PNG, o WEBP lang pwede.');
      return;
    }
    // Validate file size (max 5MB)
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
  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">
          Mag-login ka muna para makapag-upload, boss.
        </h2>
      </div>);

  }
  const handleArrayChange = (
  field: 'ingredients' | 'steps',
  index: number,
  value: string) =>
  {
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
    addRecipe({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      image: formData.image,
      ingredients: formData.ingredients.filter((i) => i.trim() !== ''),
      steps: formData.steps.filter((s) => s.trim() !== ''),
      authorId: currentUser.id
    });
    setIsSubmitted(true);
  };
  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm px-6">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-display font-bold text-stone-900 mb-4">
          Recipe Submitted!
        </h2>
        <p className="text-stone-600 mb-8 text-lg">
          Your recipe has been sent to moderation. It will appear publicly once
          approved by an admin.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary-500 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-600 transition-colors">
          
          Back to Home
        </button>
      </div>);

  }
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-stone-900 mb-2">
          Mag-Upload ng Luto
        </h1>
        <p className="text-stone-500">
          I-share mo na ang luto mong pang-masterchef (o pang-disaster).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
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
              placeholder="hal., Sinigang na Hotdog"
              className="w-full bg-stone-50 border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl py-3 px-4 outline-none transition-all" />
            
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
              placeholder="Ano kwento ng lutong 'to..."
              rows={3}
              className="w-full bg-stone-50 border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl py-3 px-4 outline-none transition-all resize-none" />
            
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
              
              {CATEGORIES.map((c) =>
              <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1.5">
              Litrato ng Luto
            </label>
            {formData.image ?
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 group">
                <img
                src={formData.image}
                alt="Recipe preview"
                className="w-full h-56 object-cover" />
              
                <button
                type="button"
                onClick={() =>
                setFormData({
                  ...formData,
                  image: ''
                })
                }
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                aria-label="Remove image">
                
                  <X className="w-4 h-4" />
                </button>
              </div> :

            <label className="flex flex-col items-center justify-center gap-2 w-full h-56 bg-stone-50 border-2 border-dashed border-stone-300 hover:border-primary-400 hover:bg-primary-50/40 rounded-2xl cursor-pointer transition-colors text-stone-500">
                <UploadCloud className="w-8 h-8 text-stone-400" />
                <span className="font-semibold text-stone-700">
                  I-tap para mag-upload
                </span>
                <span className="text-xs text-stone-400">
                  PNG, JPG mula sa device mo
                </span>
                <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={handleImageUpload}
                className="hidden" />
              
              </label>
            }
            {imageError &&
            <p className="text-sm text-red-500 mt-2">{imageError}</p>
            }
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-100">
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
            {formData.ingredients.map((ing, i) =>
            <div key={i} className="flex gap-2">
                <input
                required
                type="text"
                value={ing}
                onChange={(e) =>
                handleArrayChange('ingredients', i, e.target.value)
                }
                className="flex-1 bg-stone-50 border border-stone-200 focus:border-primary-500 rounded-xl py-2.5 px-4 outline-none"
                placeholder="e.g., 500g Chicken" />
              
                <button
                type="button"
                onClick={() => removeArrayItem('ingredients', i)}
                className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => addArrayItem('ingredients')}
            className="mt-3 flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
            
            <Plus className="w-4 h-4" /> Add Ingredient
          </button>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-100">
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
            {formData.steps.map((step, i) =>
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
                placeholder="Describe this step..." />
              
                <button
                type="button"
                onClick={() => removeArrayItem('steps', i)}
                className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors h-fit">
                
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => addArrayItem('steps')}
            className="mt-3 flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
            
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </div>

        <div className="pt-6 border-t border-stone-100">
          <button
            type="submit"
            className="w-full bg-primary-500 text-white font-bold text-lg py-4 rounded-2xl hover:bg-primary-600 active:scale-[0.98] transition-all">
            
            I-Publish ang Luto
          </button>
        </div>
      </form>
    </div>);

}