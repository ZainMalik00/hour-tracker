import React from 'react';
import styles from './categories-entry-form.module.css';
import { CategoryEntry } from '../../backend/entities/DefaultCategories';
import { Button, Popover, TextField, Typography } from '@mui/material';
import { SketchPicker } from 'react-color';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
interface CategoriesEntryFormProps {
  selectedCategory: CategoryEntry | null;
  onSelectedCategoryChange: (category: CategoryEntry) => void;
  onCategoryChange: (category: CategoryEntry) => void;
  onRemoveCategory: (category: CategoryEntry) => void;
}

const CategoriesEntryForm = ({
  selectedCategory,
  onSelectedCategoryChange,
  onCategoryChange,
  onRemoveCategory,
}: CategoriesEntryFormProps) => {       
  
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCategory) {
      const newCategory = {id: selectedCategory.id, name: event.currentTarget.value, color: selectedCategory.color, description: selectedCategory.description};
      onCategoryChange(newCategory);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCategory) {
      const newCategory = {id: selectedCategory.id, name: selectedCategory.name, color: selectedCategory.color, description: e.target.value};
      onCategoryChange(newCategory);
    }
  };


  const handleColorChange = (color: string) => {
    if (selectedCategory) {
      const newCategory = {id: selectedCategory.id, name: selectedCategory.name, color: color, description: selectedCategory.description};
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
        {selectedCategory?.color && <div className={styles.colorContainer}>
          <PopupState variant="popover" popupId="color-picker-popup-popover">
            {(popupState) => (
              <div>
                <Button variant="outlined" {...bindTrigger(popupState)}>
                  <div 
                    style={{ 
                      maxWidth: "10px",
                      marginRight: "calc(var(--mui-spacing) / 2)",
                      backgroundColor: selectedCategory?.color, 
                      color: selectedCategory?.color, 
                    }}
                  >H</div>
                  Select Color
                </Button>
                <Popover
                  {...bindPopover(popupState)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                >
                  <div className={styles.colorPickerWrapper}>
                    <SketchPicker 
                      color={selectedCategory?.color} 
                      onChange={(color) => handleColorChange(color.hex)} 
                      disableAlpha={true}
                    />
                  </div>
    
                </Popover>
              </div>
            )}
          </PopupState>
        </div>
        }
        {selectedCategory && <Button variant="outlined" color="error" onClick={() => onRemoveCategory(selectedCategory)}>Delete</Button>}
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
      </div>
  );
};

export default CategoriesEntryForm;
