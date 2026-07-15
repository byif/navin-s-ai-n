from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

try:
    from .app import Base
except ImportError:
    from app import Base


class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    company_email = Column(String, unique=True, nullable=False)
    designation = Column(String)
    company_id = Column(Integer, ForeignKey("companies.id"))
    created_at = Column(DateTime, default=datetime.now)

    company = relationship("Company", back_populates="recruiters")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    profile_json = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now)


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    website = Column(String)
    industry = Column(String)
    description = Column(Text)
    logo_url = Column(String)
    company_size = Column(String)
    locations = Column(Text)

    recruiters = relationship("Recruiter", back_populates="company")
    jobs = relationship("Job", back_populates="company")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    required_skills = Column(Text)
    experience_required = Column(String)
    location = Column(String)
    employment_type = Column(String)
    salary_range = Column(String)
    openings = Column(Integer, default=1)
    deadline = Column(DateTime)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.now)

    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    candidate_name = Column(String, nullable=False)
    resume_url = Column(String)
    ats_score = Column(Integer, default=0)
    resume_score = Column(Integer, default=0)
    career_prediction = Column(String)
    stage = Column(String, default="Applied")
    created_at = Column(DateTime, default=datetime.now)

    job = relationship("Job", back_populates="applications")


class ApplicationStatus(Base):
    __tablename__ = "application_status"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    status = Column(String, nullable=False)
    changed_by_user_id = Column(Integer, ForeignKey("users.id"))
    note = Column(Text)
    created_at = Column(DateTime, default=datetime.now)


class CandidateRanking(Base):
    __tablename__ = "candidate_rankings"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    match_percentage = Column(Integer, default=0)
    skill_match = Column(Integer, default=0)
    experience_match = Column(Integer, default=0)
    education_match = Column(Integer, default=0)
    ai_summary = Column(Text)


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    scheduled_at = Column(DateTime)
    mode = Column(String)
    interview_score = Column(Integer, default=0)
    confidence_score = Column(Integer, default=0)
    communication_score = Column(Integer, default=0)
    eye_contact_score = Column(Integer, default=0)
    technical_score = Column(Integer, default=0)
    status = Column(String, default="Waiting")
    join_time = Column(DateTime)
    exit_time = Column(DateTime)
    duration = Column(String)


class InterviewResult(Base):
    __tablename__ = "interview_results"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    monitoring_report = Column(Text)
    feedback = Column(Text)
    recording_url = Column(String)
    created_at = Column(DateTime, default=datetime.now)


class RecruiterNote(Base):
    __tablename__ = "recruiter_notes"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    recruiter_id = Column(Integer, ForeignKey("recruiters.id"))
    note = Column(Text)
    created_at = Column(DateTime, default=datetime.now)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    notification_type = Column(String)
    subject = Column(String)
    body = Column(Text)
    status = Column(String, default="Draft")
    created_at = Column(DateTime, default=datetime.now)


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String)
    action = Column(String, nullable=False)
    metadata = Column(Text)
    created_at = Column(DateTime, default=datetime.now)


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token_hash = Column(String, nullable=False)
    refresh_token_hash = Column(String)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)
    revoked_at = Column(DateTime)
