export const ROUTE_PATHS = {
  HOME: '/',
  MODULE: '/module/:moduleId',
} as const;

export interface Material {
  id: string;
  title: string;
  moduleId: string;
  uploadDate: string;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
}

export interface Module {
  id: string;
  name: string;
  icon: string;
  materialsCount: number;
}



export const MODULES: Module[] = [
  { id: 'web-apps', name: 'تطبيقات الويب في أنظمة المعلومات الوثائقية', icon: 'Globe', materialsCount: 0 },
  { id: 'digital-document', name: 'الوثيقة الرقمية', icon: 'FileText', materialsCount: 0 },
  { id: 'info-engineering', name: 'هندسة المعلومات', icon: 'Network', materialsCount: 0 },
  { id: 'digital-platforms', name: 'المنصات الرقمية الوثائقية', icon: 'Server', materialsCount: 0 },
  { id: 'research-methodology', name: 'منهجية البحث العلمي في علم المكتبات والمعلومات 2', icon: 'BookOpen', materialsCount: 0 },
  { id: 'research-data-management', name: 'إدارة بيانات البحث', icon: 'Database', materialsCount: 0 },
  { id: 'governance-e-reputation', name: 'الحوكمة والسمعة الإلكترونية', icon: 'Shield', materialsCount: 0 },
  { id: 'programming-ai', name: 'البرمجة والذكاء الاصطناعي (2)', icon: 'Bot', materialsCount: 0 },
  { id: 'entrepreneurship', name: 'المقاولاتية والمؤسسات الناشئة', icon: 'Rocket', materialsCount: 0 },
  { id: 'social-networks', name: 'شبكات التواصل الاجتماعي', icon: 'Share2', materialsCount: 0 },
  { id: 'english-language', name: 'اللغة الإنجليزية (2)', icon: 'Languages', materialsCount: 0 },
];

export const FILE_TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'Word (DOCX)' },
  { value: 'pptx', label: 'PowerPoint (PPTX)' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
  { value: 'txt', label: 'نص (TXT)' },
  { value: 'zip', label: 'ملف مضغوط (ZIP)' },
] as const;
