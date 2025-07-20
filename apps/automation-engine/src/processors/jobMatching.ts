import { Job } from 'bull';
import { PrismaClient } from '@rigger/database';
import { logger } from '../../utils/logger';
import { addNotificationJob } from '../index';

const prisma = new PrismaClient();

interface JobMatchingData {
  jobId: string;
}

export async function processJobMatching(job: Job<JobMatchingData>): Promise<void> {
  const { jobId } = job.data;
  
  try {
    logger.info(`Processing job matching for job: ${jobId}`);

    // Fetch the job with required skills
    const jobPost = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        skills: {
          include: {
            skill: true
          }
        },
        company: true
      }
    });

    if (!jobPost) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Get all active worker profiles
    const workers = await prisma.workerProfile.findMany({
      where: { status: 'AVAILABLE' },
      include: {
        user: true,
        skills: {
          include: {
            skill: true
          }
        },
        certifications: {
          where: { status: 'ACTIVE' },
          include: {
            certification: true
          }
        }
      }
    });

    const matches = [];

    // Calculate match scores for each worker
    for (const worker of workers) {
      const score = calculateMatchScore(jobPost, worker);
      
      if (score >= 60) { // Minimum 60% match
        matches.push({
          jobId,
          workerProfileId: worker.id,
          score,
          reasons: generateMatchReasons(jobPost, worker, score)
        });

        // Send notification to worker about job match
        await addNotificationJob(
          'job-match',
          worker.user.email,
          {
            jobTitle: jobPost.title,
            companyName: jobPost.company.name,
            matchScore: score,
            payRate: jobPost.payRate,
            location: `${jobPost.city}, ${jobPost.state}`
          }
        );
      }
    }

    // Save matches to database
    if (matches.length > 0) {
      await prisma.jobMatch.createMany({
        data: matches,
        skipDuplicates: true
      });
    }

    logger.info(`Job matching completed for ${jobId}: ${matches.length} matches found`);

    // Log automation activity
    await prisma.automationLog.create({
      data: {
        type: 'JOB_MATCHING',
        status: 'SUCCESS',
        data: {
          jobId,
          matchesFound: matches.length,
          processingTime: Date.now() - job.timestamp
        }
      }
    });

  } catch (error) {
    logger.error(`Job matching failed for ${jobId}:`, error);
    
    await prisma.automationLog.create({
      data: {
        type: 'JOB_MATCHING',
        status: 'FAILED',
        data: { jobId },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    throw error;
  }
}

function calculateMatchScore(job: any, worker: any): number {
  let score = 0;
  let maxScore = 0;

  // Skills matching (40% of total score)
  const requiredSkills = job.skills.filter((js: any) => js.required);
  const optionalSkills = job.skills.filter((js: any) => !js.required);
  
  maxScore += requiredSkills.length * 40;
  maxScore += optionalSkills.length * 20;

  // Check required skills
  for (const requiredSkill of requiredSkills) {
    const workerSkill = worker.skills.find((ws: any) => 
      ws.skill.id === requiredSkill.skillId
    );
    
    if (workerSkill) {
      score += 40;
      // Bonus for proficiency level
      if (workerSkill.proficiency >= 8) score += 10;
      else if (workerSkill.proficiency >= 6) score += 5;
    }
  }

  // Check optional skills
  for (const optionalSkill of optionalSkills) {
    const workerSkill = worker.skills.find((ws: any) => 
      ws.skill.id === optionalSkill.skillId
    );
    
    if (workerSkill) {
      score += 20;
      if (workerSkill.proficiency >= 8) score += 5;
    }
  }

  // Location proximity (20% of total score)
  maxScore += 100;
  if (worker.city === job.city) {
    score += 100;
  } else if (worker.state === job.state) {
    score += 50;
  }

  // Experience level (20% of total score)
  maxScore += 100;
  if (worker.yearsExp >= 10) score += 100;
  else if (worker.yearsExp >= 5) score += 70;
  else if (worker.yearsExp >= 2) score += 40;
  else score += 20;

  // Certifications (20% of total score)
  maxScore += 100;
  const activeCertifications = worker.certifications.filter((wc: any) => 
    wc.status === 'ACTIVE' && new Date(wc.expiresAt) > new Date()
  );
  
  if (activeCertifications.length >= 3) score += 100;
  else if (activeCertifications.length >= 2) score += 70;
  else if (activeCertifications.length >= 1) score += 40;

  return Math.min(100, Math.round((score / maxScore) * 100));
}

function generateMatchReasons(job: any, worker: any, score: number): any {
  const reasons = [];

  // Skills analysis
  const matchingSkills = worker.skills.filter((ws: any) =>
    job.skills.some((js: any) => js.skillId === ws.skill.id)
  );

  if (matchingSkills.length > 0) {
    reasons.push(`${matchingSkills.length} matching skills including ${matchingSkills[0].skill.name}`);
  }

  // Location
  if (worker.city === job.city) {
    reasons.push('Local worker - same city');
  } else if (worker.state === job.state) {
    reasons.push('Regional worker - same state');
  }

  // Experience
  if (worker.yearsExp >= 10) {
    reasons.push('Highly experienced (10+ years)');
  } else if (worker.yearsExp >= 5) {
    reasons.push('Experienced professional (5+ years)');
  }

  // Certifications
  const validCerts = worker.certifications.filter((wc: any) => 
    wc.status === 'ACTIVE' && new Date(wc.expiresAt) > new Date()
  );
  
  if (validCerts.length > 0) {
    reasons.push(`${validCerts.length} active certifications`);
  }

  return {
    score,
    reasons,
    matchingSkills: matchingSkills.map((ws: any) => ({
      name: ws.skill.name,
      proficiency: ws.proficiency,
      experience: ws.yearsExp
    }))
  };
}

