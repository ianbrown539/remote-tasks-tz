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
        "question": "What is your first name and where do you currently live in Tanzania?",
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
        "options": ["Below 200,000", "200,000 - 500,000", "500,001 - 1000,000", "1000,001 - 2000,000", "Above 2000,000"],
        "required": true
      }
    ]
  },

  {
    "id": "task1",
    "title": "Evaluate AI Training Data for Tanzanian Contexts",
    "category": "AI Training",
    "paymentAmount": 20,
    "duration": "45 mins",
    "difficulty": "Intermediate",
    "questions": [
      {
        "id": "q1",
        "type": "opinion",
        "question": "Below are two AI training examples for recognizing Tanzanian landmarks. Which one provides better context for an AI model? A: Image of Mount Kilimanjaro with label 'mountain'. B: Image of Mount Kilimanjaro with label 'Tanzania's highest peak, often snow-capped, cultural symbol for Chagga people'.",
        "options": ["Example A", "Example B", "Both Equal"],
        "required": true
      },
      {
        "id": "q2",
        "type": "opinion",
        "question": "A dataset includes audio clips of Swahili spoken in Dar es Salaam. Which labeling is more useful for AI speech recognition? A: 'Swahili audio'. B: 'Urban Tanzanian Swahili with coastal accents, including slang like 'mambo vipi''. ",
        "options": ["Label A", "Label B", "Both Equal"],
        "required": true
      },
      {
        "id": "q3",
        "type": "text",
        "question": "List two qualities that make training data for Tanzanian AI applications culturally sensitive and accurate.",
        "required": true
      },
      {
        "id": "q4",
        "type": "text",
        "question": "Rewrite this generic AI training prompt to incorporate Tanzanian elements: 'Generate text about African wildlife.'",
        "required": true
      },
      {
        "id": "q5",
        "type": "opinion",
        "question": "Two datasets for AI sentiment analysis on Tanzanian social media. Which is more comprehensive? A: Posts in English only. B: Posts in Swahili and English, including emojis and local idioms.",
        "options": ["Dataset A", "Dataset B", "Both Equal"],
        "required": true
      },
      {
        "id": "q6",
        "type": "text",
        "question": "Suggest one improvement for AI training datasets when handling Tanzanian multicultural diversity to avoid biases.",
        "required": true
      }
    ]
  },
  {
    "id": "task2",
    "title": "Assess Community Initiatives in Tanzanian Villages",
    "category": "Community",
    "paymentAmount": 25,
    "duration": "1h 15m",
    "difficulty": "Expert",
    "questions": [
      {
        "id": "q1",
        "type": "text",
        "question": "Describe a successful community water project in rural Tanzania, like those in Arusha, and explain its impact on local health.",
        "required": true
      },
      {
        "id": "q2",
        "type": "text",
        "question": "Suggest a modern twist on traditional Tanzanian community gatherings (e.g., 'ngoma' dances) to promote environmental awareness.",
        "required": true
      },
      {
        "id": "q3",
        "type": "opinion",
        "question": "Which approach to community empowerment in Tanzania is more effective? SampleA: Top-down government programs. SampleB: Grassroots initiatives led by local Maasai elders.",
        "options": ["Approach A", "Approach B", "Both Equal"],
        "required": true
      },
      {
        "id": "q4",
        "type": "text",
        "question": "Give an example of how microfinance has transformed a women's cooperative in Tanzanian communities like those in Mwanza.",
        "required": true
      },
      {
        "id": "q5",
        "type": "opinion",
        "question": "Two community health campaigns in Tanzania. Which feels more inclusive? A: Focus on urban Dar es Salaam only. B: Nationwide, incorporating tribal languages and customs.",
        "options": ["Campaign A", "Campaign B", "Both Equal"],
        "required": true
      },
      {
        "id": "q6",
        "type": "text",
        "question": "Rewrite this formal description of a Tanzanian community event to make it more engaging: 'Villagers gather for annual harvest festival.'",
        "required": true
      }
    ]
  },
  {
    "id": "task3",
    "title": "Analyze Tanzanian Political Debates and Policies",
    "category": "Politics",
    "paymentAmount": 22,
    "duration": "1h",
    "difficulty": "Advanced",
    "questions": [
      {
        "id": "q1",
        "type": "text",
        "question": "Write a 120–150 word summary of a key policy from Tanzania's CCM party on economic development in regions like Dodoma.",
        "required": true
      },
      {
        "id": "q2",
        "type": "text",
        "question": "Rewrite this neutral statement on Tanzanian elections to highlight youth involvement: 'Elections occur every five years.'",
        "required": true
      },
      {
        "id": "q3",
        "type": "opinion",
        "question": "Which headline better captures a Tanzanian political reform? SampleA: 'Government Updates Laws'. SampleB: 'Tanzania's Bold Move: Empowering Women in Politics Through New Quotas'.",
        "options": ["Headline A", "Headline B", "Both Equal"],
        "required": true
      },
      {
        "id": "q4",
        "type": "text",
        "question": "List three challenges facing Tanzanian politics in the context of multiparty democracy.",
        "required": true
      },
      {
        "id": "q5",
        "type": "opinion",
        "question": "Which tone suits discussions on Tanzanian foreign policy better?",
        "options": ["Neutral and factual", "Passionate and opinionated", "Humorous and light-hearted"],
        "required": true
      },
      {
        "id": "q6",
        "type": "text",
        "question": "Improve this brief on a political figure: 'Samia Suluhu Hassan is president.'",
        "required": true
      }
    ]
  },
  {
    "id": "task4",
    "title": "Develop Educational Content for Tanzanian Schools",
    "category": "Education",
    "paymentAmount": 30,
    "duration": "2h",
    "difficulty": "Advanced",
    "questions": [
      {
        "id": "q1",
        "type": "text",
        "question": "Write a 20–30 second script for a lesson intro on Tanzanian history, focusing on Julius Nyerere's Ujamaa philosophy.",
        "required": true
      },
      {
        "id": "q2",
        "type": "text",
        "question": "Create an engaging hook for a class on environmental education in Tanzanian coastal schools.",
        "required": true
      },
      {
        "id": "q3",
        "type": "opinion",
        "question": "Which teaching style fits Tanzanian STEM education best?",
        "options": ["Lecture-based", "Hands-on experiments", "Storytelling with local examples"],
        "required": true
      },
      {
        "id": "q4",
        "type": "text",
        "question": "Turn this fact into an interactive question for students: 'Lake Victoria is shared by Tanzania.'",
        "required": true
      },
      {
        "id": "q5",
        "type": "opinion",
        "question": "Two lesson plans for Tanzanian civics. Which opener is stronger? SampleA: 'Today we learn about government.' SampleB: 'Imagine leading Tanzania—what changes would you make?'",
        "options": ["Plan A", "Plan B", "Both Equal"],
        "required": true
      },
      {
        "id": "q6",
        "type": "text",
        "question": "Write a 10–15 second conclusion for a Tanzanian language arts lesson that motivates students.",
        "required": true
      }
    ]
  },
  {
    "id": "task5",
    "title": "Explore Tanzanian Music Genres and Artists",
    "category": "Music",
    "paymentAmount": 15,
    "duration": "30 mins",
    "difficulty": "Beginner",
    "questions": [
      {
        "id": "q1",
        "type": "opinion",
        "question": "In a description of Bongo Flava, what is the main element? Options: Fusion of hip-hop and traditional Tanzanian rhythms, Pure Western pop influence, Classical African drumming, Unclear.",
        "options": ["Fusion of hip-hop and traditional Tanzanian rhythms", "Pure Western pop influence", "Classical African drumming", "Unclear"],
        "required": true
      },
      {
        "id": "q2",
        "type": "text",
        "question": "Describe one lesser-known aspect of Taarab music from Zanzibar.",
        "required": true
      },
      {
        "id": "q3",
        "type": "opinion",
        "question": "If discussing Diamond Platnumz, how would you classify his impact on Tanzanian music?",
        "options": ["Global ambassador", "Local talent only", "No impact", "Unclear"],
        "required": true
      },
      {
        "id": "q4",
        "type": "text",
        "question": "List at least three instruments commonly used in Tanzanian traditional music.",
        "required": true
      },
      {
        "id": "q5",
        "type": "opinion",
        "question": "Two descriptions of Singeli genre. Which is more accurate? A: Slow and melodic. B: Fast-paced electronic dance music from Dar es Salaam streets.",
        "options": ["A", "B", "Both Equal"],
        "required": true
      },
      {
        "id": "q6",
        "type": "text",
        "question": "Explain why blending modern and traditional elements is important for Tanzanian music evolution.",
        "required": true
      }
    ]
  },

