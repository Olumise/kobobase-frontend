
'use client';

import { sampleCategories } from '@/lib/mockData';
import { Plus, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CategoriesSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-foreground">System Categories</h2>
        <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm">
          <Plus size={16} className="mr-2" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sampleCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: category.color }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.type}</p>
                </div>
              </div>
              <button className="text-muted-foreground hover:text-foreground p-1">
                <MoreVertical size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
