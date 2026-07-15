import csv
import os
import re
from collections import defaultdict
from pathlib import Path

import requests


BASE_DIR = Path(__file__).resolve().parent

ROLE_PROFILES = {
    "Full Stack Developer": {"skills": ["html", "css", "javascript", "typescript", "react", "angular", "vue", "node", "express", "django", "flask", "fastapi", "mongodb", "mysql", "postgresql", "api", "git"], "interests": ["web apps", "frontend", "backend", "software development"]},
    "Machine Learning Engineer": {"skills": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "numpy", "pandas", "nlp", "opencv"], "interests": ["ai", "machine learning", "data science", "computer vision"]},
    "AI Researcher": {"skills": ["python", "deep learning", "tensorflow", "pytorch", "nlp", "opencv", "research", "statistics", "machine learning"], "interests": ["ai", "research", "computer vision", "natural language processing"]},
    "Data Analyst": {"skills": ["sql", "excel", "python", "pandas", "numpy", "power bi", "tableau", "statistics", "data analysis", "visualization"], "interests": ["analytics", "data analysis", "forecasting", "business intelligence"]},
    "DevOps Engineer": {"skills": ["linux", "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "jenkins", "terraform", "git", "networking", "cloud"], "interests": ["cloud", "automation", "deployment", "infrastructure"]},
    "Cloud Architect": {"skills": ["aws", "azure", "gcp", "cloud", "docker", "kubernetes", "networking", "security", "terraform", "linux"], "interests": ["cloud", "architecture", "infrastructure", "scalability"]},
    "Security Analyst": {"skills": ["security", "cybersecurity", "networking", "linux", "penetration testing", "ethical hacking", "siem", "cryptography"], "interests": ["cybersecurity", "security", "ethical hacking", "networks"]},
    "Network Engineer": {"skills": ["networking", "linux", "cisco", "routing", "switching", "tcp/ip", "firewall", "security"], "interests": ["networks", "infrastructure", "security"]},
    "Business Analyst": {"skills": ["excel", "sql", "power bi", "tableau", "requirements", "documentation", "analytics", "communication"], "interests": ["business", "analytics", "finance", "process improvement"]},
    "Financial Analyst": {"skills": ["excel", "finance", "accounting", "forecasting", "statistics", "power bi", "sql", "valuation"], "interests": ["finance", "forecasting", "investment", "business"]},
    "UI/UX Designer": {"skills": ["figma", "ui design", "ux", "wireframing", "prototyping", "user research", "adobe", "illustration"], "interests": ["ui design", "design", "user experience", "web apps"]},
    "Graphic Designer": {"skills": ["adobe", "photoshop", "illustrator", "illustration", "branding", "editing", "figma"], "interests": ["design", "branding", "art", "illustration"]},
    "Content Strategist": {"skills": ["writing", "editing", "seo", "content", "marketing", "research", "communication"], "interests": ["writing", "marketing", "branding", "social media"]},
    "Technical Writer": {"skills": ["writing", "editing", "documentation", "research", "technical writing", "communication"], "interests": ["writing", "technology", "documentation", "teaching"]},
    "Marketing Manager": {"skills": ["marketing", "seo", "branding", "analytics", "social media", "communication", "excel"], "interests": ["marketing", "branding", "social media", "business"]},
    "HR Specialist": {"skills": ["recruitment", "counseling", "communication", "human resources", "hr", "excel"], "interests": ["recruitment", "people", "management", "counseling"]},
    "Clinical Psychologist": {"skills": ["psychology", "counseling", "mental health", "research", "communication"], "interests": ["mental health", "psychology", "counseling", "healthcare"]},
    "Automobile Design Engineer": {"skills": ["autocad", "solidworks", "cad", "mechanical", "manufacturing", "design"], "interests": ["automobile", "manufacturing", "mechanical design", "engineering"]},
    "Creative Director": {"skills": ["branding", "adobe", "illustration", "design", "marketing", "editing", "communication"], "interests": ["branding", "art", "design", "marketing"]},
}

SECTION_CHECKS = {
    "Contact details": ["email", "linkedin", "github", "phone"],
    "Professional summary": ["summary", "objective", "profile"],
    "Education": ["education", "b.tech", "bsc", "msc", "mca", "mba", "degree"],
    "Skills": ["skills", "technical skills", "technologies"],
    "Projects": ["project", "projects"],
    "Experience": ["experience", "internship", "intern", "employment", "work history"],
    "Achievements": ["certification", "certifications", "achievement", "awards"],
}

SECTION_WEIGHTS = {"Contact details": 10, "Professional summary": 10, "Education": 12, "Skills": 18, "Projects": 18, "Experience": 20, "Achievements": 12}

# Hugging Face AI Endpoints
SIMILARITY_MODEL_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
NER_MODEL_URL = "https://api-inference.huggingface.co/models/jjzha/jobbert-base-cased-ner"

def extract_text_from_pdf(file_storage):
    """Parses text out of an incoming file buffer using pypdf"""
    try:
        pdf_file = io.BytesIO(file_storage.read())
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"PDF Extraction Error: {e}")
        return ""

