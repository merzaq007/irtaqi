# دليل المطور - منصة ارتقي

## 🏗️ البنية المعمارية

### نمط التصميم
المشروع يتبع نمط **Component-Based Architecture** مع فصل واضح بين:
- **Presentation Components**: المكونات المرئية (UI)
- **Container Components**: المكونات التي تحتوي على المنطق
- **Utility Functions**: الوظائف المساعدة

### تدفق البيانات
```
User Action → Component → State Update → Re-render
```

## 📦 المكونات الرئيسية

### Layout.tsx
المكون الأساسي الذي يحتوي على:
- Header: شريط التنقل العلوي
- Main: محتوى الصفحة
- Footer: التذييل مع معلومات حقوق النشر

```tsx
<Layout>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/module/:id" element={<ModulePage />} />
    <Route path="/admin" element={<AdminPage />} />
  </Routes>
</Layout>
```

### ModuleCard.tsx
بطاقة عرض المقياس مع:
- اسم المقياس
- أيقونة السهم للتنقل
- تأثيرات hover احترافية
- رابط للصفحة التفصيلية

### FileList.tsx
قائمة الملفات مع:
- أيقونة نوع الملف (PDF, Word, PowerPoint)
- اسم الملف
- تاريخ الرفع
- حجم الملف
- زر التحميل

## 🎨 نظام التصميم

### الألوان
```css
/* Primary - الأزرق الأكاديمي */
--primary: oklch(0.35 0.12 230);

/* Secondary - الرمادي الفاتح */
--secondary: oklch(0.92 0.01 230);

/* Accent - الأزرق الفاتح */
--accent: oklch(0.42 0.14 230);

/* Muted - الخلفية الثانوية */
--muted: oklch(0.96 0.005 230);
```

### الخطوط
```css
/* الخط الأساسي */
--font-sans: Cairo, Tajawal, 'IBM Plex Sans Arabic', system-ui;

/* الخط أحادي المسافة */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

### الظلال
```css
/* ظل خفيف للبطاقات */
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* ظل متوسط للتفاعل */
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);

/* ظل كبير للتركيز */
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* ظل كبير جداً للعناصر المهمة */
shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

## 🔧 الوظائف المساعدة

### formatDate
تنسيق التاريخ بالعربية:
```typescript
formatDate('2026-04-10T10:00:00Z')
// النتيجة: "١٠ أبريل ٢٠٢٦"
```

### formatFileSize
تنسيق حجم الملف:
```typescript
formatFileSize(2048000)
// النتيجة: "1.95 MB"
```

### getFileTypeLabel
الحصول على تسمية نوع الملف:
```typescript
getFileTypeLabel('pdf')    // "PDF"
getFileTypeLabel('docx')   // "Word"
getFileTypeLabel('pptx')   // "PowerPoint"
```

## 🎭 الحركات والتأثيرات

### Spring Presets
```typescript
// سريع وحاد - للأزرار
springPresets.snappy = { stiffness: 400, damping: 30 }

// ناعم ولطيف - للبطاقات
springPresets.gentle = { stiffness: 300, damping: 35 }

// مرتد - للتأكيدات
springPresets.bouncy = { stiffness: 500, damping: 25 }

// سلس - للانتقالات
springPresets.smooth = { stiffness: 200, damping: 40 }
```

### استخدام الحركات
```tsx
import { motion } from 'framer-motion';
import { springPresets } from '@/lib/motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={springPresets.gentle}
>
  {/* المحتوى */}
</motion.div>
```

## 🔄 إدارة الحالة

### useState للحالة المحلية
```tsx
const [files, setFiles] = useState<File[]>([]);
const [loading, setLoading] = useState(true);
```

### useEffect للتأثيرات الجانبية
```tsx
useEffect(() => {
  const fetchFiles = async () => {
    // جلب البيانات
  };
  fetchFiles();
}, [dependency]);
```

