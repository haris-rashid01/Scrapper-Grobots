import { Input } from "@/components/ui/input";
import { Globe } from "lucide-react";

interface UrlInputProps {
  url: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

const UrlInput = ({ url, onChange, disabled }: UrlInputProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Website URL
      </label>
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="url"
          placeholder="https://example.com/products"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="pl-10 h-11 font-mono text-sm bg-muted/50 border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>
    </div>
  );
};

export default UrlInput;
