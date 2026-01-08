import React from 'react';
import ReactDOM from 'react-dom';
import CategoriesEntryForm from './categories-entry-form';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CategoriesEntryForm />, div);
  ReactDOM.unmountComponentAtNode(div);
});