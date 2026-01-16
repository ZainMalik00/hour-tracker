import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import { PageContainer, PageHeader, PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { GetCategories } from '../../backend/user-stories/categories/get-categories/get-categories';
import { GetDays } from '../../backend/user-stories/daily/get-daily-entries/get-daily-entries';
import { CategoryEntry } from '../../backend/entities/DefaultCategories';
import { DayEntry } from '../charts';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CategoriesTable from '../../components/categories-table/categories-table';

function CustomPageToolbar({ selectedDate, onSelectedDateChange }: { selectedDate: dayjs.Dayjs; onSelectedDateChange: (date: dayjs.Dayjs) => void }) {

  return (
    <PageHeaderToolbar>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker 
              label="Year"
              views={['year']}
              value={selectedDate}
              onChange={(value) => { if(value){ onSelectedDateChange(value) }}} 
              sx={{ maxWidth: '115px' }}
              slotProps={{ textField: { size: 'small' } }}
          />
      </LocalizationProvider>
    </PageHeaderToolbar>
  );
}

function CustomPageHeader({ selectedDate, onSelectedDateChange }: { selectedDate: dayjs.Dayjs; onSelectedDateChange: (date: dayjs.Dayjs) => void }) {
  const CustomPageToolbarComponent = React.useCallback(
    () => <CustomPageToolbar selectedDate={selectedDate} onSelectedDateChange={onSelectedDateChange} />,
    [selectedDate, onSelectedDateChange],
  );

  return <PageHeader slots={{ toolbar: CustomPageToolbarComponent }} />;
}

export default function AnalyticsPage() {
  const { data: userData } = useSession();
  const [userCategories, setUserCategories] = useState<CategoryEntry[]>([]);
  const [userDayEntries, setUserDayEntries] = useState<DayEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const handleSelectedDateChange = React.useCallback((date: dayjs.Dayjs) => {
    setSelectedDate(date);
  }, []);

  const CustomPageHeaderComponent = React.useCallback(
    () => <CustomPageHeader selectedDate={selectedDate} onSelectedDateChange={handleSelectedDateChange} />,
    [selectedDate, handleSelectedDateChange],
  );

  useEffect(() => {
    if (!userData?.user?.email) { return; }
    GetCategories(userData?.user?.email).then((categories) => { 
      if (!categories) { setUserCategories([]); return; }
      setUserCategories(categories);
    });
    GetDays(userData?.user?.email).then((dayEntries) => {
      setUserDayEntries(dayEntries);
    });
  }, [userData?.user?.email]);

  return(
    <PageContainer slots={{ header: CustomPageHeaderComponent }}  sx={{ minHeight: 'calc(100vh - 128px)' }}>
      <CategoriesTable 
        userCategories={userCategories}
        userDayEntries={userDayEntries}
        selectedDate={selectedDate}
      />
    </PageContainer>
  );

}