import { get_test_api } from '@/lib/api';
import { Test } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TestsContextType {
  tests: Test[];
  loading: boolean;
  fetchTests: () => void;
}

const TestsContext = createContext<TestsContextType | undefined>(undefined);

export function TestsProvider({ children }: { children: ReactNode }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await fetch(get_test_api);
      if (!response.ok) throw new Error('تعذر جلب بيانات الفحوصات، يرجى المحاولة لاحقًا.');
      const data: Test[] = await response.json();
      setTests(data);
    } catch (error) {
      alert('حدث خطأ أثناء تحميل الفحوصات، تأكد من اتصالك بالإنترنت أو حاول لاحقًا.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <TestsContext.Provider value={{ tests, loading, fetchTests }}>
      {children}
    </TestsContext.Provider>
  );
}

export function useTests() {
  const context = useContext(TestsContext);
  if (context === undefined) {
    throw new Error('يجب استخدام useTests داخل TestsProvider.');
  }
  return context;
}