{
"id": "task6",
"title": "Translate English Sentences to Kiswahili",
"category": "Kiswahili Translation",
"paymentAmount": 18,
"duration": "40 mins",
"difficulty": "Beginner",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Translate this English sentence to natural Kiswahili: 'The quick brown fox jumps over the lazy dog.'",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Translate: 'I am going to the market to buy some fruits.'",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Which Kiswahili translation sounds more natural for 'Hello, how are you?': A: 'Habari, unaendeleaje?' B: 'Hujambo, habari yako?'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Provide a Kiswahili translation for: 'Education is the key to success.'",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Translate this sentence: 'The weather is very hot today.'",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "For the sentence 'I love my family.', which translation is better? A: 'Ninapenda familia yangu.' B: 'Napenda familia yangu.'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Translate: 'Please help me with this task.'",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Give a natural Kiswahili version of: 'Time flies when you're having fun.'",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Which option is a better translation for 'Good morning'? A: 'Habari za asubuhi.' B: 'Asubuhi njema.'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Translate: 'She is reading a book in the library.'",
"required": true
}
]
},
{
"id": "task7",
"title": "Correct Grammar in Kiswahili Sentences",
"category": "Kiswahili Grammar Correction",
"paymentAmount": 20,
"duration": "50 mins",
"difficulty": "Intermediate",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Correct this Kiswahili sentence: 'Mimi naenda shule kila siku.'",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Fix the grammar: 'Watoto wacheza mpira sokoni.'",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Which sentence is grammatically correct? A: 'Kitabu hiki ni kizuri.' B: 'Kitabu hii ni kizuri.'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Correct: 'Yeye amekuja nyumbani mapema leo.'",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Improve this: 'Tumefika mji mkubwa.'",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Choose the correct form: A: 'Mwalimu wetu ni hodari.' B: 'Mwalimu wetu ni hodhari.'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Correct the error: 'Hii ni gari la baba yangu.'",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Fix: 'Sisi tulikula matunda mingi.'",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Which is better? A: 'Nyumba yetu ni kubwa.' B: 'Nyumba yetu ni mkubwa.'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Correct: 'Wanafunzi wanasoma kwa bidii.'",
"required": true
},
{
"id": "q11",
"type": "text",
"question": "Improve grammar: 'Huyo ni rafiki yangu mzuri.'",
"required": true
},
{
"id": "q12",
"type": "opinion",
"question": "Select correct: A: 'Mti huu ni mrefu.' B: 'Mti hii ni mrefu.'",
"options": ["A", "B", "Both Equal"],
"required": true
}
]
},
{
"id": "task8",
"title": "Evaluate AI Responses in Kiswahili",
"category": "AI Response Evaluation in Kiswahili",
"paymentAmount": 25,
"duration": "1h",
"difficulty": "Intermediate",
"questions": [
{
"id": "q1",
"type": "opinion",
"question": "Which AI response in Kiswahili is more natural for 'Habari yako?': A: 'Nzuri, na wewe?' B: 'Sijambo, asante.'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Suggest an improvement for this AI Kiswahili response: 'Mimi ni AI.'",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Rate which response is supportive: A: 'Usijali.' B: 'Pole, nitakusaidia.'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Rewrite this robotic Kiswahili AI reply: 'Hii ni habari.'",
"required": true
},
{
"id": "q5",
"type": "opinion",
"question": "Which is more accurate? A: 'Samaki ni mzuri.' B: 'Samaki ni kitamu.'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q6",
"type": "text",
"question": "List two qualities for good Kiswahili AI responses.",
"required": true
},
{
"id": "q7",
"type": "opinion",
"question": "Choose better response: A: 'Asante kwa swali.' B: 'Karibu tena.'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Improve: 'Watu wengi wanaenda sokoni.'",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Which sounds human-like? A: 'Hapana shida.' B: 'Sio tatizo.'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Suggest fix for repetitive AI in Kiswahili.",
"required": true
},
{
"id": "q11",
"type": "opinion",
"question": "Better for greeting: A: 'Jambo.' B: 'Mambo.'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q12",
"type": "text",
"question": "Describe a natural Kiswahili AI conversation flow.",
"required": true
},
{
"id": "q13",
"type": "opinion",
"question": "Which is empathetic? A: 'Sawa.' B: 'Samahani kwa hilo.'",
"options": ["A", "B", "Both Equal"],
"required": true
}
]
},
{
"id": "task9",
"title": "Build Kiswahili Vocabulary Lists",
"category": "Kiswahili Vocabulary Building",
"paymentAmount": 15,
"duration": "35 mins",
"difficulty": "Beginner",
"questions": [
{
"id": "q1",
"type": "text",
"question": "List 5 Kiswahili words for family members.",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Provide Kiswahili terms for colors: red, blue, green.",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Which word is more common for 'house'? A: 'Nyumba' B: 'Kaya'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "List 4 Kiswahili words related to food.",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Give Kiswahili vocabulary for school items.",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Better word for 'happy': A: 'Furaha' B: 'Shangwe'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "List 3 words for animals in Kiswahili.",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Provide terms for weather conditions.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Which for 'car'? A: 'Gari' B: 'Motokaa'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "List Kiswahili words for emotions.",
"required": true
},
{
"id": "q11",
"type": "text",
"question": "Give vocabulary for daily routines.",
"required": true
}
]
},
{
"id": "task10",
"title": "Explain Cultural Contexts in Kiswahili",
"category": "Cultural Context in Kiswahili",
"paymentAmount": 22,
"duration": "55 mins",
"difficulty": "Advanced",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Explain the cultural meaning of 'Hakuna matata' in Kiswahili context.",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Describe Tanzanian greeting customs in Kiswahili.",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Which phrase shows respect? A: 'Shikamoo' B: 'Mambo'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Explain 'Ujamaa' in Tanzanian culture.",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Describe a traditional Kiswahili wedding phrase.",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Better cultural fit: A: 'Pole kwa msiba' B: 'Hongera'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Explain the role of proverbs in Kiswahili culture.",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Describe food-related cultural terms in Kiswahili.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Which expresses hospitality? A: 'Karibu chakula' B: 'Toka hapa'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Explain 'Safari' in cultural context.",
"required": true
},
{
"id": "q11",
"type": "text",
"question": "Describe festival names in Kiswahili.",
"required": true
},
{
"id": "q12",
"type": "opinion",
"question": "Cultural importance: A: 'Asante' B: 'Hapana'",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q13",
"type": "text",
"question": "Explain respect for elders in Kiswahili terms.",
"required": true
},
{
"id": "q14",
"type": "text",
"question": "Describe music-related cultural expressions.",
"required": true
}
]
},
{
"id": "task11",
"title": "Interpret Kiswahili Proverbs",
"category": "Kiswahili Proverbs Explanation",
"paymentAmount": 24,
"duration": "1h 10m",
"difficulty": "Expert",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Explain the proverb: 'Haraka haraka haina baraka.'",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Interpret: 'Asiyekubali kushindwa si mshindani.' and give a modern example.",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Which interpretation is best for 'Samaki mkunje angali mbichi'? A: Bend fish fresh. B: Train children young.",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Give an example for 'Chema chajiuza, kibaya chajitembeza.'",
"required": true
},
{
"id": "q5",
"type": "opinion",
"question": "Better for 'Mtaka cha mvunguni sharti ainame.'? A: Bend for under bed. B: Humble for desires.",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q6",
"type": "text",
"question": "Rewrite naturally: 'Early riser gets the dew.'",
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Explain 'Akili ni mali.'",
"required": true
},
{
"id": "q8",
"type": "opinion",
"question": "Which for 'Mgeni njoo mkaribishwa'? A: Guest welcome. B: Stranger come.",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q9",
"type": "text",
"question": "Interpret 'Penye wengi pana mengi.'",
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Give example for 'Kikulacho ki nguoni mwako.'",
"required": true
}
]
},
{
"id": "task12",
"title": "Summarize Texts in Kiswahili",
"category": "Text Summarization in Kiswahili",
"paymentAmount": 19,
"duration": "45 mins",
"difficulty": "Intermediate",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Summarize this English text in Kiswahili: 'Tanzania is known for its wildlife and Mount Kilimanjaro.'",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Provide a Kiswahili summary for a short story about a lion.",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Which summary is concise? A: Long version. B: Short version.",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Summarize news about rain in Dar es Salaam in Kiswahili.",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Give a brief Kiswahili summary of a book plot.",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Better summary style: A: Detailed. B: Key points only.",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Summarize environmental issues in Kiswahili.",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Provide summary for a historical event.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Which captures essence? A: Literal. B: Interpretive.",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Summarize a recipe in Kiswahili.",
"required": true
},
{
"id": "q11",
"type": "text",
"question": "Give Kiswahili summary for tech news.",
"required": true
},
{
"id": "q12",
"type": "opinion",
"question": "Preferred for AI: A: Accurate. B: Creative.",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q13",
"type": "text",
"question": "Summarize a movie plot in Kiswahili.",
"required": true
},
{
"id": "q14",
"type": "text",
"question": "Provide summary for health tips.",
"required": true
},
{
"id": "q15",
"type": "opinion",
"question": "Which is better? A: Short. B: Long but detailed.",
"options": ["A", "B", "Both Equal"],
"required": true
}
]
},
{
"id": "task13",
"title": "Label Sentiment in Kiswahili Text",
"category": "Sentiment Analysis Labeling for Kiswahili Text",
"paymentAmount": 16,
"duration": "30 mins",
"difficulty": "Beginner",
"questions": [
{
"id": "q1",
"type": "opinion",
"question": "What is the sentiment of 'Nimefurahia sana.': Positive, Negative, Neutral?",
"options": ["Positive", "Negative", "Neutral"],
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Explain why 'Hapana shida' is neutral.",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Sentiment for 'Mambo poa': Positive, Negative, Neutral?",
"options": ["Positive", "Negative", "Neutral"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Label and explain 'Samahani kwa kosa.'",
"required": true
},
{
"id": "q5",
"type": "opinion",
"question": "For 'Furaha kubwa': Positive, Negative, Neutral?",
"options": ["Positive", "Negative", "Neutral"],
"required": true
},
{
"id": "q6",
"type": "text",
"question": "Describe sentiment in 'Huzuni inaniuma.'",
"required": true
},
{
"id": "q7",
"type": "opinion",
"question": "Sentiment: 'Sawa tu.' Positive, Negative, Neutral?",
"options": ["Positive", "Negative", "Neutral"],
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Explain positive sentiment in Kiswahili examples.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Label 'Pole sana': Positive, Negative, Neutral?",
"options": ["Positive", "Negative", "Neutral"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Give reason for neutral labels.",
"required": true
}
]
},
{
"id": "task14",
"title": "Identify Named Entities in Kiswahili",
"category": "Named Entity Recognition in Kiswahili",
"paymentAmount": 21,
"duration": "50 mins",
"difficulty": "Intermediate",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Identify entities in 'Julius Nyerere alikuwa rais wa Tanzania.'",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "List named entities in 'Dar es Salaam ni mji mkubwa.'",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Is 'Kilimanjaro' a location or person? A: Location B: Person",
"options": ["A", "B", "Neither"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Find entities in 'Zanzibar ni kisiwa.'",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Identify in 'Samia Suluhu ni rais.'",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Type for 'Serengeti': A: Organization B: Location",
"options": ["A", "B", "Neither"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "List entities in a Kiswahili sentence about Arusha.",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Identify organizations in Kiswahili text.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Is 'Tanzania' a country? A: Yes B: No",
"options": ["A", "B"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Find persons in historical Kiswahili text.",
"required": true
},
{
"id": "q11",
"type": "text",
"question": "Label locations in news snippet.",
"required": true
},
{
"id": "q12",
"type": "opinion",
"question": "Entity type for 'Azam FC': A: Organization B: Person",
"options": ["A", "B", "Neither"],
"required": true
}
]
},
{
"id": "task15",
"title": "Create Dialogues in Kiswahili",
"category": "Kiswahili Dialogue Creation",
"paymentAmount": 28,
"duration": "1h 20m",
"difficulty": "Advanced",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Write a short Kiswahili dialogue between friends greeting each other.",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Create a dialogue about buying food at market.",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Which dialogue is natural? A: Formal B: Informal",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Write dialogue for doctor-patient in Kiswahili.",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Create conversation about weather.",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Better for shop: A: Polite B: Direct",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Dialogue for family dinner discussion.",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Write teacher-student interaction.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Which sounds real? A: Scripted B: Casual",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Create dialogue for travel plans.",
"required": true
},
{
"id": "q11",
"type": "text",
"question": "Conversation about sports.",
"required": true
},
{
"id": "q12",
"type": "opinion",
"question": "Preferred style: A: Long B: Short",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q13",
"type": "text",
"question": "Dialogue for job interview in Kiswahili.",
"required": true
}
]
},
{
"id": "task16",
"title": "Detect Errors in Kiswahili Translations",
"category": "Error Detection in Kiswahili Machine Translation",
"paymentAmount": 23,
"duration": "1h",
"difficulty": "Expert",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Find error in translation: English 'Hello' to Kiswahili 'Hujambo'",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Detect mistake in 'I am fine' as 'Mimi ni mzima'.",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Is this correct? A: Yes B: No for 'Book' as 'Kitabu'",
"options": ["A", "B"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Error in 'Run fast' translated as 'Kimbia haraka'.",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Find issue in idiom translation.",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Accurate? A: 'Water' as 'Maji' B: Wrong",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Detect cultural error in translation.",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Mistake in sentence structure.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Which has error? A: Correct B: Incorrect",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Explain error in verb tense.",
"required": true
},
{
"id": "q11",
"type": "text",
"question": "Find grammar error in translated text.",
"required": true
}
]
},
{
"id": "task17",
"title": "Write Short Stories in Kiswahili",
"category": "Kiswahili Story Writing",
"paymentAmount": 27,
"duration": "1h 30m",
"difficulty": "Advanced",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Write a 100-word Kiswahili story about a brave child.",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Create a story about friendship in Kiswahili.",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Which plot is engaging? A: Adventure B: Mystery",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Write about nature in Kiswahili.",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Story on perseverance.",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Better ending: A: Happy B: Twist",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Create moral story in Kiswahili.",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Write about city life.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Style preference: A: Descriptive B: Dialogue-heavy",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Story on family values.",
"required": true
},
{
"id": "q11",
"type": "text",
"question": "Create fantasy tale in Kiswahili.",
"required": true
},
{
"id": "q12",
"type": "opinion",
"question": "Which character is relatable? A: Hero B: Villain",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q13",
"type": "text",
"question": "Write educational story.",
"required": true
},
{
"id": "q14",
"type": "text",
"question": "Story about animals.",
"required": true
},
{
"id": "q15",
"type": "opinion",
"question": "Best for AI training: A: Varied B: Simple",
"options": ["A", "B", "Both Equal"],
"required": true
}
]
},
{
"id": "task18",
"title": "Answer Questions in Kiswahili",
"category": "Question Answering in Kiswahili",
"paymentAmount": 17,
"duration": "40 mins",
"difficulty": "Beginner",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Jibu: Nini mji mkuu wa Tanzania?",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Eleza Kilimanjaro ni nini.",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Ni ipi bora? A: Majibu mafupi B: Ya kina",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Jibu kuhusu historia ya Kiswahili.",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Eleza chakula cha kawaida Tanzania.",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Majibu gani sahihi? A: Sahihi B: Potofu",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Jibu kuhusu wanyama Tanzania.",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Eleza hekima ya methali.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Ni ipi wazi? A: Moja B: Mbili",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Jibu swali la elimu.",
"required": true
}
]
},
{
"id": "task19",
"title": "Paraphrase Sentences in Kiswahili",
"category": "Paraphrasing in Kiswahili",
"paymentAmount": 20,
"duration": "45 mins",
"difficulty": "Intermediate",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Paraphrase: 'Mimi ninapenda Kiswahili.'",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Rewrite: 'Watoto wanasoma shuleni.'",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Which paraphrase is better? A: Similar B: Different words",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Paraphrase proverb: 'Haraka haraka haina baraka.'",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Rewrite sentence about weather.",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Best for meaning: A: Exact B: Approximate",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Paraphrase dialogue line.",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Rewrite news headline in Kiswahili.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Which keeps tone? A: Formal B: Informal",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Paraphrase instructional text.",
"required": true
},
{
"id": "q11",
"type": "text",
"question": "Rewrite emotional sentence.",
"required": true
},
{
"id": "q12",
"type": "opinion",
"question": "Preferred: A: Creative B: Literal",
"options": ["A", "B", "Both Equal"],
"required": true
}
]
},
{
"id": "task20",
"title": "Translate Kiswahili Idioms",
"category": "Kiswahili Idioms Translation",
"paymentAmount": 25,
"duration": "1h",
"difficulty": "Expert",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Translate idiom 'Kupiga mbizi' to English.",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Explain and translate 'Kushika adabu'.",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Which translation fits 'Kutoa mimba'? A: Literal B: Figurative",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Translate 'Penye nia pana njia'.",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Give English for 'Kupiga chenga'.",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Better: A: Direct B: Explained",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Translate 'Mwenye pupa hadiriki kula tamu'.",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Explain 'Kufunga virago'.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Which captures culture? A: Word-for-word B: Meaning",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Translate 'Kula njama'.",
"required": true
},
{
"id": "q11",
"type": "text",
"question": "Give equivalent for 'Piga mbizi'.",
"required": true
},
{
"id": "q12",
"type": "opinion",
"question": "Preferred for AI: A: Accurate B: Natural",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q13",
"type": "text",
"question": "Translate another idiom.",
"required": true
}
]
},
{
"id": "task21",
"title": "Rate Kiswahili Chatbot Interactions",
"category": "Evaluating Kiswahili Chatbot Responses",
"paymentAmount": 26,
"duration": "1h 15m",
"difficulty": "Intermediate",
"questions": [
{
"id": "q1",
"type": "opinion",
"question": "Rate response: Good, Bad, Average.",
"options": ["Good", "Bad", "Average"],
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Suggest improvement for chatbot reply.",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Which is helpful? A: Response1 B: Response2",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Evaluate accuracy of answer.",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Comment on naturalness.",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Better engagement: A or B",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Rate cultural sensitivity.",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Suggest better phrasing.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Is it polite? Yes, No",
"options": ["Yes", "No"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Evaluate completeness.",
"required": true
},
{
"id": "q11",
"type": "text",
"question": "Comment on grammar.",
"required": true
},
{
"id": "q12",
"type": "opinion",
"question": "Overall score: High, Low",
"options": ["High", "Low", "Medium"],
"required": true
}
]
},
{
"id": "task22",
"title": "Summarize Kiswahili News Articles",
"category": "Kiswahili News Article Summarization",
"paymentAmount": 18,
"duration": "40 mins",
"difficulty": "Beginner",
"questions": [
{
"id": "q1",
"type": "text",
"question": "Summarize a news about politics in Kiswahili.",
"required": true
},
{
"id": "q2",
"type": "text",
"question": "Provide short summary for sports news.",
"required": true
},
{
"id": "q3",
"type": "opinion",
"question": "Which summary is objective? A or B",
"options": ["A", "B", "Both Equal"],
"required": true
},
{
"id": "q4",
"type": "text",
"question": "Summarize economic update.",
"required": true
},
{
"id": "q5",
"type": "text",
"question": "Give key points for health news.",
"required": true
},
{
"id": "q6",
"type": "opinion",
"question": "Better length: Short or Long",
"options": ["Short", "Long", "Both Equal"],
"required": true
},
{
"id": "q7",
"type": "text",
"question": "Summarize environmental story.",
"required": true
},
{
"id": "q8",
"type": "text",
"question": "Provide summary for local event.",
"required": true
},
{
"id": "q9",
"type": "opinion",
"question": "Is it accurate? Yes or No",
"options": ["Yes", "No"],
"required": true
},
{
"id": "q10",
"type": "text",
"question": "Summarize international news in Kiswahili.",
"required": true
}
]
},

{
    "id": "task24",
    "title": "Fix Machine-Translated Kiswahili Sentences",
    "category": "Post-Editing Machine Translation",
    "paymentAmount": 22,
    "duration": "50 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "The original English is: 'He runs every morning.' The bad MT output is: 'Yeye mbio kila asubuhi.' Fix it.", "required": true },
      { "id": "q2", "type": "text", "question": "Fix this awkward translation: 'The government announced new taxes yesterday.' → 'Serikali ilitangaza ushuru mpya jana.'", "required": true },
      { "id": "q3", "type": "opinion", "question": "Which corrected version is more natural? A: 'Mtu huyu anaishi Dodoma.' B: 'Yeye anaishi Dodoma.'", "options": ["A", "B", "Both equal"], "required": true },
      { "id": "q4", "type": "text", "question": "Improve fluency: 'Kitabu hiki ni cha kusoma vizuri sana sana.' (over-translation)", "required": true },
      { "id": "q5", "type": "text", "question": "Correct word order and agreement: 'Wanawake wawili walikuja nyumbani mapema sana sana.'", "required": true },
      { "id": "q6", "type": "opinion", "question": "Which fix preserves politeness better? A: Add 'tafadhali' B: Change verb tense", "options": ["A", "B", "Neither"], "required": true },
      { "id": "q7", "type": "text", "question": "Post-edit: 'I would like to order ugali and nyama choma.' → 'Nataka kuagiza ugali na nyama choma.'", "required": true },
      { "id": "q8", "type": "text", "question": "Make this more idiomatic: 'Maji ni maisha.' (literal from proverb context)", "required": true },
      { "id": "q9", "type": "opinion", "question": "Better register for news: A: Formal B: Conversational", "options": ["A", "B", "Depends on audience"], "required": true },
      { "id": "q10", "type": "text", "question": "Fix cultural mismatch: 'Let's grab a beer after work.'", "required": true },
      { "id": "q11", "type": "text", "question": "Improve: 'Hii ni picha ya familia yangu nzuri sana.'", "required": true }
    ]
  },
  {
    "id": "task25",
    "title": "Judge Naturalness of Kiswahili AI Voice Prompts",
    "category": "Text-to-Speech Prompt Evaluation",
    "paymentAmount": 20,
    "duration": "40 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Which prompt will sound more natural when spoken by TTS? A: 'Habari za asubuhi!' B: 'Habari za asubuhi, marafiki wenzangu.'", "options": ["A", "B", "Both equal"], "required": true },
      { "id": "q2", "type": "text", "question": "Write one sentence you would NEVER use as a TTS prompt for natural Kiswahili speech.", "required": true },
      { "id": "q3", "type": "opinion", "question": "Rate emotional expressiveness (1–5) of: 'Pole sana kwa hasara hiyo…'", "options": ["1","2","3","4","5"], "required": true },
      { "id": "q4", "type": "text", "question": "Suggest punctuation / emphasis markers to improve TTS intonation for excitement.", "required": true },
      { "id": "q5", "type": "opinion", "question": "Which is likely to cause unnatural pauses? A: Long compound sentence B: Short sentences", "options": ["A", "B", "Both equal"], "required": true },
      { "id": "q6", "type": "text", "question": "Rewrite this prompt to sound more like everyday Tanzanian street talk.", "required": true },
      { "id": "q7", "type": "opinion", "question": "Better for newsreader voice? A: Very formal B: Neutral conversational", "options": ["A", "B"], "required": true },
      { "id": "q8", "type": "text", "question": "Add one discourse marker (e.g. basi, kwa hivyo) that improves natural flow.", "required": true }
    ]
  },
  {
    "id": "task26",
    "title": "Create Kiswahili Multiple-Choice Questions for AI",
    "category": "Question Generation for AI Datasets",
    "paymentAmount": 24,
    "duration": "1h",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Write a Kiswahili reading comprehension question (with 4 options) based on this short text: 'Kilimanjaro ni mlima mrefu zaidi barani Afrika.'", "required": true },
      { "id": "q2", "type": "text", "question": "Create one grammar MCQ testing noun class agreement (4 options).", "required": true },
      { "id": "q3", "type": "opinion", "question": "Which distractor style is most effective? A: Similar sounding words B: Opposite meaning", "options": ["A", "B", "Both good"], "required": true },
      { "id": "q4", "type": "text", "question": "Make a vocabulary MCQ about synonyms of 'furaha'.", "required": true },
      { "id": "q5", "type": "text", "question": "Write one proverb-based inference question with plausible wrong answers.", "required": true },
      { "id": "q6", "type": "opinion", "question": "Better difficulty for intermediate learners? A: One clear right answer B: Two close answers", "options": ["A", "B"], "required": true },
      { "id": "q7", "type": "text", "question": "Create a cultural knowledge MCQ about 'Shikamoo / Marahaba'.", "required": true }
    ]
  },
  {
    "id": "task27",
    "title": "Compare Kiswahili & English Emotion Expressions",
    "category": "Cross-Lingual Emotion Annotation",
    "paymentAmount": 21,
    "duration": "55 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Which language usually expresses sympathy more indirectly? A: Kiswahili B: English", "options": ["A", "B", "About the same"], "required": true },
      { "id": "q2", "type": "text", "question": "Give one Kiswahili phrase that conveys sarcasm better than a direct English translation.", "required": true },
      { "id": "q3", "type": "text", "question": "Translate and compare tone: English 'I'm fine, thanks.' vs common Kiswahili equivalents.", "required": true },
      { "id": "q4", "type": "opinion", "question": "Stronger emotion carrier? A: 'Pole sana' B: 'I'm so sorry'", "options": ["A", "B", "Equal"], "required": true },
      { "id": "q5", "type": "text", "question": "Write a situation where 'sawa' can mean agreement, indifference, OR sarcasm.", "required": true },
      { "id": "q6", "type": "opinion", "question": "More polite refusal? A: 'Hapana asante' B: 'No thanks'", "options": ["A", "B", "Equal"], "required": true }
    ]
  },
  {
    "id": "task28",
    "title": "Rank Kiswahili AI Response Options",
    "category": "Preference Ranking for RLHF-style Training",
    "paymentAmount": 28,
    "duration": "1h 10m",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Rank from best (1) to worst (3): A – very polite but long / B – short & direct / C – warm & natural", "options": ["A > B > C", "C > A > B", "B > C > A", "Other order"], "required": true },
      { "id": "q2", "type": "text", "question": "Explain why you ranked response X highest in the previous question.", "required": true },
      { "id": "q3", "type": "opinion", "question": "Rank helpfulness: A – gives steps / B – gives encouragement only / C – gives both", "options": ["C > A > B", "A > C > B", "Other"], "required": true },
      { "id": "q4", "type": "text", "question": "Write one additional criterion (besides helpfulness & naturalness) you used for ranking.", "required": true },
      { "id": "q5", "type": "opinion", "question": "Which ranking is hardest to decide? A – very similar responses B – clearly different", "options": ["A", "B"], "required": true }
    ]
  },
  {
    "id": "task29",
    "title": "Generate Kiswahili Safety & Ethics Prompts",
    "category": "Safety Data Collection for Kiswahili AI",
    "paymentAmount": 26,
    "duration": "1h 15m",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Write a realistic user prompt in Kiswahili that tries to get medical advice without saying it's for real.", "required": true },
      { "id": "q2", "type": "text", "question": "Create a prompt that asks for politically sensitive opinions in a subtle way.", "required": true },
      { "id": "q3", "type": "opinion", "question": "Which is more dangerous to answer directly? A – witchcraft question B – exam cheating question", "options": ["A", "B", "Equal risk"], "required": true },
      { "id": "q4", "type": "text", "question": "Write a harmless-looking prompt that could lead to generating hate speech if answered carelessly.", "required": true },
      { "id": "q5", "type": "text", "question": "Give one example of a 'red team' prompt already common among young Tanzanian users.", "required": true }
    ]
  },
  {
    "id": "task30",
    "title": "Annotate Code-Mixed Kiswahili–English Messages",
    "category": "Code-Mixing Annotation",
    "paymentAmount": 23,
    "duration": "50 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "'Nimechoka sana bro, deadline inakaribia.' → Which language dominates? (Kiswahili / English / Balanced)", "required": true },
      { "id": "q2", "type": "opinion", "question": "Is code-switching natural here? 'Tuma ile pic kwa WhatsApp basi.' Yes / No / Borderline", "options": ["Yes","No","Borderline"], "required": true },
      { "id": "q3", "type": "text", "question": "Identify the trigger word that caused switching in: 'Hiyo story ilinifanya nicheke mpaka nalia.'", "required": true },
      { "id": "q4", "type": "text", "question": "Rewrite fully in Kiswahili while keeping natural youth style.", "required": true },
      { "id": "q5", "type": "opinion", "question": "More common among: A – under 25 B – over 35", "options": ["A", "B", "Equal"], "required": true }
    ]
  },

  {
    "id": "task31",
    "title": "Translate Sheng Phrases to Standard Kiswahili",
    "category": "Sheng to Kiswahili Translation",
    "paymentAmount": 20,
    "duration": "45 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "Translate this Sheng phrase to natural Kiswahili: 'Niaje msee, uko poa?'", "required": true },
      { "id": "q2", "type": "text", "question": "Convert to standard Kiswahili: 'Mbogi yangu iko fiti, tunaenda mtaa leo.'", "required": true },
      { "id": "q3", "type": "opinion", "question": "Which is the best Kiswahili equivalent for 'Mresh huyo ni moto'? A: 'Msichana huyo ni mzuri' B: 'Mrembo huyo anauma'", "options": ["A", "B", "Both Equal"], "required": true },
      { "id": "q4", "type": "text", "question": "Translate: 'Piga luku vizuri bro, usikose chwani.'", "required": true },
      { "id": "q5", "type": "text", "question": "Give standard Kiswahili for: 'Kanairo ni noma, lakini rada iko poa.'", "required": true },
      { "id": "q6", "type": "opinion", "question": "More natural formal version? A: 'Habari yako mzee?' B: 'Uko aje bro?'", "options": ["A", "B", "Both Equal"], "required": true },
      { "id": "q7", "type": "text", "question": "Translate Sheng greeting: 'Sasa mabwana, niko ital.'", "required": true },
      { "id": "q8", "type": "text", "question": "Convert: 'Mboka yangu iko mbaya, nataka ku-promote.'", "required": true },
      { "id": "q9", "type": "opinion", "question": "Best match for 'Chwani yangu ni kebo'? A: 'Mpenzi wangu ni hodari' B: 'Rafiki yangu ni mzuri'", "options": ["A", "B", "Both Equal"], "required": true },
      { "id": "q10", "type": "text", "question": "Translate: 'Cheki hiyo vibe, ni sheng fresh.'", "required": true }
    ]
  },
  {
    "id": "task32",
    "title": "Identify Sheng in Mixed Kiswahili-English Text",
    "category": "Sheng Detection & Annotation",
    "paymentAmount": 18,
    "duration": "40 mins",
    "difficulty": "Beginner",
    "questions": [
      { "id": "q1", "type": "text", "question": "List all Sheng words in: 'Niaje bro, niko na mbogi yangu tunaenda Kanairo kutafuta mboka fiti.'", "required": true },
      { "id": "q2", "type": "text", "question": "Highlight Sheng elements: 'Habari za mtaa? Rada iko poa, mresh amepiga luku moto.'", "required": true },
      { "id": "q3", "type": "opinion", "question": "Is 'msee' Sheng or standard Kiswahili? A: Sheng B: Standard C: Both", "options": ["A", "B", "C"], "required": true },
      { "id": "q4", "type": "text", "question": "Identify Sheng slang for people/group in: 'Mbogi yetu iko solid, tuna chill na chwani.'", "required": true },
      { "id": "q5", "type": "text", "question": "Spot Sheng in this youth chat: 'Uko aje? Nimepata mokia mpya, ni poa sana.'", "required": true },
      { "id": "q6", "type": "opinion", "question": "More Sheng-heavy? A: 'Niko poa' B: 'Niko fiti msee'", "options": ["A", "B", "Equal"], "required": true },
      { "id": "q7", "type": "text", "question": "List Sheng terms related to appearance: 'Ame piga luku, mresh huyo ni kebo.'", "required": true }
    ]
  },
  {
    "id": "task33",
    "title": "Rewrite Sheng Dialogues in Standard Kiswahili",
    "category": "Sheng Dialogue Normalization",
    "paymentAmount": 22,
    "duration": "50 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "Rewrite this Sheng chat in polite standard Kiswahili: 'Niaje mabwana? Tuko aje leo? Mbogi iko fiti.'", "required": true },
      { "id": "q2", "type": "text", "question": "Convert to formal Kiswahili: 'Cheki hiyo mresh, amepiga luku moto sana bro.'", "required": true },
      { "id": "q3", "type": "opinion", "question": "Which rewrite keeps youth energy best? A: Fully formal B: Slightly casual", "options": ["A", "B", "Both Equal"], "required": true },
      { "id": "q4", "type": "text", "question": "Normalize: 'Kanairo ni noma, lakini rada yangu iko poa na chwani.'", "required": true },
      { "id": "q5", "type": "text", "question": "Rewrite greeting: 'Sasa msee, uko ital au noma?'", "required": true },
      { "id": "q6", "type": "opinion", "question": "Better for AI chatbot? A: Pure Sheng B: Mixed Sheng-Kiswahili", "options": ["A", "B"], "required": true },
      { "id": "q7", "type": "text", "question": "Convert short convo: 'Mboka yangu iko mbaya, nataka ku-bounce.'", "required": true }
    ]
  },
  {
    "id": "task34",
    "title": "Generate Sheng-Style Social Media Captions",
    "category": "Sheng Content Creation",
    "paymentAmount": 25,
    "duration": "1h",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Write a Sheng caption for a photo with friends in town: keep it fun and youthful (use mbogi, poa, etc.).", "required": true },
      { "id": "q2", "type": "text", "question": "Create a flirty Sheng caption for a selfie with a girl (include mresh or similar).", "required": true },
      { "id": "q3", "type": "opinion", "question": "Which vibe fits Gen Z TikTok best? A: Heavy Sheng B: Light Sheng + emojis", "options": ["A", "B", "Both Equal"], "required": true },
      { "id": "q4", "type": "text", "question": "Make a motivational Sheng post about job hunting (use mboka, fiti).", "required": true },
      { "id": "q5", "type": "text", "question": "Write Sheng caption for weekend plans: 'Tunaenda...'", "required": true },
      { "id": "q6", "type": "opinion", "question": "More engaging? A: 'Niaje' opener B: 'Cheki' opener", "options": ["A", "B"], "required": true },
      { "id": "q7", "type": "text", "question": "Caption for new phone pic (use mokia).", "required": true },
      { "id": "q8", "type": "text", "question": "Create humorous Sheng status about Monday blues.", "required": true }
    ]
  },
  {
    "id": "task35",
    "title": "Evaluate Naturalness of Sheng Responses",
    "category": "Sheng AI Response Evaluation",
    "paymentAmount": 24,
    "duration": "55 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Which AI reply sounds more like real Nairobi youth? A: 'Habari yako' B: 'Niaje msee, uko poa?'", "options": ["A", "B", "Both Equal"], "required": true },
      { "id": "q2", "type": "text", "question": "Suggest improvement to make this robotic: 'Nimefurahi kukuona.' more Sheng-natural.", "required": true },
      { "id": "q3", "type": "opinion", "question": "Rate youth authenticity (1-5): 'Mbogi yangu iko fiti sana bro.'", "options": ["1","2","3","4","5"], "required": true },
      { "id": "q4", "type": "text", "question": "Rewrite to add more Sheng vibe: 'Tunaenda sokoni kununua chakula.'", "required": true },
      { "id": "q5", "type": "opinion", "question": "Better for casual chat? A: 'Poa' B: 'Fiti sana'", "options": ["A", "B", "Equal"], "required": true }
    ]
  },
  {
    "id": "task36",
    "title": "Rank Sheng Variations by Coolness",
    "category": "Sheng Preference Ranking",
    "paymentAmount": 26,
    "duration": "1h 5m",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Rank coolest (1 best) to least: A – 'Niaje msee' B – 'Habari bro' C – 'Sasa mabwana'", "options": ["A > C > B", "A > B > C", "Other"], "required": true },
      { "id": "q2", "type": "text", "question": "Explain your top-ranked Sheng greeting and why it's fresher.", "required": true },
      { "id": "q3", "type": "opinion", "question": "Rank for street cred: A – 'Mbogi iko solid' B – 'Kikundi kiko vizuri' C – 'Squad iko poa'", "options": ["A > C > B", "C > A > B", "Other"], "required": true }
    ]
  },
  {
    "id": "task37",
    "title": "Create Sheng TikTok Scripts",
    "category": "Sheng Video Script Writing",
    "paymentAmount": 28,
    "duration": "1h 20m",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Write 15-20 sec Sheng TikTok script for 'day in Nairobi life' (use niaje, mtaa, mbogi).", "required": true },
      { "id": "q2", "type": "text", "question": "Script funny Sheng reaction to bad day: 'Mboka iliharibika...'", "required": true },
      { "id": "q3", "type": "opinion", "question": "Better style? A: Pure Sheng B: Sheng + English mix", "options": ["A", "B"], "required": true },
      { "id": "q4", "type": "text", "question": "Create Sheng hook: 'Cheki hii...'", "required": true }
    ]
  },
  {
    "id": "task38",
    "title": "Correct Sheng Grammar in Sentences",
    "category": "Sheng Usage Correction",
    "paymentAmount": 19,
    "duration": "45 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "Fix: 'Niaje mabwana uko poa sana mbogi.' (add flow)", "required": true },
      { "id": "q2", "type": "text", "question": "Improve naturalness: 'Mresh amepiga luku fiti bro.'", "required": true }
    ]
  },
  {
    "id": "task39",
    "title": "Explain Sheng Cultural Context",
    "category": "Sheng Meaning & Context",
    "paymentAmount": 23,
    "duration": "1h",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Explain cultural vibe of 'mbogi' vs standard 'kikundi'.", "required": true },
      { "id": "q2", "type": "text", "question": "Why 'niaje' more common than 'habari' among Tanzanian/Kenyan youth?", "required": true },
      { "id": "q3", "type": "opinion", "question": "More urban identity marker? A: 'Kanairo' B: 'Dar'", "options": ["A", "B", "Equal"], "required": true }
    ]
  },
  {
    "id": "task40",
    "title": "Detect Inappropriate Sheng Usage",
    "category": "Sheng Safety & Ethics Annotation",
    "paymentAmount": 21,
    "duration": "50 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Is 'nyash' safe for general AI chat? A: Yes B: No C: Context-dependent", "options": ["A", "B", "C"], "required": true },
      { "id": "q2", "type": "text", "question": "Suggest safer alternative to risky Sheng term in youth convo.", "required": true }
    ]
  },
  {
    "id": "task41",
    "title": "Build Sheng Vocabulary Lists",
    "category": "Sheng Vocabulary Building",
    "paymentAmount": 17,
    "duration": "35 mins",
    "difficulty": "Beginner",
    "questions": [
      { "id": "q1", "type": "text", "question": "List 5 Sheng words for friends/people (e.g. msee, mbogi).", "required": true },
      { "id": "q2", "type": "text", "question": "Give Sheng terms for positive vibes (poa, fiti, etc.).", "required": true }
    ]
  },
  {
    "id": "task42",
    "title": "Paraphrase in Sheng Style",
    "category": "Sheng Paraphrasing",
    "paymentAmount": 20,
    "duration": "45 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "Paraphrase in Sheng: 'Rafiki yangu anakuja leo.'", "required": true },
      { "id": "q2", "type": "text", "question": "Rewrite casually: 'Nimefurahi sana.'", "required": true }
    ]
  },
  {
    "id": "task43",
    "title": "Label Sentiment in Sheng Messages",
    "category": "Sheng Sentiment Analysis",
    "paymentAmount": 19,
    "duration": "40 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Sentiment of 'Rada iko poa sana msee!'? A: Positive B: Negative C: Neutral", "options": ["A", "B", "C"], "required": true },
      { "id": "q2", "type": "text", "question": "Explain why 'Noma hii!' is negative.", "required": true }
    ]
  },
  {
    "id": "task44",
    "title": "Create Sheng Proverbs or Sayings",
    "category": "Sheng Creative Expression",
    "paymentAmount": 24,
    "duration": "1h",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Invent a funny Sheng 'proverb' about money or jobs.", "required": true },
      { "id": "q2", "type": "text", "question": "Make modern Sheng twist on 'Haraka haraka haina baraka.'", "required": true }
    ]
  },
  {
    "id": "task45",
    "title": "Sheng vs Standard Kiswahili Comparison",
    "category": "Cross-Style Comparison",
    "paymentAmount": 22,
    "duration": "50 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "More expressive for youth emotions? A: Sheng B: Standard Kiswahili", "options": ["A", "B"], "required": true },
      { "id": "q2", "type": "text", "question": "Compare tone: 'Niko poa' vs 'Nimepata hali njema.'", "required": true }
    ]
  },
  {
    "id": "task46",
    "title": "Sheng in Tanzanian Urban Context",
    "category": "Tanzania Sheng Adaptation",
    "paymentAmount": 23,
    "duration": "55 mins",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Adapt 'Niaje msee' for Dar es Salaam youth style.", "required": true },
      { "id": "q2", "type": "text", "question": "Explain how Sheng spreads to Tanzanian cities.", "required": true }
    ]
  },
  {
    "id": "task47",
    "title": "Sheng Slang for Emotions",
    "category": "Emotion Labeling with Sheng",
    "paymentAmount": 20,
    "duration": "45 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "List Sheng ways to say 'happy' or 'excited'.", "required": true },
      { "id": "q2", "type": "opinion", "question": "Stronger happiness? A: 'Niko poa' B: 'Niko kebo sana'", "options": ["A", "B"], "required": true }
    ]
  },
  {
    "id": "task48",
    "title": "Sheng Greeting Variations",
    "category": "Sheng Greeting Judgment",
    "paymentAmount": 18,
    "duration": "35 mins",
    "difficulty": "Beginner",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Most casual greeting? A: 'Niaje' B: 'Sasa' C: 'Mambo'", "options": ["A", "B", "C"], "required": true },
      { "id": "q2", "type": "text", "question": "Write 3 Sheng ways to say hello to friends.", "required": true }
    ]
  },
  {
    "id": "task49",
    "title": "Sheng in Music Lyrics Analysis",
    "category": "Sheng in Gengetone/Urban Music",
    "paymentAmount": 25,
    "duration": "1h 10m",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Explain Sheng use in a typical Gengetone line (invent example).", "required": true },
      { "id": "q2", "type": "text", "question": "Suggest Sheng words to make lyrics more 'street'.", "required": true }
    ]
  },
  {
    "id": "task50",
    "title": "Future Sheng Prediction",
    "category": "Sheng Evolution Forecasting",
    "paymentAmount": 27,
    "duration": "1h 15m",
    "difficulty": "Expert",
    "questions": [
      { "id": "q1", "type": "text", "question": "Predict 2-3 new Sheng words for 2026-2027 (e.g. tech/social media related).", "required": true },
      { "id": "q2", "type": "text", "question": "Why do you think Sheng will keep evolving fast in Tanzania/Kenya?", "required": true },
      { "id": "q3", "type": "opinion", "question": "Will Sheng replace standard Kiswahili among youth? A: Yes B: No C: Mix", "options": ["A", "B", "C"], "required": true }
    ]
  },

  {
    "id": "task31",
    "title": "Translate Tanzanian Urban Slang to Standard Kiswahili",
    "category": "Tanzanian Youth Slang Translation",
    "paymentAmount": 20,
    "duration": "45 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "Translate this Dar es Salaam youth phrase to natural standard Kiswahili: 'Mambo vipi kaka, uko poa?'", "required": true },
      { "id": "q2", "type": "text", "question": "Convert to standard Kiswahili: 'Mtaa wangu uko safi, tunaenda Bongo leo.'", "required": true },
      { "id": "q3", "type": "opinion", "question": "Which is the best Kiswahili equivalent for 'Pisi kali huyo ni bomba'? A: 'Msichana huyo ni mzuri sana' B: 'Mrembo huyo anauma'", "options": ["A", "B", "Both Equal"], "required": true },
      { "id": "q4", "type": "text", "question": "Translate: 'Cheki kitu hicho poa, usikose fresh style.'", "required": true },
      { "id": "q5", "type": "text", "question": "Give standard Kiswahili for: 'Bongo ni noma, lakini vibe iko safi.'", "required": true },
      { "id": "q6", "type": "opinion", "question": "More natural formal version? A: 'Habari yako?' B: 'Uko vipi kaka?'", "options": ["A", "B", "Both Equal"], "required": true },
      { "id": "q7", "type": "text", "question": "Translate Tanzanian youth greeting: 'Sema mambo, uko fresh au vibaya?'", "required": true },
      { "id": "q8", "type": "text", "question": "Convert: 'Kazi yangu iko vibaya, nataka ku-promote style.'", "required": true },
      { "id": "q9", "type": "opinion", "question": "Best match for 'Dada yangu ni kebo sana'? A: 'Rafiki yangu ni hodari' B: 'Mpenzi wangu ni mzuri'", "options": ["A", "B", "Both Equal"], "required": true },
      { "id": "q10", "type": "text", "question": "Translate: 'Cheki hiyo vibe ya Bongo Flava, ni fresh sana.'", "required": true }
    ]
  },
  {
    "id": "task32",
    "title": "Identify Tanzanian Urban Slang in Mixed Text",
    "category": "Tanzanian Youth Slang Detection",
    "paymentAmount": 18,
    "duration": "40 mins",
    "difficulty": "Beginner",
    "questions": [
      { "id": "q1", "type": "text", "question": "List all youth slang words in: 'Mambo vipi kaka, tunaenda mtaa kutafuta kitu poa.'", "required": true },
      { "id": "q2", "type": "text", "question": "Highlight slang elements: 'Habari za Bongo? Vibe iko safi, pisi kali amepiga style moto.'", "required": true },
      { "id": "q3", "type": "opinion", "question": "Is 'mtaa' Tanzanian youth slang or standard Kiswahili? A: Youth slang B: Standard C: Both", "options": ["A", "B", "C"], "required": true },
      { "id": "q4", "type": "text", "question": "Identify slang for people/area in: 'Mtaa wetu uko solid, tuna chill na dada.'", "required": true },
      { "id": "q5", "type": "text", "question": "Spot slang in this Dar chat: 'Uko aje? Nimepata simu mpya, ni fresh sana.'", "required": true },
      { "id": "q6", "type": "opinion", "question": "More slang-heavy? A: 'Niko poa' B: 'Niko safi kaka'", "options": ["A", "B", "Equal"], "required": true },
      { "id": "q7", "type": "text", "question": "List slang terms related to appearance: 'Amepiga style, pisi kali huyo ni bomba.'", "required": true }
    ]
  },
  {
    "id": "task33",
    "title": "Rewrite Tanzanian Youth Slang Dialogues in Standard Kiswahili",
    "category": "Tanzanian Slang Normalization",
    "paymentAmount": 22,
    "duration": "50 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "Rewrite this Dar youth chat in polite standard Kiswahili: 'Mambo vipi vijana? Tuko safi leo, tunaenda Bongo.'", "required": true },
      { "id": "q2", "type": "text", "question": "Convert to formal Kiswahili: 'Cheki hiyo pisi kali, amepiga style moto sana kaka.'", "required": true },
      { "id": "q3", "type": "opinion", "question": "Which rewrite keeps Tanzanian youth energy best? A: Fully formal B: Slightly casual", "options": ["A", "B", "Both Equal"], "required": true },
      { "id": "q4", "type": "text", "question": "Normalize: 'Bongo ni noma, lakini vibe yangu iko poa na dada.'", "required": true },
      { "id": "q5", "type": "text", "question": "Rewrite greeting: 'Sema kaka, uko fresh au vibaya?'", "required": true },
      { "id": "q6", "type": "opinion", "question": "Better for Tanzanian AI chatbot? A: Pure youth slang B: Mixed with standard Kiswahili", "options": ["A", "B"], "required": true },
      { "id": "q7", "type": "text", "question": "Convert short convo: 'Kazi yangu iko vibaya, nataka ku-bounce style.'", "required": true }
    ]
  },
  {
    "id": "task34",
    "title": "Generate Tanzanian Bongo-Style Social Media Captions",
    "category": "Tanzanian Youth Content Creation",
    "paymentAmount": 25,
    "duration": "1h",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Write a Dar youth slang caption for a photo with friends in mtaa: keep it fun (use mambo, poa, Bongo).", "required": true },
      { "id": "q2", "type": "text", "question": "Create a flirty Tanzanian slang caption for a selfie (include pisi kali or similar).", "required": true },
      { "id": "q3", "type": "opinion", "question": "Which vibe fits Tanzanian TikTok best? A: Heavy slang B: Slang + emojis", "options": ["A", "B", "Both Equal"], "required": true },
      { "id": "q4", "type": "text", "question": "Make a motivational Bongo caption about hustle (use kazi, fresh).", "required": true },
      { "id": "q5", "type": "text", "question": "Write slang caption for weekend plans in Dar: 'Tunaenda...'", "required": true },
      { "id": "q6", "type": "opinion", "question": "More engaging? A: 'Mambo' opener B: 'Cheki' opener", "options": ["A", "B"], "required": true },
      { "id": "q7", "type": "text", "question": "Caption for new phone pic (use simu or fresh gadget).", "required": true },
      { "id": "q8", "type": "text", "question": "Create humorous Tanzanian slang status about Monday in Bongo.", "required": true }
    ]
  },
  {
    "id": "task35",
    "title": "Evaluate Naturalness of Tanzanian Youth Responses",
    "category": "Tanzanian Slang AI Evaluation",
    "paymentAmount": 24,
    "duration": "55 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Which AI reply sounds more like real Dar youth? A: 'Habari yako' B: 'Mambo vipi kaka, uko poa?'", "options": ["A", "B", "Both Equal"], "required": true },
      { "id": "q2", "type": "text", "question": "Suggest improvement to make this robotic: 'Nimefurahi kukuona.' more Tanzanian youth-natural.", "required": true },
      { "id": "q3", "type": "opinion", "question": "Rate Dar authenticity (1-5): 'Vibe iko safi sana kaka.'", "options": ["1","2","3","4","5"], "required": true },
      { "id": "q4", "type": "text", "question": "Rewrite to add more Bongo slang: 'Tunaenda sokoni kununua chakula.'", "required": true },
      { "id": "q5", "type": "opinion", "question": "Better for casual Tanzanian chat? A: 'Poa' B: 'Safi sana'", "options": ["A", "B", "Equal"], "required": true }
    ]
  },
  {
    "id": "task36",
    "title": "Rank Tanzanian Slang Variations by Coolness",
    "category": "Tanzanian Youth Preference Ranking",
    "paymentAmount": 26,
    "duration": "1h 5m",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Rank coolest (1 best) to least: A – 'Mambo vipi' B – 'Habari kaka' C – 'Sema vijana'", "options": ["A > C > B", "A > B > C", "Other"], "required": true },
      { "id": "q2", "type": "text", "question": "Explain your top-ranked Tanzanian greeting and why it's fresher in Bongo.", "required": true },
      { "id": "q3", "type": "opinion", "question": "Rank for street cred: A – 'Mtaa uko solid' B – 'Mtaa uko vizuri' C – 'Mtaa uko poa'", "options": ["A > C > B", "C > A > B", "Other"], "required": true }
    ]
  },
  {
    "id": "task37",
    "title": "Create Tanzanian Bongo Flava-Style TikTok Scripts",
    "category": "Tanzanian Youth Video Script Writing",
    "paymentAmount": 28,
    "duration": "1h 20m",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Write 15-20 sec Tanzanian slang TikTok script for 'day in Dar life' (use mambo, mtaa, poa).", "required": true },
      { "id": "q2", "type": "text", "question": "Script funny Bongo reaction to bad day: 'Kazi iliharibika...'", "required": true },
      { "id": "q3", "type": "opinion", "question": "Better style? A: Pure Tanzanian slang B: Slang + English mix", "options": ["A", "B"], "required": true },
      { "id": "q4", "type": "text", "question": "Create Tanzanian slang hook: 'Cheki hii Bongo...'", "required": true }
    ]
  },
  {
    "id": "task38",
    "title": "Correct Tanzanian Youth Slang Grammar in Sentences",
    "category": "Tanzanian Slang Usage Correction",
    "paymentAmount": 19,
    "duration": "45 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "Fix: 'Mambo vipi kaka uko poa sana mtaa.' (add flow)", "required": true },
      { "id": "q2", "type": "text", "question": "Improve naturalness: 'Pisi kali amepiga style safi kaka.'", "required": true }
    ]
  },
  {
    "id": "task39",
    "title": "Explain Tanzanian Urban Slang Cultural Context",
    "category": "Bongo Slang Meaning & Context",
    "paymentAmount": 23,
    "duration": "1h",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Explain cultural vibe of 'mtaa' vs standard 'kitongoji' in Dar.", "required": true },
      { "id": "q2", "type": "text", "question": "Why 'mambo vipi' more common than 'habari yako' among Tanzanian youth?", "required": true },
      { "id": "q3", "type": "opinion", "question": "More Bongo identity marker? A: 'Bongo' B: 'Dar'", "options": ["A", "B", "Equal"], "required": true }
    ]
  },
  {
    "id": "task40",
    "title": "Detect Inappropriate Tanzanian Youth Slang Usage",
    "category": "Tanzanian Slang Safety Annotation",
    "paymentAmount": 21,
    "duration": "50 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Is certain slang like 'usenge' safe for general AI chat in Tanzania? A: Yes B: No C: Context-dependent", "options": ["A", "B", "C"], "required": true },
      { "id": "q2", "type": "text", "question": "Suggest safer alternative to risky youth term in Tanzanian convo.", "required": true }
    ]
  },
  {
    "id": "task41",
    "title": "Build Tanzanian Youth Slang Vocabulary Lists",
    "category": "Bongo Vocabulary Building",
    "paymentAmount": 17,
    "duration": "35 mins",
    "difficulty": "Beginner",
    "questions": [
      { "id": "q1", "type": "text", "question": "List 5 Tanzanian youth words for friends/people (e.g. kaka, dada, mtaa crew).", "required": true },
      { "id": "q2", "type": "text", "question": "Give Tanzanian slang terms for positive vibes (poa, safi, fresh, etc.).", "required": true }
    ]
  },
  {
    "id": "task42",
    "title": "Paraphrase in Tanzanian Bongo Style",
    "category": "Tanzanian Slang Paraphrasing",
    "paymentAmount": 20,
    "duration": "45 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "Paraphrase in Dar slang: 'Rafiki yangu anakuja leo.'", "required": true },
      { "id": "q2", "type": "text", "question": "Rewrite casually: 'Nimefurahi sana.'", "required": true }
    ]
  },
  {
    "id": "task43",
    "title": "Label Sentiment in Tanzanian Youth Messages",
    "category": "Bongo Sentiment Analysis",
    "paymentAmount": 19,
    "duration": "40 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Sentiment of 'Vibe iko poa sana kaka!'? A: Positive B: Negative C: Neutral", "options": ["A", "B", "C"], "required": true },
      { "id": "q2", "type": "text", "question": "Explain why 'Noma hii!' is negative in Tanzanian context.", "required": true }
    ]
  },
  {
    "id": "task44",
    "title": "Create Tanzanian Youth Sayings or Twists",
    "category": "Bongo Creative Expression",
    "paymentAmount": 24,
    "duration": "1h",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Invent a funny Tanzanian youth saying about hustle in Bongo.", "required": true },
      { "id": "q2", "type": "text", "question": "Make modern Bongo twist on 'Haraka haraka haina baraka.'", "required": true }
    ]
  },
  {
    "id": "task45",
    "title": "Tanzanian Slang vs Standard Kiswahili Comparison",
    "category": "Cross-Style Comparison in Tanzania",
    "paymentAmount": 22,
    "duration": "50 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "More expressive for Tanzanian youth emotions? A: Urban slang B: Standard Kiswahili", "options": ["A", "B"], "required": true },
      { "id": "q2", "type": "text", "question": "Compare tone: 'Niko poa' vs 'Nimepata hali njema.'", "required": true }
    ]
  },
  {
    "id": "task46",
    "title": "Tanzanian Urban Slang in Dar es Salaam Context",
    "category": "Bongo Slang Adaptation",
    "paymentAmount": 23,
    "duration": "55 mins",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Adapt 'Mambo vipi' for different Dar mtaa styles (e.g. Kinondoni vs Temeke).", "required": true },
      { "id": "q2", "type": "text", "question": "Explain how youth slang spreads in Tanzanian cities like Arusha or Mwanza.", "required": true }
    ]
  },
  {
    "id": "task47",
    "title": "Tanzanian Slang for Emotions",
    "category": "Bongo Emotion Labeling",
    "paymentAmount": 20,
    "duration": "45 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "List Tanzanian youth ways to say 'happy' or 'excited' (e.g. fresh, bomba).", "required": true },
      { "id": "q2", "type": "opinion", "question": "Stronger happiness? A: 'Niko poa' B: 'Niko bomba sana'", "options": ["A", "B"], "required": true }
    ]
  },
  {
    "id": "task48",
    "title": "Tanzanian Youth Greeting Variations",
    "category": "Bongo Greeting Judgment",
    "paymentAmount": 18,
    "duration": "35 mins",
    "difficulty": "Beginner",
    "questions": [
      { "id": "q1", "type": "opinion", "question": "Most casual Tanzanian greeting? A: 'Mambo' B: 'Vipi' C: 'Sema'", "options": ["A", "B", "C"], "required": true },
      { "id": "q2", "type": "text", "question": "Write 3 Tanzanian youth ways to say hello to friends in Dar.", "required": true }
    ]
  },
  {
    "id": "task49",
    "title": "Tanzanian Slang in Bongo Flava Lyrics Analysis",
    "category": "Bongo Flava Slang Analysis",
    "paymentAmount": 25,
    "duration": "1h 10m",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Explain slang use in a typical Bongo Flava line (invent Tanzanian example).", "required": true },
      { "id": "q2", "type": "text", "question": "Suggest Tanzanian youth words to make Bongo Flava lyrics more 'street'.", "required": true }
    ]
  },
  {
    "id": "task50",
    "title": "Future of Tanzanian Urban Slang Prediction",
    "category": "Bongo Slang Evolution Forecasting",
    "paymentAmount": 27,
    "duration": "1h 15m",
    "difficulty": "Expert",
    "questions": [
      { "id": "q1", "type": "text", "question": "Predict 2-3 new Tanzanian youth slang words for 2027-2028 (e.g. TikTok/Bongo Flava related).", "required": true },
      { "id": "q2", "type": "text", "question": "Why do you think Tanzanian urban slang will keep evolving fast in Dar and other cities?", "required": true },
      { "id": "q3", "type": "opinion", "question": "Will Bongo-style slang replace standard Kiswahili among Tanzanian youth? A: Yes B: No C: Mix", "options": ["A", "B", "C"], "required": true }
    ]
  },

  {
    "id": "task51",
    "title": "Explain Swahili Cultural Customs in Tanzania",
    "category": "Swahili Culture Explanation",
    "paymentAmount": 24,
    "duration": "1h 10m",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Explain the cultural importance of 'karibu' in Tanzanian Swahili hospitality beyond just 'welcome'.", "required": true },
      { "id": "q2", "type": "text", "question": "Describe how respect for elders is shown in daily Tanzanian interactions, including greetings like 'shikamoo'.", "required": true },
      { "id": "q3", "type": "opinion", "question": "Which greeting shows deeper respect? A: 'Habari yako?' B: 'Shikamoo' C: 'Jambo'", "options": ["A", "B", "C", "All equal"], "required": true },
      { "id": "q4", "type": "text", "question": "Explain why the right hand is preferred for greetings, eating, and giving/receiving in Tanzanian culture.", "required": true },
      { "id": "q5", "type": "text", "question": "Describe the role of extended family and community sharing in Tanzanian Swahili social norms.", "required": true },
      { "id": "q6", "type": "opinion", "question": "More important in Tanzanian Swahili culture? A: Individual success B: Collective harmony and hospitality", "options": ["A", "B", "Both equal"], "required": true },
      { "id": "q7", "type": "text", "question": "Explain how greetings in Tanzania often involve asking about family/health before business.", "required": true },
      { "id": "q8", "type": "text", "question": "Describe modest dress customs in coastal Tanzanian Swahili areas (e.g., Zanzibar).", "required": true },
      { "id": "q9", "type": "opinion", "question": "Which reflects Swahili hospitality best? A: Offering food immediately B: Long polite conversation first", "options": ["A", "B", "Both"], "required": true },
      { "id": "q10", "type": "text", "question": "Explain the cultural meaning of using 'mzee' or 'mama' when addressing elders.", "required": true },
      { "id": "q11", "type": "text", "question": "Describe how Swahili culture blends African, Arab, Persian, and Indian influences in Tanzania.", "required": true },
      { "id": "q12", "type": "opinion", "question": "In modern Tanzania, is elder respect declining due to urban life? A: Yes B: No C: Still strong", "options": ["A", "B", "C"], "required": true },
      { "id": "q13", "type": "text", "question": "Explain the significance of handshakes lasting longer in Tanzanian greetings.", "required": true },
      { "id": "q14", "type": "text", "question": "Describe a typical Tanzanian Swahili welcome ritual for guests.", "required": true }
    ]
  },
  {
    "id": "task52",
    "title": "Analyze Tanzanian Swahili Proverbs",
    "category": "Swahili Proverbs & Wisdom",
    "paymentAmount": 26,
    "duration": "1h 20m",
    "difficulty": "Expert",
    "questions": [
      { "id": "q1", "type": "text", "question": "Explain the meaning and cultural lesson of 'Haraka haraka haina baraka.' in Tanzanian context.", "required": true },
      { "id": "q2", "type": "text", "question": "Interpret 'Akili ni mali' and give a Tanzanian real-life example.", "required": true },
      { "id": "q3", "type": "opinion", "question": "Which proverb best teaches patience? A: 'Pole pole ndio mwendo' B: 'Subira yavuta heri'", "options": ["A", "B", "Both equal"], "required": true },
      { "id": "q4", "type": "text", "question": "Explain 'Haba na haba hujaza kibaba' and its application in daily Tanzanian life.", "required": true },
      { "id": "q5", "type": "text", "question": "Describe how proverbs appear on kanga cloths in Swahili Tanzanian culture.", "required": true },
      { "id": "q6", "type": "opinion", "question": "More relevant today in urban Tanzania? A: 'Hasira hasara' B: 'Moyo wa kupenda hauna subira'", "options": ["A", "B", "Equal"], "required": true },
      { "id": "q7", "type": "text", "question": "Interpret 'Kupoteza njia ndio kujua njia' with a modern Tanzanian youth example.", "required": true },
      { "id": "q8", "type": "text", "question": "Explain 'Mtu ni watu' and its emphasis on community in Tanzanian Swahili culture.", "required": true },
      { "id": "q9", "type": "opinion", "question": "Which proverb promotes unity? A: 'Umoja ni nguvu' B: 'Kidole kimoja hakivunji chawa'", "options": ["A", "B", "Both"], "required": true },
      { "id": "q10", "type": "text", "question": "Give an example situation where 'Nyota njema huonekana asubuhi' applies in Tanzania.", "required": true },
      { "id": "q11", "type": "text", "question": "Explain how proverbs teach moral values in Tanzanian family settings.", "required": true },
      { "id": "q12", "type": "opinion", "question": "Best for teaching youth? A: Traditional proverbs B: Modern Bongo Flava twists on them", "options": ["A", "B", "Both"], "required": true },
      { "id": "q13", "type": "text", "question": "Interpret 'Milima haikutani, binadamu hukutana' in social context.", "required": true },
      { "id": "q14", "type": "text", "question": "Describe how elders use proverbs to resolve conflicts in Tanzanian communities.", "required": true },
      { "id": "q15", "type": "text", "question": "Create a short modern Tanzanian story illustrating one proverb from above.", "required": true }
    ]
  },
  {
    "id": "task53",
    "title": "Explore Swahili Food & Cuisine in Tanzania",
    "category": "Tanzanian Swahili Food Culture",
    "paymentAmount": 22,
    "duration": "55 mins",
    "difficulty": "Intermediate",
    "questions": [
      { "id": "q1", "type": "text", "question": "Describe ugali and its role as a staple in Tanzanian Swahili meals.", "required": true },
      { "id": "q2", "type": "text", "question": "Explain influences on Swahili Tanzanian food (Arab, Indian, African).", "required": true },
      { "id": "q3", "type": "opinion", "question": "Most iconic coastal dish? A: Pilau B: Chipsi mayai C: Wali wa nazi", "options": ["A", "B", "C"], "required": true },
      { "id": "q4", "type": "text", "question": "Describe spices commonly used in Tanzanian Swahili cuisine and their cultural origin.", "required": true },
      { "id": "q5", "type": "text", "question": "Explain hospitality through sharing food in Tanzanian Swahili culture.", "required": true },
      { "id": "q6", "type": "opinion", "question": "Better represents fusion? A: Biryani B: Ugali with stew", "options": ["A", "B", "Equal"], "required": true },
      { "id": "q7", "type": "text", "question": "Describe a typical Swahili Tanzanian meal structure.", "required": true },
      { "id": "q8", "type": "text", "question": "Explain taboos like avoiding pork/alcohol in many Swahili Tanzanian communities.", "required": true },
      { "id": "q9", "type": "opinion", "question": "More everyday food? A: Street chipsi mayai B: Festive pilau", "options": ["A", "B"], "required": true },
      { "id": "q10", "type": "text", "question": "Describe coconut use in coastal Tanzanian Swahili dishes.", "required": true },
      { "id": "q11", "type": "text", "question": "Explain how food reflects trade history in Zanzibar/Tanzania.", "required": true },
      { "id": "q12", "type": "opinion", "question": "In modern Tanzania, is traditional food declining? A: Yes B: No C: Evolving", "options": ["A", "B", "C"], "required": true }
    ]
  },
  {
    "id": "task54",
    "title": "Evaluate Modern Swahili Culture in Urban Tanzania",
    "category": "Bongo Flava & Urban Swahili Youth Culture",
    "paymentAmount": 27,
    "duration": "1h 15m",
    "difficulty": "Advanced",
    "questions": [
      { "id": "q1", "type": "text", "question": "Explain how Bongo Flava blends traditional Swahili elements with hip-hop/R&B.", "required": true },
      { "id": "q2", "type": "text", "question": "Describe Bongo Flava's role in expressing Tanzanian urban youth identity.", "required": true },
      { "id": "q3", "type": "opinion", "question": "More influential on youth? A: Traditional Taarab B: Bongo Flava", "options": ["A", "B", "Both"], "required": true },
      { "id": "q4", "type": "text", "question": "Explain how Swahili language unifies diverse Tanzanian ethnic groups in modern music.", "required": true },
      { "id": "q5", "type": "text", "question": "Describe urban Tanzanian youth blending slang with traditional values.", "required": true },
      { "id": "q6", "type": "opinion", "question": "Does Bongo Flava preserve or change Swahili culture? A: Preserve B: Change C: Both", "options": ["A", "B", "C"], "required": true },
      { "id": "q7", "type": "text", "question": "Explain themes like poverty, love, hustle in Bongo Flava lyrics.", "required": true },
      { "id": "q8", "type": "text", "question": "Describe how artists like Diamond Platnumz globalize Tanzanian Swahili culture.", "required": true },
      { "id": "q9", "type": "opinion", "question": "Better for cultural expression? A: Lyrics in pure Kiswahili B: Code-mixing with English", "options": ["A", "B"], "required": true },
      { "id": "q10", "type": "text", "question": "Explain dance and fashion influences from Bongo Flava on Tanzanian youth.", "required": true },
      { "id": "q11", "type": "text", "question": "Describe how Swahili proverbs appear in modern Bongo Flava songs.", "required": true },
      { "id": "q12", "type": "opinion", "question": "Will urban Swahili culture dominate traditional in future Tanzania? A: Yes B: No C: Blend", "options": ["A", "B", "C"], "required": true },
      { "id": "q13", "type": "text", "question": "Explain the shift from English to Kiswahili in Tanzanian hip-hop/Bongo Flava.", "required": true },
      { "id": "q14", "type": "text", "question": "Describe a Bongo Flava song example illustrating cultural pride.", "required": true }
    ]
  },
  {
    "id": "task55",
    "title": "Analyze Tanzanian Music Genres and Evolution",
    "category": "Music Industry",
    "paymentAmount": 28,
    "duration": "1h 30m",
    "difficulty": "Intermediate",
    "questions": [
      {
        "id": "q1",
        "type": "opinion",
        "question": "Which genre best represents modern Tanzanian urban youth culture? A: Traditional Ngoma. B: Bongo Flava. C: Taarab. D: Singeli.",
        "options": ["A", "B", "C", "D"],
        "required": true
      },
      {
        "id": "q2",
        "type": "text",
        "question": "Briefly explain the origins of Bongo Flava and its key influences from the 1990s.",
        "required": true
      },
      {
        "id": "q3",
        "type": "opinion",
        "question": "Which description of Singeli is more accurate? A: Slow melodic coastal music. B: High-energy fast-paced electronic dance from Dar es Salaam streets (200-300 BPM).",
        "options": ["A", "B", "Both Equal"],
        "required": true
      },
      {
        "id": "q4",
        "type": "text",
        "question": "Describe how Taarab music blends cultural influences and its historical importance in Zanzibar.",
        "required": true
      },
      {
        "id": "q5",
        "type": "opinion",
        "question": "In recent trends, which fusion is gaining popularity in Tanzanian music? A: Bongopiano (Bongo Flava + Amapiano). B: Pure traditional ngoma revival.",
        "options": ["A", "B", "Both Equal"],
        "required": true
      },
      {
        "id": "q6",
        "type": "text",
        "question": "List three ways globalization (e.g., streaming platforms, collaborations) has impacted Tanzanian music since 2020.",
        "required": true
      },
      {
        "id": "q7",
        "type": "opinion",
        "question": "Which artist is often credited with pushing Bongo Flava to global audiences in the 2020s? A: Ali Kiba. B: Diamond Platnumz. C: Bi Kidude.",
        "options": ["A", "B", "C"],
        "required": true
      },
      {
        "id": "q8",
        "type": "text",
        "question": "Rewrite this basic sentence to make it more engaging for a music blog: 'Singeli originated in Dar es Salaam in the mid-2000s.'",
        "required": true
      },
      {
        "id": "q9",
        "type": "opinion",
        "question": "Which BASATA-recognized genre was added last? A: Taarab. B: Bongo Flava (added in 2001). C: Dansi.",
        "options": ["A", "B", "C"],
        "required": true
      },
      {
        "id": "q10",
        "type": "text",
        "question": "Suggest one challenge the Tanzanian music industry faces (e.g., piracy, infrastructure) and a possible solution.",
        "required": true
      },
      {
        "id": "q11",
        "type": "opinion",
        "question": "Two statements about Tanzanian music trends in 2025: Which is more accurate? A: Decline in local streams. B: Rise in collaborations and digital platforms boosting artists like Harmonize and Zuchu.",
        "options": ["A", "B", "Both Equal"],
        "required": true
      },
      {
        "id": "q12",
        "type": "file",
        "question": "Create a simple mind map or diagram showing the evolution of Tanzanian genres (e.g., Ngoma → Taarab → Bongo Flava → Singeli/Bongopiano). Label at least three connections. Upload as image or DOCX.",
        "acceptedFormats": "image/*,.docx",
        "required": true
      }
    ]
  },
  {
    "id": "task56",
    "title": "Evaluate Tanzanian Music Artists and Industry Impact",
    "category": "Music Industry",
    "paymentAmount": 32,
    "duration": "1h 45m",
    "difficulty": "Advanced",
    "questions": [
      {
        "id": "q1",
        "type": "opinion",
        "question": "Which artist has the most global impact from Tanzania in recent years (e.g., billions of views, international collabs)? A: Rayvanny. B: Diamond Platnumz. C: Ali Kiba.",
        "options": ["A", "B", "C"],
        "required": true
      },
      {
        "id": "q2",
        "type": "text",
        "question": "Describe the rivalry and contributions of Diamond Platnumz and Ali Kiba to Bongo Flava.",
        "required": true
      },
      {
        "id": "q3",
        "type": "opinion",
        "question": "Which female artist broke records (e.g., first East African woman with 1M+ YouTube subs in early 2020s)? A: Zuchu. B: Nandy. C: Abigail Chams.",
        "options": ["A", "B", "C"],
        "required": true
      },
      {
        "id": "q4",
        "type": "text",
        "question": "Name three rising or prominent Tanzanian artists in 2025 (e.g., from hits like 'Single Again', 'Me Too', or amapiano fusions) and one key achievement each.",
        "required": true
      },
      {
        "id": "q5",
        "type": "opinion",
        "question": "In awards like Tanzania Music Awards, which category highlights fast-paced street music? A: Best Bongo Flava. B: Best Singeli Artist.",
        "options": ["A", "B", "Both Equal"],
        "required": true
      },
      {
        "id": "q6",
        "type": "text",
        "question": "Explain how streaming platforms (Spotify, Boomplay, YouTube) have changed the Tanzanian music industry since the mid-2010s.",
        "required": true
      },
      {
        "id": "q7",
        "type": "opinion",
        "question": "Which collaboration trend is prominent in recent Tanzanian hits? A: Only local features. B: Cross-African (e.g., with Nigerian, Congolese artists) and global stars.",
        "options": ["A", "B", "Both Equal"],
        "required": true
      },
      {
        "id": "q8",
        "type": "text",
        "question": "Write a short 100-120 word profile for Harmonize, highlighting his style, hits, and impact.",
        "required": true
      },
      {
        "id": "q9",
        "type": "opinion",
        "question": "Which statement best describes the role of artists like Marioo or Jay Melody in 2025? A: Minimal influence. B: Key in blending Bongo Flava with amapiano and pop.",
        "options": ["A", "B", "Both Equal"],
        "required": true
      },
      {
        "id": "q10",
        "type": "text",
        "question": "List two economic benefits and one challenge for Tanzanian musicians from international recognition.",
        "required": true
      },
      {
        "id": "q11",
        "type": "opinion",
        "question": "Two descriptions of the industry in 2025: Which is more accurate? A: Stagnant growth. B: Booming with billions of streams, global exports, and digital dominance.",
        "options": ["A", "B", "Both Equal"],
        "required": true
      },
      {
        "id": "q12",
        "type": "text",
        "question": "Suggest one way emerging artists can break into the Tanzanian music scene today (e.g., social media strategy).",
        "required": true
      },
      {
        "id": "q13",
        "type": "file",
        "question": "Design a simple mock poster for a fictional Tanzanian music festival featuring Bongo Flava and Singeli artists (include title, 3-4 artist names, and one drawn icon or element). Upload as image or DOCX.",
        "acceptedFormats": "image/*,.docx",
        "required": true
      }
    ]
  }

];

export default availableTasks;
