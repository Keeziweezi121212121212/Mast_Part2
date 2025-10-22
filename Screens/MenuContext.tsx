import React, { createContext, useState } from 'react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  course: string;
  price: number;
}

interface MenuContextProps {
  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  removeMenuItem: (id: string) => void;
}

export const MenuContext = createContext<MenuContextProps | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Part 2: start with NO hardcoded items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const addMenuItem = (item: MenuItem) => setMenuItems(prev => [...prev, item]);
  const removeMenuItem = (id: string) => setMenuItems(prev => prev.filter(i => i.id !== id));

  return (
    <MenuContext.Provider value={{ menuItems, addMenuItem, removeMenuItem }}>
      {children}
    </MenuContext.Provider>
  );
};

