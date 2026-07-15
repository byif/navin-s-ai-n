CAREER_SKILLS = {
    "Software Engineer": ["java", "python", "c++", "react", "node", "api"],
    "Data Scientist": ["python", "pandas", "numpy", "machine learning", "sql"],
    "AI/ML Engineer": ["deep learning", "tensorflow", "pytorch", "nlp", "opencv"],
}

def predict_career(resume_text):
    scores = {}

    for career, skills in CAREER_SKILLS.items():
        scores[career] = sum(skill in resume_text for skill in skills)

    sorted_careers = sorted(scores, key=scores.get, reverse=True)
    return sorted_careers[:3], scores

def calculate_score(resume_text, career):
    skills = CAREER_SKILLS[career]

    skill_score = (sum(skill in resume_text for skill in skills) / len(skills)) * 40
    project_score = 25 if "project" in resume_text else 10
    experience_score = 20 if "intern" in resume_text or "experience" in resume_text else 8
    cert_score = 10 if "certification" in resume_text else 5
    structure_score = 5

    total = skill_score + project_score + experience_score + cert_score + structure_score
    return round(total)
