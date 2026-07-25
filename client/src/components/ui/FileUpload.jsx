import { forwardRef } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "../../utils/helpers";

const FileUpload = forwardRef(
  ({ label, error, accept = "image/*", multiple = false, onFiles, className, previews = [] }, ref) => {
    const handleChange = (e) => {
      const files = Array.from(e.target.files);
      onFiles?.(files);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div
          className={cn(
            "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors",
            error && "border-red-500",
            className
          )}
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, WebP up to 5MB</p>
          <input
            ref={ref}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        {previews.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {previews.map((src, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

export default FileUpload;
