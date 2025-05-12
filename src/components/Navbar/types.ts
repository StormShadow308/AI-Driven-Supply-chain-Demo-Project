
import { ReactNode } from 'react';

export type NavLink = {
  path: string;
  label: string;
  icon?: ReactNode;
};

export type NavDropdownItem = NavLink & {
  icon: ReactNode;
};
