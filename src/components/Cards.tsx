import { Module, Material } from '@/lib/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ModuleCardProps {
  module: Module;
  onClick: () => void;
}

export function ModuleCard({ module, onClick }: ModuleCardProps) {
  const IconComponent = (Icons as any)[module.icon] || Icons.BookOpen;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{module.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {module.materialsCount} ملف متاح
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

interface MaterialItemProps {
  material: Material;
}

export function MaterialItem({ material }: MaterialItemProps) {
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'pptx':
      case 'ppt':
        return <FileText className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {getFileIcon(material.fileType)}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">
                {material.title}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(material.uploadDate)}
                </span>
                <span>{material.fileSize}</span>
                <span className="uppercase">{material.fileType}</span>
              </div>
            </div>
          </div>
          <Button size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            تحميل
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
