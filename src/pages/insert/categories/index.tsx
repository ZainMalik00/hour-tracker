import React, { useCallback, useEffect, useRef } from 'react'; 
import InsertPageContainer from '../../../components/page-containers/insert-page-container/insert-page-container';
import { Box, Button, FormControl, Typography } from '@mui/material';
import { PageContainer, PageHeader, PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useSession } from 'next-auth/react';
import { GetCategories } from '../../../backend/user-stories/categories/get-categories/get-categories';
import dayjs from 'dayjs';
import { CategoryEntry } from '../../../backend/entities/DefaultCategories';
import CategoriesPageContainer from '../../../components/page-containers/categories-page-container/categories-page-container';

export default function InsertPage() {
  const { data: userData } = useSession();
  const [ userCategories, setUserCategories ] = React.useState<CategoryEntry[]>([]);
  const [ categoriesLength, setCategoriesLength ] = React.useState<number>(0);
  const [ selectedCategory, setSelectedCategory ] = React.useState<CategoryEntry | null>(null);
  const selectedCategoryRef = useRef<CategoryEntry | null>(null);
  const isUserSignedIn = !!userData?.user?.email;
  const isSubmitDisabled = categoriesLength == 0 || !isUserSignedIn;

  useEffect(() => {
    if (!userData?.user?.email) { return; }
    GetCategories(userData?.user?.email).then((categories) => { 
      if (!categories) { 
        setUserCategories([]); 
        setCategoriesLength(0); 
        return; 
      }
      setUserCategories(categories);
      setCategoriesLength(categories.length);
    });
  }, [userData?.user?.email]);

  const handleUserCategoriesChange = useCallback((categories: CategoryEntry[]) => { setUserCategories(categories); }, []);
  const handleSelectedCategoryChange = useCallback((category: CategoryEntry) => { 
    setSelectedCategory(category);
    selectedCategoryRef.current = { ...category };
  }, []);

  const handleCategoryChange = useCallback((newCategory: CategoryEntry) => {
    const currentCategory = selectedCategoryRef.current;
    setSelectedCategory(newCategory);
    selectedCategoryRef.current = { ...newCategory };
    
    setUserCategories((prevCategories) => {
      if (!currentCategory) { return prevCategories; }

      return prevCategories.map((category) => {
        if (category.name === currentCategory.name && 
            category.color === currentCategory.color &&
            category.description === currentCategory.description) {
          return newCategory;
        }
        return category;
      });
    });
  }, []);
  
  return (
    <div>
      <PageContainer title="Insert Categories" sx={{ minHeight: 'calc(100vh - 128px)' }}>
        <CategoriesPageContainer selectedCategory={selectedCategory} onSelectedCategoryChange={handleSelectedCategoryChange} userCategories={userCategories} onUserCategoriesChange={handleUserCategoriesChange} onCategoryChange={handleCategoryChange} />
      </PageContainer>
      {/* <Box sx={{ position: 'sticky', bottom: 0, left: 0, right: 0, scrollbarGutter: "auto", backgroundColor: 'primary.contrastText'}}>
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "calc( var(--mui-spacing) * 2)",
          borderTop: "1px solid #e0e0e0",
          paddingTop: "var(--mui-spacing)",
          paddingBottom: "var(--mui-spacing)",
          paddingLeft: "calc( var(--mui-spacing) * 2)",
          paddingRight: "calc( var(--mui-spacing) * 2)"
          }}>
          {!isUserSignedIn && (
            <Typography variant="body2" color="text.secondary">*Must be Signed-In to Insert</Typography>
          )}
          {isUserSignedIn && <div />}
          <Button variant="contained" size='large' type='submit' form="hour-entry-form" id="submit-button" disabled={isSubmitDisabled}>Submit</Button>
        </div>
      </Box> */}
    </div>
    );
}