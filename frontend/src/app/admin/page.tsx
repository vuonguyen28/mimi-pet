"use client";
import { useState, useEffect } from 'react';
import Sidebar from '../admin/Sidebar/page';
import Navbar from '../admin/Navbar/page';
import Dashboard from './profile/page';
import PostCategoriesPage from '../admin/postscategories/page';

export default function AdminPage() {
  const [section, setSection] = useState('dashboard');

  useEffect(() => {
    const updateSectionFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      setSection(hash || 'dashboard');
    };

    updateSectionFromHash();
    window.addEventListener('hashchange', updateSectionFromHash);

    return () => window.removeEventListener('hashchange', updateSectionFromHash);
  }, []);

  return (
    <Dashboard />
  );
}
