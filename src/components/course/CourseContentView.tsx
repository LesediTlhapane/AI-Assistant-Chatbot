// React typings are not available in the current project configuration.
// @ts-expect-error TS7016: use the runtime module until @types/react is installed.
import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize2, 
  Sparkles, 
  Star,
  Globe,
  Subtitles,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Course, Module, Lesson } from '../../types';

interface CourseContentViewProps {
  course: Course;
  activeModule: Module;
  activeLesson: Lesson;
  onAskAiAboutTopic: (topicText: string, actionType?: 'explain' | 'simplify' | 'example') => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
}

export const CourseContentView: React.FC<CourseContentViewProps> = ({
  course,
  activeModule,
  activeLesson,
  onAskAiAboutTopic,
  onNextLesson,
  onPrevLesson
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTextSnippet, setSelectedTextSnippet] = useState<string | null>(null);

  const introQuote = activeLesson.description || activeLesson.contentSections?.[0]?.body?.[0] || 'Explore this lesson to deepen your understanding.';

  const getVisualPromptLines = (lesson: Lesson) => {
    const title = lesson.title.toLowerCase();

    if (title.includes('decision-making') || title.includes('analytics')) {
      return [
        'How can your team use data to make smarter decisions?',
        'Which business signal is most valuable in this lesson?',
        'How would you apply this insight to a real workflow?'
      ];
    }

    if (title.includes('opportunity') || title.includes('high-impact') || title.includes('spot and assess')) {
      return [
        'Which problem in your work feels most AI-ready?',
        'How would you assess this opportunity before investing?',
        'What would make this initiative worth pursuing?' 
      ];
    }

    if (title.includes('creative') || title.includes('question') || title.includes('emerge') || title.includes('approach')) {
      return [
        'What question would unlock a more creative solution?',
        'How can you reframe this challenge for better ideas?',
        'Which new angle could lead to a breakthrough?' 
      ];
    }

    if (title.includes('ready') || title.includes('strategy') || title.includes('jump-start')) {
      return [
        'What readiness gap is slowing your AI progress?',
        'Which short-term move would create momentum?',
        'How would you turn this strategy into action?' 
      ];
    }

    return [
      `What is the key idea behind ${lesson.title}?`,
      `How does this lesson connect to real work?`,
      `Which part of this topic would you test first?`
    ];
  };

  const visualPromptLines = getVisualPromptLines(activeLesson);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 5) {
      setSelectedTextSnippet(selection.toString().trim());
    } else {
      setSelectedTextSnippet(null);
    }
  };

  return (
    <div className="w-full h-full bg-white overflow-y-auto">
      <main
        id="main-course-content"
        onMouseUp={handleTextSelection}
        className="w-full max-w-5xl mx-auto px-6 sm:px-8 py-6 space-y-6"
        tabIndex={0}
        aria-label="CrossKnowledge Course Content"
      >
        {/* Floating Quick AI Explanation Tooltip */}
        {selectedTextSnippet && (
          <div className="sticky top-4 z-20 bg-[#002B66] text-white p-3 rounded-xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in duration-200 border border-blue-700">
            <div className="flex items-center gap-2 text-xs truncate max-w-md">
              <Sparkles className="w-4 h-4 text-[#45CC42] shrink-0" />
              <span className="truncate">"{selectedTextSnippet}"</span>
            </div>
            <button
              onClick={() => {
                onAskAiAboutTopic(`Explain this concept from the lesson: "${selectedTextSnippet}"`, 'explain');
                setSelectedTextSnippet(null);
              }}
              className="px-3 py-1 bg-[#45CC42] hover:bg-[#3db83a] text-[#002B66] font-bold text-xs rounded-lg transition-colors shrink-0 shadow-xs"
            >
              Ask AI Assistant
            </button>
          </div>
        )}

        {/* 1. Lesson Header Title */}
        <div className="space-y-3 border-b border-gray-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
            {activeLesson.title || 'Find high-impact AI opportunities'}
          </h1>

          {/* Introductory Quote Text matching Kavita Ganesan CrossKnowledge Screenshot */}
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal italic bg-gray-50 p-4 rounded-xl border-l-4 border-[#002B66]">
            "{introQuote}"
          </p>
        </div>

        {/* 2. Video Player Frame (Matching CrossKnowledge Video & Overlay Badge) */}
        <div className="relative rounded-xl overflow-hidden bg-black shadow-md border border-gray-800">
          
          {/* Top-Right lesson points badge */}
          <div className="absolute top-3 right-3 z-10 bg-[#002B66] text-white px-3 py-1 rounded-md shadow-md text-xs font-extrabold tracking-wider border border-white/20">
            {activeLesson.points || 5} PTS EARNED
          </div>

          {/* Video Container Screen */}
          <div className="relative aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center text-white p-6 text-center select-none group">
            
            {/* Background Graphic Effect */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#45CC42_1px,transparent_1px)] [background-size:20px_20px]" />

            {/* Embedded Text Questions on Video Frame matching Screenshot */}
            <div className="relative z-10 space-y-3.5 max-w-4xl text-center leading-snug px-4">
              {visualPromptLines.map((line, index) => (
                <p key={`${activeLesson.id}-${index}`} className="text-sm sm:text-xl font-bold text-white tracking-wide">
                  {line}
                </p>
              ))}
            </div>

            {/* Play Button Overlay */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/90 hover:bg-white text-[#002B66] flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 group-hover:ring-4 group-hover:ring-[#45CC42]/50 z-10"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-[#002B66]" /> : <Play className="w-8 h-8 fill-[#002B66] ml-1" />}
            </button>
          </div>

          {/* Video Control Bar Simulation */}
          <div className="bg-[#1A1A1A] px-4 py-2.5 flex items-center justify-between text-xs text-gray-300 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-[#45CC42] transition-colors">
                {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white fill-white" />}
              </button>
              <Volume2 className="w-4 h-4 hover:text-white cursor-pointer" />
              <span className="text-xs font-mono text-gray-300">-0.06</span>
            </div>

            {/* Timeline Progress Bar */}
            <div className="flex-1 mx-4 bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#45CC42] h-full rounded-full w-[95%]" />
            </div>

            <div className="flex items-center gap-3">
              <Subtitles className="w-4 h-4 hover:text-white cursor-pointer" />
              <Maximize2 className="w-4 h-4 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>

        {/* 3. Star Ratings & Language Selector Bar matching Screenshot */}
        <div className="flex items-center justify-between pt-2 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-[#45CC42]">
              <Star className="w-4 h-4 fill-[#45CC42]" />
              <Star className="w-4 h-4 fill-[#45CC42]" />
              <Star className="w-4 h-4 fill-[#45CC42]" />
              <Star className="w-4 h-4 fill-[#45CC42]" />
              <Star className="w-4 h-4 text-gray-300 fill-gray-200" />
            </div>
            <span className="text-xs font-bold text-gray-700">| 4.7/5</span>
            <span className="text-xs text-gray-500 font-medium">(15 votes)</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector Button */}
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#45CC42] bg-emerald-50/50 text-[#002B66] text-xs font-bold hover:bg-emerald-100/50 transition-colors">
              <Globe className="w-3.5 h-3.5 text-[#45CC42]" />
              <span>EN</span>
            </button>
          </div>
        </div>

        {/* 4. Lesson Content & AI Prompt Trigger Cards */}
        <article className="space-y-6 pt-2">
          {activeLesson.contentSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#101828]">
                  {section.title}
                </h2>
                <button
                  onClick={() => onAskAiAboutTopic(`Explain the concept of: ${section.title}`, 'explain')}
                  className="text-xs font-bold text-[#002B66] hover:text-blue-900 flex items-center gap-1.5 bg-[#002B66]/5 px-3 py-1 rounded-full border border-[#002B66]/20 hover:bg-[#002B66]/10 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#45CC42]" />
                  <span>Explain with AI</span>
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-700 leading-relaxed font-normal">
                {section.body.map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>

              {section.keyConcept && (
                <div className="bg-white rounded-xl border-2 border-[#002B66]/15 p-4 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#002B66] uppercase tracking-wide">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Core Concept: {section.keyConcept.term}
                    </div>
                    <button
                      onClick={() => onAskAiAboutTopic(`Give me a workplace example of ${section.keyConcept?.term}`, 'example')}
                      className="text-[11px] font-bold text-[#002B66] hover:underline flex items-center gap-1"
                    >
                      <span>Give me an example</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-700">
                    <strong>Definition:</strong> {section.keyConcept.definition}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Practical Takeaway */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase">
              <CheckCircle2 className="w-4 h-4 text-[#45CC42]" />
              Key Takeaway
            </div>
            <p className="text-xs font-semibold text-emerald-900 leading-relaxed">
              {activeLesson.practicalTakeaway}
            </p>
          </div>
        </article>

        {/* 5. Navigation Bar */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between gap-4 pb-8">
          <button
            onClick={onPrevLesson}
            className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => onAskAiAboutTopic('Summarise this lesson in 3 key takeaways', 'summarise')}
            className="px-4 py-2 rounded-xl bg-[#002B66]/5 border border-[#002B66]/20 text-[#002B66] text-xs font-bold hover:bg-[#002B66]/10 flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#45CC42]" />
            <span>Summarise Lesson</span>
          </button>

          <button
            onClick={onNextLesson}
            className="px-5 py-2 rounded-xl bg-[#002B66] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};
