# إعدادات Cloudflare Pages

## ⚠️ مهم جداً

يجب تغيير إعدادات Build في Cloudflare Pages Dashboard:

### الخطوات:

1. **افتح Cloudflare Dashboard**
   - اذهب إلى: https://dash.cloudflare.com
   - اختر **Pages**
   - اختر مشروع **irtaqi**

2. **اذهب إلى Settings → Builds & deployments**

3. **عدّل Build settings:**
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Deploy command**: **اتركه فارغاً** أو احذفه تماماً

4. **احفظ التغييرات**

5. **أعد النشر:**
   - اذهب إلى **Deployments**
   - اضغط **Retry deployment** على آخر deployment

## ✅ الإعدادات الصحيحة

```
Framework preset: None (أو Vite)
Build command: npm run build
Build output directory: dist
Root directory: /
Deploy command: (فارغ - لا تضع أي شيء)
```

## ❌ المشكلة الحالية

Cloudflare Pages يحاول تشغيل `npx wrangler deploy` وهذا خاطئ لأن:
- المشروع هو **Pages** وليس **Worker**
- Pages لا يحتاج deploy command
- wrangler deploy للـ Workers فقط

## 🎯 بعد التعديل

بعد تغيير الإعدادات وإعادة النشر، المنصة ستعمل بشكل صحيح على:
- https://irtaqi.pages.dev

---

**ملاحظة**: لا يمكن تغيير هذه الإعدادات من الكود، يجب تغييرها من Dashboard يدوياً.