def process_resume_analysis(extracted_text, targeted_job_title, targeted_job_description):
    """Handles the dataset logic and calls Hugging Face models if inputs are present"""
    word_count = len(extracted_text.split())
    HF_TOKEN = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_TOKEN")
    headers = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

    # 1. Base Response Payload (Your standard dataset lookup structure)
    analysis_result = {
        "predicted_career": "Full Stack Developer",
        "score": 70,
        "word_count": word_count,
        "sections": [
            {"name": "Contact details", "found": True, "points": 10},
            {"name": "Professional summary", "found": True, "points": 10},
            {"name": "Skills", "found": True, "points": 18}
        ],
        "career_matches": [
            {"career": "Full Stack Developer", "confidence": 68, "matched_skills": ["html", "css", "javascript"]}
        ],
        "suggestions": ["Quantify achievements inside your professional experiences section."]
    }

    # 2. Global AI Matching: Runs only if targeting parameters are provided by the user
    if targeted_job_title and targeted_job_description:
        full_job_context = f"{targeted_job_title} {targeted_job_description}"

        # --- PIECE A: Semantic Distance Match Calculation ---
        similarity_payload = {
            "inputs": {
                "source_sentence": full_job_context,
                "sentences": [extracted_text]
            }
        }
        try:
            sim_res = requests.post(SIMILARITY_MODEL_URL, json=similarity_payload, headers=headers)
            raw_vector_score = 0.5
            if sim_res.status_code == 200:
                scores = sim_res.json()
                if isinstance(scores, list) and len(scores) > 0:
                    raw_vector_score = scores[0]
            contextual_match_score = min(100, max(0, int((raw_vector_score + 0.15) * 100)))
            analysis_result["targeted_match_score"] = contextual_match_score
        except Exception as e:
            print(f"Similarity API Error: {e}")

        # --- PIECE B: Extract Skills & Map Differences ---
        try:
            ner_payload = {"inputs": full_job_context}
            ner_res = requests.post(NER_MODEL_URL, json=ner_payload, headers=headers)
            
            discovered_job_skills = []
            if ner_res.status_code == 200:
                entities = ner_res.json()
                if isinstance(entities, list):
                    for entity in entities:
                        if entity.get('entity_group') == 'SKILL' and entity.get('word'):
                            clean_skill = entity['word'].replace('##', '').lower().strip()
                            if len(clean_skill) > 1 and clean_skill not in discovered_job_skills:
                                discovered_job_skills.append(clean_skill)

            resume_lower = extracted_text.lower()
            detected_gaps = [skill.upper() for skill in discovered_job_skills if skill not in resume_lower]
            
            analysis_result["predicted_career"] = targeted_job_title
            analysis_result["skill_gaps"] = detected_gaps[:4] if detected_gaps else ["PYTHON", "REST APIS", "SQL DATABASES"]
        except Exception as e:
            print(f"NER API Error: {e}")

    return analysis_result


def normalize(text):
    return re.sub(r"\s+", " ", text.lower()).strip()


def contains_term(text, term):
    term = normalize(term)
    return bool(re.search(rf"\b{re.escape(term)}\b", text)) if len(term) <= 2 else term in text


def load_csv_profiles(csv_path=BASE_DIR / "carreradvisor.csv"):
    profiles = defaultdict(lambda: {"skills": set(), "interests": set(), "education": set()})
    with open(csv_path, newline="", encoding="utf-8") as csvfile:
        for row in csv.DictReader(csvfile):
            career = row["Career Path"].strip()
            profiles[career]["skills"].update(skill.strip().lower() for skill in row["Skills"].split(","))
            profiles[career]["interests"].update(interest.strip().lower() for interest in row["Interests"].split(","))
            profiles[career]["education"].add(row["Education"].strip().lower())
    return profiles


CSV_PROFILES = load_csv_profiles()


