import { Download, FileText, FileType, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Material } from '@/lib/index';

interface FileListProps {
  files: Material[];
  moduleId?: string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ar-DZ');
}

function getFileTypeLabel(type: string) {
  const map: Record<string, string> = { pdf: 'PDF', doc: 'Word', docx: 'Word', ppt: 'PowerPoint', pptx: 'PowerPoint', xls: 'Excel', xlsx: 'Excel' };
  return map[type.toLowerCase()] || type.toUpperCase();
}

function formatFileSize(size: string) {
  return size;
}

export function FileList({ files, moduleId }: FileListProps) {
  const filteredFiles = moduleId
    ? files.filter((file) => file.moduleId === moduleId)
    : files;

  if (filteredFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground text-center">لا توجد ملفات متاحة حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredFiles.map((file) => (
        <Card key={file.id} className="p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-3 bg-primary/10 rounded-lg">
                {file.fileType === 'pdf' && <FileType className="w-6 h-6 text-primary" />}
                {(file.fileType === 'ppt' || file.fileType === 'pptx') && <Presentation className="w-6 h-6 text-primary" />}
                {(file.fileType === 'doc' || file.fileType === 'docx') && <FileText className="w-6 h-6 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate text-lg mb-2">{file.title}</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary" className="text-xs font-medium">{getFileTypeLabel(file.fileType)}</Badge>
                  <span className="text-sm text-muted-foreground">{formatDate(file.uploadDate)}</span>
                  {file.fileSize && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{formatFileSize(file.fileSize)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button size="default" className="flex-shrink-0 font-semibold" onClick={() => window.open(file.downloadUrl, '_blank')}>
              <Download className="w-5 h-5 ml-2" />
              تحميل
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
