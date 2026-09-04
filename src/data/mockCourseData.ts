import { Course } from '../types';

export const mockCourseData: Course = {
  id: 'course-creative-thinking-ai',
  title: 'Creative Thinking and AI',
  code: 'CK-MODULE-5',
  provider: 'eStudy South Africa (CrossKnowledge LMS)',
  category: 'Innovation & Enterprise AI Strategy',
  totalProgress: 75,
  currentModuleId: 'module-005',
  currentLessonId: 'lesson-005-04',
  modules: [
    {
      id: 'module-005',
      order: 5,
      title: 'Creative Thinking and AI',
      description: 'Discover how to identify, frame, evaluate, and score high-impact AI opportunities in your organization using the HI-AI Discovery Framework.',
      status: 'in-progress',
      progress: 75,
      estimatedTime: '30 mins',
      lessons: [
        {
          id: 'lesson-005-01',
          order: 1,
          title: 'Use AI-Powered Data Analytics for Decision-Making',
          duration: '3 mins',
          type: 'reading',
          points: 2,
          isCompleted: true,
          description: 'Leveraging algorithmic analytics to augment executive decision making.',
          learningObjectives: [
            'Understand data-driven decision frameworks',
            'Identify key metrics for AI readiness'
          ],
          contentSections: [
            {
              title: 'Data Analytics & AI',
              body: ['Using AI to analyze corporate data and uncover actionable operational insights.']
            }
          ],
          practicalTakeaway: 'Data quality dictates analytical accuracy.'
        },
        {
          id: 'lesson-005-02',
          order: 2,
          title: 'What steps might you take to determine whether a proposed project is truly AI worthy?',
          duration: '2 min',
          type: 'interactive',
          points: 2,
          isCompleted: false,
          description: 'Open question exercise to evaluate project feasibility and return on investment.',
          learningObjectives: [
            'Formulate project screening criteria',
            'Assess technical and business feasibility'
          ],
          contentSections: [
            {
              title: 'Evaluating AI Worthiness',
              body: ['Consider data availability, problem complexity, ROI potential, and operational alignment.']
            }
          ],
          practicalTakeaway: 'Not all problems require AI; choose projects where pattern synthesis adds strategic value.'
        },
        {
          id: 'lesson-005-03',
          order: 3,
          title: 'Spot and Assess AI Opportunities',
          duration: '2 min',
          type: 'reading',
          points: 2,
          isCompleted: true,
          description: 'Editorial overview of methods for discovering high-value use cases across business units.',
          learningObjectives: [
            'Spot high-value automation opportunities',
            'Conduct initial feasibility assessments'
          ],
          contentSections: [
            {
              title: 'Spotting Opportunities',
              body: ['Look for workflow bottlenecks, repetitive document synthesis, or data-rich manual processes.']
            }
          ],
          practicalTakeaway: 'Start with high-impact, low-complexity pilot projects.'
        },
        {
          id: 'lesson-005-04',
          order: 4,
          title: 'Find high-impact AI opportunities',
          duration: '5 min',
          type: 'video',
          videoDuration: '05:00',
          points: 5,
          isCompleted: true,
          description: 'In this video Kavita Ganesan introduces the HI-AI Discovery Framework, a method she has created to identify the most relevant and promising AI opportunities. Let\'s find out why it\'s important to understand whether an initiative has true potential and how to do so.',
          learningObjectives: [
            'Identify initiatives that are truly AI worthy',
            'Frame AI initiatives to bring clarity on their business benefits',
            'Engage domain experts to verify feasibility and implementation readiness',
            'Score and prioritize AI initiatives to surface high-impact opportunities'
          ],
          contentSections: [
            {
              title: 'The HI-AI Discovery Framework',
              body: [
                'The HI-AI (High-Impact AI) Discovery Framework provides a structured 4-step blueprint for enterprise AI adoption:',
                '1. Identify: Pinpoint operational pain points and bottleneck processes across department workflows.',
                '2. Frame: Define clear measurable outcomes, ROI targets, and human-in-the-loop governance.',
                '3. Verify: Conduct technical and data readiness reviews with engineering experts before capital allocation.',
                '4. Score: Rank candidate projects matrixing business impact against execution complexity.'
              ],
              highlightQuote: 'How can you score AI initiatives in order to surface those with the most impact?',
              keyConcept: {
                term: 'HI-AI Discovery Framework',
                definition: 'A 4-step framework created by Kavita Ganesan to identify, frame, verify, and score strategic AI opportunities.',
                example: 'Scoring a customer support ticket summarizer vs. a complex autonomous supply chain model to choose the highest ROI pilot.'
              }
            }
          ],
          practicalTakeaway: 'Always score proposed AI projects by comparing business impact against technical feasibility.'
        },
        {
          id: 'lesson-005-05',
          order: 5,
          title: 'About high-impact AI initiatives (HI-AIs)',
          duration: '1 min',
          type: 'reading',
          points: 1,
          isCompleted: true,
          description: 'Editorial guide detailing characteristics of HI-AIs.',
          learningObjectives: ['Define key characteristics of HI-AIs'],
          contentSections: [
            {
              title: 'Understanding HI-AIs',
              body: ['High-Impact AI initiatives combine clear business value, data availability, and manageable implementation risk.']
            }
          ],
          practicalTakeaway: 'Focus organizational energy on projects that deliver measurable bottom-line value.'
        },
        {
          id: 'lesson-005-06',
          order: 6,
          title: 'The high-impact AI initiative discovery framework',
          duration: '1 min',
          type: 'interactive',
          points: 1,
          isCompleted: true,
          description: 'Interactive learning resource mapping out the discovery pipeline.',
          learningObjectives: ['Navigate the discovery framework steps'],
          contentSections: [
            {
              title: 'Interactive Framework Map',
              body: ['Explore each stage of the discovery pipeline from identification to deployment.']
            }
          ],
          practicalTakeaway: 'Use structured frameworks to prevent costly project failures.'
        },
        {
          id: 'lesson-005-07',
          order: 7,
          title: 'Step 1: Identify',
          duration: '1 min',
          type: 'reading',
          points: 1,
          isCompleted: false,
          description: 'Editorial lesson focusing on Phase 1: Identification.',
          learningObjectives: ['Master problem identification techniques'],
          contentSections: [
            {
              title: 'Identification Phase',
              body: ['Interview business unit leaders and audit daily workflows to uncover hidden automation potential.']
            }
          ],
          practicalTakeaway: 'Identify real business pain points before choosing AI technologies.'
        }
      ]
    }
  ]
};