def rank_careers(resume_text, limit=5):
    text = normalize(resume_text)
    results = []
    for career, profile in ROLE_PROFILES.items():
        matched_skills = [skill for skill in profile["skills"] if contains_term(text, skill)]
        matched_interests = [interest for interest in profile["interests"] if contains_term(text, interest)]
        csv_profile = CSV_PROFILES.get(career, {})
        csv_skills = [skill for skill in csv_profile.get("skills", []) if contains_term(text, skill)]
        csv_interests = [interest for interest in csv_profile.get("interests", []) if contains_term(text, interest)]
        csv_education = [education for education in csv_profile.get("education", []) if contains_term(text, education)]
        curated_score = min(len(matched_skills) * 8, 64) + min(len(matched_interests) * 5, 15)
        csv_score = min(len(csv_skills) * 1.5, 9) + min(len(csv_interests), 4) + min(len(csv_education) * 2, 4)
        confidence = round(min(curated_score + csv_score, 96))
        if confidence >= 15:
            evidence = list(dict.fromkeys(matched_skills + matched_interests + csv_skills))[:6]
            results.append({"career": career, "confidence": confidence, "matched_skills": evidence})
    return sorted(results, key=lambda item: item["confidence"], reverse=True)[:limit]


def score_resume(resume_text, top_match=None):
    text = normalize(resume_text)
    sections = []
    score = 0
    for section, keywords in SECTION_CHECKS.items():
        found = any(contains_term(text, keyword) for keyword in keywords)
        sections.append({"name": section, "found": found, "points": SECTION_WEIGHTS[section]})
        if found:
            score += SECTION_WEIGHTS[section]
    word_count = len(re.findall(r"\b\w+\b", text))
    if 180 <= word_count <= 1200:
        score += 5
    if top_match:
        score += min(len(top_match.get("matched_skills", [])), 5)
    missing = [section["name"] for section in sections if not section["found"]]
    suggestions = [f"Add a clear {name.lower()} section." for name in missing[:4]]
    if word_count < 180:
        suggestions.append("Add more detail to your projects and experience using measurable outcomes.")
    elif word_count > 1200:
        suggestions.append("Shorten the resume and prioritize the most relevant achievements.")
    if top_match and len(top_match.get("matched_skills", [])) < 3:
        suggestions.append("Add more role-specific technical skills and show where you applied them.")
    return {"score": min(score, 100), "sections": sections, "suggestions": suggestions[:5], "word_count": word_count}


def analyze_resume(resume_text):
    matches = rank_careers(resume_text)
    quality = score_resume(resume_text, matches[0] if matches else None)
    return {
        "predicted_career": matches[0]["career"] if matches else "General Career Profile",
        "career_matches": matches,
        "all_predictions": [match["career"] for match in matches],
        **quality,
    }


def is_valid_resume(text):
    normalized_text = normalize(text)
    matched_sections = sum(any(contains_term(normalized_text, keyword) for keyword in keywords) for keywords in SECTION_CHECKS.values())
    return matched_sections >= 2 and len(normalized_text) >= 80


SKILL_ALIASES = {
    "Python": ["python", "py"],
    "Java": ["java"],
    "C++": ["c++", "cpp"],
    "JavaScript": ["javascript", "java script", "js"],
    "TypeScript": ["typescript", "ts"],
    "HTML": ["html", "html5"],
    "CSS": ["css", "css3", "tailwind"],
    "React": ["react", "react.js", "reactjs"],
    "Node.js": ["node", "node.js", "nodejs"],
    "Express": ["express", "express.js"],
    "Next.js": ["next", "next.js", "nextjs"],
    "SQL": ["sql", "mysql", "postgresql", "postgres", "sqlite"],
    "MongoDB": ["mongodb", "mongo"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Statistics": ["statistics", "statistical analysis", "probability"],
    "Power BI": ["power bi", "powerbi"],
    "Machine Learning": ["machine learning", "ml"],
    "Deep Learning": ["deep learning"],
    "Computer Vision": ["computer vision", "opencv", "cv"],
    "NLP": ["nlp", "natural language processing"],
    "TensorFlow": ["tensorflow"],
    "PyTorch": ["pytorch", "torch"],
    "Scikit-learn": ["scikit-learn", "sklearn"],
    "Docker": ["docker", "containerization", "containers"],
    "Kubernetes": ["kubernetes", "k8s"],
    "AWS": ["aws", "amazon web services"],
    "Azure": ["azure", "microsoft azure"],
    "GCP": ["gcp", "google cloud"],
    "Git": ["git", "github", "version control"],
    "Linux": ["linux", "unix"],
    "REST APIs": ["rest api", "restful api", "rest apis", "api development"],
    "System Design": ["system design", "scalability", "distributed systems"],
    "Data Structures": ["data structures", "arrays", "linked lists", "trees", "graphs"],
    "Dynamic Programming": ["dynamic programming", "dp"],
    "Aptitude": ["aptitude", "quantitative aptitude", "reasoning"],
    "Excel": ["excel", "spreadsheets"],
    "CI/CD": ["ci/cd", "continuous integration", "continuous deployment"],
}

ROLE_SKILL_HINTS = {
    "frontend": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git"],
    "front end": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git"],
    "backend": ["Node.js", "Express", "SQL", "REST APIs", "Git"],
    "back end": ["Node.js", "Express", "SQL", "REST APIs", "Git"],
    "full stack": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "SQL", "Git"],
    "software": ["Python", "Java", "JavaScript", "SQL", "Data Structures", "Git"],
    "data analyst": ["SQL", "Python", "Pandas", "Statistics", "Power BI", "Excel"],
    "data scientist": ["Python", "SQL", "Pandas", "NumPy", "Statistics", "Machine Learning"],
    "machine learning": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Statistics"],
    "ai": ["Python", "Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch"],
    "devops": ["Linux", "Docker", "Kubernetes", "AWS", "Git", "CI/CD"],
    "cloud": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Linux"],
}

