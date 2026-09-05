import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  X,
  ExternalLink,
  Star,
  ThumbsUp,
  Eye,
  Share2,
  Copy,
  Check,
  Edit3,
  Calendar,
  Images,
  Maximize2,
  Minimize2,
  FileText,
  Mic,
  Image as ImageIcon,
  Subtitles,
  CheckCircle2,
  Circle,
  TrendingUp,
  Bookmark,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { VideoItem } from '../types/video';
import {
  formatCompactNumber,
  toKhmerNumerals,
  cleanFacebookUrl,
} from '../utils/videoHelper';
import { OFFICIAL_PAGE_INFO } from '../data/initialVideos';
import { PhotoGalleryPlayer } from './PhotoGalleryPlayer';

interface PlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onEdit: (video: VideoItem) => void;
  onToggleFavorite: (id: string) => void;
  lang: 'km' | 'en';
}

interface PlayerModalContentProps {
  video: VideoItem;
  onClose: () => void;
  onEdit: (video: VideoItem) => void;
  onToggleFavorite: (id: string) => void;
  lang: 'km' | 'en';
}

const PlayerModalContent: React.FC<PlayerModalContentProps> = ({
  video,
  onClose,
  onEdit,
  onToggleFavorite,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [activeMediaView, setActiveMediaView] = useState<'thumbnail' | 'gallery'>('thumbnail');
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const num = (n: number | string) => (lang === 'km' ? toKhmerNumerals(n) : String(n));

  const thumbnailSrc =
    video.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000';

  // Compute all slide thumbnails: starts with video.thumbnail, plus video.images without duplicates
  const allSlideImages = useMemo(() => {
    const list: string[] = [];
    if (video.thumbnail) {
      list.push(video.thumbnail);
    }
    if (video.images && video.images.length > 0) {
      video.images.forEach((img) => {
        if (img && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    return list.length > 0 ? list : [thumbnailSrc];
  }, [video.thumbnail, video.images, thumbnailSrc]);

  const hasImages = allSlideImages.length > 1;

  // Reset slide index when video ID changes
  useEffect(() => {
    setSlideIndex(0);
  }, [video.id]);

  const goToNextSlide = useCallback(() => {
    if (allSlideImages.length <= 1) return;
    setSlideIndex((prev) => (prev + 1) % allSlideImages.length);
  }, [allSlideImages.length]);

  const goToPrevSlide = useCallback(() => {
    if (allSlideImages.length <= 1) return;
    setSlideIndex((prev) => (prev === 0 ? allSlideImages.length - 1 : prev - 1));
  }, [allSlideImages.length]);

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeMediaView !== 'thumbnail') return;
      if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMediaView, goToNextSlide, goToPrevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      goToNextSlide();
    } else if (diff < -45) {
      goToPrevSlide();
    }
    touchStartX.current = null;
  };

  const currentSlideImage = allSlideImages[slideIndex] || allSlideImages[0] || thumbnailSrc;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(video.url || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyImageLink = () => {
    navigator.clipboard.writeText(currentSlideImage);
    setCopiedImage(true);
    setTimeout(() => setCopiedImage(false), 2000);
  };

  // Engagement calculation
  const totalInteractions = (video.likes || 0) + (video.shares || 0);
  const engagementRate =
    video.views && video.views > 0
      ? ((totalInteractions / video.views) * 100).toFixed(1)
      : '0.0';

  const statusConfig = {
    published: {
      km: 'បានបង្ហោះផ្លូវការ',
      en: 'Published',
      color: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
      dot: 'bg-emerald-400',
    },
    scheduled: {
      km: 'គ្រោងបង្ហោះ',
      en: 'Scheduled',
      color: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
      dot: 'bg-amber-400',
    },
    draft: {
      km: 'ព្រាងទុក',
      en: 'Draft',
      color: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
      dot: 'bg-slate-400',
    },
  }[video.status || 'published'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-white/15 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-white">
        
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white uppercase tracking-wider shadow-sm border border-indigo-400/30 shrink-0">
              {video.platform}
            </span>
            <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-400/20 px-2.5 py-1 rounded-lg shrink-0">
              {video.category}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5 ${statusConfig.color} shrink-0`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              <span>{lang === 'km' ? statusConfig.km : statusConfig.en}</span>
            </span>
            {hasImages && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2.5 py-1 rounded-lg shrink-0">
                <Images className="w-3 h-3 text-amber-400" />
                <span>{num(allSlideImages.length)} {lang === 'km' ? 'ស្លាយរូប' : 'slides'}</span>
              </span>
            )}
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Media Toggle tabs if images exist */}
            {hasImages && (
              <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveMediaView('thumbnail')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeMediaView === 'thumbnail'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'ស្លាយ Thumbnail' : 'Slides'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGalleryIndex(slideIndex);
                    setActiveMediaView('gallery');
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeMediaView === 'gallery'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Images className="w-3.5 h-3.5 text-amber-300" />
                  <span>{lang === 'km' ? 'Slideshow' : 'Player'}</span>
                </button>
              </div>
            )}

            {/* Edit button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(video);
              }}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title={lang === 'km' ? 'កែសម្រួលមាតិកា (Edit)' : 'Edit content'}
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Favorite button */}
            <button
              type="button"
              onClick={() => onToggleFavorite(video.id)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                video.isFavorite
                  ? 'text-amber-400 bg-amber-500/20 border border-amber-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={video.isFavorite ? 'ដកចេញពីចូលចិត្ត' : 'ដាក់ជាចូលចិត្ត'}
            >
              <Star className={`w-4 h-4 ${video.isFavorite ? 'fill-current' : ''}`} />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="បិទ (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Unified Scrollable Container: Thumbnail & Content Details scroll together smoothly */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Media Showcase: High-Definition Thumbnail or Photo Gallery */}
          <div className="relative aspect-video max-h-[380px] sm:max-h-[440px] w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-white/10 select-none">
            {activeMediaView === 'thumbnail' ? (
              <div
                className="relative w-full h-full flex items-center justify-center bg-slate-950 group"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  key={currentSlideImage}
                  src={currentSlideImage}
                  alt={`${video.title} - Slide ${slideIndex + 1}`}
                  className="w-full h-full object-contain animate-in fade-in duration-200"
                />

                {/* Left Slide Arrow */}
                {hasImages && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevSlide();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/80 hover:bg-indigo-600 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all shadow-xl active:scale-95 cursor-pointer z-20 opacity-80 hover:opacity-100 hover:scale-105"
                    title={lang === 'km' ? 'ស្លាយមុន (Previous Slide)' : 'Previous Slide'}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Right Slide Arrow */}
                {hasImages && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNextSlide();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/80 hover:bg-indigo-600 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all shadow-xl active:scale-95 cursor-pointer z-20 opacity-80 hover:opacity-100 hover:scale-105"
                    title={lang === 'km' ? 'ស្លាយបន្ទាប់ (Next Slide)' : 'Next Slide'}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none z-20">
                  {hasImages ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-950/90 text-indigo-300 border border-indigo-400/30 backdrop-blur-md shadow-md">
                      <Images className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        {lang === 'km'
                          ? `រូបភាពតំណាង Slide (${num(slideIndex + 1)} / ${num(allSlideImages.length)})`
                          : `Thumbnail Slide (${slideIndex + 1} of ${allSlideImages.length})`}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-950/85 text-indigo-300 border border-indigo-400/30 backdrop-blur-md shadow-md">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{lang === 'km' ? 'រូបភាពតំណាងមាតិកា (Thumbnail HD)' : 'Content Thumbnail HD'}</span>
                    </span>
                  )}
                </div>

                {/* Top-Right Image Controls */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                  <button
                    type="button"
                    onClick={handleCopyImageLink}
                    className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition-all shadow-md cursor-pointer"
                    title={lang === 'km' ? 'ចម្លង Link រូបភាពស្លាយនេះ' : 'Copy current slide image link'}
                  >
                    {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <a
                    href={currentSlideImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition-all shadow-md"
                    title={lang === 'km' ? 'បើករូបភាពទំហំធំពេញលេញ' : 'Open original image in new tab'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Pagination Dots at Bottom Center when multiple slides */}
                {hasImages && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-lg z-20">
                    {allSlideImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlideIndex(idx);
                        }}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          idx === slideIndex
                            ? 'w-5 bg-indigo-400 shadow-xs'
                            : 'w-2 bg-white/40 hover:bg-white/80'
                        }`}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Bottom Quick Bar with Direct Platform Link */}
                <div className="absolute bottom-3 right-3 flex items-center justify-between pointer-events-auto z-20">
                  <a
                    href={cleanFacebookUrl(video.url || OFFICIAL_PAGE_INFO.officialUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30 hover:scale-105"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>
                      {video.platform === 'facebook'
                        ? (lang === 'km' ? 'បើកមើលលើ Facebook' : 'Open on Facebook')
                        : (lang === 'km' ? 'បើកមើលលើ YouTube' : 'Open on YouTube')}
                    </span>
                  </a>
                </div>
              </div>
            ) : (
              /* Photo Gallery Slideshow */
              <PhotoGalleryPlayer
                images={allSlideImages}
                title={video.title}
                initialIndex={selectedGalleryIndex}
                lang={lang}
                onImageChange={setSelectedGalleryIndex}
              />
            )}
          </div>

          {/* Content Details Body (ព័ត៌មានលម្អិតបន្ថែមអំពីមាតិកា) */}
          <div className="p-4 sm:p-6 space-y-5">
          
          {/* Main Title & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-white leading-snug tracking-tight">
                {video.title}
              </h2>
              {video.titleEn && (
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                  {video.titleEn}
                </p>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-colors cursor-pointer"
                title="ចម្លងតំណភ្ជាប់ (Copy link)"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === 'km' ? 'បានចម្លង!' : 'Copied!') : (lang === 'km' ? 'ចម្លង Link' : 'Copy Link')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(video);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-colors cursor-pointer"
                title="កែសម្រួលព័ត៌មានមាតិកា"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'km' ? 'កែសម្រួល' : 'Edit Details'}</span>
              </button>

              <a
                href={cleanFacebookUrl(video.url || OFFICIAL_PAGE_INFO.officialUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all border border-indigo-400/25 hover:scale-105"
                title="បើកមើលលើប្រភពដើម"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>
                  {video.platform === 'facebook'
                    ? (lang === 'km' ? 'បើកលើ Facebook' : 'Open on Facebook')
                    : (lang === 'km' ? 'បើកលើ YouTube' : 'Open on YouTube')}
                </span>
              </a>
            </div>
          </div>

          {/* Key Metrics & Performance Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {lang === 'km' ? 'ចំនួនទស្សនា' : 'Total Views'}
                </p>
                <p className="text-base font-bold text-white font-mono">
                  {num(formatCompactNumber(video.views))}
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 shrink-0">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {lang === 'km' ? 'ការចូលចិត្ត (Likes)' : 'Likes'}
                </p>
                <p className="text-base font-bold text-white font-mono">
                  {num(formatCompactNumber(video.likes))}
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {lang === 'km' ? 'ចែករំលែក (Shares)' : 'Shares'}
                </p>
                <p className="text-base font-bold text-white font-mono">
                  {num(formatCompactNumber(video.shares))}
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {lang === 'km' ? 'អត្រាអន្តរកម្ម' : 'Engagement'}
                </p>
                <p className="text-base font-bold text-white font-mono">
                  {num(engagementRate)}%
                </p>
              </div>
            </div>
          </div>

          {/* Overview / Description Section */}
          <div className="bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Info className="w-4 h-4" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {lang === 'km' ? 'ខ្លឹមសារសង្ខេប និងការពិពណ៌នាមាតិកា' : 'Overview & Description'}
              </h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line pt-1">
              {video.description || (lang === 'km' ? 'មិនមានការពិពណ៌នាបន្ថែមសម្រាប់មាតិកានេះទេ។' : 'No description provided.')}
            </p>
          </div>

          {/* Creator Notes & Production Insights */}
          {video.notes && (
            <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'km' ? 'កំណត់ចំណាំអ្នកផលិត (Creator Notes)' : 'Creator Notes & Insights'}</span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                {video.notes}
              </p>
            </div>
          )}

          {/* Technical Details & Production Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* Metadata info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'km' ? 'ព័ត៌មានបច្ចេកទេស និងកាលបរិច្ឆេទ' : 'Technical & Publishing Info'}</span>
              </h4>
              <div className="space-y-2 text-xs divide-y divide-white/5 pt-1">
                <div className="flex items-center justify-between text-slate-300 pt-1.5">
                  <span className="text-slate-400">{lang === 'km' ? 'កាលបរិច្ឆេទបង្ហោះ' : 'Publish Date'}:</span>
                  <span className="font-semibold font-mono text-white">{num(video.publishDate)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 pt-1.5">
                  <span className="text-slate-400">{lang === 'km' ? 'ប្រភពផ្សាយ' : 'Platform'}:</span>
                  <span className="font-semibold capitalize text-indigo-300">{video.platform}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 pt-1.5">
                  <span className="text-slate-400">{lang === 'km' ? 'ប្រភេទមាតិកា' : 'Category'}:</span>
                  <span className="font-semibold text-white">{video.category}</span>
                </div>
              </div>
            </div>

            {/* Production Checklist */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'km' ? 'បញ្ជីត្រួតពិនិត្យការផលិត (Production Checklist)' : 'Production Checklist'}</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                  video.creatorChecklist?.script
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}>
                  {video.creatorChecklist?.script ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div className="min-w-0 truncate font-medium">
                    {lang === 'km' ? 'ស្គ្រីបអត្ថបទ' : 'Script'}
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                  video.creatorChecklist?.voiceover
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}>
                  {video.creatorChecklist?.voiceover ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div className="min-w-0 truncate font-medium">
                    {lang === 'km' ? 'សំឡេងអធិប្បាយ' : 'Voiceover'}
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                  video.creatorChecklist?.thumbnailDone
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}>
                  {video.creatorChecklist?.thumbnailDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div className="min-w-0 truncate font-medium">
                    {lang === 'km' ? 'រូបភាពគម្រប (Thumbnail)' : 'Thumbnail'}
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                  video.creatorChecklist?.subtitles
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}>
                  {video.creatorChecklist?.subtitles ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div className="min-w-0 truncate font-medium">
                    {lang === 'km' ? 'ចំណងជើងរត់' : 'Subtitles'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attached Photo Album / Slides Strip */}
          {hasImages && (
            <div className="bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-400/20">
                    <Images className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {lang === 'km'
                        ? `ផ្ទាំងរូបភាពស្លាយទាំងអស់ (${num(allSlideImages.length)} រូប)`
                        : `All Thumbnail Slides (${allSlideImages.length})`}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {lang === 'km'
                        ? 'ចុចលើរូបភាពណាមួយដើម្បីប្តូរស្លាយ ឬបើកមើលទំហំធំពេញលេញ'
                        : 'Click any photo to jump to slide or open full viewer'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedGalleryIndex(slideIndex);
                    setActiveMediaView('gallery');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Images className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'បើកផ្ទាំងរូបភាព Slideshow' : 'Open Slideshow'}</span>
                </button>
              </div>

              {/* Photo Strip Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                {allSlideImages.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSlideIndex(idx);
                      if (activeMediaView === 'gallery') {
                        setSelectedGalleryIndex(idx);
                      }
                    }}
                    className={`group relative aspect-video rounded-xl overflow-hidden border transition-all bg-slate-950 focus:outline-hidden cursor-pointer ${
                      idx === slideIndex && activeMediaView === 'thumbnail'
                        ? 'border-indigo-400 ring-2 ring-indigo-400/50 scale-102 shadow-lg'
                        : 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Slide ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-transparent transition-colors flex items-end justify-between p-1.5">
                      <span className="bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-xs">
                        #{idx + 1}
                      </span>
                      {idx === 0 && (
                        <span className="bg-indigo-600/90 text-white px-1 py-0.2 rounded text-[9px] font-bold">
                          Cover
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs text-slate-400 font-medium">{lang === 'km' ? 'ស្លាកសម្គាល់៖' : 'Tags:'}</span>
              {video.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-white/5 text-slate-300 px-2.5 py-1 rounded-full border border-white/10"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* End Unified Scrollable Container */}
        </div>
      </div>
    </div>
  );
};

export const PlayerModal: React.FC<PlayerModalProps> = ({
  video,
  onClose,
  onEdit,
  onToggleFavorite,
  lang,
}) => {
  if (!video) return null;

  return (
    <PlayerModalContent
      video={video}
      onClose={onClose}
      onEdit={onEdit}
      onToggleFavorite={onToggleFavorite}
      lang={lang}
    />
  );
};
