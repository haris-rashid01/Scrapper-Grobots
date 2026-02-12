import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface FieldsInputProps {
  fields: string[];
  onChange: (fields: string[]) => void;
  disabled?: boolean;
}

const SUGGESTIONS = ["title", "price", "image", "description", "rating", "url", "category"];

const FieldsInput = ({ fields, onChange, disabled }: FieldsInputProps) => {
  const addField = (value = "") => {
    onChange([...fields, value]);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, value: string) => {
    const updated = [...fields];
    updated[index] = value;
    onChange(updated);
  };

  const unusedSuggestions = SUGGESTIONS.filter((s) => !fields.includes(s));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Scraping Fields
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addField()}
          disabled={disabled}
          className="h-8 text-xs text-primary hover:text-primary hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Field
        </Button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={index} className="flex gap-2 animate-fade-in">
            <Input
              placeholder="Field name (e.g. price)"
              value={field}
              onChange={(e) => updateField(index, e.target.value)}
              disabled={disabled}
              className="h-10 font-mono text-sm bg-muted/50 border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeField(index)}
              disabled={disabled}
              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">
          No fields added yet. Add fields or pick from suggestions below.
        </p>
      )}

      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {unusedSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addField(suggestion)}
              disabled={disabled}
              className="px-2.5 py-1 text-xs font-mono rounded-md bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FieldsInput;
