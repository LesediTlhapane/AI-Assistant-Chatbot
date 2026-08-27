import { Course } from '../types';

export const mockCourseData: Course = {
  id: 'course-ai-essentials',
  title: 'AI Essentials for Business & Workplace',
  code: 'ESTUDY-AI-101',
  provider: 'eStudy South Africa (CrossKnowledge LMS)',
  category: 'Digital Transformation & Emerging Tech',
  totalProgress: 62,
  currentModuleId: 'module-002',
  currentLessonId: 'lesson-002-01',
  modules: [
    {
      id: 'module-001',
      order: 1,
      title: 'Foundations of Artificial Intelligence',
      description: 'Understand the historical evolution, core terminology, and fundamental principles of machine learning and deep neural networks.',
      status: 'completed',
      progress: 100,
      estimatedTime: '45 mins',
      lessons: [
        {
          id: 'lesson-001-01',
          order: 1,
          title: 'The AI Landscape & Evolution',
          duration: '12 mins',
          type: 'video',
          description: 'A comprehensive timeline of AI developments from symbolic systems to deep learning.',
          learningObjectives: [
            'Differentiate between Artificial Narrow Intelligence (ANI) and Artificial General Intelligence (AGI)',
            'Identify key breakthrough moments in machine learning history'
          ],
          contentSections: [
            {
              title: 'Overview of Machine Intelligence',
              body: [
                'Artificial Intelligence represents the capability of computational systems to perform tasks historically requiring human cognition, such as pattern recognition, visual perception, decision-making, and natural language processing.',
                'Today, nearly all operational implementations are Artificial Narrow Intelligence (ANI)—systems specialized in discrete domains such as predictive analytics, computer vision, and language modeling.'
              ],
              keyConcept: {
                term: 'Artificial Narrow Intelligence (ANI)',
                definition: 'AI that is trained to perform a specific, focused task with high accuracy (e.g. speech recognition or translation) without general cognitive flexibility.',
                example: 'Spam filters, recommendation algorithms on streaming services, and medical imaging diagnostics.'
              }
            }
          ],
          practicalTakeaway: 'Always assess whether a business challenge requires specialized rule-based automation or adaptive machine learning.'
        },
        {
          id: 'lesson-001-02',
          order: 2,
          title: 'Machine Learning vs Traditional Software',
          duration: '18 mins',
          type: 'reading',
          description: 'How data-driven algorithms differ from explicit procedural programming.',
          learningObjectives: [
            'Understand the shift from explicit coding to learning from data patterns',
            'Recognize supervised, unsupervised, and reinforcement learning paradigms'
          ],
          contentSections: [
            {
              title: 'The Paradigm Shift',
              body: [
                'In traditional software engineering, developers write explicit business rules (If X, then Y) that execute on input data to produce outputs.',
                'In Machine Learning, algorithm models ingest historical inputs and known outcomes, discovering underlying mathematical relationships to construct predictive rules automatically.'
              ]
            }
          ],
          practicalTakeaway: 'High-quality structured training data is the cornerstone of effective ML deployment.'
        }
      ]
    },
    {
      id: 'module-002',
      order: 2,
      title: 'AI in the Workplace',
      description: 'Explore how generative AI and cognitive automation transform knowledge work, productivity, communications, and decision-making in modern organizations.',
      status: 'in-progress',
      progress: 78,
      estimatedTime: '1 hr 15 mins',
      lessons: [
        {
          id: 'lesson-002-01',
          order: 1,
          title: 'Introduction to Generative AI',
          duration: '15 mins',
          type: 'video',
          videoDuration: '04:35',
          description: 'Discover what generative AI is, how foundational models generate contextual outputs, and why it represents a fundamental leap in knowledge work productivity.',
          learningObjectives: [
            'Define generative AI and contrast it with traditional search and database retrieval.',
            'Explain how Large Language Models (LLMs) predict tokens using learned probability distributions.',
            'Identify high-impact workplace applications including document drafting, synthesis, and code assistance.',
            'Recognize the vital role of human oversight (Human-in-the-Loop) and output verification.'
          ],
          contentSections: [
            {
              title: 'What is Generative AI?',
              body: [
                'Generative AI refers to artificial intelligence architectures capable of synthesizing novel content—including coherent text, realistic imagery, audio, structured data, and computer code—based on statistical patterns acquired from vast training datasets.',
                'Unlike traditional query systems or deterministic databases that merely index, locate, and retrieve static pre-existing records, generative systems dynamically synthesize original responses tailored to the nuanced context of a user prompt.'
              ],
              highlightQuote: 'Generative AI does not merely search the internet for an answer—it reasons probabilistically over contextual representations to synthesize an answer tailored to your specific constraint.',
              keyConcept: {
                term: 'Generative AI vs. Traditional Search',
                definition: 'Search retrieves exact documents containing keywords. Generative AI reads the contextual request, analyzes relationships across semantic tokens, and composes a unique, tailored response.',
                example: 'Searching "leave policy draft" gives you 10 template PDFs. Prompting GenAI generates a customized South African BCEA-compliant draft based on your 20-day annual allowance requirement.'
              }
            },
            {
              title: 'How Foundational Large Language Models (LLMs) Work',
              body: [
                'At the core of modern conversational AI are Transformer architectures. These models process language by converting words into numerical embeddings (tokens) and calculating the statistical probability of subsequent tokens across a multi-dimensional context window.',
                'Because LLMs operate on statistical likelihood rather than conscious factual reasoning, they can produce convincing yet factually inaccurate statements if context is ambiguous or ungrounded. This phenomenon is known as hallucination.',
                'In a business setting, this highlights why generative AI functions best as an intelligent co-pilot, augmenting human professionals rather than operating as an unverified autonomous decision-maker.'
              ],
              keyConcept: {
                term: 'Token & Context Window',
                definition: 'Tokens are the foundational text fragments (approx. 4 characters or 0.75 words) processed by LLMs. The context window is the total span of tokens the model can hold in working memory during a single prompt interaction.',
                example: 'Providing an executive brief and asking for a summary leverages the context window to ground the model\'s response strictly in your company\'s factual text.'
              }
            },
            {
              title: 'Key Enterprise Use Cases in the Workplace',
              body: [
                '1. Document Synthesis & Summarization: Condensing 50-page RFP bids, financial audits, or client meeting transcripts into structured executive action items in seconds.',
                '2. First-Draft Generation: Creating initial outlines for proposals, standard operating procedures (SOPs), policy manuals, and email communications.',
                '3. Cross-Disciplinary Translation & Clarification: Translating complex technical specifications into accessible business language for non-technical stakeholders.',
                '4. Ideation & Scenario Testing: Stress-testing strategy assumptions by asking the AI to simulate customer counter-arguments or edge cases.'
              ]
            }
          ],
          practicalTakeaway: 'Always apply the 80/20 principle: Use Generative AI to accelerate the initial 80% of content structuring and ideation, then apply human critical judgment and domain expertise to polish and verify the final 20%.'
        },
        {
          id: 'lesson-002-02',
          order: 2,
          title: 'Prompt Engineering for Business Teams',
          duration: '20 mins',
          type: 'interactive',
          description: 'Master practical prompting frameworks (Role, Task, Context, Constraints) to extract precise, professional outputs.',
          learningObjectives: [
            'Apply the RTCF framework (Role, Task, Context, Format) to workplace prompts',
            'Prevent hallucinations through grounded reference documents (few-shot prompting)'
          ],
          contentSections: [
            {
              title: 'The Structure of an Effective Workplace Prompt',
              body: [
                'Vague instructions yield generic outputs. High-performance enterprise prompting requires clear persona specification, precise objective scoping, unambiguous background context, and explicit formatting constraints.',
                'By assigning a distinct role (e.g. "Act as a Senior Compliance Officer in South Africa") and defining constraints (e.g. "Use bullet points, max 200 words, cite POPIA guidelines"), the output quality improves by orders of magnitude.'
              ],
              keyConcept: {
                term: 'RTCF Prompt Framework',
                definition: 'A structured blueprint: Role (who the AI acts as), Task (the precise job), Context (background details and data), Format (desired layout and tone).',
                example: 'Role: Senior Financial Analyst | Task: Summarize Q3 revenue variance | Context: [Pasted balance sheet] | Format: Markdown table with percentage variances.'
              }
            }
          ],
          practicalTakeaway: 'The quality of your AI output is a direct reflection of the clarity and context provided in your prompt.'
        },
        {
          id: 'lesson-002-03',
          order: 3,
          title: 'Workflow Automation & Copilots',
          duration: '22 mins',
          type: 'reading',
          description: 'Connecting AI models to spreadsheets, email clients, CRM systems, and workflow engines to automate repetitive operational tasks.',
          learningObjectives: [
            'Identify high-frequency repetitive workflows suited for AI co-pilots',
            'Distinguish between deterministic RPA and cognitive AI agent workflows'
          ],
          contentSections: [
            {
              title: 'Augmenting Business Processes',
              body: [
                'Modern enterprise tools integrate AI directly into Microsoft 365, Google Workspace, Salesforce, and CrossKnowledge LMS platforms.',
                'Rather than switching between disconnected windows, learners and workers interact with contextual assistants embedded right where the workflow occurs.'
              ]
            }
          ],
          practicalTakeaway: 'Embedded AI reduces context-switching fatigue and preserves cognitive momentum.'
        },
        {
          id: 'lesson-002-04',
          order: 4,
          title: 'Ethics, Data Privacy & Verification',
          duration: '18 mins',
          type: 'reading',
          description: 'Protecting proprietary company data, adhering to POPIA / GDPR, avoiding bias, and establishing verification checklists.',
          learningObjectives: [
            'Understand data leakage risks when inputting proprietary information into public AI models',
            'Apply South African POPIA (Protection of Personal Information Act) principles to AI data handling'
          ],
          contentSections: [
            {
              title: 'Safeguarding Sensitive Enterprise Data',
              body: [
                'Never paste Personally Identifiable Information (PII), customer banking details, trade secrets, or unreleased financial metrics into public, non-enterprise AI instances that use user inputs for model retraining.',
                'Ensure your organization utilizes enterprise-tier zero-data-retention agreements and approved internal AI gateways.'
              ]
            }
          ],
          practicalTakeaway: 'Always verify claims against primary documentation and treat AI outputs as drafts subject to professional review.'
        }
      ]
    },
    {
      id: 'module-003',
      order: 3,
      title: 'Applied AI & Automation',
      description: 'Hands-on implementation of custom GPT agents, knowledge retrieval pipelines (RAG), and data analytics copilots.',
      status: 'in-progress',
      progress: 0,
      estimatedTime: '1 hr 30 mins',
      lessons: [
        {
          id: 'lesson-003-01',
          order: 1,
          title: 'Building Custom AI Knowledge Bases (RAG)',
          duration: '25 mins',
          type: 'interactive',
          description: 'How Retrieval-Augmented Generation connects LLMs to internal company PDF archives and knowledge wikis.',
          learningObjectives: [
            'Explain the difference between model fine-tuning and retrieval-augmented generation (RAG)',
            'Map out a document ingestion pipeline for company manuals'
          ],
          contentSections: [
            {
              title: 'Grounding AI with Enterprise Knowledge',
              body: [
                'Retrieval-Augmented Generation (RAG) allows an AI model to consult specific authoritative company documents before answering, eliminating hallucination risks on internal policies.'
              ]
            }
          ],
          practicalTakeaway: 'RAG is the most cost-effective and secure way to give an AI knowledge about your specific business operations.'
        },
        {
          id: 'lesson-003-02',
          order: 2,
          title: 'Autonomous Agents & Multi-Step Reasoning',
          duration: '30 mins',
          type: 'reading',
          description: 'How modern AI agents plan, execute tool calls, search web APIs, and coordinate complex multi-step business deliverables.',
          learningObjectives: [
            'Define an AI agent loop (Plan -> Act -> Observe -> Reflect)',
            'Evaluate risks and guardrails for autonomous tool execution'
          ],
          contentSections: [
            {
              title: 'From Chatbots to Autonomous Agents',
              body: [
                'While early chatbots simply answered questions in a single turn, modern agents can access calendars, query databases, draft documents, and ask for human confirmation before taking irreversible actions.'
              ]
            }
          ],
          practicalTakeaway: 'Maintain strict human-in-the-loop sign-offs on financial transactions, public communications, and system deletions.'
        }
      ]
    },
    {
      id: 'module-004',
      order: 4,
      title: 'Responsible AI Governance & Compliance',
      description: 'Regulatory frameworks, South African AI policies, algorithmic bias auditing, and corporate AI steering committees.',
      status: 'locked',
      progress: 0,
      estimatedTime: '55 mins',
      lessons: [
        {
          id: 'lesson-004-01',
          order: 1,
          title: 'South African & Global AI Regulatory Landscape',
          duration: '25 mins',
          type: 'reading',
          description: 'Understanding the EU AI Act, South African National AI Plan, POPIA compliance, and intellectual property precedents.',
          learningObjectives: [
            'Align AI workplace policies with POPIA regulations',
            'Understand copyright and intellectual property implications for AI-generated works'
          ],
          contentSections: [
            {
              title: 'Regulatory Preparedness',
              body: [
                'Organizations must establish an AI Code of Conduct, catalog all shadow AI usage, and implement bias audits across human resource and lending algorithms.'
              ]
            }
          ],
          practicalTakeaway: 'Transparency and auditability are foundational to compliant enterprise AI adoption.'
        }
      ]
    }
  ]
};
