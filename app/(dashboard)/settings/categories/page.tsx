
'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Category } from '@/lib/types/category';
import { categoriesApi } from '@/lib/api';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { CategoryFormModal } from '@/components/categories/CategoryFormModal';
import { CategoryDeleteDialog } from '@/components/categories/CategoryDeleteDialog';

export default function CategoriesSettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriesApi.getAllCategories();
      const categoriesData = response.data?.data?.categories || response.data?.categories || [];
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setFormModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const systemCategories = categories.filter(cat => cat.isSystemCategory);
  const userCategories = categories.filter(cat => !cat.isSystemCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Categories</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-foreground">Categories</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage transaction categories. System categories are predefined and cannot be edited.
          </p>
        </div>
        <button
          onClick={handleAddCategory}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={16} className="mr-2" />
          Add Category
        </button>
      </div>

      {error && categories.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-md p-3">
          <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
        </div>
      )}

      {/* System Categories */}
      {systemCategories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground">System Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            ))}
          </div>
        </div>
      )}

      {/* User Categories */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-foreground">Your Categories</h3>
        {userCategories.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <h4 className="text-sm font-medium text-foreground mb-1">No custom categories yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create custom categories to better organize your transactions
            </p>
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Plus size={16} className="mr-2" />
              Add Your First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {userCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            ))}
          </div>
        )}
      </div>

      <CategoryFormModal
        category={selectedCategory}
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSave={fetchCategories}
      />

      <CategoryDeleteDialog
        category={selectedCategory}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={fetchCategories}
      />
    </div>
  );
}
