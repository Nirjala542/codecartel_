const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google Generative AI SDK with the API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

const geminiService = {
  /**
   * Generates tailored interview questions based on the user's profile and target role.
   */
  generateInterviewQuestions: async (userContext, targetRole) => {
    try {
      const prompt = `
        You are an expert technical interviewer. Create a 5-question technical interview for a candidate applying for a ${targetRole} role.
        Tailor the questions to their specific skills and experience:
        Skills: ${JSON.stringify(userContext.skills)}
        GitHub Repos: ${userContext.githubReposContext || 'None provided'}
        Experience: ${JSON.stringify(userContext.experience)}
        
        The 5 questions must be a mix of:
        - "code" (algorithm or component implementation)
        - "mcq" (multiple choice, conceptual)
        - "text" (open-ended explanation or system design)
        
        You MUST respond ONLY with a valid JSON array of 5 objects in the following format (no markdown formatting, just raw JSON):
        [
          {
            "id": "q1",
            "number": 1,
            "type": "code",
            "category": "Frontend/Backend/DSA",
            "question": "Write a function that...",
            "boilerplate": "function solve() {\\n  // code here\\n}\\n",
            "options": null,
            "answer": "",
            "score": null,
            "feedback": null
          },
          {
            "id": "q2",
            "number": 2,
            "type": "mcq",
            "category": "Concept",
            "question": "What is...",
            "boilerplate": null,
            "options": ["A", "B", "C", "D"],
            "answer": "",
            "score": null,
            "feedback": null
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedResponse = responseText.replace(/```json\n?|```\n?/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw error;
    }
  },

  /**
   * Acts as an ATS scanner to score a resume against a JD and provide a polished resume.
   */
  polishResume: async (resumeData, jdText) => {
    try {
      const prompt = `
        You are an expert Applicant Tracking System (ATS) and professional resume writer.
        Compare the following user resume data against the provided Job Description (JD).
        
        User Resume Data:
        ${JSON.stringify(resumeData)}
        
        Job Description:
        ${jdText}
        
        Perform the following:
        1. Calculate an ATS match score (0-100) based on how well the resume matches the JD.
        2. Identify key keywords/skills from the JD that are missing in the resume.
        3. Write a polished, ATS-optimized markdown version of their resume. Use their existing experience and skills, but optimize the phrasing and include matching keywords naturally to score as high as possible. Ensure the polished resume looks professional and comprehensive.
        
        Respond ONLY with a valid JSON object in the following format (no markdown formatting, just raw JSON):
        {
          "atsScore": <number between 0 and 100>,
          "missingKeywords": ["keyword1", "keyword2", ...],
          "polishedResume": "<markdown string of the polished resume>"
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedResponse = responseText.replace(/```json\n?|```\n?/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error polishing resume with Gemini:', error);
      throw error;
    }
  },

  /**
   * Matches a list of jobs against a user's profile and returns a personalized evaluation array.
   */
  matchJobs: async (userProfile, rawJobs) => {
    try {
      const prompt = `
        You are an expert technical recruiter and AI assistant. 
        Compare the following user profile against a list of job opportunities.
        
        User Profile:
        Skills: ${JSON.stringify(userProfile.skills)}
        Overall Score: ${userProfile.overallScore}/100
        
        Job Opportunities:
        ${JSON.stringify(rawJobs.map(j => ({ id: j.id, role: j.role, company: j.company, description: j.description })))}
        
        For each job, evaluate how well the user fits based on their skills.
        Return ONLY a JSON array of objects with the exact structure below. Do not use markdown.
        [
          {
            "id": "exact_job_id_from_input",
            "matchScore": <number between 0 and 100>,
            "requirements": ["Skill1", "Skill2", "Skill3"], // Key skills required extracted from JD
            "missingSkills": ["Skill4"], // Skills required that the user lacks
            "learnableSkills": ["Skill4"] // Subset of missing skills that the user could realistically learn within a few weeks (e.g. a small library like Redux, instead of a core language like Java)
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedResponse = responseText.replace(/```json\n?|```\n?/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error matching jobs with Gemini:', error);
      throw error;
    }
  },

  /**
   * Evaluates the submitted answer against a prompt and generates a SkillProof Score.
   */
  evaluateAnswer: async (questionPrompt, submittedAnswer, targetRole) => {
    try {
      const prompt = `
        You are an expert technical interviewer evaluating a candidate for a ${targetRole} role.
        The candidate was asked the following question:
        "${questionPrompt}"
        
        The candidate submitted the following answer/code:
        \`\`\`
        ${submittedAnswer}
        \`\`\`
        
        Please evaluate the answer based on correctness, efficiency, and best practices.
        Respond ONLY with a valid JSON object in the following format (no markdown formatting, just raw JSON):
        {
          "score": <number between 0 and 100>,
          "passed": <boolean>,
          "aiFeedback": "<string with detailed feedback on what they did well and what they can improve>"
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean the response to ensure it's valid JSON even if the model wraps it in markdown blocks
      const cleanedResponse = responseText.replace(/```json\n?|```\n?/g, '').trim();
      
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error evaluating answer with Gemini:', error);
      throw error;
    }
  },

  /**
   * Generates contextual career advice based on the user's past data.
   */
  getCareerTwinAdvice: async (messageHistory, userContext) => {
    try {
      const prompt = `
        You are "Career Twin", an expert AI career mentor. 
        Here is the user's current profile context:
        Skills: ${JSON.stringify(userContext.skills)}
        Overall SkillProof Score: ${userContext.overallSkillProofScore}
        
        Here is the recent conversation history:
        ${messageHistory.map(m => `${m.role}: ${m.content}`).join('\n')}
        
        Respond to the user as their Career Twin. Give actionable, concise, and specific advice based on their profile to help them improve their skills and get hired.
        
        You MUST respond ONLY with a valid JSON object in the following format (no markdown formatting, just raw JSON):
        {
          "readinessScore": <number between 0 and 100>,
          "strengths": [ { "text": "<short strength description>", "citation": "<evidence from profile>" } ],
          "weaknesses": [ { "text": "<short weakness description>", "citation": "<evidence from profile>" } ],
          "boosterPlan": [ { "action": "<actionable step>", "days": <number of days estimated> } ]
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedResponse = responseText.replace(/```json\n?|```\n?/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error getting Career Twin advice:', error);
      throw error;
    }
  },

  /**
   * Evaluates text extracted from a resume and/or GitHub data to structure skills and experience.
   */
  evaluateProfile: async (resumeText, githubData, existingSkills = []) => {
    try {
      const prompt = `
        You are an expert technical recruiter AI. Evaluate the candidate holistically based on their provided Resume and/or GitHub Profile Data.

        1. Consolidate a list of technical skills (languages, frameworks, tools) from BOTH the resume and GitHub data. 
           CRITICAL: Here are the user's existing skills: ${JSON.stringify(existingSkills.map(s => s.name))}.
           Do NOT create duplicate boxes (e.g. if "HTML" and "CSS" exist, do NOT output "HTML/CSS". Map new evidence to the existing skills or add entirely new distinct skills).
           Keep the list concise and relevant. Max 15 skills. Include an estimated strength score (0-100) for each skill based on their experience.
        2. A list of their work experience/projects. For each, extract the "role" (e.g., Software Engineer), the "company" (or project name), and the "duration" (e.g., 2020 - 2022). Keep it to the top 3 most recent/relevant experiences.
        3. Estimate an overall skill score (0-100) combining resume impact and GitHub open source activity.
        4. Estimate scores (0-100) for 5 categories: frontend, backend, dsa, communication, ai_readiness.
        5. Identify 3 growth areas (skills they should develop next) with an estimated current strength (0-100).
        
        Here is the resume text (may be empty if syncing GitHub only):
        "${resumeText ? resumeText.substring(0, 5000) : 'None'}"
        
        Here is their GitHub Data (may be empty if no GitHub linked):
        "${githubData ? JSON.stringify(githubData) : 'None'}"
        
        You MUST respond ONLY with a valid JSON object in the following format (no markdown formatting, just raw JSON):
        {
          "skills": [ { "name": "Skill1", "score": 85 } ],
          "experience": [
            { "role": "Role Title", "company": "Company Name", "duration": "Duration String" }
          ],
          "estimatedOverallScore": 75,
          "estimatedCategories": {
            "frontend": 80,
            "backend": 60,
            "dsa": 70,
            "communication": 85,
            "ai_readiness": 50
          },
          "growthAreas": [
            { "name": "System Design", "strength": 30 }
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedResponse = responseText.replace(/```json\n?|```\n?/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error evaluating profile with Gemini:', error);
      throw error;
    }
  }
};

module.exports = geminiService;