RESOURCE_LIBRARY = {
    "Docker": [
        ("Docker Official Docs", "Container basics, images, Dockerfiles, and Compose.", "https://docs.docker.com/get-started/", "1-2 weeks"),
        ("freeCodeCamp Docker Course", "Beginner-friendly hands-on Docker walkthrough.", "https://www.freecodecamp.org/news/the-docker-handbook/", "1 week"),
        ("Roadmap.sh Docker", "A focused checklist for Docker concepts and practice.", "https://roadmap.sh/docker", "3-5 days"),
    ],
    "AWS": [
        ("AWS Skill Builder", "Guided AWS learning paths and cloud fundamentals.", "https://skillbuilder.aws/", "2-4 weeks"),
        ("AWS Documentation", "Official service documentation and getting-started guides.", "https://docs.aws.amazon.com/", "Ongoing"),
        ("AWS Cloud Practitioner Essentials", "Beginner path for core cloud and AWS services.", "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", "1 week"),
    ],
    "React": [
        ("React Docs", "Official modern React lessons, hooks, and component patterns.", "https://react.dev/learn", "3-4 weeks"),
        ("freeCodeCamp React", "Project-based React practice for beginners.", "https://www.freecodecamp.org/news/tag/react/", "2-3 weeks"),
    ],
    "Python": [
        ("Python Docs Tutorial", "Official Python fundamentals and standard library basics.", "https://docs.python.org/3/tutorial/", "2-3 weeks"),
        ("freeCodeCamp Python", "Beginner Python lessons with practical examples.", "https://www.freecodecamp.org/news/learn-python-free-python-courses-for-beginners/", "3 weeks"),
    ],
    "SQL": [
        ("Microsoft Learn SQL", "Structured SQL learning modules and database basics.", "https://learn.microsoft.com/en-us/training/browse/?terms=sql", "2-3 weeks"),
        ("Mode SQL Tutorial", "Practical analytics SQL with real query patterns.", "https://mode.com/sql-tutorial/", "1-2 weeks"),
    ],
    "Git": [
        ("Git Documentation", "Official Git book and command references.", "https://git-scm.com/book/en/v2", "1 week"),
        ("GitHub Skills", "Interactive Git and GitHub workflow courses.", "https://skills.github.com/", "2-4 days"),
    ],
    "Machine Learning": [
        ("Google ML Crash Course", "Practical machine learning foundations and model evaluation.", "https://developers.google.com/machine-learning/crash-course", "3-5 weeks"),
        ("Microsoft Learn AI", "Applied AI and ML modules for career preparation.", "https://learn.microsoft.com/en-us/training/browse/?terms=machine%20learning", "3-4 weeks"),
    ],
    "TensorFlow": [
        ("TensorFlow Learn", "Official TensorFlow tutorials and model-building guides.", "https://www.tensorflow.org/learn", "2-3 weeks"),
    ],
    "PyTorch": [
        ("PyTorch Tutorials", "Official PyTorch training loops, tensors, and model examples.", "https://pytorch.org/tutorials/", "2-3 weeks"),
    ],
    "Node.js": [
        ("Node.js Learn", "Official server-side JavaScript fundamentals.", "https://nodejs.org/en/learn", "2-3 weeks"),
    ],
    "System Design": [
        ("Roadmap.sh System Design", "Structured system design roadmap and interview concepts.", "https://roadmap.sh/system-design", "4-6 weeks"),
    ],
}

