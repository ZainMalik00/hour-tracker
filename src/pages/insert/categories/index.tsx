import React, { startTransition, useCallback, useEffect, useMemo, useRef } from 'react'; 
import InsertPageContainer from '../../../components/page-containers/insert-page-container/insert-page-container';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { PageContainer, PageHeader, PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useSession } from 'next-auth/react';
import { GetCategories } from '../../../backend/user-stories/categories/get-categories/get-categories';
import dayjs from 'dayjs';
import { CategoryEntry } from '../../../backend/entities/DefaultCategories';
import CategoriesPageContainer from '../../../components/page-containers/categories-page-container/categories-page-container';

function CustomPageToolbar({ sortBy, onSortByChange }: { sortBy: string; onSortByChange: (value: string) => void }) {
  return (
    <PageHeaderToolbar>
      <FormControl size="small" sx={{ width: 150, maxWidth: 150, minWidth: 150 }}>
        <InputLabel id="sort-by-label">Sort By</InputLabel>
        <Select 
          labelId="sort-by-label"
          label="Sort By"
          size="small"
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value)}
        >
          <MenuItem value="lastAdded">Last Added</MenuItem>
          <MenuItem value="ascending">Ascending</MenuItem>
          <MenuItem value="descending">Descending</MenuItem>
        </Select>
      </FormControl>
    </PageHeaderToolbar>
  );
}

function CustomPageHeader({ sortBy, onSortByChange }: { sortBy: string; onSortByChange: (value: string) => void }) {
  const CustomPageToolbarComponent = React.useCallback(
    () => <CustomPageToolbar sortBy={sortBy} onSortByChange={onSortByChange} />,
    [],
  );

  return <PageHeader title={"Modify Categories"} slots={{ toolbar: CustomPageToolbarComponent }} />;
}

export default function InsertCategoriesPage() {
  const { data: userData } = useSession();
  const [ userCategories, setUserCategories ] = React.useState<CategoryEntry[]>([]);
  const [ categoriesLength, setCategoriesLength ] = React.useState<number>(0);
  const [ selectedCategory, setSelectedCategory ] = React.useState<CategoryEntry | null>(null);
  const [ sortBy, setSortBy ] = React.useState<string>("lastAdded");
  const selectedCategoryRef = useRef<CategoryEntry | null>(null);
  const isUserSignedIn = !!userData?.user?.email;
  const isSubmitDisabled = categoriesLength == 0 || !isUserSignedIn;

  const sortedUserCategoriesAscending = useMemo(() => {
    const sortedCategories = [...userCategories];
    sortedCategories.sort((a, b) => a.name.localeCompare(b.name));
    return sortedCategories;
  }, [userCategories]);

  const sortedUserCategoriesDescending = useMemo(() => {
    const sortedCategories = [...userCategories];
    sortedCategories.sort((a, b) => b.name.localeCompare(a.name));
    return sortedCategories;
  }, [userCategories]);

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
  

  const handleAddCategory = useCallback(() => {
    startTransition(() => {
      const newId = (Number(userCategories[userCategories.length - 1].id) + 1).toString();
      const randomColor = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      const newCategory = { id: newId, name: "New Category " + newId, color: randomColor, description: "New Category Description" };
      setUserCategories((prevCategories) => {
        return [...prevCategories, newCategory];
      });
      setSelectedCategory(newCategory);
      setCategoriesLength(prevLength => prevLength + 1);
      selectedCategoryRef.current = newCategory;
    });
  }, [userCategories]);

  const handleSortByChange = useCallback((value: string) => { setSortBy(value); }, []);

  const CustomPageHeaderComponent = React.useCallback(
    () => <CustomPageHeader sortBy={sortBy} onSortByChange={handleSortByChange} />,
    [sortBy, handleSortByChange],
  );

  return (
    <div>
      <PageContainer slots={{ header: CustomPageHeaderComponent }} sx={{ minHeight: 'calc(100vh - 128px)' }}>
        <CategoriesPageContainer 
          selectedCategory={selectedCategory} 
          onSelectedCategoryChange={handleSelectedCategoryChange} 
          userCategories={sortBy === "ascending" ? sortedUserCategoriesAscending : sortBy === "descending" ? sortedUserCategoriesDescending : userCategories} 
          onUserCategoriesChange={handleUserCategoriesChange} 
          onCategoryChange={handleCategoryChange} 
          onAddCategory={handleAddCategory} 
        />
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