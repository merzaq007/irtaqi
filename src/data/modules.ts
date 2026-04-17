export interface ModuleFile {
  id: string;
  name: string;
  type: 'PDF' | 'DOC' | 'PPT';
  uploadDate: string;
  size: string;
  fileUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  icon: string;
  color: string;
  files: ModuleFile[];
}

export const modulesData: Module[] = [
  {
    id: 'web-apps',
    title: 'تطبيقات الويب في أنظمة المعلومات الوثائقية',
    icon: 'Globe',
    color: 'text-blue-500 bg-blue-500/10 group-hover:bg-blue-500',
    files: []
  },
  {
    id: 'digital-document',
    title: 'الوثيقة الرقمية',
    icon: 'FileText',
    color: 'text-purple-500 bg-purple-500/10 group-hover:bg-purple-500',
    files: []
  },
  {
    id: 'info-engineering',
    title: 'هندسة المعلومات',
    icon: 'Network',
    color: 'text-cyan-500 bg-cyan-500/10 group-hover:bg-cyan-500',
    files: []
  },
  {
    id: 'digital-platforms',
    title: 'المنصات الرقمية الوثائقية',
    icon: 'Server',
    color: 'text-indigo-500 bg-indigo-500/10 group-hover:bg-indigo-500',
    files: []
  },
  {
    id: 'research-methodology',
    title: 'منهجية البحث العلمي في علم المكتبات والمعلومات 2',
    icon: 'BookOpen',
    color: 'text-emerald-500 bg-emerald-500/10 group-hover:bg-emerald-500',
    files: []
  },
  {
    id: 'research-data-management',
    title: 'إدارة بيانات البحث',
    icon: 'Database',
    color: 'text-orange-500 bg-orange-500/10 group-hover:bg-orange-500',
    files: []
  },
  {
    id: 'governance-e-reputation',
    title: 'الحوكمة والسمعة الإلكترونية',
    icon: 'Shield',
    color: 'text-red-500 bg-red-500/10 group-hover:bg-red-500',
    files: []
  },
  {
    id: 'programming-ai',
    title: 'البرمجة والذكاء الاصطناعي (2)',
    icon: 'Bot',
    color: 'text-violet-500 bg-violet-500/10 group-hover:bg-violet-500',
    files: []
  },
  {
    id: 'entrepreneurship',
    title: 'المقاولاتية والمؤسسات الناشئة',
    icon: 'Rocket',
    color: 'text-amber-500 bg-amber-500/10 group-hover:bg-amber-500',
    files: []
  },
  {
    id: 'social-networks',
    title: 'شبكات التواصل الاجتماعي',
    icon: 'Share2',
    color: 'text-pink-500 bg-pink-500/10 group-hover:bg-pink-500',
    files: []
  },
  {
    id: 'english-language',
    title: 'اللغة الإنجليزية (2)',
    icon: 'Languages',
    color: 'text-teal-500 bg-teal-500/10 group-hover:bg-teal-500',
    files: []
  }
];
