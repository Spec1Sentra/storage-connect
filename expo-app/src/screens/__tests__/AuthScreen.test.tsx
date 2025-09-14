import React from 'react';
import { render } from '@testing-library/react-native';
import AuthScreen from '../AuthScreen';

// Mock the supabase client and auth context
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  },
}));

describe('AuthScreen', () => {
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);

    expect(getByText('Storage Connection')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });
});
