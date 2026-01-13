import * as React from 'react';
import TimeEntriesPageContainer   from '../../components/page-containers/time-entries-page-container/time-entries-page-container';
import { Box, Button, FormControl, Typography } from '@mui/material';
import { PageContainer, PageHeader, PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import InsertPageContainer from '../../components/page-containers/insert-page-container/insert-page-container';

export default function InsertPage() {
  const { data: userData } = useSession();
  const [timeEntriesLength, setTimeEntriesLength] = React.useState<number>(0);
  const [selectedDate, setSelectedDate] = React.useState(dayjs());
  const handleTimeEntriesChange = React.useCallback((length: number) => {
    setTimeEntriesLength(length);
  }, []);

  const handleSelectedDateChange = React.useCallback((date: dayjs.Dayjs) => {
    setSelectedDate(date);
  }, []);

  const isUserSignedIn = !!userData?.user?.email;
  const isSubmitDisabled = timeEntriesLength == 0 || !isUserSignedIn;

  return (
    <PageContainer sx={{ minHeight: 'calc(100vh - 128px)' }}>
      <InsertPageContainer />
    </PageContainer>
    );
}