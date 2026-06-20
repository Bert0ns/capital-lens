'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download } from 'lucide-react';
import { importPortfolioFromFile } from '@/lib/utils/portfolio-sharing';
import { toast } from 'sonner';
import { EtfConfig } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface ImportPortfolioButtonProps {
  onImport: (etfs: EtfConfig[]) => void;
}

export function ImportPortfolioButton({ onImport }: ImportPortfolioButtonProps) {
  const { t } = useTranslation();
  const n = t.components.common.notifications;
  const s = t.components.common.sharePortfolio;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      const etfs = await importPortfolioFromFile(file);
      if (etfs.length > 0) {
        onImport(etfs);
        toast.success(n.importSuccess, {
          description: n.importSuccessDesc + file.name,
        });
      }
    } catch (err) {
      const error = err as Error;
      if (error.message === 'UNSUPPORTED_TYPE') {
        toast.error(n.invalidType, { description: n.invalidTypeDesc });
      } else if (error.message === 'FILE_TOO_LARGE') {
        toast.error(n.importFailed, { description: n.fileSizeExceeded });
      } else {
        toast.error(n.importFailed, {
          description: error.message || n.importFailedDesc,
        });
      }
    }

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".lens,image/png"
        className="hidden"
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                className="gap-2 shrink-0 h-auto py-3 px-4 rounded-xl font-semibold border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <Download size={16} className="rotate-180" />
                {s.import}
              </Button>
            }
          />
          <TooltipContent
            side="bottom"
            sideOffset={12}
            className="max-w-[200px] text-center border border-primary/50 bg-background/95 backdrop-blur-sm text-primary shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            {t.pages.analyzer.main.tipDragDrop}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
