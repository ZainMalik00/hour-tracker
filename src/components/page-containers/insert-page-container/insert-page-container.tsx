import React, { useCallback } from 'react';
import styles from './insert-page-container.module.css';
import { Card, CardContent, CardMedia, Divider, Typography, useMediaQuery, useTheme } from '@mui/material';
import router from 'next/router';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import ArticleIcon from '@mui/icons-material/Article';

const InsertPageContainer = () => { 
    const theme = useTheme();
    const isBelowSm = useMediaQuery(theme.breakpoints.down('sm'));
    const handleCardClick = useCallback((path: string) => {
        router.push('/insert/' + path);
    }, []);
    
    return(
        <div className={styles.insertPageContainer}>
            <Typography variant="body1" color="text.secondary">Choose whether to insert time entries or categories:</Typography>
            <div className={`${styles.cardContainer} ${isBelowSm ? styles.column : ''}`}>  
                <Card onClick={() => handleCardClick('time-entries')} className={styles.card}>
                    <CardMedia className={styles.cardMedia}>
                        <AccessTimeIcon className={styles.icon} />
                    </CardMedia>
                    <CardContent>
                        <Typography variant="h6">Time Entries</Typography>
                        <Divider /> 
                        <Typography variant="body2" color="text.secondary">Specify a date, then add time entries for each category in half-hour intervals</Typography>
                    </CardContent>
                </Card>
                <Card onClick={() => handleCardClick('categories')} className={styles.card}>
                    <CardMedia className={styles.cardMedia}>
                        <CategoryIcon className={styles.icon} />
                    </CardMedia>
                    <CardContent>
                        <Typography variant="h6">Categories</Typography>
                        <Divider /> 
                        <Typography variant="body2" color="text.secondary">Define categories to organize your time entries with, view analytical data in charts.</Typography>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InsertPageContainer;