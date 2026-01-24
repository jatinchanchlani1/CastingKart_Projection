import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { DEFAULT_INPUTS } from '../lib/utils';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function useFinancialData() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [projections, setProjections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateProjections = useCallback(async (newInputs) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/calculate`, newInputs);
      setProjections(response.data);
    } catch (err) {
      console.error('Calculation error:', err);
      setError(err.message || 'Failed to calculate projections');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInputs = useCallback((section, field, value) => {
    setInputs(prev => {
      const newInputs = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
      
      // Trigger recalculation
      calculateProjections(newInputs);
      
      return newInputs;
    });
  }, [calculateProjections]);

  const updateSection = useCallback((section, values) => {
    setInputs(prev => {
      const newInputs = {
        ...prev,
        [section]: {
          ...prev[section],
          ...values
        }
      };
      
      calculateProjections(newInputs);
      
      return newInputs;
    });
  }, [calculateProjections]);

  const resetInputs = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    calculateProjections(DEFAULT_INPUTS);
  }, [calculateProjections]);

  // Initial calculation on mount
  useEffect(() => {
    calculateProjections(inputs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    inputs,
    setInputs,
    projections,
    loading,
    error,
    updateInputs,
    updateSection,
    resetInputs,
    calculateProjections
  };
}
