import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@rigger/database';
import { expressAuth, expressRequireRole, expressRequireCompanyAccess } from '@rigger/auth/middleware';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Get all jobs (public endpoint for workers)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('city').optional().isString(),
  query('state').optional().isString(),
  query('skills').optional().isString(),
  query('type').optional().isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY']),
  query('minRate').optional().isFloat({ min: 0 }),
  query('maxRate').optional().isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      status: 'PUBLISHED',
      applicationDeadline: {
        gte: new Date() // Not expired
      }
    };

    if (req.query.city) {
      where.city = { contains: req.query.city as string, mode: 'insensitive' };
    }

    if (req.query.state) {
      where.state = req.query.state as string;
    }

    if (req.query.type) {
      where.type = req.query.type as string;
    }

    if (req.query.minRate || req.query.maxRate) {
      where.payRate = {};
      if (req.query.minRate) where.payRate.gte = parseFloat(req.query.minRate as string);
      if (req.query.maxRate) where.payRate.lte = parseFloat(req.query.maxRate as string);
    }

    // Get jobs with related data
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              city: true,
              state: true
            }
          },
          skills: {
            include: {
              skill: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              }
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.job.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    logger.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs'
    });
  }
});

// Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            website: true,
            city: true,
            state: true,
            country: true
          }
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                category: true,
                description: true
              }
            }
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Only show published jobs to non-company users
    if (job.status !== 'PUBLISHED') {
      // Check if user belongs to the company
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }
      // Additional company access check would go here
    }

    res.json({
      success: true,
      data: job
    });

  } catch (error) {
    logger.error('Get job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job'
    });
  }
});

// Create new job (company users only)
router.post('/', expressRequireRole(['COMPANY_OWNER', 'COMPANY_MANAGER']), [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('description').trim().isLength({ min: 50 }),
  body('type').isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY']),
  body('city').trim().isLength({ min: 1 }),
  body('state').trim().isLength({ min: 1 }),
  body('postcode').trim().isLength({ min: 4, max: 4 }),
  body('payRate').optional().isFloat({ min: 0 }),
  body('skills').isArray({ min: 1 }),
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      title,
      description,
      type,
      payRate,
      payType,
      startDate,
      endDate,
      hoursPerWeek,
      city,
      state,
      postcode,
      isRemote,
      maxApplicants,
      applicationDeadline,
      skills
    } = req.body;

    // Get user's company
    const userCompany = await prisma.companyUser.findFirst({
      where: { userId: req.user.id },
      include: { company: true }
    });

    if (!userCompany) {
      return res.status(403).json({
        success: false,
        error: 'No company associated with user'
      });
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        companyId: userCompany.companyId,
        title,
        description,
        type,
        payRate: payRate ? parseFloat(payRate) : null,
        payType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        hoursPerWeek,
        city,
        state,
        postcode,
        isRemote: isRemote || false,
        maxApplicants,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        status: 'DRAFT' // Created as draft initially
      }
    });

    // Add skills to job
    if (skills && skills.length > 0) {
      await prisma.jobSkill.createMany({
        data: skills.map((skill: any) => ({
          jobId: job.id,
          skillId: skill.skillId,
          required: skill.required || false,
          minExp: skill.minExp || null
        }))
      });
    }

    // Fetch created job with relations
    const createdJob = await prisma.job.findUnique({
      where: { id: job.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    logger.info(`Job created: ${job.title} by company ${userCompany.company.name}`);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: createdJob
    });

  } catch (error) {
    logger.error('Create job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create job'
    });
  }
});

// Publish job (company users only)
router.post('/:id/publish', expressRequireRole(['COMPANY_OWNER', 'COMPANY_MANAGER']), async (req: any, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { company: true }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if user belongs to the job's company
    const userCompany = await prisma.companyUser.findFirst({
      where: {
        userId: req.user.id,
        companyId: job.companyId
      }
    });

    if (!userCompany && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Update job status to published
    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });

    logger.info(`Job published: ${job.title} by ${job.company.name}`);

    res.json({
      success: true,
      message: 'Job published successfully',
      data: updatedJob
    });

  } catch (error) {
    logger.error('Publish job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish job'
    });
  }
});

// Apply for job (workers only)
router.post('/:id/apply', expressAuth, [
  body('coverLetter').optional().trim().isLength({ max: 2000 }),
  body('proposedRate').optional().isFloat({ min: 0 }),
  body('availableFrom').optional().isISO8601(),
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Only workers can apply
    if (req.user.role !== 'WORKER') {
      return res.status(403).json({
        success: false,
        error: 'Only workers can apply for jobs'
      });
    }

    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });

    if (!job || job.status !== 'PUBLISHED') {
      return res.status(404).json({
        success: false,
        error: 'Job not available'
      });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && job.applicationDeadline < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Application deadline has passed'
      });
    }

    // Get worker profile
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!workerProfile) {
      return res.status(400).json({
        success: false,
        error: 'Worker profile not found'
      });
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_workerProfileId: {
          jobId: req.params.id,
          workerProfileId: workerProfile.id
        }
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'Already applied for this job'
      });
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId: req.params.id,
        workerProfileId: workerProfile.id,
        coverLetter: req.body.coverLetter,
        proposedRate: req.body.proposedRate ? parseFloat(req.body.proposedRate) : null,
        availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : null,
        status: 'PENDING'
      },
      include: {
        job: {
          select: {
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    logger.info(`Job application submitted: ${req.user.email} applied for ${application.job.title}`);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });

  } catch (error) {
    logger.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application'
    });
  }
});

export { router as jobRoutes };