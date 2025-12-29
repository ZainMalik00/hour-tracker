import * as React from 'react';
import InsertPageContainer from '../../components/insert-page-container/insert-page-container';
import { Box, Button } from '@mui/material';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function InsertPage() {
  const [timeEntriesLength, setTimeEntriesLength] = React.useState<number>(0);
  const handleTimeEntriesChange = React.useCallback((length: number) => {
    setTimeEntriesLength(length);
  }, []);

  return (
    <div>
      <PageContainer>
        <InsertPageContainer onTimeEntriesChange={handleTimeEntriesChange} />
      </PageContainer>
      <Box sx={{ position: 'sticky', bottom: 0, left: 0, right: 0, scrollbarGutter: "auto", backgroundColor: 'primary.contrastText'}}>
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-end",
          borderTop: "1px solid #e0e0e0",
          paddingTop: "var(--mui-spacing)",
          paddingBottom: "var(--mui-spacing)",
          paddingRight: "calc( var(--mui-spacing) * 2)"
          }}>
          <Button variant="contained" size='large' type='submit' form="hour-entry-form" id="submit-button" disabled={timeEntriesLength == 0}>Submit</Button>
        </div>
      </Box>
    </div>
    );
}