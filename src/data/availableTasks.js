// src/data/availableTasks.js

const availableTasks = [
{
    "id": "task0",
    "title": "Welcome! Let's Get to Know You",
    "category": "User Onboarding",
    "paymentAmount": 10,
    "duration": "5 mins",
    "difficulty": "Beginner",
    "questions": [
      {
        "id": "q1",
        "type": "text",
        "question": "What is your first name and the county you currently live in?",
        "required": true
      },
      {
        "id": "q2",
        "type": "opinion",
        "question": "Which age group do you belong to?",
        "options": ["18-24", "25-34", "35-44", "45-54", "55+"],
        "required": true
      },
      {
        "id": "q3",
        "type": "opinion",
        "question": "What is your highest level of education?",
        "options": ["Primary", "Secondary", "Diploma", "Bachelor's Degree", "Postgraduate"],
        "required": true
      },
      {
        "id": "q4",
        "type": "opinion",
        "question": "What is your current employment status?",
        "options": ["Student", "Employed Full-Time", "Employed Part-Time", "Self-Employed", "Seeking Work", "Not Seeking Work"],
        "required": true
      },
      {
        "id": "q5",
        "type": "opinion",
        "question": "What is your approximate gross monthly income range in KSh?",
        "options": ["Below 20,000", "20,000 - 50,000", "50,001 - 100,000", "100,001 - 200,000", "Above 200,000"],
        "required": true
      }
    ]
  },

{
  id: 'task1',
  title: 'Rate Text and Image Responses from AI Chatbots',
  category: 'AI Evaluation',
  paymentAmount: 20,
  duration: '45 mins',
  difficulty: 'Intermediate',
  questions: [
    {
      id: 'q1',
      type: 'opinion',
      question:
        'Below are two AI responses to the user message: “I’m feeling stressed about my exams.” Which response sounds more natural and supportive? A: I understand. Academic examinations can induce psychological pressure. Consider organizing your tasks into efficient study blocks. B: I’m really sorry you’re feeling stressed. Exams can be overwhelming, but you’re not alone—let’s break it down together. What’s worrying you most?',
      options: ['Response A', 'Response B', 'Both Equal'],
      required: true
    },
    {
      id: 'q2',
      type: 'opinion',
      question:
        'A user uploads a picture of a messy desk and asks: “How do I make this workspace better?” Which AI response is more practical and visually aware? A: To improve your workspace, enhance the lighting and remove unnecessary items. B: I see notebooks piled on the left, cables hanging off the edge, and a cup balancing near your keyboard. I’d start by organizing cables with a clip and moving the cup farther back to avoid spills.',
      options: ['Response A', 'Response B', 'Both Equal'],
      required: true
    },
    {
      id: 'q3',
      type: 'text',
      question:
        'List two qualities that make an AI response feel “human-like” when reacting to emotional messages.',
      required: true
    },
    {
      id: 'q4',
      type: 'text',
      question:
        'Rewrite this AI reply to make it warmer and more natural:\n\nUser: “I failed my driving test.”\nAI: “Failure is a normal part of life. Try again.”',
      required: true
    },
    {
      id: 'q5',
      type: 'opinion',
      question:
        'Two AI models try to explain the same image (a dog wearing sunglasses in a park). Which one is more accurate and descriptive? A. A dog is present outdoors. B: A small brown dog wearing round black sunglasses is sitting on green grass, looking toward the camera as if posing.',
      options: ['Model A', 'Model B', 'Both Equal'],
      required: true
    },
    {
      id: 'q6',
      type: 'text',
      question:
        'Suggest one improvement an AI could make when describing images containing people to avoid sounding robotic or repetitive.',
      required: true
    },
    {
      id: 'q7',
      type: 'file',
      question:
        'Create a simple hand-drawn sketch of a “chatbot interacting with a user.” Label **two** parts clearly (e.g., CHATBOT, USER MESSAGE BUBBLE). Upload as an image or a DOCX file.',
      acceptedFormats: 'image/*,.docx',
      required: true
    }
  ]
},

{
  id: 'task2',
  title: 'Translate Swahili Proverbs to English',
  category: 'Translation',
  paymentAmount: 25,
  duration: '1h 15m',
  difficulty: 'Expert',
  questions: [
    {
      id: 'q1',
      type: 'text',
      question:
        'Translate this Swahili proverb into natural English while keeping the cultural meaning: “Haraka haraka haina baraka.”',
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question:
        'Translate this proverb and add a modern interpretation for younger readers: “Asiyekubali kushindwa si mshindani.”',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',

  question:
    'Which English translation of “Samaki mkunje angali mbichi” keeps the meaning best?\n\nsampleA: Bend the fish while it is still fresh.\nsampleB: Shape someone’s habits while they are still young.',
  options: ['Version A', 'Version B', 'Both Equal'],
  required: true
    },
    {
      id: 'q4',
      type: 'text',
      question:
        'Give an example situation in real life where the proverb “Chema chajiuza, kibaya chajitembeza” applies.',
      required: true
    },
    {
      id: 'q5',
      type: 'opinion',
      question:
        'Two translators give different interpretations of “Mtaka cha mvunguni sharti ainame.” Which one feels more accurate? A: You must bend to get something hidden under the bed. B: ',
      options: ['Translator A', 'Translator B', 'Both Equal'],
      required: true
    },
    {
      id: 'q6',
      type: 'text',
      question:
        'Rewrite this literal translation to sound more natural: “The one who wakes early gets the insects.”',
      required: true
    },
    {
      id: 'q7',
      type: 'file',
      question:
        'Create a simple illustrated page showing ANY Swahili proverb and its English equivalent. You may hand-draw or use basic computer tools. Upload as an image or DOCX.',
      acceptedFormats: 'image/*,.docx',
      required: true
    }
  ]
},

{
  id: 'task3',
  title: 'Write Product Descriptions for Smart Home Devices',
  category: 'Content Writing',
  paymentAmount: 22,
  duration: '1h',
  difficulty: 'Advanced',
  questions: [
    {
      id: 'q1',
      type: 'text',
      question:
        'Write a 120–150 word product description for a smart thermostat that learns your routine and saves energy automatically.',
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question:
        'Rewrite this dull product line to sound more exciting: “This smart bulb can change colors using a mobile app.”',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',
      question:
        'Which headline is stronger for marketing a smart home camera?',
      options: ['Headline A', 'Headline B', 'Both Equal'],
      sampleA:
        'Your Home, Always in Sight',
      sampleB:
        'See Every Corner, Anytime, From Anywhere',
      required: true
    },
    {
      id: 'q4',
      type: 'text',
      question:
        'List three emotions you want customers to feel when reading a smart-home product description.',
      required: true
    },
    {
      id: 'q5',
      type: 'opinion',
      question:
        'Which tone fits luxury smart-home products better?',
      options: [
        'Minimalist, calm, premium',
        'Energetic, fun, colorful',
        'Technical and deeply detailed'
      ],
      required: true
    },
    {
      id: 'q6',
      type: 'text',
      question:
        'Improve this micro-description:\n\n“Smart kettle that boils water faster.”',
      required: true
    },
    {
      id: 'q7',
      type: 'file',
      question:
        'Design a simple mockup page for ONE smart home product (title + short description + one drawn icon). Upload image or DOCX.',
      acceptedFormats: 'image/*,.docx',
      required: true
    }
  ]
},
{
  id: 'task4',
  title: 'Write 5 Viral TikTok Scripts About AI Tools',
  category: 'Content Writing',
  paymentAmount: 30,
  duration: '2h',
  difficulty: 'Advanced',
  questions: [
    {
      id: 'q1',
      type: 'text',
      question:
        'Write a 20–30 second TikTok script introducing an AI tool that writes resumes. Keep it funny and energetic.',
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question:
        'Write a dramatic TikTok hook for a video about an AI app that removes background noise from audio.',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',
      question:
        'Which TikTok style fits AI tutorials best?',
      options: ['Humor-driven', 'Fast-paced informative', 'Lifestyle aesthetic'],
      required: true
    },
    {
      id: 'q4',
      type: 'text',
      question:
        'Turn this boring sentence into a viral-style TikTok line: “This tool can summarize long PDFs.”',
      required: true
    },
    {
      id: 'q5',
      type: 'opinion',
      question:
        'Two TikTok creators try to explain an AI logo maker. Which opener is stronger?',
      options: ['Creator A', 'Creator B', 'Both Equal'],
      sampleA:
        '“Here’s an AI tool you might like…”',
      sampleB:
        '“STOP scrolling — this AI just made a better logo than my designer!”',
      required: true
    },
    {
      id: 'q6',
      type: 'text',
      question:
        'Write a 10–15 second TikTok ending that encourages viewers to try an AI tool.',
      required: true
    },
    {
      id: 'q7',
      type: 'file',
      question:
        'Create a storyboard with at least 4 frames for any AI-tool TikTok idea. Draw simple boxes and labels. Upload as an image or DOCX.',
      acceptedFormats: 'image/*,.docx',
      required: true
    }
  ]
},
{
  id: 'task5',
  title: 'Label Safety Hazards in Urban Street Images',
  category: 'Data Labeling',
  paymentAmount: 15,
  duration: '30 mins',
  difficulty: 'Beginner',
  questions: [
    {
      id: 'q1',
      type: 'opinion',
      question:
        'In the image below (scenario): A pedestrian is crossing between parked cars while a motorcycle is approaching. What is the main hazard?',
      options: [
        'Pedestrian crossing unsafely',
        'Motorcycle speeding',
        'Both are hazards',
        'Scene unclear'
      ],
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question:
        'Describe one secondary hazard that might not be obvious at first glance.',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',
      question:
        'If you see a delivery van stopped in a bike lane, how would you classify the hazard?',
      options: ['Blocked bike lane', 'Illegal parking', 'No hazard', 'Unclear'],
      required: true
    },
    {
      id: 'q4',
      type: 'text',
      question:
        'List at least three objects that should be labeled in a standard traffic-safety dataset.',
      required: true
    },
    {
      id: 'q5',
      type: 'opinion',
      question:
        'Two annotators describe the same scene. Which label is more accurate?\n\nA: “Car parked.”\nB: “Red sedan parked partially on pedestrian walkway.”',
      options: ['A', 'B', 'Both Equal'],
      required: true
    },
    {
      id: 'q6',
      type: 'text',
      question:
        'Explain why consistent labeling rules are important for training AI safety models.',
      required: true
    },
    {
      id: 'q7',
      type: 'file',
      question:
        'Draw a simple street scene and mark at least ONE hazard using arrows or boxes. Upload image or DOCX.',
      acceptedFormats: 'image/*,.docx',
      required: true
    }
  ]
},
{
  id: 'task6',
  title: 'Tag Objects in Self-Driving Car Videos',
  category: 'Data Labeling',
  paymentAmount: 28,
  duration: '1h 30m',
  difficulty: 'Intermediate',
  questions: [
    {
      id: 'q1',
      type: 'opinion',
      question:
        'A frame shows a cyclist partially blocked by a bus. How should it be labeled?',
      options: [
        'Visible cyclist',
        'Partially occluded cyclist',
        'Not enough info',
        'Do not label'
      ],
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question:
        'List four common object categories in autonomous driving datasets.',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',
      question:
        'Two labelers disagree on whether a distant object is a motorcycle or a person. What is the safest choice?',
      options: ['Label as “unclear”', 'Choose motorcycle', 'Choose person', 'Skip the frame'],
      required: true
    },
    {
      id: 'q4',
      type: 'text',
      question:
        'Explain how motion blur affects object labeling in nighttime scenes.',
      required: true
    },
    {
      id: 'q5',
      type: 'opinion',
      question:
        'Which bounding-box description is more precise?\nA: “Car near sidewalk.”\nB: “Blue hatchback, partially cropped, right side of frame.”',
      options: ['A', 'B', 'Both Equal'],
      required: true
    },
    {
      id: 'q6',
      type: 'text',
      question:
        'Provide one rule for labeling pedestrians who are only visible from the waist up.',
      required: true
    },
    {
      id: 'q7',
      type: 'file',
      question:
        'Draw a sample video frame (simple rectangles and shapes) and label at least THREE objects. Upload as image or DOCX.',
      acceptedFormats: 'image/*,.docx',
      required: true
    }
  ]
},
{
  id: 'task7',
  title: 'Translate Chat Messages from English to French',
  category: 'Translation',
  paymentAmount: 24,
  duration: '1h',
  difficulty: 'Intermediate',
  questions: [
    {
      id: 'q1',
      type: 'text',
      question: 'Translate: “Good morning! How can I assist you today?”',
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question: 'Translate: “Your payment has been processed successfully.”',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',
      question: 'Which translation sounds more natural? sampleA: “Bonjour ! Comment puis-je vous aider aujourd’hui ?” sampleB: “Salut ! Que puis-je faire pour vous aujourd’hui ?”',
      options: ['Formal tone', 'Casual tone', 'Both'],
      required: true
    },
    {
      id: 'q4',
      type: 'file',
      question: 'Upload your translated text (PDF/DOCX)',
      acceptedFormats: '.pdf,.docx',
      required: true
    }
  ]
}
,{
  id: 'task8',
  title: 'Write Prompts to Test Image Generation Models',
  category: 'Prompt Writing',
  paymentAmount: 35,
  duration: '1h 30m',
  difficulty: 'Advanced',
  questions: [
    {
      id: 'q1',
      type: 'text',
      question: 'Write a detailed prompt for generating a “sunset over futuristic Nairobi skyline.”',
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question: 'Write another prompt describing a “robot teacher in a classroom.”',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',
      question: 'Which prompt would create more realistic images? sampleA: “Sunset over Nairobi skyline with futuristic neon buildings, flying cars, soft clouds.” sampleB: “Futuristic Nairobi city with high-rise towers at sunset, warm lighting, flying drones.”',
      options: ['Prompt 1', 'Prompt 2', 'Both'],
      required: true
    },
    {
      id: 'q4',
      type: 'file',
      question: 'Upload your final prompt set (PDF/DOCX)',
      acceptedFormats: '.pdf,.docx',
      required: true
    }
  ]
}
,{
  id: 'task9',
  title: 'Label Unsafe Content in Social Media Screenshots',
  category: 'Content Moderation',
  paymentAmount: 26,
  duration: '1h',
  difficulty: 'Intermediate',
  questions: [
    {
      id: 'q1',
      type: 'opinion',
      question: 'Which category best fits: “Offensive language in a post”? sampleA: “This post uses racial slurs repeatedly.” sampleB: “User made negative jokes but no slurs.”',
      options: ['Hate Speech', 'Spam', 'Harassment'],
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question: 'Define “harmful content” in your own words.',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',
      question: 'What’s the correct action for mild spam? sampleA: “User posts repeated product links.” sampleB: “User posts one promotional link in a conversation.”',
      options: ['Delete', 'Ignore', 'Report'],
      required: true
    },
    {
      id: 'q4',
      type: 'file',
      question: 'Upload your labeling summary (PDF/DOCX)',
      acceptedFormats: '.pdf,.docx',
      required: true
    }
  ]
}
,{
  id: 'task10',
  title: 'Rate AI Voice Clarity and Accent Naturalness',
  category: 'Audio Evaluation',
  paymentAmount: 20,
  duration: '40 mins',
  difficulty: 'Beginner',
  questions: [
    {
      id: 'q1',
      type: 'opinion',
      question: 'How natural does this AI voice sound? sampleA: “Hello, I hope you are having a great day!” sampleB: “Hello, hope your day is good.”',
      options: ['Very Natural', 'Somewhat Natural', 'Robotic'],
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question: 'List two factors that affect voice clarity in AI systems.',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',
      question: 'Which accent sounds more neutral for global audiences? sampleA: “US English accent sample sentence.” sampleB: “British English accent sample sentence.” sampleC: “Kenyan English accent sample sentence.”',
      options: ['US', 'British', 'African'],
      required: true
    },
    {
      id: 'q4',
      type: 'file',
      question: 'Upload your evaluation notes (PDF/DOCX)',
      acceptedFormats: '.pdf,.docx',
      required: true
    }
  ]
}
,{
  id: 'task11',
  title: 'Annotate Landmarks in Aerial Drone Images',
  category: 'Image Tagging',
  paymentAmount: 32,
  duration: '1h 20m',
  difficulty: 'Advanced',
  questions: [
    {
      id: 'q1',
      type: 'opinion',
      question: 'Identify the main landmark in the drone image. sampleA: “A large bridge crossing the river.” sampleB: “A tall office building surrounded by smaller structures.”',
      options: ['Building', 'River', 'Bridge', 'Park'],
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question: 'Describe how landmarks can help in AI navigation systems.',
      required: true
    },
    {
      id: 'q3',
      type: 'text',
      question: 'List 2 potential labeling challenges for aerial images.',
      required: true
    },
    {
      id: 'q4',
      type: 'file',
      question: 'Upload annotated image (PDF/DOCX)',
      acceptedFormats: '.pdf,.docx',
      required: true
    }
  ]
}
,{
  id: 'task12',
  title: 'Summarize Long-form Research Articles',
  category: 'Content Summarization',
  paymentAmount: 40,
  duration: '2h',
  difficulty: 'Expert',
  questions: [
    {
      id: 'q1',
      type: 'text',
      question: 'Write a 100-word summary of the article’s key points.',
      required: true
    },
    {
      id: 'q2',
      type: 'opinion',
      question: 'Does the article’s argument seem well-supported? sampleA: “Yes, every claim is backed by evidence and citations.” sampleB: “Some claims lack supporting data.” sampleC: “Mostly opinion-based without references.”',
      options: ['Yes', 'No', 'Partially'],
      required: true
    },
    {
      id: 'q3',
      type: 'text',
      question: 'List 2 takeaways that could improve AI content understanding.',
      required: true
    },
    {
      id: 'q4',
      type: 'file',
      question: 'Upload your summary document (PDF/DOCX)',
      acceptedFormats: '.pdf,.docx',
      required: true
    }
  ]
}
,{
  id: 'task13',
  title: 'Detect Spam Messages in Customer Chats',
  category: 'Data Cleaning',
  paymentAmount: 18,
  duration: '45 mins',
  difficulty: 'Beginner',
  questions: [
    {
      id: 'q1',
      type: 'opinion',
      question: 'Classify this message as spam or not. sampleA: “Buy our product now and get 50% off!” sampleB: “Hey, are you coming to the meeting today?”',
      options: ['Spam', 'Not Spam'],
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question: 'Explain why a message might be flagged as spam.',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',
      question: 'How critical is manual review for spam detection? sampleA: “Automated filters often miss subtle spam.” sampleB: “Most spam is obvious and can be auto-detected.”',
      options: ['Essential', 'Optional', 'Not Needed'],
      required: true
    },
    {
      id: 'q4',
      type: 'file',
      question: 'Upload your classification notes (PDF/DOCX)',
      acceptedFormats: '.pdf,.docx',
      required: true
    }
  ]
}
,{
  id: 'task14',
  title: 'Rate Product Review Helpfulness',
  category: 'User Experience Evaluation',
  paymentAmount: 16,
  duration: '30 mins',
  difficulty: 'Beginner',
  questions: [
    {
      id: 'q1',
      type: 'opinion',
      question: 'Rate this review’s usefulness. sampleA: “This product exceeded my expectations in every way.” sampleB: “It was okay, nothing special.”',
      options: ['Very Useful', 'Somewhat Useful', 'Not Useful'],
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question: 'Explain why you rated it this way.',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',
      question: 'Which factors improve review usefulness? sampleA: “Detailed description of features.” sampleB: “Short but clear opinion.” sampleC: “Includes personal story or example.”',
      options: ['Detail', 'Length', 'Tone'],
      required: true
    },
    {
      id: 'q4',
      type: 'file',
      question: 'Upload your evaluation notes (PDF/DOCX)',
      acceptedFormats: '.pdf,.docx',
      required: true
    }
  ]
}
,{
  id: 'task15',
  title: 'Rate Text and Image Responses from AI Chatbots',
  category: 'AI Evaluation',
  paymentAmount: 20,
  duration: '45 mins',
  difficulty: 'Intermediate',
  questions: [
    {
      id: 'q1',
      type: 'opinion',
      question: 'Which AI text response sounds more natural? sampleA: “I had a great day, thanks for asking!” sampleB: “My day went well, thank you for asking.”',
      options: ['Response A', 'Response B', 'Both Equal'],
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question: 'Describe one thing that makes an AI response feel human-like.',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',
      question: 'Which response better follows the user’s tone? sampleA: “Sure! I’d love to help you with that.” sampleB: “Yes, I can assist you with that.”',
      options: ['A', 'B', 'Neither'],
      required: true
    },
    {
      id: 'q4',
      type: 'text',
      question: 'Write a short improved version of a chatbot reply to “How’s your day?”',
      required: true
    },
    {
      id: 'q5',
      type: 'file',
      question: 'Draw and label a flow diagram showing how you evaluated the AI responses, then upload (PDF/DOCX/PNG).',
      acceptedFormats: '.pdf,.docx,.png',
      required: true
    }
  ]
}
,{
  id: 'task16',
  title: 'Annotate Emotions in Voice Recordings',
  category: 'Audio Labeling',
  paymentAmount: 25,
  duration: '1h',
  difficulty: 'Advanced',
  questions: [
    {
      id: 'q1',
      type: 'opinion',
      question: 'Which emotion best fits this description: calm tone, steady pace? sampleA: “Hello, I hope everything is okay today.” sampleB: “I am frustrated with this situation.”',
      options: ['Happy', 'Sad', 'Neutral', 'Angry'],
      required: true
    },
    {
      id: 'q2',
      type: 'text',
      question: 'Explain how emotion labeling improves AI assistants.',
      required: true
    },
    {
      id: 'q3',
      type: 'opinion',
      question: 'How confident are you in your labeling decisions? sampleA: “I am certain about the emotions detected.” sampleB: “I am unsure about some clips.”',
      options: ['Very confident', 'Somewhat confident', 'Unsure'],
      required: true
    },
    {
      id: 'q4',
      type: 'file',
      question: 'Upload your annotation notes and labeled audio (PDF/DOCX/ZIP)',
      acceptedFormats: '.pdf,.docx,.zip',
      required: true
    }
  ]
}
,  {
    id: 'task17',
    title: 'Classify Social Media Posts by Topic',
    category: 'Content Categorization',
    paymentAmount: 20,
    duration: '50 mins',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Classify this post: sampleA: “Check out my new tech gadget review.”, sampleB: “Political debate heats up in parliament.”, sampleC: “Here’s my recipe for chocolate cake.”',
        options: ['Technology', 'Politics', 'Food', 'Other'],
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'What is the sentiment of this post? sampleA: “I love this product, works perfectly!”, sampleB: “I hate waiting in lines, terrible service.”, sampleC: “It’s okay, nothing special.”',
        options: ['Positive', 'Negative', 'Neutral'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'Explain why you chose the topic and sentiment for the post.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your post classification notes (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task18',
    title: 'Rate AI-Generated Marketing Copy',
    category: 'Marketing Evaluation',
    paymentAmount: 28,
    duration: '1h',
    difficulty: 'Advanced',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which marketing copy is more persuasive? sampleA: “Unlock your potential with our AI platform.”, sampleB: “Our AI helps you reach new heights effortlessly.”, sampleC: “Get smarter with AI today!”',
        options: ['Copy A', 'Copy B', 'Copy C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Write one improvement suggestion for the less effective copy.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which tone is more suitable for social media ads? sampleA: “Friendly and casual.”, sampleB: “Professional and authoritative.”, sampleC: “Funny and playful.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task19',
    title: 'Transcribe Short Podcast Clips',
    category: 'Transcription',
    paymentAmount: 22,
    duration: '45 mins',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Transcribe the clip accurately.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which transcription is more readable? sampleA: “AI is changing the world, one algorithm at a time.”, sampleB: “Artificial intelligence changes the world with each algorithm.”',
        options: ['A', 'B', 'Both Equal'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'Describe challenges you faced while transcribing the clip.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your transcription file (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task20',
    title: 'Annotate Objects in Street Images',
    category: 'Data Labeling',
    paymentAmount: 30,
    duration: '1h',
    difficulty: 'Advanced',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which objects are present in the image? sampleA: “Pedestrian crossing and traffic light.”, sampleB: “Parked cars and street sign.”, sampleC: “Cyclist and trash bin.”',
        options: ['A', 'B', 'C', 'Multiple'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Describe any safety hazards visible in the image.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'How critical is labeling accuracy for AI training? sampleA: “Errors may cause AI misbehavior.”, sampleB: “Minor errors have little impact.”',
        options: ['Critical', 'Somewhat Important', 'Not Important'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload annotated image with labels (PDF/DOCX/PNG)',
        acceptedFormats: '.pdf,.docx,.png',
        required: true
      }
    ]
  },
  {
    id: 'task21',
    title: 'Evaluate AI-Generated Quiz Questions',
    category: 'AI Evaluation',
    paymentAmount: 26,
    duration: '50 mins',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which AI-generated question is better? sampleA: “What is the capital of Kenya?”, sampleB: “Name the largest city in Kenya.”, sampleC: “Which city in Kenya has the most population?”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Suggest one improvement for the less effective question.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which question is most suitable for beginners? sampleA: “Easy fact-based.”, sampleB: “Moderate difficulty.”, sampleC: “Advanced reasoning.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes and suggested improvements (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },{
    id: 'task22',
    title: 'Label Emotions in Short Video Clips',
    category: 'Video Labeling',
    paymentAmount: 28,
    duration: '1h',
    difficulty: 'Advanced',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which emotion best fits the clip? sampleA: “Person smiling and laughing.”, sampleB: “Person frowning and sighing.”, sampleC: “Person with neutral expression.”',
        options: ['Happy', 'Sad', 'Neutral', 'Angry'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Explain why you selected this emotion.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'How confident are you in your labeling? sampleA: “I am very sure.”, sampleB: “Somewhat sure.”, sampleC: “Unsure.”',
        options: ['Very confident', 'Somewhat confident', 'Unsure'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload annotated video clip with emotion labels (PDF/DOCX/ZIP)',
        acceptedFormats: '.pdf,.docx,.zip',
        required: true
      }
    ]
  },
  {
    id: 'task23',
    title: 'Summarize Product Features for AI Tools',
    category: 'Content Summarization',
    paymentAmount: 24,
    duration: '45 mins',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Summarize key features in 100 words.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which feature description is clearer? sampleA: “AI learns your preferences automatically.”, sampleB: “Machine learning adapts to your behavior over time.”',
        options: ['A', 'B', 'Both Equal'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'List one improvement to make the feature description more user-friendly.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your summarized document (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task24',
    title: 'Evaluate AI-Generated Captions for Images',
    category: 'AI Evaluation',
    paymentAmount: 22,
    duration: '50 mins',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which caption best describes the image? sampleA: “A dog playing in the park.”, sampleB: “A happy dog enjoying outdoors.”, sampleC: “Canine having fun on grass.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Write one improved caption that is more engaging.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which caption is more suitable for social media? sampleA: “Simple and factual.”, sampleB: “Emotionally engaging.”, sampleC: “Funny and playful.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes and improved captions (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task25',
    title: 'Transcribe Customer Support Calls',
    category: 'Transcription',
    paymentAmount: 30,
    duration: '1h 15m',
    difficulty: 'Advanced',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Transcribe the provided audio clip.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which transcription reads more clearly? sampleA: “I need help with my order, please.”, sampleB: “Could you assist me regarding my purchase?”',
        options: ['A', 'B', 'Both Equal'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'Describe any challenges you faced while transcribing.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your transcription file (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task26',
    title: 'Label Traffic Signs in Street View Images',
    category: 'Data Labeling',
    paymentAmount: 32,
    duration: '1h',
    difficulty: 'Advanced',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which signs are visible in the image? sampleA: “Stop sign and pedestrian crossing.”, sampleB: “Speed limit and no parking signs.”, sampleC: “Traffic light and yield sign.”',
        options: ['A', 'B', 'C', 'Multiple'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Describe any potential hazards for AI detection in this image.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'How important is accurate labeling for AI traffic applications? sampleA: “Errors may cause accidents.”, sampleB: “Minor mistakes are tolerable.”',
        options: ['Critical', 'Somewhat Important', 'Not Important'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload annotated image with labels (PDF/DOCX/PNG)',
        acceptedFormats: '.pdf,.docx,.png',
        required: true
      }
    ]
  },  
  {
    id: 'task27',
    title: 'Evaluate AI Chatbot Story Responses',
    category: 'AI Evaluation',
    paymentAmount: 28,
    duration: '1h',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which AI response tells a more coherent story? sampleA: “The dragon flew over the castle at dawn.”, sampleB: “At sunrise, the dragon soared above the ancient fortress.”, sampleC: “A castle was seen by the dragon in the morning.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Describe one improvement to make the story more engaging.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which version feels more natural for children? sampleA: “Simple and clear.”, sampleB: “Detailed and descriptive.”, sampleC: “Funny and imaginative.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes and suggested improvements (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task28',
    title: 'Summarize Customer Feedback Comments',
    category: 'Content Summarization',
    paymentAmount: 24,
    duration: '50 mins',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Summarize the following comments in 100 words.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which summary captures the sentiment better? sampleA: “Customers love the ease of use but complain about delivery.”, sampleB: “Positive feedback on usability, negative on shipping delays.”, sampleC: “Some like it, some dislike the shipping time.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'Suggest one improvement to make the summary clearer.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your summarized feedback document (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task29',
    title: 'Rate AI-Generated Blog Titles',
    category: 'Marketing Evaluation',
    paymentAmount: 22,
    duration: '40 mins',
    difficulty: 'Beginner',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which title is more engaging? sampleA: “Top 10 AI Tools to Boost Productivity”, sampleB: “Boost Your Productivity with These AI Tools”, sampleC: “Productivity Hacks Using AI Technology”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Write one suggestion to make the least effective title more catchy.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which tone is most suitable for social media? sampleA: “Professional.”, sampleB: “Fun and playful.”, sampleC: “Informative but casual.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task30',
    title: 'Transcribe Short Interview Clips',
    category: 'Transcription',
    paymentAmount: 26,
    duration: '45 mins',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Transcribe the provided audio clip accurately.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which transcription reads more naturally? sampleA: “I enjoy using AI for daily tasks.”, sampleB: “Using AI for everyday tasks is enjoyable.”, sampleC: “AI makes daily tasks fun and easy.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'Describe any difficulties you faced while transcribing.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your transcription file (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  }, {
    id: 'task31',
    title: 'Evaluate AI-Generated Social Media Captions',
    category: 'Marketing Evaluation',
    paymentAmount: 24,
    duration: '50 mins',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which caption is more engaging? sampleA: “Boost your productivity with AI today!”, sampleB: “Discover how AI can make your life easier!”, sampleC: “AI tools to supercharge your daily tasks!”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Write one suggestion to improve the least effective caption.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which caption tone suits Instagram best? sampleA: “Professional and serious.”, sampleB: “Fun and casual.”, sampleC: “Informative and friendly.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes with suggested improvements (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task32',
    title: 'Label Facial Expressions in Photos',
    category: 'Image Labeling',
    paymentAmount: 30,
    duration: '1h 15m',
    difficulty: 'Advanced',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which expression is most visible? sampleA: “Person smiling broadly.”, sampleB: “Person frowning slightly.”, sampleC: “Person with neutral expression.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Explain your choice of emotion labeling.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'How confident are you in your labeling? sampleA: “Very confident.”, sampleB: “Somewhat confident.”, sampleC: “Unsure.”',
        options: ['Very confident', 'Somewhat confident', 'Unsure'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload annotated photo with labeled expressions (PDF/DOCX/PNG)',
        acceptedFormats: '.pdf,.docx,.png',
        required: true
      }
    ]
  },
  {
    id: 'task33',
    title: 'Summarize Technical Documentation',
    category: 'Content Summarization',
    paymentAmount: 36,
    duration: '1h 30m',
    difficulty: 'Expert',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Write a 150-word summary highlighting key technical points.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which summary version is clearer? sampleA: “Explains step-by-step procedures concisely.”, sampleB: “Gives detailed explanations with examples.”, sampleC: “Summarizes main concepts only.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'Suggest one improvement to make the documentation easier to understand.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your summarized document (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task34',
    title: 'Evaluate AI-Generated Joke Responses',
    category: 'AI Evaluation',
    paymentAmount: 20,
    duration: '40 mins',
    difficulty: 'Beginner',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which AI joke is funnier? sampleA: “Why did the robot go to school? Because it had class.”, sampleB: “Why did the AI cross the road? To optimize its route.”, sampleC: “Why was the computer cold? It left its Windows open.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Write a short improved version of the funniest joke.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which joke tone is suitable for social media? sampleA: “Clever and witty.”, sampleB: “Silly and playful.”, sampleC: “Educational and punny.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes and improved joke (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task35',
    title: 'Transcribe Short Educational Podcasts',
    category: 'Transcription',
    paymentAmount: 28,
    duration: '1h',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Transcribe the provided audio clip accurately.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which transcription version reads better? sampleA: “AI can help students learn faster.”, sampleB: “Students can learn more quickly using AI.”, sampleC: “Using AI, students enhance learning speed.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'Describe any challenges you faced while transcribing.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your transcription file (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },  {
    id: 'task36',
    title: 'Rate AI-Generated Marketing Emails',
    category: 'Marketing Evaluation',
    paymentAmount: 26,
    duration: '50 mins',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which email subject line is more compelling? sampleA: “Unlock Your AI Potential Today!”, sampleB: “Discover the Power of AI for Your Business”, sampleC: “AI Tools to Transform Your Workflow”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Suggest one improvement for the least engaging subject line.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which tone is best for professional audiences? sampleA: “Formal and informative.”, sampleB: “Friendly and approachable.”, sampleC: “Creative and catchy.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes and suggestions (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task37',
    title: 'Label Objects in Home Interior Images',
    category: 'Image Labeling',
    paymentAmount: 34,
    duration: '1h 20m',
    difficulty: 'Advanced',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which objects are present in the living room? sampleA: “Sofa, coffee table, floor lamp.”, sampleB: “Bookshelf, chair, rug.”, sampleC: “Television, plant, armchair.”',
        options: ['A', 'B', 'C', 'Multiple'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Describe any potential labeling challenges in this image.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'How important is accurate labeling for AI interior design apps? sampleA: “Critical for recommendations.”, sampleB: “Moderately important.”, sampleC: “Not very important.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload annotated image with labeled objects (PDF/DOCX/PNG)',
        acceptedFormats: '.pdf,.docx,.png',
        required: true
      }
    ]
  },
  {
    id: 'task38',
    title: 'Summarize Customer Support Chat Logs',
    category: 'Content Summarization',
    paymentAmount: 30,
    duration: '1h',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Write a 100-word summary highlighting main customer issues and solutions.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which summary version is clearer? sampleA: “Concise and structured summary.”, sampleB: “Detailed explanation with examples.”, sampleC: “Highlights only key complaints.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'Suggest one improvement to make the summary easier to read.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your summarized chat logs (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task39',
    title: 'Evaluate AI-Generated Social Media Replies',
    category: 'AI Evaluation',
    paymentAmount: 22,
    duration: '45 mins',
    difficulty: 'Beginner',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which AI reply is most appropriate? sampleA: “Thank you for your comment! We appreciate your feedback.”, sampleB: “Thanks! Glad you liked it.”, sampleC: “We value your input and will consider it.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Write one improved version of the most casual reply.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which tone works best for Twitter? sampleA: “Formal.”, sampleB: “Friendly.”, sampleC: “Funny.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes and improved replies (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task40',
    title: 'Transcribe Short Motivational Speeches',
    category: 'Transcription',
    paymentAmount: 28,
    duration: '1h',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Transcribe the provided audio clip accurately.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which transcription version reads better? sampleA: “Believe in yourself and take action every day.”, sampleB: “Every day, take action and believe in your potential.”, sampleC: “Trust yourself and act daily.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'Describe any challenges you faced while transcribing.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your transcription file (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },  {
    id: 'task41',
    title: 'Rate AI-Generated LinkedIn Posts',
    category: 'Marketing Evaluation',
    paymentAmount: 25,
    duration: '50 mins',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which LinkedIn post is most professional? sampleA: “Unlock your career potential with AI tools.”, sampleB: “Boost your career with cutting-edge AI solutions.”, sampleC: “Explore AI innovations to enhance your work.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Suggest one improvement for the least professional post.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which post tone is best for engagement? sampleA: “Formal.”, sampleB: “Friendly.”, sampleC: “Inspirational.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes and suggestions (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task42',
    title: 'Label Vehicles in Street Photos',
    category: 'Image Labeling',
    paymentAmount: 33,
    duration: '1h 20m',
    difficulty: 'Advanced',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which vehicles are present? sampleA: “Car, motorcycle, bus.”, sampleB: “Truck, van, bicycle.”, sampleC: “Taxi, scooter, pedestrian.”',
        options: ['A', 'B', 'C', 'Multiple'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Describe any labeling challenges in this image.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'How important is accurate vehicle labeling for AI traffic systems? sampleA: “Critical.”, sampleB: “Moderate.”, sampleC: “Not important.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload annotated image with labeled vehicles (PDF/DOCX/PNG)',
        acceptedFormats: '.pdf,.docx,.png',
        required: true
      }
    ]
  },
  {
    id: 'task43',
    title: 'Summarize AI Research Papers',
    category: 'Content Summarization',
    paymentAmount: 40,
    duration: '2h',
    difficulty: 'Expert',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Write a 150-word summary highlighting the paper’s key AI contributions.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which summary version is most precise? sampleA: “Concise and focused on results.”, sampleB: “Includes methodology and discussion.”, sampleC: “Highlights implications and future work.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'List two ways the summary could help AI content understanding.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your summarized paper document (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task44',
    title: 'Evaluate AI Chatbot Humor',
    category: 'AI Evaluation',
    paymentAmount: 22,
    duration: '45 mins',
    difficulty: 'Beginner',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which chatbot joke is funniest? sampleA: “Why did the AI go to school? To improve its algorithms.”, sampleB: “Why did the robot eat lunch alone? It needed bytes.”, sampleC: “Why was the computer tired? It had too many tabs open.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Write a short improved version of the funniest joke.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which joke tone is best for social media? sampleA: “Clever.”, sampleB: “Silly.”, sampleC: “Punny.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes and improved joke (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task45',
    title: 'Transcribe Educational Interview Clips',
    category: 'Transcription',
    paymentAmount: 28,
    duration: '1h',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Transcribe the provided interview clip accurately.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which transcription version is clearer? sampleA: “Teachers should embrace AI in classrooms.”, sampleB: “Classrooms benefit when teachers use AI.”, sampleC: “Integrating AI enhances classroom teaching.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'Describe any challenges faced during transcription.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your transcription file (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  }, {
    id: 'task46',
    title: 'Rate AI-Generated YouTube Video Titles',
    category: 'Marketing Evaluation',
    paymentAmount: 27,
    duration: '50 mins',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which video title is most click-worthy? sampleA: “Top 5 AI Tools for Productivity”, sampleB: “Boost Your Workflow with These AI Hacks”, sampleC: “AI Innovations That Will Change Your Life”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Suggest one improvement for the least engaging title.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which title tone is best for tech enthusiasts? sampleA: “Informative.”, sampleB: “Friendly.”, sampleC: “Exciting.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes and improved title suggestions (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task47',
    title: 'Label Animals in Wildlife Photos',
    category: 'Image Labeling',
    paymentAmount: 35,
    duration: '1h 30m',
    difficulty: 'Advanced',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which animals are present in the image? sampleA: “Lion, elephant, zebra.”, sampleB: “Giraffe, hyena, wildebeest.”, sampleC: “Leopard, buffalo, gazelle.”',
        options: ['A', 'B', 'C', 'Multiple'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Describe any labeling challenges you noticed.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'How important is labeling accuracy for wildlife conservation AI? sampleA: “Critical.”, sampleB: “Moderate.”, sampleC: “Low importance.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your annotated wildlife image (PDF/DOCX/PNG)',
        acceptedFormats: '.pdf,.docx,.png',
        required: true
      }
    ]
  },
  {
    id: 'task48',
    title: 'Summarize AI Conference Presentations',
    category: 'Content Summarization',
    paymentAmount: 38,
    duration: '2h',
    difficulty: 'Expert',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Write a 150-word summary of the presentation key points.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which summary version is most concise? sampleA: “Focuses on AI results and insights.”, sampleB: “Includes methodology and examples.”, sampleC: “Highlights implications and future work.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'List two ways this summary could improve AI content analysis.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your summarized presentation document (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task49',
    title: 'Evaluate AI Responses for Customer Complaints',
    category: 'AI Evaluation',
    paymentAmount: 24,
    duration: '45 mins',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'opinion',
        question: 'Which AI response resolves the complaint best? sampleA: “We apologize and will process your refund immediately.”, sampleB: “Sorry for the inconvenience, your request is being reviewed.”, sampleC: “We appreciate your feedback and will take action.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Write a short improved version of the least empathetic response.',
        required: true
      },
      {
        id: 'q3',
        type: 'opinion',
        question: 'Which response tone is most professional? sampleA: “Formal.”, sampleB: “Friendly.”, sampleC: “Empathetic.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your evaluation notes and improved responses (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
    id: 'task50',
    title: 'Transcribe Motivational Podcasts',
    category: 'Transcription',
    paymentAmount: 30,
    duration: '1h',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q1',
        type: 'text',
        question: 'Transcribe the provided podcast clip accurately.',
        required: true
      },
      {
        id: 'q2',
        type: 'opinion',
        question: 'Which transcription version reads best? sampleA: “Consistency and hard work lead to success.”, sampleB: “Success comes to those who work consistently.”, sampleC: “Hard work and persistence bring achievement.”',
        options: ['A', 'B', 'C'],
        required: true
      },
      {
        id: 'q3',
        type: 'text',
        question: 'Describe any challenges you faced while transcribing.',
        required: true
      },
      {
        id: 'q4',
        type: 'file',
        question: 'Upload your transcription file (PDF/DOCX)',
        acceptedFormats: '.pdf,.docx',
        required: true
      }
    ]
  },
  {
  id: 'task51',
  title: 'Analyze Social Media Trends',
  category: 'Research',
  paymentAmount: 35,
  duration: '45m',
  difficulty: 'Intermediate',
  questions: [
    {
      id: 'q1',
      type: 'text',
      question: 'Identify one trending topic on social media today and summarize it in your own words.',
      required: true
    },
    {
      id: 'q2',
      type: 'opinion',
      question: 'Which trend description sounds most engaging? sampleA: “A rapid surge in online discussions.”, sampleB: “A viral topic gaining massive attention.”, sampleC: “A widely shared theme shaping conversations.”',
      options: ['A', 'B', 'C'],
      required: true
    },
    {
      id: 'q3',
      type: 'text',
      question: 'Explain why you think this trend gained popularity.',
      required: true
    },
    {
      id: 'q4',
      type: 'file',
      question: 'Upload a screenshot or document showing examples of posts related to the trend.',
      acceptedFormats: '.png,.jpg,.jpeg,.pdf,.docx',
      required: true
    }
  ]
}
];

export default availableTasks;
