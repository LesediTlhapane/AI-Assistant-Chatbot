import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Maximize2, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  FileText, 
  Download, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight,
  Info,
  Lightbulb,
  HelpCircle,
  Clock,
  BookOpen
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
  const [activeTab, setActiveTab] = useState<'content' | 'transcript' | 'resources' | 'notes'>('content');
  const [completedObjectives, setCompletedObjectives] = useState<Record<number, boolean>>({
    0: true,
    1: true
  });
  const [selectedTextSnippet, setSelectedTextSnippet] = useState<string | null>(null);

  const toggleObjective = (index: number) => {
    setCompletedObjectives((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 5) {
      setSelectedTextSnippet(selection.toString().trim());
    } else {
      setSelectedTextSnippet(null);
    }
  };

  return (
    <main
      id="main-course-content"
      onMouseUp={handleTextSelection}
      className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 overflow-y-auto space-y-8"
      tabIndex={0}
      aria-label="Course Learning Content"
    >
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
        <span className="hover:text-gray-700">{course.title}</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-700 font-medium">{activeModule.title}</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[#052B66] font-bold">{activeLesson.title}</span>
      </nav>

      {/* Lesson Header Title Area */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#052B66]/10 text-[#052B66]">
            Module {activeModule.order} · Lesson {activeLesson.order}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {activeLesson.duration}
          </span>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Core Curriculum
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
          {activeLesson.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {activeLesson.description}
        </p>
      </div>

      {/* Floating Selection Tooltip for Quick AI Explanation */}
      {selectedTextSnippet && (
        <div className="sticky top-20 z-10 bg-[#052B66] text-white p-3 rounded-xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 border border-blue-800">
          <div className="flex items-center gap-2 text-xs truncate max-w-xs sm:max-w-md">
            <Sparkles className="w-4 h-4 text-[#45CC42] shrink-0" />
            <span className="truncate">"{selectedTextSnippet}"</span>
          </div>
          <button
            onClick={() => {
              onAskAiAboutTopic(`Explain this concept: "${selectedTextSnippet}"`, 'explain');
              setSelectedTextSnippet(null);
            }}
            className="px-3 py-1 bg-[#45CC42] hover:bg-[#3db83a] text-[#052B66] font-bold text-xs rounded-lg transition-colors shrink-0 shadow-xs"
          >
            Ask AI Assistant
          </button>
        </div>
      )}

      {/* Interactive Video Player Placeholder (Modern LMS styling) */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 shadow-sm">
        <div className="relative aspect-video bg-gradient-to-br from-[#052B66] via-slate-900 to-[#101828] flex items-center justify-center text-white group">
          {/* Simulated Video Visual Graphics */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#45CC42_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 text-center space-y-3 px-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-white/90 hover:bg-white text-[#052B66] flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 group-hover:ring-4 group-hover:ring-[#45CC42]/50"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-[#052B66]" /> : <Play className="w-8 h-8 fill-[#052B66] ml-1" />}
            </button>
            <div className="space-y-1">
              <p className="text-sm font-semibold tracking-wide text-gray-200">
                {isPlaying ? 'Playing Lecture: Foundational Concepts & Architecture' : 'Watch Video Lecture'}
              </p>
              <p className="text-xs text-gray-400">Duration: {activeLesson.videoDuration || '04:35'} · High Definition</p>
            </div>
          </div>

          {/* Video Control Bar Simulation */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-[#45CC42] transition-colors">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <span className="text-[11px] font-mono text-gray-300">
                {isPlaying ? '01:45' : '00:00'} / {activeLesson.videoDuration || '04:35'}
              </span>
            </div>
            
            {/* Progress line */}
            <div className="hidden sm:block flex-1 mx-4 bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#45CC42] h-full rounded-full w-[38%]" />
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-[11px] font-semibold bg-white/10 px-1.5 py-0.5 rounded">1.0x</span>
              <Volume2 className="w-4 h-4 hover:text-white cursor-pointer" />
              <Maximize2 className="w-4 h-4 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Video Sub-Tabs */}
        <div className="bg-white border-t border-gray-200 px-4 flex items-center justify-between gap-4 overflow-x-auto text-xs font-semibold">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'content'
                  ? 'border-[#052B66] text-[#052B66]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Lesson Material
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'transcript'
                  ? 'border-[#052B66] text-[#052B66]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Video Transcript
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'resources'
                  ? 'border-[#052B66] text-[#052B66]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Resources & Downloads (2)
            </button>
          </div>

          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => onAskAiAboutTopic('Explain this video lesson in simple terms', 'simplify')}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F5F7FA] text-[#052B66] hover:bg-[#052B66]/10 border border-gray-200 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-[#45CC42]" />
              Summarize Video with AI
            </button>
          </div>
        </div>
      </div>

      {/* Learning Objectives Checklist */}
      <section id="section-learning-objectives" className="bg-[#F5F7FA] rounded-xl p-5 border border-gray-200/90 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#052B66]" />
            Key Learning Objectives
          </h2>
          <span className="text-[11px] text-gray-500 font-medium">
            {Object.values(completedObjectives).filter(Boolean).length} of {activeLesson.learningObjectives.length} completed
          </span>
        </div>

        <div className="space-y-2">
          {activeLesson.learningObjectives.map((objective, idx) => {
            const isDone = completedObjectives[idx] || false;
            return (
              <div
                key={idx}
                onClick={() => toggleObjective(idx)}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-gray-200/70 hover:border-gray-300 cursor-pointer transition-all text-xs text-gray-700"
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#45CC42] fill-emerald-50" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300" />
                  )}
                </div>
                <span className={`leading-relaxed ${isDone ? 'text-gray-500 line-through' : 'text-gray-800 font-medium'}`}>
                  {objective}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Lesson Content Sections */}
      {activeTab === 'content' && (
        <article className="space-y-8">
          {activeLesson.contentSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#101828]">
                  {section.title}
                </h2>
                <button
                  onClick={() => onAskAiAboutTopic(`Explain the concept of: ${section.title}`, 'explain')}
                  className="text-xs font-semibold text-[#052B66] hover:text-blue-800 flex items-center gap-1 bg-[#052B66]/5 px-2.5 py-1 rounded-full border border-[#052B66]/15 hover:bg-[#052B66]/10 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-[#45CC42]" />
                  Ask AI to Explain
                </button>
              </div>

              <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
                {section.body.map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>

              {/* Highlight Quote */}
              {section.highlightQuote && (
                <blockquote className="border-l-4 border-[#052B66] bg-[#F5F7FA] p-4 rounded-r-xl text-sm font-medium text-[#101828] italic leading-relaxed my-4">
                  "{section.highlightQuote}"
                </blockquote>
              )}

              {/* Key Concept Callout Card */}
              {section.keyConcept && (
                <div className="bg-white rounded-xl border-2 border-[#052B66]/15 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#052B66] uppercase tracking-wide">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Core Concept Focus: {section.keyConcept.term}
                    </div>
                    <button
                      onClick={() => onAskAiAboutTopic(`Give me a practical workplace example of ${section.keyConcept?.term}`, 'example')}
                      className="text-[11px] font-semibold text-[#052B66] hover:underline flex items-center gap-1"
                    >
                      <span>Need an example?</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <strong className="text-gray-900">Definition:</strong> {section.keyConcept.definition}
                  </p>

                  <div className="bg-[#F5F7FA] p-3 rounded-lg text-xs text-gray-600 border border-gray-200/80">
                    <strong className="text-[#052B66]">Workplace Application:</strong> {section.keyConcept.example}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Practical Takeaway Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-[#45CC42]" />
              Practical Action Rule
            </div>
            <p className="text-sm font-medium text-emerald-900 leading-relaxed">
              {activeLesson.practicalTakeaway}
            </p>
          </div>
        </article>
      )}

      {/* Video Transcript Tab */}
      {activeTab === 'transcript' && (
        <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed">
          <h3 className="font-bold text-[#101828] text-base">Video Lecture Transcript</h3>
          <p className="text-xs text-gray-500">[00:00] Welcome to Module 2 of the eStudy AI Essentials course. In this video, we explore the paradigm shift introduced by generative foundational models...</p>
          <p className="text-xs text-gray-500">[01:15] Unlike older search engines that simply crawl static indexes, generative models analyze the probability distribution of tokens to synthesize a brand new response...</p>
          <p className="text-xs text-gray-500">[02:45] However, because they are probabilistic, hallucinations can occur. That is why human oversight remains your organization\'s most crucial safeguard...</p>
        </div>
      )}

      {/* Resources & Downloads Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-3 bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-bold text-[#101828] text-base mb-2">Lesson Downloads & Reference Guides</h3>
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#052B66]" />
              <div>
                <p className="text-xs font-bold text-gray-800">Generative AI Workplace Governance Framework (PDF)</p>
                <p className="text-[10px] text-gray-500">2.4 MB · eStudy Business Resource</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-[#052B66] text-white text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-blue-900 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>
      )}

      {/* Footer Navigation Bar for Lessons */}
      <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onPrevLesson}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous Lesson
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onAskAiAboutTopic('Start a 5-question quiz to test my understanding of this lesson', 'quiz')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white border border-[#052B66]/30 text-[#052B66] text-xs font-bold hover:bg-[#052B66]/5 flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#45CC42]" />
            Test with AI Quiz
          </button>

          <button
            onClick={onNextLesson}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#052B66] hover:bg-blue-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <span>Next Lesson</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
};
