import { GoogleGenAI, Type } from "@google/genai";
import { IndividualFeedback, FinalReport, InterviewData, InterviewQuestion, CodingProblem, CodingFeedback } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const feedbackSchema = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.OBJECT,
      properties: {
        clarity: { type: Type.NUMBER, description: "Clarity of the answer on a scale of 1 to 10." },
        relevance: { type: Type.NUMBER, description: "Relevance of the answer to the question on a scale of 1 to 10." },
        structure: { type: Type.NUMBER, description: "Structure of the answer (e.g., STAR method) on a scale of 1 to 10." },
      },
      required: ["clarity", "relevance", "structure"],
    },
    strengths: {
      type: Type.STRING,
      description: "A concise summary of the answer's strengths.",
    },
    improvements: {
      type: Type.STRING,
      description: "A concise summary of areas for improvement.",
    },
  },
  required: ["scores", "strengths", "improvements"],
};

const finalReportSchema = {
    type: Type.OBJECT,
    properties: {
        overallSummary: {
            type: Type.STRING,
            description: "A brief, encouraging summary of the candidate's overall performance."
        },
        keyStrengths: {
            type: Type.STRING,
            description: "A summary of key strengths demonstrated across all answers."
        },
        areasForImprovement: {
            type: Type.STRING,
            description: "A summary of recurring areas for improvement identified in the interview."
        },
        actionableTips: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A single actionable tip for improvement."
            },
            description: "A list of 3-5 concrete, actionable tips for the candidate's next interview."
        },
        codingChallengeFeedback: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                correctness: { type: Type.NUMBER },
                efficiency: { type: Type.NUMBER },
                style: { type: Type.NUMBER },
                suggestions: { type: Type.STRING },
            },
            description: "Feedback on the coding challenge, if one was completed. This field can be omitted if no challenge was attempted."
        }
    },
    required: ["overallSummary", "keyStrengths", "areasForImprovement", "actionableTips"]
};

const interviewQuestionsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.NUMBER, description: "A unique integer ID for the question, starting from 1." },
      category: { type: Type.STRING, description: "The category of the question (e.g., 'Behavioral', 'Problem-Solving', 'Teamwork')." },
      question: { type: Type.STRING, description: "The interview question text." },
    },
    required: ["id", "category", "question"],
  },
};

const codingProblemSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, descriptive title for the problem." },
    description: { type: Type.STRING, description: "A detailed description of the coding problem to be solved." },
    example: { type: Type.STRING, description: "A simple example with input and expected output to clarify the problem." },
  },
  required: ["title", "description", "example"],
};

const codingFeedbackSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief, encouraging summary of the code's quality and approach." },
    correctness: { type: Type.NUMBER, description: "A score from 1-10 on whether the code correctly solves the problem." },
    efficiency: { type: Type.NUMBER, description: "A score from 1-10 on the code's efficiency (time and space complexity)." },
    style: { type: Type.NUMBER, description: "A score from 1-10 on code style, readability, and best practices." },
    suggestions: { type: Type.STRING, description: "A detailed explanation of strengths and specific, actionable suggestions for improvement." },
  },
  required: ["summary", "correctness", "efficiency", "style", "suggestions"],
};

export const generateInterviewQuestions = async (): Promise<InterviewQuestion[]> => {
  const prompt = `You are an expert career coach. Generate 5 diverse and insightful interview questions for a general software engineering role.
  Ensure a mix of categories: 'Behavioral', 'Problem-Solving', and 'Teamwork'.
  The questions should be unique and thought-provoking.
  Assign a unique ID to each question, starting from 1.
  Return the questions in the specified JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: interviewQuestionsSchema,
      temperature: 1.0,
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as InterviewQuestion[];
};

export const generateTechnicalQuestions = async (topic: string): Promise<InterviewQuestion[]> => {
  const prompt = `You are an expert technical interviewer. Generate 5 insightful interview questions for a "${topic}" software engineering role.
  Ensure a mix of categories like 'Technical Concept', 'Data Structures', 'Algorithms', and 'Problem-Solving' that are relevant to ${topic}.
  The questions should be unique and thought-provoking.
  Assign a unique ID to each question, starting from 6.
  Return the questions in the specified JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: interviewQuestionsSchema,
      temperature: 0.8,
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as InterviewQuestion[];
};

export const analyzeAnswer = async (question: string, answer: string): Promise<IndividualFeedback> => {
  const prompt = `You are an expert interview coach. Analyze the following answer to the interview question.
    Provide constructive feedback. Be encouraging but also direct.
    Evaluate clarity, relevance, and structure (like the STAR method) on a scale of 1-10.
    Provide a concise summary of strengths and areas for improvement.

    Question: "${question}"
    Answer: "${answer}"

    Return the analysis in the specified JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: feedbackSchema,
      temperature: 0.5,
    }
  });
  
  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as IndividualFeedback;
};

export const generateCodingProblem = async (topic: string): Promise<CodingProblem> => {
  const prompt = `You are an expert technical interviewer. Generate a medium-difficulty coding problem relevant to a "${topic}" software engineering role.
  The problem should be solvable within 10-15 minutes.
  Provide a clear title, a detailed description, and a simple input/output example.
  Return the problem in the specified JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: codingProblemSchema,
      temperature: 0.9,
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as CodingProblem;
};

export const analyzeCodingSolution = async (problem: string, solution: string): Promise<CodingFeedback> => {
  const prompt = `You are an expert programming instructor and code reviewer.
  Analyze the following code solution for the given problem.
  Evaluate it on correctness, efficiency (Big O notation), and coding style/readability.
  Provide scores for each category from 1-10.
  Offer a constructive summary and detailed, actionable suggestions for improvement.
  Assume the language is likely JavaScript/TypeScript but analyze based on general programming principles.

  Problem: "${problem}"
  
  Solution:
  \`\`\`
  ${solution}
  \`\`\`

  Return the analysis in the specified JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: codingFeedbackSchema,
      temperature: 0.4,
    }
  });
  
  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as CodingFeedback;
};


export const generateFinalReport = async (interviewData: InterviewData[], codingChallenge?: { problem: CodingProblem, solution: string, feedback: CodingFeedback | null }): Promise<FinalReport> => {
    const formattedData = interviewData.map(({ question, answer, feedback }) => ({
        question: question.question,
        answer,
        feedback,
    }));

    const prompt = `You are an expert interview coach. Based on the entire interview session data provided below, generate a final comprehensive evaluation.
    Your tone should be encouraging and professional.
    1.  Provide an overall summary of the candidate's performance.
    2.  Identify key strengths demonstrated across all answers.
    3.  Pinpoint recurring areas for improvement.
    4.  Offer 3-5 concise, actionable tips for the candidate to focus on for their next interview.
    5.  If coding challenge feedback is provided, include it in the final report under the 'codingChallengeFeedback' field. If no coding challenge was done, omit this field from the JSON output.

    Interview Data:
    ${JSON.stringify(formattedData, null, 2)}
    
    Coding Challenge Feedback (if applicable):
    ${codingChallenge && codingChallenge.feedback ? JSON.stringify(codingChallenge.feedback, null, 2) : "Not attempted."}

    Return the final report in the specified JSON format.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: finalReportSchema,
            temperature: 0.6,
        }
    });

    const jsonText = response.text.trim();
    const report = JSON.parse(jsonText) as FinalReport;
    if (report.codingChallengeFeedback && !report.codingChallengeFeedback.summary) {
        delete report.codingChallengeFeedback;
    }
    return report;
};