DEFAULT_RESOURCE_LINKS = [
    ("GeeksForGeeks", "Concept explanations, examples, and interview preparation.", "https://www.geeksforgeeks.org/", "1-2 weeks"),
    ("freeCodeCamp", "Hands-on tutorials and project-based learning.", "https://www.freecodecamp.org/news/", "1-3 weeks"),
    ("Roadmap.sh", "Skill roadmaps and structured learning checkpoints.", "https://roadmap.sh/", "1 week"),
]


def canonicalize_skill(raw_skill):
    cleaned = normalize(raw_skill).strip(" .,:;()[]{}")
    for skill, aliases in SKILL_ALIASES.items():
        if cleaned == normalize(skill) or cleaned in aliases:
            return skill
    return raw_skill.strip().title()


def extract_known_skills(text):
    normalized_text = normalize(text)
    found = []
    for skill, aliases in SKILL_ALIASES.items():
        terms = [skill, *aliases]
        if any(contains_term(normalized_text, term) for term in terms):
            found.append(skill)
    return list(dict.fromkeys(found))


def extract_huggingface_skills(text):
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_TOKEN")
    if not token or not text.strip():
        return []

    try:
        response = requests.post(
            NER_MODEL_URL,
            json={"inputs": text[:3500]},
            headers={"Authorization": f"Bearer {token}"},
            timeout=8,
        )
        if response.status_code != 200:
            return []

        entities = response.json()
        if not isinstance(entities, list):
            return []

        skills = []
        for entity in entities:
            label = str(entity.get("entity_group") or entity.get("entity") or "").lower()
            word = str(entity.get("word") or "").replace("##", "").strip()
            if word and ("skill" in label or label in {"misc", "b-misc", "i-misc"}):
                skills.append(canonicalize_skill(word))
        return list(dict.fromkeys(skills))
    except Exception as exc:
        print(f"Hugging Face skill extraction fallback used: {exc}")
        return []


def infer_required_skills(job_title, job_description):
    context = f"{job_title} {job_description}".strip()
    required = extract_known_skills(context)
    required.extend(extract_huggingface_skills(context))

    title_text = normalize(job_title)
    if not job_description.strip() or len(required) < 4:
        for hint, skills in ROLE_SKILL_HINTS.items():
            if hint in title_text:
                required.extend(skills)

    return list(dict.fromkeys(canonicalize_skill(skill) for skill in required if skill))


def build_learning_resources(missing_skills):
    recommendations = []
    for skill in missing_skills[:8]:
        links = RESOURCE_LIBRARY.get(skill, DEFAULT_RESOURCE_LINKS)
        for name, description, link, estimate in links[:3]:
            recommendations.append({
                "skill": skill,
                "resource_name": name,
                "description": description,
                "link": link,
                "estimated_time": estimate,
            })
    return recommendations


def analyze_skill_gap(resume_text, job_title="", job_description=""):
    target_role = job_title.strip() or "Target Role"
    required_skills = infer_required_skills(job_title, job_description)
    resume_skills = extract_known_skills(resume_text)
    resume_skill_set = set(resume_skills)

    matched_skills = [skill for skill in required_skills if skill in resume_skill_set]
    missing_skills = [skill for skill in required_skills if skill not in resume_skill_set]

    match_score = round((len(matched_skills) / len(required_skills)) * 100) if required_skills else 0
    skill_gap_score = max(0, 100 - match_score)

    return {
        "targeted_analysis": True,
        "target_role": target_role,
        "required_skills": required_skills,
        "resume_skills": resume_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommended_skills": missing_skills[:8],
        "match_score": match_score,
        "skill_gap_score": skill_gap_score,
        "targeted_match_score": match_score,
        "skill_gaps": missing_skills,
        "learning_resources": build_learning_resources(missing_skills),
    }


def process_resume_analysis(extracted_text, targeted_job_title="", targeted_job_description=""):
    analysis = analyze_resume(extracted_text)
    if targeted_job_title.strip() or targeted_job_description.strip():
        analysis.update(analyze_skill_gap(extracted_text, targeted_job_title, targeted_job_description))
    return analysis


