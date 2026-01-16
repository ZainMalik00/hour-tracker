import { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { CategoryEntry } from '../../backend/entities/DefaultCategories';
import { DayEntry } from '../../pages/charts';
import { TimeEntry } from '../hour-entry-form/hour-entry-form';
import styles from './categories-table.module.css';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  'td': {
    paddingTop: 'var(--mui-spacing)',
    paddingBottom: 'var(--mui-spacing)',
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.vars?.palette?.background?.paper || theme.palette.background.paper,
  },
  '&:hover': {
    backgroundColor: `${theme.vars?.palette?.background?.paper || theme.palette.background.paper} !important`,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

type Order = 'asc' | 'desc';
type OrderBy = 'category' | 'hours';

interface CategoriesTableProps {
  userCategories: CategoryEntry[];
  userDayEntries: DayEntry[];
  selectedDate: dayjs.Dayjs;
}

export default function CategoriesTable({ userCategories, userDayEntries, selectedDate }: CategoriesTableProps) {
  const [orderBy, setOrderBy] = useState<OrderBy | null>(null);
  const [order, setOrder] = useState<Order>('asc');

  const sortTotalCategoriesById = useCallback((categories: [string, number][]) => {
    return categories.sort((a, b) => Number(a[0]) - Number(b[0]));
  }, []);
  
  const totalHoursByCategory = useMemo(() => {
    const year = selectedDate.year().toString();
    if (!userDayEntries) { return []; }
    const totalHoursByCategory = new Map<string, number>();
    const flattenedUserTimeEntries: TimeEntry[] = 
      userDayEntries.filter((dayEntry: DayEntry) => dayEntry.date.substring(0, 4) === year)
        .flatMap((dayEntry: DayEntry) => dayEntry.timeEntries)
        .filter((timeEntry: TimeEntry | null) => timeEntry !== null) as TimeEntry[];
    flattenedUserTimeEntries.forEach((timeEntry: TimeEntry) => {
      totalHoursByCategory.set(timeEntry.category, (totalHoursByCategory.get(timeEntry.category) || 0) + 0.5);
    });
    return sortTotalCategoriesById(Array.from(totalHoursByCategory.entries()));
  }, [userDayEntries, selectedDate, sortTotalCategoriesById]);

  const handleRequestSort = (property: OrderBy) => {
    if (orderBy === property) { setOrder(order === 'asc' ? 'desc' : 'asc'); } 
    else {
      setOrderBy(property);
      setOrder('asc');
    }
  };

  const sortCategoriesComparator = useCallback((a: { category: CategoryEntry; totalHours: number }, b: { category: CategoryEntry; totalHours: number }) => {
    if (orderBy === null) { return Number(a.category.id) - Number(b.category.id); }
    let comparison = 0;
    if (orderBy === 'category') { comparison = a.category.name.localeCompare(b.category.name); }
    else if (orderBy === 'hours') { comparison = a.totalHours - b.totalHours; }
    return order === 'asc' ? comparison : comparison * -1;
  }, [orderBy, order]);

  const sortedCategories = useMemo(() => {
    const categoriesWithHours = userCategories.map((category) => {
      const totalHours = totalHoursByCategory.find(([categoryId, hours]) => categoryId === category.id)?.[1] || 0;
      return { category, totalHours };
    });

    return categoriesWithHours.sort(sortCategoriesComparator);
  }, [userCategories, totalHoursByCategory, sortCategoriesComparator]);

  return (
    <TableContainer className={styles.tableContainer}>
      <Table stickyHeader aria-label="Time Entries Table">
        <TableHead>
          <TableRow>
            <StyledTableCell 
              key={"category"} 
              className={styles.categoryCell}
              sortDirection={orderBy === 'category' ? order : false}
            >
              <TableSortLabel
                active={orderBy === 'category'}
                direction={orderBy === 'category' ? order : 'asc'}
                onClick={() => handleRequestSort('category')}
              >
                Category
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell 
              key={"hours"} 
              className={styles.hoursCell}
              sortDirection={orderBy === 'hours' ? order : false}
            >
              <TableSortLabel
                active={orderBy === 'hours'}
                direction={orderBy === 'hours' ? order : 'asc'}
                onClick={() => handleRequestSort('hours')}
              >
                Hours
              </TableSortLabel>
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedCategories.map(function ({ category, totalHours }) {
              const categoryName = category.name;
              const categoryColor = category.color;
              return (
                <StyledTableRow hover role="checkbox" tabIndex={-1} key={category.id}>
                  <TableCell key={"category"}>
                    <div className={styles.categoryCellContent}>
                      <div 
                        className={styles.categoryColorIndicator}
                        style={{ 
                          backgroundColor: categoryColor, 
                          color: categoryColor, 
                        }}
                      >H</div>
                      {categoryName}
                    </div>
                  </TableCell>
                  <StyledTableCell key={"hours"}>{totalHours}</StyledTableCell>
                </StyledTableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
