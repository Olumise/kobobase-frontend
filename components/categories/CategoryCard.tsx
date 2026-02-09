'use client';

import { useState } from 'react';
import { Category } from '@/lib/types/category';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {category.icon ? (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: category.color || '#6b7280', aspectRatio: '1 / 1' }}
          >
            <span className="text-sm leading-none">{category.icon}</span>
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: category.color || '#6b7280', aspectRatio: '1 / 1' }}
          >
            <span className="text-base font-semibold leading-none">
              {category.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">{category.name}</h3>
            {category.isSystemCategory && (
              <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 flex-shrink-0">
                System
              </Badge>
            )}
          </div>
        </div>
      </div>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted flex-shrink-0">
            <MoreVertical size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => onEdit(category)}
            disabled={category.isSystemCategory}
          >
            <Pencil size={16} className="mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(category)}
            disabled={category.isSystemCategory}
            className="text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
