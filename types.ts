
export type ViewState = 'login' | 'home' | 'products' | 'menus' | 'media' | 'product-editor' | 'menu-editor' | 'profile';

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
}

export interface MenuTemplate {
  id: string;
  name: string;
  style: 'List' | 'Grid';
  format: 'A4' | 'A5';
  lastModified: string;
}

export enum MenuStyle {
  STANDARD = 'Standard',
  OVERLAY = 'Overlay',
  PARISIAN = 'Parisian',
  CLASSIC = 'Classic',
  MINIMAL = 'Minimal'
}

export interface EditorConfig {
  title: string;
  showTitle: boolean;
  format: string;
  layout: string;
  paddingH: number;
  paddingV: number;
  gap: number;
  cols: number;
  rows: number;
  colorTitle: string;
  colorBg: string; // Used as fallback or solid color reference
  gradientStart: string;
  gradientEnd: string;
  colorProductName: string;
  colorPrice: string;
  backgroundGradient?: string;
  customWidth: number;
  customHeight: number;
}