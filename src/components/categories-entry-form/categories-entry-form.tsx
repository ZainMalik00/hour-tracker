import React, { useMemo, useCallback} from 'react';
import styles from './categories-entry-form.module.css';
import { CategoryEntry } from '../../backend/entities/DefaultCategories';
import { TextField, Typography } from '@mui/material';

interface CategoriesEntryFormProps {
  selectedCategory: CategoryEntry | null;
  onSelectedCategoryChange: (category: CategoryEntry) => void;
  onCategoryChange: (category: CategoryEntry) => void;
}

const CategoriesEntryForm = ({
  selectedCategory,
  onSelectedCategoryChange,
  onCategoryChange,
}: CategoriesEntryFormProps) => {

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCategory) {
      const newCategory = {name: event.currentTarget.value, color: selectedCategory.color, description: selectedCategory.description};
      onCategoryChange(newCategory);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCategory) {
      const newCategory = {name: selectedCategory.name, color: selectedCategory.color, description: e.target.value};
      onCategoryChange(newCategory);
    }
  };

  return(
    <div>
        <div className={styles.nameContainer}>
            <Typography variant="h6">Category Name:</Typography>
            <TextField 
              id="category-name" 
              variant="outlined" 
              value={selectedCategory?.name || ''}
              onChange={handleNameChange}
              sx={{ 
                maxHeight: '40px', 
                minHeight: '40px', 
                width: '300px', 
                '& .MuiInputBase-root': { 
                  maxHeight: '40px', 
                  minHeight: '40px' 
                }, 
                '& .MuiInputBase-input': { 
                  maxHeight: '40px', 
                  minHeight: '40px' 
                }
              }} 
            />
      </div>
      <Typography variant="h6">Description:</Typography>
      <TextField
          id="category-description"
          multiline
          maxRows={4}
          variant="outlined"
          value={selectedCategory?.description || ''}
          sx={{ 
            width: '100%', 
            '& .MuiInputBase-root': { width: '100%' },
            '& .MuiInputBase-input': { width: '100%' }
          }}
          onChange={handleDescriptionChange}
        />
      <Typography variant="body1">{selectedCategory?.color}</Typography>
    </div>
  );
};

export default CategoriesEntryForm;
