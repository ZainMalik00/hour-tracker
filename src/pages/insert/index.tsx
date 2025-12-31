import * as React from 'react';
import InsertPageContainer from '../../components/page-containers/insert-page-container/insert-page-container';
import { Box, Button, FormControl, Typography } from '@mui/material';
import { PageContainer, PageHeader, PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';

function CustomPageToolbar({ selectedDate, onSelectedDateChange }: { selectedDate: dayjs.Dayjs; onSelectedDateChange: (date: dayjs.Dayjs) => void }) {
  return (
    <PageHeaderToolbar>
      <FormControl size="small" required>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker 
            label="Date *"
            value={selectedDate}
            onChange={(value) => {if(value){ onSelectedDateChange(value) }}} 
            sx={{ width: 220 }}
            slotProps={{ textField: { size: 'small' } }}
          />
        </LocalizationProvider>
      </FormControl>
    </PageHeaderToolbar>
  );
}

function CustomPageHeader({ status, selectedDate, onSelectedDateChange }: { status: string; selectedDate: dayjs.Dayjs; onSelectedDateChange: (date: dayjs.Dayjs) => void }) {
  const CustomPageToolbarComponent = React.useCallback(
    () => <CustomPageToolbar selectedDate={selectedDate} onSelectedDateChange={onSelectedDateChange} />,
    [status, selectedDate, onSelectedDateChange],
  );

  return <PageHeader slots={{ toolbar: CustomPageToolbarComponent }} />;
}

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

  const CustomPageHeaderComponent = React.useCallback(
    () => <CustomPageHeader status="" selectedDate={selectedDate} onSelectedDateChange={handleSelectedDateChange} />,
    [selectedDate, handleSelectedDateChange],
  );

  const isUserSignedIn = !!userData?.user?.email;
  const isSubmitDisabled = timeEntriesLength == 0 || !isUserSignedIn;

  return (
    <div>
      <PageContainer slots={{ header: CustomPageHeaderComponent }}>
        <InsertPageContainer 
          selectedDate={selectedDate}
          onSelectedDateChange={handleSelectedDateChange}
          onTimeEntriesChange={handleTimeEntriesChange} 
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
            <Typography variant="body2" color="text.secondary">*Must be Signed-In to Insert</Typography>
          )}
          {isUserSignedIn && <div />}
          <Button variant="contained" size='large' type='submit' form="hour-entry-form" id="submit-button" disabled={isSubmitDisabled}>Submit</Button>
        </div>
      </Box>
    </div>
    );
}