## 🛣️ التوجيه (Routing)

### تعريف المسارات
```typescript
export const ROUTE_PATHS = {
  HOME: '/',
  MODULE: '/module',
  ADMIN: '/admin',
} as const;
```

### استخدام المسارات
```tsx
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';

<Link to={`${ROUTE_PATHS.MODULE}/${module.id}`}>
  {module.name}
</Link>
```

## 📱 التصميم المتجاوب

### نقاط التوقف (Breakpoints)
```css
/* Mobile First Approach */
/* Default: Mobile (< 640px) */

/* Tablet */
@media (min-width: 768px) { /* md */ }

/* Desktop */
@media (min-width: 1024px) { /* lg */ }

/* Large Desktop */
@media (min-width: 1280px) { /* xl */ }
```

### مثال على الاستخدام
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Mobile: 1 column */}
  {/* Tablet: 2 columns */}
  {/* Desktop: 3 columns */}
</div>
```

## 🔐 الأمان

### حماية لوحة التحكم
```tsx
const [isAuthenticated, setIsAuthenticated] = useState(false);
const ADMIN_PASSWORD = 'admin123'; // يجب تغييره في الإنتاج

const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  if (password === ADMIN_PASSWORD) {
    setIsAuthenticated(true);
  }
};
```

**⚠️ تحذير**: في بيئة الإنتاج، يجب:
1. استخدام متغيرات البيئة لكلمة المرور
2. تشفير كلمة المرور
3. استخدام JWT أو Session للمصادقة
4. إضافة HTTPS

## 🧪 الاختبار

### اختبار المكونات
```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع التغطية
npm run test:coverage
```

### اختبار يدوي
1. **الصفحة الرئيسية**
   - [ ] عرض جميع المقاييس
   - [ ] عرض آخر الدروس المضافة
   - [ ] التنقل إلى صفحة المقياس

2. **صفحة المقياس**
   - [ ] عرض اسم المقياس
   - [ ] عرض قائمة الملفات
   - [ ] تحميل الملفات

3. **لوحة التحكم**
   - [ ] المصادقة بكلمة المرور
   - [ ] رفع ملف جديد
   - [ ] عرض رسائل النجاح/الخطأ

## 🚀 النشر

### البناء للإنتاج
```bash
npm run build
```

### معاينة البناء
```bash
npm run preview
```

### النشر على Vercel
```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel
```

### النشر على Netlify
```bash
# تثبيت Netlify CLI
npm i -g netlify-cli

# النشر
netlify deploy --prod
```

## 🐛 تصحيح الأخطاء

### أدوات التطوير
```tsx
// React DevTools
// Redux DevTools (إذا تم استخدام Redux)

// Console Logging
console.log('Debug:', data);
console.error('Error:', error);
console.warn('Warning:', warning);
```

### الأخطاء الشائعة

#### 1. خطأ في التوجيه
```
Error: Cannot read property 'id' of undefined
```
**الحل**: تحقق من وجود المعامل في URL
```tsx
const { id } = useParams<{ id: string }>();
if (!id) return <Navigate to={ROUTE_PATHS.HOME} />;
```

#### 2. خطأ في الحالة
```
Warning: Can't perform a React state update on an unmounted component
```
**الحل**: استخدم cleanup في useEffect
```tsx
useEffect(() => {
  let isMounted = true;
  
  const fetchData = async () => {
    const data = await getData();
    if (isMounted) setData(data);
  };
  
  fetchData();
  return () => { isMounted = false; };
}, []);
```

## 📚 موارد إضافية

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion/)

## 🤝 المساهمة

### خطوات المساهمة
1. Fork المشروع
2. أنشئ فرع للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

### معايير الكود
- استخدم TypeScript لجميع الملفات
- اتبع ESLint rules
- أضف تعليقات للكود المعقد
- اكتب اختبارات للميزات الجديدة

---

**آخر تحديث**: أبريل 2026
