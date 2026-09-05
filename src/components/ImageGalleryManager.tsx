import React, { useState, useRef } from 'react';
import {
  Upload,
  Link2,
  Plus,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Images,
  Check,
  AlertCircle,
} from 'lucide-react';
import { PRESET_GALLERY_ALBUMS } from '../data/presetGalleries';

interface ImageGalleryManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  thumbnail: string;
  onSetThumbnail: (url: string) => void;
  lang: 'km' | 'en';
}

export const ImageGalleryManager: React.FC<ImageGalleryManagerProps> = ({
  images,
  onChange,
  thumbnail,
  onSetThumbnail,
  lang,
}) => {
  const [inputTab, setInputTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // 1. Direct Upload: Handle Multiple Files
  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      showStatus(lang === 'km' ? 'សូមជ្រើសរើសឯកសារដែលជារូបភាព' : 'Please select valid image files');
      return;
    }

    setIsProcessingFiles(true);
    let loadedCount = 0;
    const newResults: string[] = [];

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          newResults.push(reader.result);
        }
        loadedCount += 1;
        if (loadedCount === fileArray.length) {
          const updated = [...images, ...newResults];
          onChange(updated);
          // If no thumbnail set yet, set the first uploaded image as cover
          if (!thumbnail || thumbnail.includes('unsplash.com/photo-1618005182384')) {
            onSetThumbnail(updated[0]);
          }
          setIsProcessingFiles(false);
          showStatus(
            lang === 'km'
              ? `បានបញ្ចូល ${newResults.length} រូបភាពដោយជោគជ័យ!`
              : `Added ${newResults.length} images successfully!`
          );
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // 2. Add Single URL
  const handleAddSingleUrl = () => {
    const trimmed = singleUrl.trim();
    if (!trimmed) return;
    if (images.includes(trimmed)) {
      showStatus(lang === 'km' ? 'រូបភាពនេះមានក្នុងបញ្ជីរួចហើយ' : 'Image is already in the list');
      return;
    }
    const updated = [...images, trimmed];
    onChange(updated);
    if (!thumbnail) {
      onSetThumbnail(trimmed);
    }
    setSingleUrl('');
    showStatus(lang === 'km' ? 'បានបន្ថែមកំណត់តំណភ្ជាប់រូបភាពរួចរាល់' : 'Image URL added');
  };

  // 3. Add Bulk URLs
  const handleAddBulkUrls = () => {
    const lines = bulkUrls
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith('http://') || l.startsWith('https://') || l.startsWith('data:image/'));

    if (lines.length === 0) {
      showStatus(lang === 'km' ? 'សូមបញ្ចូលតំណភ្ជាប់រូបភាពយ៉ាងហោចណាស់មួយ' : 'Please provide at least one valid image URL');
      return;
    }

    const uniqueNew = lines.filter((url) => !images.includes(url));
    const updated = [...images, ...uniqueNew];
    onChange(updated);
    if (!thumbnail && updated.length > 0) {
      onSetThumbnail(updated[0]);
    }
    setBulkUrls('');
    showStatus(
      lang === 'km'
        ? `បានបញ្ចូល ${uniqueNew.length} រូបភាពតាមតំណភ្ជាប់!`
        : `Added ${uniqueNew.length} images from links!`
    );
  };

  // 4. Preset Album
  const handleApplyPreset = (albumImages: string[]) => {
    const uniqueNew = albumImages.filter((url) => !images.includes(url));
    const updated = [...images, ...uniqueNew];
    onChange(updated);
    if (!thumbnail && updated.length > 0) {
      onSetThumbnail(updated[0]);
    }
    showStatus(
      lang === 'km'
        ? `បានបញ្ចូលអាល់ប៊ុមគំរូ (${uniqueNew.length} រូប)!`
        : `Preset album applied (${uniqueNew.length} photos)!`
    );
  };

  // Management Actions
  const handleRemoveImage = (index: number) => {
    const targetUrl = images[index];
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    if (thumbnail === targetUrl) {
      onSetThumbnail(updated[0] || '');
    }
  };

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChange(copy);
  };

  const handleClearAll = () => {
    if (images.length === 0) return;
    onChange([]);
    showStatus(lang === 'km' ? 'បានសម្អាតរូបភាពទាំងអស់' : 'Cleared all images');
  };

  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
      {/* Header with counter */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-400/20">
            <Images className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {lang === 'km' ? 'ផ្ទាំងរូបភាពជាច្រើន / អាល់ប៊ុមរូបភាព (Multi-Photo Gallery)' : 'Multi-Photo Gallery & Slides'}
            </h4>
            <p className="text-[11px] text-slate-400">
              {lang === 'km'
                ? 'អាចបញ្ចូលរូបភាពជាច្រើនតាមរយៈការផ្ទុកឡើងផ្ទាល់ ឬតាមតំណភ្ជាប់'
                : 'Add multiple photos via direct upload or web links'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            {images.length} {lang === 'km' ? 'រូបភាព' : 'Photos'}
          </span>
          {images.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-slate-400 hover:text-red-300 transition-colors underline"
            >
              {lang === 'km' ? 'សម្អាតទាំងអស់' : 'Clear all'}
            </button>
          )}
        </div>
      </div>

      {/* Input Mode Navigation */}
      <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10 gap-1 text-xs">
        <button
          type="button"
          onClick={() => setInputTab('upload')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
            inputTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{lang === 'km' ? 'បញ្ចូលឯកសារផ្ទាល់' : 'Direct Upload'}</span>
        </button>

        <button
          type="button"
          onClick={() => setInputTab('url')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
            inputTab === 'url'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>{lang === 'km' ? 'តាមតំណភ្ជាប់ (Links)' : 'Via Links'}</span>
        </button>

        <button
          type="button"
          onClick={() => setInputTab('presets')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
            inputTab === 'presets'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'km' ? 'អាល់ប៊ុមគំរូ' : 'Presets'}</span>
        </button>
      </div>

      {/* Tab 1: Direct Upload */}
      {inputTab === 'upload' && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                handleFilesSelected(e.target.files);
                e.target.value = ''; // reset so same files can be re-added if desired
              }
            }}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-indigo-400 bg-indigo-500/20'
                : 'border-white/15 hover:border-indigo-400/50 bg-slate-950/50 hover:bg-slate-950/80'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30 shadow-inner">
                {isProcessingFiles ? (
                  <div className="w-4 h-4 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {lang === 'km'
                    ? 'ចុចទីនេះដើម្បីជ្រើសរើសរូបភាពជាច្រើន ឬ អូសទម្លាក់រូបភាពចូល'
                    : 'Click to select multiple images or drag and drop here'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {lang === 'km'
                    ? 'គាំទ្រ JPG, PNG, WEBP, GIF (អាចជ្រើសរើសច្រើនរូបក្នុងពេលតែមួយ)'
                    : 'Supports JPG, PNG, WEBP, GIF (Multiple files supported)'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Via Link (Single & Bulk) */}
      {inputTab === 'url' && (
        <div className="space-y-3">
          {/* Single URL Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              {lang === 'km' ? 'បញ្ចូលតំណភ្ជាប់រូបភាពមួយៗ' : 'Single Image Link:'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSingleUrl();
                  }
                }}
                placeholder="https://images.unsplash.com/... ឬ web link"
                className="flex-1 px-3 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddSingleUrl}
                disabled={!singleUrl.trim()}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shrink-0 flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'km' ? 'បន្ថែម' : 'Add'}</span>
              </button>
            </div>
          </div>

          {/* Bulk Links Textarea */}
          <div className="space-y-1 pt-1 border-t border-white/5">
            <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
              <span>{lang === 'km' ? 'ឬ បិទភ្ជាប់តំណភ្ជាប់ច្រើនក្នុងពេលតែមួយ (Bulk Links)' : 'Or paste multiple links at once:'}</span>
              <span className="text-[10px] text-slate-500">{lang === 'km' ? '១ បន្ទាត់ = ១ រូប' : '1 line per image'}</span>
            </label>
            <textarea
              rows={2}
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
              className="w-full px-3 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 font-mono"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddBulkUrls}
                disabled={!bulkUrls.trim()}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs font-semibold transition-colors border border-white/10 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'km' ? 'បន្ថែមតំណភ្ជាប់ទាំងអស់' : 'Add all links'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Preset Albums */}
      {inputTab === 'presets' && (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-400">
            {lang === 'km'
              ? 'ចុចលើអាល់ប៊ុមណាមួយខាងក្រោមដើម្បីបញ្ចូលផ្ទាំងរូបភាពគំរូល្អៗភ្លាមៗ៖'
              : 'Click any album below to instantly add curated sample photos:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_GALLERY_ALBUMS.map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => handleApplyPreset(album.images)}
                className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 hover:border-indigo-400/40 border border-white/10 text-left transition-all flex items-center gap-2.5 group"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative border border-white/10">
                  <img
                    src={album.images[0]}
                    alt={album.nameKm}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-0 right-0 bg-black/75 px-1 text-[9px] text-white font-bold rounded-tl">
                    +{album.images.length}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {lang === 'km' ? album.nameKm : album.nameEn}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {album.category} • {album.images.length} {lang === 'km' ? 'រូប' : 'photos'}
                  </p>
                </div>
                <Plus className="w-4 h-4 text-indigo-400 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Uploaded Gallery Grid */}
      {images.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {lang === 'km' ? 'រូបភាពដែលបានបញ្ចូល (ចុចលើរូបដើម្បីដាក់ជារូបតំណាងចម្បង)៖' : 'Added Photos (Click to set as main thumbnail):'}
            </span>
            <span className="font-mono text-[11px] text-indigo-300">{images.length}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {images.map((imgUrl, idx) => {
              const isCover = thumbnail === imgUrl;
              return (
                <div
                  key={`${imgUrl}-${idx}`}
                  className={`group relative rounded-xl overflow-hidden aspect-square bg-slate-900 border transition-all ${
                    isCover
                      ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Index Pill */}
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono font-bold text-white backdrop-blur-xs">
                    #{idx + 1}
                  </span>

                  {/* Cover Badge */}
                  {isCover && (
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-[9px] font-bold text-slate-950 flex items-center gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{lang === 'km' ? 'រូបតំណាង' : 'Cover'}</span>
                    </span>
                  )}

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onSetThumbnail(imgUrl)}
                        className={`p-1 rounded-lg transition-colors ${
                          isCover
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white'
                        }`}
                        title={lang === 'km' ? 'កំណត់ជារូបតំណាង (Set as Cover)' : 'Set as Cover'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isCover ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1 rounded-lg bg-red-500/30 hover:bg-red-500 text-red-200 hover:text-white transition-colors"
                        title={lang === 'km' ? 'លុបរូបភាពនេះ' : 'Remove photo'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveImage(idx, -1)}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-25 transition-colors"
                        title={lang === 'km' ? 'ផ្លាស់ទីទៅឆ្វេង' : 'Move left'}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMoveImage(idx, 1)}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-25 transition-colors"
                        title={lang === 'km' ? 'ផ្លាស់ទីទៅស្តាំ' : 'Move right'}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 px-2 rounded-xl bg-slate-950/30 border border-white/5 text-slate-400 text-xs">
          <p>{lang === 'km' ? 'មិនទាន់មានរូបភាពអមនៅឡើយទេ' : 'No gallery images attached yet'}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {lang === 'km'
              ? 'លោកអ្នកអាចផ្ទុកឡើងឯកសារ ឬដាក់តំណភ្ជាប់ដើម្បីបង្កើតអាល់ប៊ុមរូបភាព'
              : 'Upload files or paste links to create an interactive photo gallery'}
          </p>
        </div>
      )}
    </div>
  );
};
