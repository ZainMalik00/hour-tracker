import React from 'react';
import PropTypes from 'prop-types';
import styles from './hour-entry-form.module.css';

const HourEntryForm = () => (
  <div className={styles.HourEntryForm}>
    <form>
      <label>Pick a Date:</label>
    </form>
  </div>
);

HourEntryForm.propTypes = {};

HourEntryForm.defaultProps = {};

export default HourEntryForm;
