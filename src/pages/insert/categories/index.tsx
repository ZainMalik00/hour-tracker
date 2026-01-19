import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'; 
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, Snackbar, Typography } from '@mui/material';
import { PageContainer, PageHeader, PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { useSession } from 'next-auth/react';
import { GetCategories } from '../../../backend/user-stories/categories/get-categories/get-categories';
import { CategoryEntry } from '../../../backend/entities/DefaultCategories';
import CategoriesPageContainer from '../../../components/page-containers/categories-page-container/categories-page-container';
import { DayEntry } from '../../../backend/entities/Entries';
import { GetDays } from '../../../backend/user-stories/daily/get-daily-entries/get-daily-entries';
import { TimeEntry } from '../../../backend/entities/Entries';
import { UpdateCategories } from '../../../backend/user-stories/categories/update-categories/update-categories';

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
  const CustomPageToolbarComponent = useCallback(
    () => <CustomPageToolbar sortBy={sortBy} onSortByChange={onSortByChange} />,
    [],
  );

  return <PageHeader title={"Modify Categories"} slots={{ toolbar: CustomPageToolbarComponent }} />;
}

export default function InsertCategoriesPage() {
  const { data: userData } = useSession();
  const [ userCategories, setUserCategories ] = useState<CategoryEntry[]>([]);
  const [ categoriesLength, setCategoriesLength ] = useState<number>(0);
  const [ selectedCategory, setSelectedCategory ] = useState<CategoryEntry | null>(null);
  const [ sortBy, setSortBy ] = useState<string>("lastAdded");
  const [ userDayEntries, setUserDayEntries ] = useState<DayEntry[]>([]);
  const [ openSnackbar, setOpenSnackbar ] = useState<boolean>(false);
  const [ openDialog, setOpenDialog ] = useState<boolean>(false);
  const [ agreeToDialog, setAgreeToDialog ] = useState<boolean>(false);

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

  const categoryInstanceMap = useMemo(() => {
    const map = new Map<string, number>();
    userDayEntries.flatMap((dayEntry) => dayEntry.timeEntries).forEach((timeEntry: TimeEntry) => {
      map.set(timeEntry.category, (map.get(timeEntry.category) || 0) + 1);
    });
    return map;
  }, [userDayEntries]);

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
    GetDays(userData?.user?.email).then((dayEntries) => {
      setUserDayEntries(dayEntries);
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
      setUserCategories((prevCategories) => { return [...prevCategories, newCategory]; });
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

 const handleRemoveCategory = useCallback((category: CategoryEntry) => {
  const categoryInstanceCount = categoryInstanceMap.get(category.id) || 0;
  if (categoryInstanceCount > 0) { return setOpenSnackbar(true); }
  setOpenDialog(true);

 }, [categoryInstanceMap, userCategories, setUserCategories, setCategoriesLength, setSelectedCategory, selectedCategoryRef]);

  const handleAgreeToDialog = useCallback(() => { 
    setUserCategories((prevCategories) => { return prevCategories.filter((c) => c.id !== selectedCategory?.id); });
    setCategoriesLength(prevLength => prevLength - 1);
    setSelectedCategory(null);
    selectedCategoryRef.current = null;
    setAgreeToDialog(false);
    setOpenDialog(false);
  }, [selectedCategory, setUserCategories, setCategoriesLength, setSelectedCategory, selectedCategoryRef]);


  const handleSubmit = useCallback(() => {
    if (!userData?.user?.email) { return; }
    UpdateCategories(userData?.user?.email, userCategories);
  }, [userData?.user?.email, userCategories]);

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
          onRemoveCategory={handleRemoveCategory}
        />
      </PageContainer>
      <Box sx={{ position: 'sticky', bottom: 0, left: 0, right: 0, scrollbarGutter: "auto", backgroundColor: 'primary.contrastText'}}>
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
            <Typography variant="body2" color="text.secondary">*Must be Signed-In to Modify Categories</Typography>
          )}
          {isUserSignedIn && <div />}
          <Button variant="contained" size='large' id="submit-button" disabled={isSubmitDisabled} onClick={handleSubmit}>Submit</Button>
        </div>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        message="Cannot remove a category with existing time entries"
      />
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete this category?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Deleting a category will delete it permanently after submitting.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Disagree</Button>
          <Button onClick={handleAgreeToDialog} autoFocus> Agree </Button>
        </DialogActions>
      </Dialog>
    </div>
    );
}