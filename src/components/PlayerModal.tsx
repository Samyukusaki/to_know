import React, { useState } from 'react';
import { X, ExternalLink, Star, ThumbsUp, Eye, Share2, Copy, Check, Edit3, Calendar, Clock, AlertCircle } from 'lucide-react';
import { VideoItem } from '../types/video';
import { formatCompactNumber, toKhmerNumerals } from '../utils/videoHelper';
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

  if (!video) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(video.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const num = (n: number | string) => (lang === 'km' ? toKhmerNumerals(n) : String(n));

  const isYouTube = video.platform === 'youtube' || video.url.includes('youtu');
  const isFacebook = video.platform === 'facebook' || video.url.includes('facebook');
  const isDirect = video.platform === 'direct' || video.url.endsWith('.mp4') || video.url.endsWith('.webm');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-white/15 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Header bar */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 min-w-0 pr-4">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-600 text-white uppercase tracking-wider shadow-sm border border-indigo-400/30">
              {video.platform}
            </span>
            <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-400/20 px-2.5 py-0.5 rounded-lg">
              {video.category}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline truncate">
              {video.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
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
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {/* Direct MP4/WebM video */}
          {isDirect && (
            <video
              src={video.url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          )}

          {/* YouTube iframe */}
          {isYouTube && video.embedUrl && !iframeError && (
            <iframe
              src={`${video.embedUrl}?autoplay=1&rel=0`}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={() => setIframeError(true)}
            />
          )}

          {/* Facebook or Fallback display */}
          {(isFacebook || iframeError || (!isDirect && !isYouTube)) && (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-radial from-slate-900 via-slate-950 to-black">
              {/* Blurred background image */}
              <img
                src={video.thumbnail}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
              />
              <div className="relative z-10 max-w-lg space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/90 flex items-center justify-center shadow-xl ring-4 ring-indigo-400/30">
                  <ExternalLink className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    {lang === 'km' ? 'ទស្សនាវីដេអូលើ Facebook ផ្លូវការ' : 'Watch on Official Facebook'}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {video.title}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <a
                    id="watch-facebook-source-btn"
                    href={video.url || OFFICIAL_PAGE_INFO.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-sm shadow-xl transition-all hover:scale-105"
                  >
                    <span>{lang === 'km' ? 'បើកមើលលើ Facebook ឥឡូវនេះ' : 'Open in Facebook'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'km'
                    ? 'ចុចដើម្បីទស្សនាវីដេអូកម្រិតច្បាស់ HD និងចែករំលែកលើទំព័រ នាំដឹង - To Know'
                    : 'Click to watch high-definition video directly on Facebook'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Video Information & Actions */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
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
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
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
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-colors"
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
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{lang === 'km' ? 'កែសម្រួល' : 'Edit'}</span>
              </button>

              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-colors border border-indigo-400/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{lang === 'km' ? 'Facebook ដើម' : 'Original FB'}</span>
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
