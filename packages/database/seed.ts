import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  console.log('🗑️  Cleaning existing data...');
  await prisma.jobMatch.deleteMany();
  await prisma.automationLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.workerCertification.deleteMany();
  await prisma.workerSkill.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.companySubscription.deleteMany();
  await prisma.companyUser.deleteMany();
  await prisma.company.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.skill.deleteMany();

  // Create subscription plans
  console.log('💳 Creating subscription plans...');
  const basicPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Basic',
      description: 'Perfect for small companies',
      price: 49.99,
      interval: 'monthly',
      jobPostLimit: 5,
      features: {
        jobPosts: 5,
        applicantTracking: true,
        basicAnalytics: true,
        emailSupport: true
      }
    }
  });

  const premiumPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Premium',
      description: 'Great for growing businesses',
      price: 99.99,
      interval: 'monthly',
      jobPostLimit: 20,
      features: {
        jobPosts: 20,
        applicantTracking: true,
        advancedAnalytics: true,
        prioritySupport: true,
        aiMatching: true
      }
    }
  });

  const enterprisePlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Enterprise',
      description: 'For large organizations',
      price: 199.99,
      interval: 'monthly',
      jobPostLimit: null, // Unlimited
      features: {
        jobPosts: 'unlimited',
        applicantTracking: true,
        advancedAnalytics: true,
        dedicatedSupport: true,
        aiMatching: true,
        apiAccess: true,
        customIntegrations: true
      }
    }
  });

  // Create skills
  console.log('🛠️  Creating skills...');
  const skills = await Promise.all([
    prisma.skill.create({
      data: { name: 'Rigging', category: 'Construction', description: 'Setting up and operating rigging equipment' }
    }),
    prisma.skill.create({
      data: { name: 'Scaffolding', category: 'Construction', description: 'Erecting and dismantling scaffolding structures' }
    }),
    prisma.skill.create({
      data: { name: 'Tower Crane Operation', category: 'Heavy Machinery', description: 'Operating tower cranes safely' }
    }),
    prisma.skill.create({
      data: { name: 'Safety Management', category: 'Safety', description: 'Managing workplace safety protocols' }
    }),
    prisma.skill.create({
      data: { name: 'Steel Erection', category: 'Construction', description: 'Erecting steel structures' }
    }),
    prisma.skill.create({
      data: { name: 'Heights Safety', category: 'Safety', description: 'Working safely at heights' }
    }),
    prisma.skill.create({
      data: { name: 'Team Leadership', category: 'Management', description: 'Leading construction teams' }
    }),
    prisma.skill.create({
      data: { name: 'Equipment Maintenance', category: 'Maintenance', description: 'Maintaining construction equipment' }
    })
  ]);

  // Create certifications
  console.log('🎓 Creating certifications...');
  const certifications = await Promise.all([
    prisma.certification.create({
      data: {
        name: 'WorkSafe WA High Risk License',
        category: 'Safety',
        authority: 'WorkSafe Western Australia',
        description: 'Required for high-risk construction work in WA',
        validityPeriod: 60 // 5 years
      }
    }),
    prisma.certification.create({
      data: {
        name: 'SafeWork NSW White Card',
        category: 'Safety',
        authority: 'SafeWork NSW',
        description: 'General construction induction training',
        validityPeriod: null // No expiry
      }
    }),
    prisma.certification.create({
      data: {
        name: 'EWP License',
        category: 'Equipment',
        authority: 'Various State Authorities',
        description: 'Elevated Work Platform operation license',
        validityPeriod: 60 // 5 years
      }
    }),
    prisma.certification.create({
      data: {
        name: 'First Aid Certificate',
        category: 'Safety',
        authority: 'St John Ambulance',
        description: 'First aid and CPR certification',
        validityPeriod: 36 // 3 years
      }
    }),
    prisma.certification.create({
      data: {
        name: 'Crane Operator License',
        category: 'Equipment',
        authority: 'State Licensing Authority',
        description: 'License to operate various types of cranes',
        validityPeriod: 60 // 5 years
      }
    })
  ]);

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tiation.net',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerifiedAt: new Date()
    }
  });

  // Create demo companies
  console.log('🏢 Creating demo companies...');
  const company1 = await prisma.company.create({
    data: {
      name: 'ACME Construction Ltd',
      abn: '12345678901',
      description: 'Leading construction company specializing in commercial buildings',
      website: 'https://acme-construction.com.au',
      addressLine1: '123 Construction Street',
      city: 'Perth',
      state: 'WA',
      postcode: '6000',
      country: 'Australia',
      status: 'ACTIVE'
    }
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'BuildRight Mining Services',
      abn: '98765432109',
      description: 'Mining construction and maintenance services',
      website: 'https://buildright-mining.com.au',
      addressLine1: '456 Mining Road',
      city: 'Kalgoorlie',
      state: 'WA',
      postcode: '6430',
      country: 'Australia',
      status: 'ACTIVE'
    }
  });

  // Create company owner users
  const companyOwner1Password = await bcrypt.hash('Owner123!', 12);
  const companyOwner1 = await prisma.user.create({
    data: {
      email: 'owner@acme-construction.com.au',
      passwordHash: companyOwner1Password,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+61412345678',
      role: 'COMPANY_OWNER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date()
    }
  });

  const companyOwner2Password = await bcrypt.hash('Owner456!', 12);
  const companyOwner2 = await prisma.user.create({
    data: {
      email: 'owner@buildright-mining.com.au',
      passwordHash: companyOwner2Password,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+61487654321',
      role: 'COMPANY_OWNER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date()
    }
  });

  // Associate owners with companies
  await prisma.companyUser.create({
    data: {
      userId: companyOwner1.id,
      companyId: company1.id,
      role: 'OWNER'
    }
  });

  await prisma.companyUser.create({
    data: {
      userId: companyOwner2.id,
      companyId: company2.id,
      role: 'OWNER'
    }
  });

  // Create subscriptions for companies
  await prisma.companySubscription.create({
    data: {
      companyId: company1.id,
      planId: premiumPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  await prisma.companySubscription.create({
    data: {
      companyId: company2.id,
      planId: enterprisePlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  // Create demo workers
  console.log('👷 Creating demo workers...');
  const workerPassword = await bcrypt.hash('Worker123!', 12);
  
  const worker1 = await prisma.user.create({
    data: {
      email: 'jake.thompson@email.com',
      passwordHash: workerPassword,
      firstName: 'Jake',
      lastName: 'Thompson',
      phone: '+61456789123',
      role: 'WORKER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date()
    }
  });

  const worker2 = await prisma.user.create({
    data: {
      email: 'sarah.mitchell@email.com',
      passwordHash: workerPassword,
      firstName: 'Sarah',
      lastName: 'Mitchell',
      phone: '+61456789124',
      role: 'WORKER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date()
    }
  });

  const worker3 = await prisma.user.create({
    data: {
      email: 'mike.chen@email.com',
      passwordHash: workerPassword,
      firstName: 'Mike',
      lastName: 'Chen',
      phone: '+61456789125',
      role: 'WORKER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date()
    }
  });

  // Create worker profiles
  const workerProfile1 = await prisma.workerProfile.create({
    data: {
      userId: worker1.id,
      status: 'AVAILABLE',
      bio: 'Experienced rigger and scaffolder with 12+ years in construction. Specializing in high-rise buildings and mining operations.',
      yearsExp: 12,
      hourlyRate: 45,
      city: 'Perth',
      state: 'WA',
      postcode: '6000',
      travelRadius: 50
    }
  });

  const workerProfile2 = await prisma.workerProfile.create({
    data: {
      userId: worker2.id,
      status: 'AVAILABLE',
      bio: 'Lead scaffolder with excellent safety record. Expert in complex scaffolding systems and team leadership.',
      yearsExp: 8,
      hourlyRate: 42,
      city: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      travelRadius: 30
    }
  });

  const workerProfile3 = await prisma.workerProfile.create({
    data: {
      userId: worker3.id,
      status: 'BUSY',
      bio: 'Construction rigger with crane operation expertise. Strong background in steel erection projects.',
      yearsExp: 6,
      hourlyRate: 38,
      city: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      travelRadius: 40
    }
  });

  // Add skills to workers
  console.log('🔧 Adding skills to workers...');
  await Promise.all([
    // Jake Thompson skills
    prisma.workerSkill.create({
      data: { workerProfileId: workerProfile1.id, skillId: skills[0].id, proficiency: 9, yearsExp: 12 } // Rigging
    }),
    prisma.workerSkill.create({
      data: { workerProfileId: workerProfile1.id, skillId: skills[1].id, proficiency: 8, yearsExp: 10 } // Scaffolding
    }),
    prisma.workerSkill.create({
      data: { workerProfileId: workerProfile1.id, skillId: skills[3].id, proficiency: 9, yearsExp: 8 } // Safety Management
    }),
    prisma.workerSkill.create({
      data: { workerProfileId: workerProfile1.id, skillId: skills[2].id, proficiency: 7, yearsExp: 5 } // Tower Crane
    }),

    // Sarah Mitchell skills
    prisma.workerSkill.create({
      data: { workerProfileId: workerProfile2.id, skillId: skills[1].id, proficiency: 9, yearsExp: 8 } // Scaffolding
    }),
    prisma.workerSkill.create({
      data: { workerProfileId: workerProfile2.id, skillId: skills[5].id, proficiency: 9, yearsExp: 8 } // Heights Safety
    }),
    prisma.workerSkill.create({
      data: { workerProfileId: workerProfile2.id, skillId: skills[6].id, proficiency: 8, yearsExp: 5 } // Team Leadership
    }),

    // Mike Chen skills
    prisma.workerSkill.create({
      data: { workerProfileId: workerProfile3.id, skillId: skills[0].id, proficiency: 7, yearsExp: 6 } // Rigging
    }),
    prisma.workerSkill.create({
      data: { workerProfileId: workerProfile3.id, skillId: skills[2].id, proficiency: 8, yearsExp: 4 } // Tower Crane
    }),
    prisma.workerSkill.create({
      data: { workerProfileId: workerProfile3.id, skillId: skills[4].id, proficiency: 7, yearsExp: 6 } // Steel Erection
    })
  ]);

  // Add certifications to workers
  console.log('🎯 Adding certifications to workers...');
  const currentDate = new Date();
  const futureDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000); // 2 years from now

  await Promise.all([
    // Jake Thompson certifications
    prisma.workerCertification.create({
      data: {
        workerProfileId: workerProfile1.id,
        certificationId: certifications[0].id, // WorkSafe WA
        status: 'ACTIVE',
        issuedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        expiresAt: futureDate,
        certificationNumber: 'WA-HRL-001234'
      }
    }),
    prisma.workerCertification.create({
      data: {
        workerProfileId: workerProfile1.id,
        certificationId: certifications[3].id, // First Aid
        status: 'ACTIVE',
        issuedAt: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000), // 6 months ago
        expiresAt: futureDate,
        certificationNumber: 'FA-001234'
      }
    }),
    prisma.workerCertification.create({
      data: {
        workerProfileId: workerProfile1.id,
        certificationId: certifications[4].id, // Crane License
        status: 'ACTIVE',
        issuedAt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000), // 2 years ago
        expiresAt: futureDate,
        certificationNumber: 'CR-001234'
      }
    }),

    // Sarah Mitchell certifications
    prisma.workerCertification.create({
      data: {
        workerProfileId: workerProfile2.id,
        certificationId: certifications[1].id, // NSW White Card
        status: 'ACTIVE',
        issuedAt: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000), // 3 years ago
        expiresAt: null,
        certificationNumber: 'NSW-WC-005678'
      }
    }),
    prisma.workerCertification.create({
      data: {
        workerProfileId: workerProfile2.id,
        certificationId: certifications[2].id, // EWP License
        status: 'ACTIVE',
        issuedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        expiresAt: futureDate,
        certificationNumber: 'EWP-005678'
      }
    }),

    // Mike Chen certifications
    prisma.workerCertification.create({
      data: {
        workerProfileId: workerProfile3.id,
        certificationId: certifications[1].id, // White Card
        status: 'ACTIVE',
        issuedAt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000), // 2 years ago
        expiresAt: null,
        certificationNumber: 'VIC-WC-009876'
      }
    }),
    prisma.workerCertification.create({
      data: {
        workerProfileId: workerProfile3.id,
        certificationId: certifications[4].id, // Crane License
        status: 'ACTIVE',
        issuedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        expiresAt: futureDate,
        certificationNumber: 'CR-009876'
      }
    })
  ]);

  // Create demo jobs
  console.log('💼 Creating demo jobs...');
  const job1 = await prisma.job.create({
    data: {
      companyId: company1.id,
      title: 'Senior Rigger - Mining Operations',
      description: `We are seeking an experienced Senior Rigger to join our mining operations team in the Pilbara region. 

The successful candidate will be responsible for:
- Setting up and operating heavy rigging equipment
- Ensuring compliance with all safety protocols
- Leading a team of junior riggers
- Conducting equipment inspections and maintenance

Requirements:
- Minimum 8 years rigging experience
- Valid WorkSafe WA High Risk License
- Mining industry experience preferred
- Strong leadership and communication skills`,
      status: 'PUBLISHED',
      type: 'FULL_TIME',
      payRate: 48,
      payType: 'hourly',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      hoursPerWeek: 40,
      city: 'Pilbara',
      state: 'WA',
      postcode: '6714',
      isRemote: false,
      maxApplicants: 10,
      applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      publishedAt: new Date()
    }
  });

  const job2 = await prisma.job.create({
    data: {
      companyId: company1.id,
      title: 'Lead Scaffolder - CBD Tower Project',
      description: `Exciting opportunity for a Lead Scaffolder to work on a prestigious CBD tower project in Perth.

Key Responsibilities:
- Design and erect complex scaffolding systems
- Ensure all work meets Australian Standards
- Supervise scaffolding team
- Liaise with project managers and other trades

Requirements:
- Minimum 5 years scaffolding experience
- Valid scaffolding licenses and certifications
- Experience with high-rise construction
- Strong safety record`,
      status: 'PUBLISHED',
      type: 'CONTRACT',
      payRate: 45,
      payType: 'hourly',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      hoursPerWeek: 38,
      city: 'Perth',
      state: 'WA',
      postcode: '6000',
      isRemote: false,
      maxApplicants: 8,
      applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      publishedAt: new Date()
    }
  });

  const job3 = await prisma.job.create({
    data: {
      companyId: company2.id,
      title: 'Construction Rigger - Equipment Maintenance',
      description: `Join our maintenance team as a Construction Rigger specializing in equipment maintenance and repairs.

Duties include:
- Rigging and moving heavy machinery
- Performing equipment maintenance
- Working with crane operators
- Maintaining detailed maintenance records

What we offer:
- Competitive hourly rates
- Ongoing training opportunities
- Safe working environment
- Career progression`,
      status: 'PUBLISHED',
      type: 'PART_TIME',
      payRate: 42,
      payType: 'hourly',
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
      hoursPerWeek: 30,
      city: 'Kalgoorlie',
      state: 'WA',
      postcode: '6430',
      isRemote: false,
      maxApplicants: 5,
      applicationDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
      publishedAt: new Date()
    }
  });

  // Add required skills to jobs
  console.log('🎯 Adding required skills to jobs...');
  await Promise.all([
    // Job 1 skills
    prisma.jobSkill.create({
      data: { jobId: job1.id, skillId: skills[0].id, required: true, minExp: 8 } // Rigging
    }),
    prisma.jobSkill.create({
      data: { jobId: job1.id, skillId: skills[3].id, required: true, minExp: 5 } // Safety Management
    }),
    prisma.jobSkill.create({
      data: { jobId: job1.id, skillId: skills[6].id, required: false, minExp: 3 } // Team Leadership
    }),

    // Job 2 skills
    prisma.jobSkill.create({
      data: { jobId: job2.id, skillId: skills[1].id, required: true, minExp: 5 } // Scaffolding
    }),
    prisma.jobSkill.create({
      data: { jobId: job2.id, skillId: skills[5].id, required: true, minExp: 3 } // Heights Safety
    }),
    prisma.jobSkill.create({
      data: { jobId: job2.id, skillId: skills[6].id, required: false, minExp: 2 } // Team Leadership
    }),

    // Job 3 skills
    prisma.jobSkill.create({
      data: { jobId: job3.id, skillId: skills[0].id, required: true, minExp: 3 } // Rigging
    }),
    prisma.jobSkill.create({
      data: { jobId: job3.id, skillId: skills[7].id, required: true, minExp: 2 } // Equipment Maintenance
    }),
    prisma.jobSkill.create({
      data: { jobId: job3.id, skillId: skills[2].id, required: false, minExp: 1 } // Tower Crane
    })
  ]);

  // Create some job applications
  console.log('📄 Creating job applications...');
  await Promise.all([
    prisma.jobApplication.create({
      data: {
        jobId: job1.id,
        workerProfileId: workerProfile1.id,
        status: 'PENDING',
        coverLetter: 'I am very interested in this Senior Rigger position. With 12+ years of experience in rigging and a strong safety record, I believe I would be a great fit for your mining operations team.',
        proposedRate: 48,
        availableFrom: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.jobApplication.create({
      data: {
        jobId: job2.id,
        workerProfileId: workerProfile2.id,
        status: 'REVIEWING',
        coverLetter: 'As an experienced lead scaffolder, I am excited about the opportunity to work on your CBD tower project. My 8 years of experience and strong safety record make me an ideal candidate.',
        proposedRate: 45,
        availableFrom: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.jobApplication.create({
      data: {
        jobId: job3.id,
        workerProfileId: workerProfile3.id,
        status: 'INTERVIEWED',
        coverLetter: 'I am interested in the equipment maintenance role. My background in rigging and crane operations would be valuable for your maintenance team.',
        proposedRate: 40,
        availableFrom: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      }
    })
  ]);

  // Create some job matches (AI-generated matches)
  console.log('🤖 Creating AI job matches...');
  await Promise.all([
    prisma.jobMatch.create({
      data: {
        jobId: job1.id,
        workerProfileId: workerProfile1.id,
        score: 95.5,
        reasons: {
          score: 95.5,
          reasons: [
            'Highly experienced (12+ years)',
            'Perfect skill match for rigging',
            'Local worker - same state',
            '3 active certifications'
          ],
          matchingSkills: [
            { name: 'Rigging', proficiency: 9, experience: 12 },
            { name: 'Safety Management', proficiency: 9, experience: 8 },
            { name: 'Tower Crane Operation', proficiency: 7, experience: 5 }
          ]
        }
      }
    }),
    prisma.jobMatch.create({
      data: {
        jobId: job2.id,
        workerProfileId: workerProfile2.id,
        score: 88.0,
        reasons: {
          score: 88.0,
          reasons: [
            'Experienced professional (8+ years)',
            'Perfect match for scaffolding',
            'Regional worker - same state',
            '2 active certifications'
          ],
          matchingSkills: [
            { name: 'Scaffolding', proficiency: 9, experience: 8 },
            { name: 'Heights Safety', proficiency: 9, experience: 8 },
            { name: 'Team Leadership', proficiency: 8, experience: 5 }
          ]
        }
      }
    }),
    prisma.jobMatch.create({
      data: {
        jobId: job3.id,
        workerProfileId: workerProfile3.id,
        score: 76.0,
        reasons: {
          score: 76.0,
          reasons: [
            'Good experience level (6 years)',
            'Strong rigging skills',
            'Equipment maintenance background',
            'Currently busy but suitable'
          ],
          matchingSkills: [
            { name: 'Rigging', proficiency: 7, experience: 6 },
            { name: 'Tower Crane Operation', proficiency: 8, experience: 4 }
          ]
        }
      }
    })
  ]);

  // Create some automation logs
  console.log('📊 Creating automation logs...');
  await Promise.all([
    prisma.automationLog.create({
      data: {
        type: 'JOB_MATCHING',
        status: 'SUCCESS',
        data: {
          jobId: job1.id,
          matchesFound: 1,
          processingTime: 1240
        }
      }
    }),
    prisma.automationLog.create({
      data: {
        type: 'NOTIFICATION_SENT',
        status: 'SUCCESS',
        data: {
          type: 'job-match',
          recipient: 'jake.thompson@email.com',
          jobTitle: 'Senior Rigger - Mining Operations'
        }
      }
    }),
    prisma.automationLog.create({
      data: {
        type: 'PAYMENT_PROCESSING',
        status: 'SUCCESS',
        data: {
          subscriptionId: 'sub_1',
          amount: 99.99,
          companyId: company1.id
        }
      }
    })
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Demo Accounts Created:');
  console.log('');
  console.log('🔐 Admin Account:');
  console.log('   Email: admin@tiation.net');
  console.log('   Password: Admin123!');
  console.log('');
  console.log('🏢 Company Owner Accounts:');
  console.log('   Email: owner@acme-construction.com.au');
  console.log('   Password: Owner123!');
  console.log('   Company: ACME Construction Ltd');
  console.log('');
  console.log('   Email: owner@buildright-mining.com.au');
  console.log('   Password: Owner456!');
  console.log('   Company: BuildRight Mining Services');
  console.log('');
  console.log('👷 Worker Accounts:');
  console.log('   Email: jake.thompson@email.com');
  console.log('   Password: Worker123!');
  console.log('   Profile: Senior Rigger & Scaffolder');
  console.log('');
  console.log('   Email: sarah.mitchell@email.com');
  console.log('   Password: Worker123!');
  console.log('   Profile: Lead Scaffolder');
  console.log('');
  console.log('   Email: mike.chen@email.com');
  console.log('   Password: Worker123!');
  console.log('   Profile: Construction Rigger');
  console.log('');
  console.log('📊 Sample Data:');
  console.log(`   - ${skills.length} skills created`);
  console.log(`   - ${certifications.length} certifications created`);
  console.log('   - 3 subscription plans created');
  console.log('   - 2 demo companies created');
  console.log('   - 3 active jobs posted');
  console.log('   - 3 job applications submitted');
  console.log('   - AI job matching data generated');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });