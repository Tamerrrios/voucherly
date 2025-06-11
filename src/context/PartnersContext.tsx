// contexts/PartnersContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getPartners, getBanners, getCategories } from '../api/homeApi'; 

interface PartnersContextType {
  partners: any[];
  banners: any[];
  categories: any[];
  popularPartners: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const PartnersContext = createContext<PartnersContextType | undefined>(undefined);

interface PartnersProviderProps {
  children: ReactNode;
}

export const PartnersProvider: React.FC<PartnersProviderProps> = ({ children }) => {
  const [partners, setPartners] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [popularPartners, setPopularPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [bannersData, partnersData, categoriesData] = await Promise.all([
        getBanners(),
        getPartners(),
        getCategories(),
      ]);

      setBanners(bannersData);
      setPartners(partnersData);
      setCategories(categoriesData ?? []);
      
      const popular = partnersData.filter(p => p.isPopular === true);
      setPopularPartners(popular);
    } catch (e) {
      console.error('Ошибка при загрузке данных:', e);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const value: PartnersContextType = {
    partners,
    banners,
    categories,
    popularPartners,
    loading,
    error,
    refetch: fetchData,
  };

  return (
    <PartnersContext.Provider value={value}>
      {children}
    </PartnersContext.Provider>
  );
};

export const usePartners = () => {
  const context = useContext(PartnersContext);
  if (context === undefined) {
    throw new Error('usePartners must be used within a PartnersProvider');
  }
  return context;
};