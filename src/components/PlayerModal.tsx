import React, { useState, useEffect } from 'react';
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
  Clock,
  Play,
  Tv,
  Globe,
  Film,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { VideoItem } from '../types/video';
import {
  formatCompactNumber,
  toKhmerNumerals,
  getFallbackVideoForCategory,
  getYouTubeId,
  getFacebookEmbedUrl,
  cleanFacebookUrl,
} from '../utils/videoHelper';
import { OFFICIAL_PAGE_INFO } from '../data/initialVideos';

interface PlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onEdit: (video: VideoItem) => void;
  onToggleFavorite: (id: string) => void;
  lang: 'km' | 'en';
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  video,
  onClose,
  onEdit,
  onToggleFavorite,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // Video type detection
  const isYouTube = Boolean(video && (video.platform === 'youtube' || video.url.includes('youtu')));
  const isDirect = Boolean(video && (video.platform === 'direct' || video.url.endsWith('.mp4') || video.url.endsWith('.webm')));
  const isFacebook = Boolean(video && (video.platform === 'facebook' || video.url.includes('facebook.com') || video.url.includes('fb.watch')));

  // For Facebook and YouTube, default to the official platform player so the actual user video plays
  const [playerMode, setPlayerMode] = useState<'in-app' | 'embed'>(() => {
    return isDirect ? 'in-app' : 'embed';
  });

  useEffect(() => {
    setPlayerMode(isDirect ? 'in-app' : 'embed');
    setIframeError(false);
  }, [video?.id, isDirect]);

  if (!video) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(video.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const num = (n: number | string) => (lang === 'km' ? toKhmerNumerals(n) : String(n));

  // Determine playable direct video source
  const directVideoSource =
    video.previewVideoUrl ||
    (isDirect ? video.url : getFallbackVideoForCategory(video.category));

  // Determine embed URL
  const ytId = getYouTubeId(video.url);
  const effectiveEmbedUrl = isYouTube
    ? (video.embedUrl || (ytId ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0` : ''))
    : getFacebookEmbedUrl(video.url, true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-white/15 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Header bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-600 text-white uppercase tracking-wider shadow-sm border border-indigo-400/30 shrink-0">
              {video.platform}
            </span>
            <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-400/20 px-2.5 py-0.5 rounded-lg shrink-0">
              {video.category}
            </span>
            <span className="text-xs text-slate-300 hidden md:inline truncate max-w-xs font-medium">
              {video.title}
            </span>
          </div>

          {/* Mode Switcher & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Player Mode Switch Tabs */}
            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-white/10 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setPlayerMode('embed');
                  setIframeError(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  playerMode === 'embed'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={lang === 'km' ? 'ចាក់វីដេអូពីប្រភពដើម (Facebook / YouTube)' : 'Play original video (Facebook / YouTube)'}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isYouTube ? 'YouTube' : 'Facebook Video'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPlayerMode('in-app')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  playerMode === 'in-app'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={lang === 'km' ? 'ចាក់វីដេអូទម្រង់ In-App Player (HD Stream)' : 'Play in In-App Player'}
              >
                <Film className="w-3.5 h-3.5" />
                <span>{lang === 'km' ? 'ចាក់ក្នុង App' : 'In-App'}</span>
              </button>
            </div>

            {/* Favorite button */}
            <button
              type="button"
              onClick={() => onToggleFavorite(video.id)}
              className={`p-2 rounded-xl transition-colors ${
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
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="បិទ (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden shrink-0">
          {/* 1. Official Embed Player (Facebook Video or YouTube) */}
          {playerMode === 'embed' && (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              {!iframeError ? (
                <>
                  <iframe
                    key={`embed-${video.id}`}
                    src={effectiveEmbedUrl}
                    title={video.title}
                    className="w-full h-full border-0"
                    scrolling="no"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onError={() => setIframeError(true)}
                  />
                  {isFacebook && (
                    <div className="absolute top-3 left-3 pointer-events-none opacity-75 hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-950/85 text-blue-200 border border-blue-400/30 backdrop-blur-md shadow-md">
                        <Globe className="w-3 h-3 text-blue-400" />
                        <span>Facebook Video Player</span>
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 text-center text-white space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-400/30">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-300 max-w-md mx-auto">
                    {lang === 'km'
                      ? 'ផ្ទាំងចាក់ Facebook អាចត្រូវបានរារាំងដោយសារភាពឯកជន ឬ Cookie។ អ្នកអាចប្តូរទៅចាក់តាម In-App Player ឬបើកមើលលើ Facebook ដោយផ្ទាល់។'
                      : 'Facebook video player could not be embedded directly due to privacy settings.'}
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPlayerMode('in-app')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
                    >
                      <Film className="w-4 h-4" />
                      <span>{lang === 'km' ? 'ចាក់តាម In-App Player' : 'Play In-App HD'}</span>
                    </button>
                    <a
                      href={cleanFacebookUrl(video.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{lang === 'km' ? 'បើកលើ Facebook ផ្ទាល់' : 'Open on Facebook'}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. In-App Video Player (Plays directly with native controls) */}
          {playerMode === 'in-app' && (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                key={`in-app-${video.id}`}
                src={directVideoSource}
                poster={video.thumbnail}
                controls
                autoPlay
                playsInline
                loop
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
              <div className="absolute top-3 left-3 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-950/85 text-indigo-200 border border-indigo-400/30 backdrop-blur-md shadow-md">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>HD 1080p • In-App Player</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Video Information & Actions */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {video.title}
              </h2>
              {video.titleEn && (
                <p className="text-xs text-slate-400 mt-0.5 italic">
                  {video.titleEn}
                </p>
              )}

              {/* Meta tags & date */}
              <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-slate-200">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  {num(formatCompactNumber(video.views))} {lang === 'km' ? 'ទស្សនា' : 'views'}
                </span>
                <span className="flex items-center gap-1 font-medium text-slate-200">
                  <ThumbsUp className="w-4 h-4 text-indigo-400" />
                  {num(formatCompactNumber(video.likes))} {lang === 'km' ? 'Likes' : 'likes'}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {num(video.publishDate)}
                </span>
                {video.duration && (
                  <span className="flex items-center gap-1 text-slate-400 font-mono">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {video.duration}
                  </span>
                )}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-colors"
                title="ចម្លងតំណភ្ជាប់ (Copy link)"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === 'km' ? 'បានចម្លង' : 'Copied') : (lang === 'km' ? 'ចម្លង Link' : 'Copy Link')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(video);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-colors"
                title="កែសម្រួលព័ត៌មានវីដេអូ"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{lang === 'km' ? 'កែសម្រួល' : 'Edit'}</span>
              </button>

              <a
                href={video.url || OFFICIAL_PAGE_INFO.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all border border-indigo-400/20 hover:scale-105"
                title="បើកមើលលើ Facebook / YouTube ផ្លូវការ"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{lang === 'km' ? 'បើកលើ Facebook' : 'Open Source'}</span>
              </a>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              {lang === 'km' ? 'ខ្លឹមសារសង្ខេប / ការពិពណ៌នា' : 'Overview & Description'}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {video.description || (lang === 'km' ? 'មិនមានការពិពណ៌នាបន្ថែម។' : 'No description provided.')}
            </p>
            {video.notes && (
              <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">{lang === 'km' ? 'កំណត់ចំណាំអ្នកផលិត៖ ' : 'Creator Notes: '}</span>
                {video.notes}
              </div>
            )}
          </div>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">{lang === 'km' ? 'ស្លាក៖' : 'Tags:'}</span>
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
      </div>
    </div>
  );
};
