import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import styles from './categories-page-container.module.css';
import { useTheme, useMediaQuery, Card, ListItem, ListItemButton, ListItemText, Box, Chip, Typography } from '@mui/material';
import { CategoryEntry, DefaultCategories } from '../../../backend/entities/DefaultCategories';
import CategoriesEntryForm from '../../categories-entry-form/categories-entry-form';

interface CategoriesPageContainerProps {
    selectedCategory: CategoryEntry | null;
    onSelectedCategoryChange: (category: CategoryEntry) => void;
    userCategories: CategoryEntry[];
    onUserCategoriesChange: (categories: CategoryEntry[]) => void;
    onCategoryChange: (category: CategoryEntry) => void;
}

const CategoriesPageContainer = ({ selectedCategory, onSelectedCategoryChange, userCategories, onUserCategoriesChange, onCategoryChange }: CategoriesPageContainerProps) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));

  const categoryChip = useMemo( () => (category: CategoryEntry) => {
    return (
      <div className={styles.categoryChipContents}>
        <div 
          style={{ 
            maxWidth: "10px",
            backgroundColor: category.color, 
            color: category.color, 
          }}
        >H</div>
        <Typography variant="body1">{category.name}</Typography>
      </div>
    );
  }, [userCategories]);

  { if (userCategories.length > 0) { 
    return (
        <div className={styles.CategoriesPageContainer}>
            <div className={styles.chipsContainer}>
                { userCategories.map((category, index) => (
                    <Chip 
                        key={index}
                        variant="outlined"
                        label={categoryChip(category)}
                        clickable
                        onClick={() => onSelectedCategoryChange(category)}
                        className={styles.categoryChip}
                    />
                ))}
            </div>
            <CategoriesEntryForm
                selectedCategory={selectedCategory}
                onSelectedCategoryChange={onSelectedCategoryChange}
                onCategoryChange={onCategoryChange}
            />
        </div>
    )
  }}
  return(<div></div>);
};

export default CategoriesPageContainer;

