import React, { useState } from 'react';
import { Video, PlayCircle, ExternalLink, X } from 'lucide-react';

interface VideoItem {
  id: number;
  title: string;
  duration: string;
  author: string;
  color: string;
  src: string;
}

const VideoResources: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);

  // Using a sample MP4 for demonstration as we cannot use arbitrary external sites without embedding rights.
  // In a production app, these would be specific URLs for the content.
  const sampleVideoUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

  const videos: VideoItem[] = [
    { 
        id: 1, 
        title: '初中物理：凸透镜成像规律实验', 
        duration: '08:45', 
        author: '物理张老师', 
        color: 'bg-indigo-100',
        src: sampleVideoUrl 
    },
    { 
        id: 2, 
        title: '5分钟掌握透镜作图法', 
        duration: '05:20', 
        author: '趣味科学', 
        color: 'bg-emerald-100',
        src: sampleVideoUrl
    },
    { 
        id: 3, 
        title: '生活中的透镜：照相机与眼睛', 
        duration: '12:10', 
        author: '初中物理微课', 
        color: 'bg-amber-100',
        src: sampleVideoUrl
    },
  ];

  const handleOpenVideo = (video: VideoItem) => {
      setCurrentVideo(video);
      setIsOpen(true);
  };

  return (
    <>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Video className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">名师微课</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
            {videos.map((video) => (
            <div 
                key={video.id} 
                onClick={() => handleOpenVideo(video)}
                className="group flex gap-4 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer"
            >
                <div className={`w-32 h-20 rounded-lg flex-shrink-0 flex items-center justify-center ${video.color} relative overflow-hidden`}>
                    <PlayCircle className="w-8 h-8 text-black/20 group-hover:text-black/40 transition-colors" />
                    {/* Mock thumbnail effect */}
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                        {video.duration}
                    </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-slate-800 text-sm mb-1 truncate group-hover:text-indigo-600 transition-colors">
                        {video.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">{video.author}</p>
                    <div className="flex items-center text-[10px] text-indigo-500 font-medium">
                        <PlayCircle className="w-3 h-3 mr-1" />
                        点击播放视频
                    </div>
                </div>
            </div>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button className="text-xs text-indigo-600 font-medium hover:underline">
                查看更多视频教程 &rarr;
            </button>
        </div>
        </div>

        {/* Video Modal */}
        {isOpen && currentVideo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden relative flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                         <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <Video className="w-5 h-5 text-indigo-600" />
                            {currentVideo.title}
                        </h3>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                    <div className="aspect-video bg-black flex items-center justify-center">
                         <video 
                            src={currentVideo.src} 
                            controls 
                            autoPlay 
                            className="w-full h-full"
                         >
                            您的浏览器不支持视频标签。
                         </video>
                    </div>
                    <div className="p-4 bg-slate-50 text-sm text-slate-500 flex justify-between">
                         <span>讲师：{currentVideo.author}</span>
                         <span>时长：{currentVideo.duration}</span>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default VideoResources;