export type PersonaType = 
  | 'all' 
  | 'students' 
  | 'office' 
  | 'developers' 
  | 'household' 
  | 'creators' 
  | 'finance' 
  | 'legal' 
  | 'journalists' 
  | 'general';

export type MainCategoryType = 
  | 'pdf-tools'
  | 'audio-tools'
  | 'calculators'
  | 'image-tools'
  | 'video-tools'
  | 'developer-tools'
  | 'logo-remover'
  | 'cv-creator'
  | 'image-separator';

export interface ToolItem {
  id: string;
  folderName: string;
  name: string;
  tagline: string;
  description: string;
  mainCategory: MainCategoryType;
  subCategory: string;
  personas: PersonaType[];
  icon: string;
  badge?: string;
  status: 'ready' | 'beta' | 'planned';
}

export interface CategoryInfo {
  id: MainCategoryType;
  title: string;
  titleUrdu: string;
  description: string;
  icon: string;
  subCategories: string[];
}
