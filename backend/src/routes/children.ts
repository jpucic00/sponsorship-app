import express from 'express';
import { prisma } from '../lib/db';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// All children routes require authentication
router.use(isAuthenticated);

// Helper function to process child data for response
const processChildForResponse = async (child: any, includeProfilePhoto = false) => {
  let processedChild = { ...child };
  
  // Add computed isSponsored field
  processedChild.isSponsored = (child.sponsorships?.length || 0) > 0;
  
  // If requested, include profile photo data
  if (includeProfilePhoto) {
    try {
      const profilePhoto = await prisma.childPhoto.findFirst({
        where: { 
          childId: child.id,
          isProfile: true 
        },
        select: {
          photoBase64: true,
          mimeType: true,
          fileName: true,
          fileSize: true
        }
      });

      if (profilePhoto && profilePhoto.photoBase64 && profilePhoto.mimeType) {
        processedChild.photoDataUrl = `data:${profilePhoto.mimeType};base64,${profilePhoto.photoBase64}`;
        processedChild.photoMimeType = profilePhoto.mimeType;
        processedChild.photoFileName = profilePhoto.fileName;
        processedChild.photoSize = profilePhoto.fileSize;
      }
    } catch (error) {
      console.warn('Error fetching profile photo for child', child.id, error);
      // Continue without photo if there's an error
    }
  }
  
  return processedChild;
};

// GET all children with pagination - MUST be first
router.get('/', async (req, res) => {
  try {
    console.log('Children API called with query:', req.query);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string)?.trim() || '';
    const sponsorship = req.query.sponsorship as string; // 'sponsored' | 'unsponsored' | undefined
    const gender = req.query.gender as string; // 'male' | 'female' | undefined
    const schoolId = req.query.schoolId as string;
    const sponsorId = req.query.sponsorId as string;
    const proxyId = req.query.proxyId as string;
    const includeImages = req.query.includeImages !== 'false'; // Include images by default

    console.log('Search term received:', search, 'Length:', search.length);

    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    // Search filter - SQLite doesn't support case-insensitive mode
    if (search && search.length > 0) {
      console.log('Adding search filter for:', search);
      // Convert search to lowercase for case-insensitive search in SQLite
      const searchLower = search.toLowerCase();
      where.OR = [
        { 
          firstName: { 
            contains: searchLower
          } 
        },
        { 
          lastName: { 
            contains: searchLower
          } 
        },
        { 
          school: { 
            name: { 
              contains: searchLower
            } 
          } 
        }
      ];
    }

    // Gender filter - SQLite doesn't support case-insensitive mode
    if (gender && gender !== 'all') {
      where.gender = gender; // Remove mode parameter for SQLite
    }

    // School filter
    if (schoolId && schoolId !== 'all') {
      const schoolIdNum = parseInt(schoolId);
      if (!isNaN(schoolIdNum)) {
        where.schoolId = schoolIdNum;
      }
    }

    // For sponsor and proxy filters, we need to use relationship queries
    if (sponsorId && sponsorId !== 'all') {
      if (sponsorId === 'none') {
        where.sponsorships = { none: { isActive: true } };
      } else {
        const sponsorIdNum = parseInt(sponsorId);
        if (!isNaN(sponsorIdNum)) {
          where.sponsorships = {
            some: {
              sponsorId: sponsorIdNum,
              isActive: true
            }
          };
        }
      }
    }

    if (proxyId && proxyId !== 'all') {
      if (proxyId === 'none') {
        where.sponsorships = {
          every: {
            sponsor: { proxyId: null }
          }
        };
      } else if (proxyId === 'direct') {
        where.sponsorships = {
          some: {
            sponsor: { proxyId: null },
            isActive: true
          }
        };
      } else {
        const proxyIdNum = parseInt(proxyId);
        if (!isNaN(proxyIdNum)) {
          where.sponsorships = {
            some: {
              sponsor: { proxyId: proxyIdNum },
              isActive: true
            }
          };
        }
      }
    }

    // Handle sponsorship filter separately for better performance
    if (sponsorship === 'sponsored') {
      where.sponsorships = { some: { isActive: true } };
    } else if (sponsorship === 'unsponsored') {
      where.sponsorships = { none: { isActive: true } };
    }

    console.log('Final where clause:', JSON.stringify(where, null, 2));

    // Get total count for pagination
    const totalCount = await prisma.child.count({ where });
    console.log('Total count:', totalCount);

    // Build include clause
    const include = {
      school: true,
      sponsorships: {
        where: { isActive: true },
        include: {
          sponsor: {
            include: {
              proxy: true
            }
          }
        }
      }
    };

    // Get paginated children
    const children = await prisma.child.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    console.log('Children found:', children.length);

    // Process children data and include profile photos
    const childrenWithStatus = await Promise.all(
      children.map(async (child) => {
        try {
          return await processChildForResponse(child, includeImages);
        } catch (error) {
          console.error('Error processing child', child.id, error);
          // Return basic child data if processing fails
          return {
            ...child,
            isSponsored: (child.sponsorships?.length || 0) > 0
          };
        }
      })
    );

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      data: childrenWithStatus,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
        startIndex: skip + 1,
        endIndex: Math.min(skip + limit, totalCount)
      }
    };

    console.log('Sending response with', childrenWithStatus.length, 'children');
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching children:', error);
    
    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error stack:', errorStack);
    
    // Send a more detailed error response for debugging
    res.status(500).json({ 
      error: 'Failed to fetch children',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    // Apply the same filters as the main children route for consistency
    const search = req.query.search as string || '';
    const sponsorship = req.query.sponsorship as string;
    const gender = req.query.gender as string;
    const schoolId = req.query.schoolId as string;
    const sponsorId = req.query.sponsorId as string;
    const proxyId = req.query.proxyId as string;

    // Build where clause based on filters (same logic as main route)
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { school: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Gender filter
    if (gender && gender !== 'all') {
      where.gender = { equals: gender, mode: 'insensitive' };
    }

    // School filter
    if (schoolId && schoolId !== 'all') {
      where.schoolId = parseInt(schoolId);
    }

    // For sponsor and proxy filters, we need to use relationship queries
    if (sponsorId && sponsorId !== 'all') {
      if (sponsorId === 'none') {
        where.sponsorships = { none: { isActive: true } };
      } else {
        where.sponsorships = {
          some: {
            sponsorId: parseInt(sponsorId),
            isActive: true
          }
        };
      }
    }

    if (proxyId && proxyId !== 'all') {
      if (proxyId === 'none') {
        where.sponsorships = {
          every: {
            sponsor: { proxyId: null }
          }
        };
      } else if (proxyId === 'direct') {
        where.sponsorships = {
          some: {
            sponsor: { proxyId: null },
            isActive: true
          }
        };
      } else {
        where.sponsorships = {
          some: {
            sponsor: { proxyId: parseInt(proxyId) },
            isActive: true
          }
        };
      }
    }

    // Get total count
    const totalChildren = await prisma.child.count({ where });

    // Get sponsored children count
    let sponsoredWhere = { ...where };
    if (sponsorship === 'sponsored') {
      sponsoredWhere.sponsorships = { some: { isActive: true } };
    } else if (sponsorship === 'unsponsored') {
      sponsoredWhere.sponsorships = { none: { isActive: true } };
    } else {
      // For overall stats, we want to count children with active sponsorships
      sponsoredWhere = {
        ...where,
        sponsorships: { some: { isActive: true } }
      };
    }

    const sponsoredChildren = await prisma.child.count({ 
      where: sponsoredWhere 
    });

    // Get unsponsored children count
    const unsponsoredChildren = sponsorship ? 
      (sponsorship === 'unsponsored' ? totalChildren : totalChildren - sponsoredChildren) :
      await prisma.child.count({
        where: {
          ...where,
          sponsorships: { none: { isActive: true } }
        }
      });

    // Get unique schools count for filtered children
    const childrenWithSchools = await prisma.child.findMany({
      where,
      select: {
        schoolId: true
      },
      distinct: ['schoolId']
    });

    const uniqueSchoolsCount = childrenWithSchools.length;

    // Get gender breakdown
    const genderStats = await prisma.child.groupBy({
      by: ['gender'],
      where,
      _count: {
        gender: true
      }
    });

    // Get class breakdown
    const classStats = await prisma.child.groupBy({
      by: ['class'],
      where,
      _count: {
        class: true
      }
    });

    // Get school breakdown (top 5)
    const schoolStats = await prisma.child.groupBy({
      by: ['schoolId'],
      where,
      _count: {
        schoolId: true
      },
      orderBy: {
        _count: {
          schoolId: 'desc'
        }
      },
      take: 5
    });

    // Get school names for the top schools
    const topSchoolIds = schoolStats.map(stat => stat.schoolId);
    const schools = await prisma.school.findMany({
      where: {
        id: { in: topSchoolIds }
      },
      select: {
        id: true,
        name: true,
        location: true
      }
    });

    // Combine school stats with names
    const schoolStatsWithNames = schoolStats.map(stat => {
      const school = schools.find(s => s.id === stat.schoolId);
      return {
        schoolId: stat.schoolId,
        schoolName: school?.name || 'Unknown School',
        schoolLocation: school?.location || '',
        count: stat._count.schoolId
      };
    });

    const statistics = {
      total: {
        children: totalChildren,
        sponsored: sponsoredChildren,
        unsponsored: unsponsoredChildren,
        schools: uniqueSchoolsCount
      },
      percentages: {
        sponsored: totalChildren > 0 ? Math.round((sponsoredChildren / totalChildren) * 100) : 0,
        unsponsored: totalChildren > 0 ? Math.round((unsponsoredChildren / totalChildren) * 100) : 0
      },
      breakdown: {
        gender: genderStats.map(stat => ({
          gender: stat.gender,
          count: stat._count.gender
        })),
        class: classStats.map(stat => ({
          class: stat.class,
          count: stat._count.class
        })).sort((a, b) => {
          // Sort classes in logical order (P1, P2, ... S1, S2, ...)
          const classOrder = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
          return classOrder.indexOf(a.class) - classOrder.indexOf(b.class);
        }),
        topSchools: schoolStatsWithNames
      },
      appliedFilters: {
        search: search || null,
        sponsorship: sponsorship || null,
        gender: gender || null,
        schoolId: schoolId || null,
        sponsorId: sponsorId || null,
        proxyId: proxyId || null
      }
    };

    res.json(statistics);
  } catch (error) {
    console.error('Error fetching children statistics:', error);
    res.status(500).json({ error: 'Failed to fetch children statistics' });
  }
});


// Add this new route to backend/src/routes/children.ts or create a new dashboard.ts route file

// GET dashboard statistics endpoint
router.get('/dashboard-statistics', async (req, res) => {
  try {
    // Basic counts
    const [totalChildren, totalSponsors, totalSchools, totalProxies] = await Promise.all([
      prisma.child.count(),
      prisma.sponsor.count(),
      prisma.school.count({ where: { isActive: true } }),
      prisma.proxy.count()
    ]);

    // Sponsorship statistics
    const [sponsoredChildren, activeSponsorships, totalSponsorships] = await Promise.all([
      prisma.child.count({
        where: {
          sponsorships: { some: { isActive: true } }
        }
      }),
      prisma.sponsorship.count({ where: { isActive: true } }),
      prisma.sponsorship.count()
    ]);

    const unsponsoredChildren = totalChildren - sponsoredChildren;
    const sponsorshipRate = totalChildren > 0 ? Math.round((sponsoredChildren / totalChildren) * 100) : 0;

    // Age distribution (calculate from dateOfBirth)
    const childrenWithAges = await prisma.child.findMany({
      select: { dateOfBirth: true, isSponsored: true }
    });

    const ageDistribution = childrenWithAges.reduce((acc, child) => {
      const today = new Date();
      const birthDate = new Date(child.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      let ageGroup;
      if (age <= 6) ageGroup = '3-6 years';
      else if (age <= 10) ageGroup = '7-10 years';
      else if (age <= 14) ageGroup = '11-14 years';
      else if (age <= 18) ageGroup = '15-18 years';
      else ageGroup = '19+ years';

      if (!acc[ageGroup]) {
        acc[ageGroup] = { total: 0, sponsored: 0 };
      }
      acc[ageGroup].total++;
      if (child.isSponsored) acc[ageGroup].sponsored++;

      return acc;
    }, {} as Record<string, { total: number; sponsored: number }>);

    // Education level distribution
    const classDistribution = await prisma.child.groupBy({
      by: ['class'],
      _count: { class: true },
      where: {}
    });

    // Group classes into education levels
    const educationLevels = classDistribution.reduce((acc, item) => {
      let level;
      if (['P1', 'P2', 'P3'].includes(item.class)) level = 'Early Primary (P1-P3)';
      else if (['P4', 'P5', 'P6', 'P7'].includes(item.class)) level = 'Upper Primary (P4-P7)';
      else if (['S1', 'S2', 'S3', 'S4'].includes(item.class)) level = 'Lower Secondary (S1-S4)';
      else if (['S5', 'S6'].includes(item.class)) level = 'Upper Secondary (S5-S6)';
      else level = 'Other';

      if (!acc[level]) acc[level] = 0;
      acc[level] += item._count.class;
      return acc;
    }, {} as Record<string, number>);

    // Gender distribution with sponsorship breakdown
    const genderStats = await prisma.child.groupBy({
      by: ['gender'],
      _count: { gender: true }
    });

    const genderWithSponsorship = await Promise.all(
      genderStats.map(async (stat) => {
        const sponsored = await prisma.child.count({
          where: {
            gender: stat.gender,
            sponsorships: { some: { isActive: true } }
          }
        });
        return {
          gender: stat.gender,
          total: stat._count.gender,
          sponsored: sponsored,
          unsponsored: stat._count.gender - sponsored
        };
      })
    );

    // School statistics with performance metrics
    const schoolStats = await prisma.school.findMany({
      where: { isActive: true },
      include: {
        children: {
          include: {
            sponsorships: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    const schoolMetrics = schoolStats.map(school => {
      const totalChildren = school.children.length;
      const sponsoredChildren = school.children.filter(child => 
        child.sponsorships.length > 0
      ).length;
      const sponsorshipRate = totalChildren > 0 ? Math.round((sponsoredChildren / totalChildren) * 100) : 0;

      return {
        id: school.id,
        name: school.name,
        location: school.location,
        totalChildren,
        sponsoredChildren,
        unsponsoredChildren: totalChildren - sponsoredChildren,
        sponsorshipRate
      };
    }).sort((a, b) => b.totalChildren - a.totalChildren);

    // Monthly trends (last 12 months)
    const now = new Date();
    const monthlyTrends = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const [newChildren, newSponsors, newSponsorships] = await Promise.all([
        prisma.child.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextMonth
            }
          }
        }),
        prisma.sponsor.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextMonth
            }
          }
        }),
        prisma.sponsorship.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextMonth
            }
          }
        })
      ]);

      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        newChildren,
        newSponsors,
        newSponsorships
      });
    }

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [recentChildren, recentSponsors, recentSponsorships] = await Promise.all([
      prisma.child.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        },
        include: { school: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.sponsor.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        },
        include: { proxy: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.sponsorship.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        },
        include: {
          child: true,
          sponsor: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Proxy/Middleman statistics
    const proxyStats = await prisma.proxy.findMany({
      include: {
        sponsors: {
          include: {
            sponsorships: {
              where: { isActive: true },
              include: { child: true }
            }
          }
        }
      }
    });

    const proxyMetrics = proxyStats.map(proxy => {
      const totalSponsors = proxy.sponsors.length;
      const activeSponsorships = proxy.sponsors.reduce((acc, sponsor) => 
        acc + sponsor.sponsorships.length, 0
      );
      
      return {
        id: proxy.id,
        fullName: proxy.fullName,
        role: proxy.role,
        totalSponsors,
        activeSponsorships
      };
    }).sort((a, b) => b.activeSponsorships - a.activeSponsorships);

    // Key insights and alerts
    const insights = [];
    
    if (sponsorshipRate < 50) {
      insights.push({
        type: 'warning',
        title: 'Low Sponsorship Rate',
        message: `Only ${sponsorshipRate}% of children are sponsored. Consider outreach efforts.`,
        value: sponsorshipRate
      });
    }

    if (unsponsoredChildren > 0) {
      insights.push({
        type: 'info',
        title: 'Children Need Sponsors',
        message: `${unsponsoredChildren} children are waiting for sponsors.`,
        value: unsponsoredChildren
      });
    }

    const topPerformingSchool = schoolMetrics[0];
    if (topPerformingSchool && topPerformingSchool.sponsorshipRate > 80) {
      insights.push({
        type: 'success',
        title: 'Top Performing School',
        message: `${topPerformingSchool.name} has ${topPerformingSchool.sponsorshipRate}% sponsorship rate!`,
        value: topPerformingSchool.sponsorshipRate
      });
    }

    const dashboardData = {
      overview: {
        totalChildren,
        totalSponsors,
        totalSchools,
        totalProxies,
        sponsoredChildren,
        unsponsoredChildren,
        activeSponsorships,
        totalSponsorships,
        sponsorshipRate
      },
      demographics: {
        ageDistribution,
        genderWithSponsorship,
        educationLevels
      },
      schools: {
        total: totalSchools,
        metrics: schoolMetrics.slice(0, 10), // Top 10 schools
        topPerforming: schoolMetrics.filter(s => s.sponsorshipRate >= 80).length
      },
      trends: {
        monthly: monthlyTrends,
        recentActivity: {
          children: recentChildren,
          sponsors: recentSponsors,
          sponsorships: recentSponsorships
        }
      },
      proxies: {
        total: totalProxies,
        metrics: proxyMetrics.slice(0, 5), // Top 5 proxies
        totalSponsorsViaProxy: proxyMetrics.reduce((acc, p) => acc + p.totalSponsors, 0)
      },
      insights
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// POST create new child with photo gallery integration
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      schoolId,
      class: childClass,
      fatherFullName,
      fatherAddress,
      fatherContact,
      motherFullName,
      motherAddress,
      motherContact,
      story,
      comment,
      // Image fields for photo gallery
      photoBase64,
      photoMimeType,
      photoFileName,
      photoSize,
      sponsorIds = [],
      newSponsor
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !gender || !schoolId || !childClass) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!fatherFullName || !motherFullName) {
      return res.status(400).json({ error: 'Both parent names are required' });
    }

    // Validate school exists
    const school = await prisma.school.findUnique({
      where: { id: parseInt(schoolId) }
    });
    if (!school) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }

    const result = await prisma.$transaction(async (tx) => {
      let finalSponsorIds: number[] = [];

      // Process existing sponsor IDs
      if (sponsorIds && sponsorIds.length > 0) {
        finalSponsorIds = sponsorIds.map((id: string) => parseInt(id));
        
        // Validate sponsor IDs exist
        const validSponsors = await tx.sponsor.findMany({
          where: { id: { in: finalSponsorIds } }
        });
        if (validSponsors.length !== finalSponsorIds.length) {
          throw new Error('One or more sponsor IDs are invalid');
        }
      }
      
      // Create new sponsor if provided
      if (newSponsor && newSponsor.fullName) {

        // Validate email format if provided
        if (newSponsor.email?.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(newSponsor.email.trim())) {
            throw new Error('Invalid email format for sponsor');
          }
        }

        // Validate proxy exists if provided
        if (newSponsor.proxyId) {
          const proxy = await tx.proxy.findUnique({
            where: { id: parseInt(newSponsor.proxyId) }
          });
          if (!proxy) {
            throw new Error('Invalid proxy ID for sponsor');
          }
        }

        // FIXED: Include email and phone fields in sponsor creation
        const sponsorData: any = {
          fullName: newSponsor.fullName.trim(),
          contact: newSponsor.contact?.trim() || '', // Keep for backward compatibility
        };

        // Add email if provided
        if (newSponsor.email?.trim()) {
          sponsorData.email = newSponsor.email.trim().toLowerCase();
        }

        // Add phone if provided
        if (newSponsor.phone?.trim()) {
          sponsorData.phone = newSponsor.phone.trim();
        }

        // Add proxy if provided
        if (newSponsor.proxyId) {
          sponsorData.proxyId = parseInt(newSponsor.proxyId);
        }

        console.log('Creating sponsor with data:', sponsorData);

        const createdSponsor = await tx.sponsor.create({
          data: sponsorData,
          include: {
            proxy: {
              select: {
                id: true,
                fullName: true,
                role: true,
                contact: true,
                email: true,
                phone: true
              }
            }
          }
        });

        console.log('Sponsor created successfully:', createdSponsor);
        finalSponsorIds.push(createdSponsor.id);
      }

      // Prepare child data (NO image fields in children table)
      const childData: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        gender,
        schoolId: parseInt(schoolId),
        class: childClass,
        fatherFullName: fatherFullName.trim(),
        fatherAddress: fatherAddress?.trim() || null,
        fatherContact: fatherContact?.trim() || null,
        motherFullName: motherFullName.trim(),
        motherAddress: motherAddress?.trim() || null,
        motherContact: motherContact?.trim() || null,
        story: story?.trim() || null,
        comment: comment?.trim() || null,
        dateEnteredRegister: new Date(),
        lastProfileUpdate: new Date(),
        isSponsored: finalSponsorIds.length > 0
      };

      // Create child record
      const child = await tx.child.create({
        data: childData,
        include: {
          school: true
        }
      });

      // Add photo to gallery if provided
      if (photoBase64 && photoMimeType) {
        // Validate image data
        if (!photoMimeType.startsWith('image/')) {
          throw new Error('Invalid image MIME type');
        }

        await tx.childPhoto.create({
          data: {
            childId: child.id,
            photoBase64,
            mimeType: photoMimeType,
            fileName: photoFileName?.trim() || null,
            fileSize: photoSize || null,
            description: '',
            isProfile: true // First photo is always profile
          }
        });
      }

      // Create sponsorship records
      if (finalSponsorIds.length > 0) {
        await Promise.all(
          finalSponsorIds.map(sponsorId =>
            tx.sponsorship.create({
              data: {
                childId: child.id,
                sponsorId: sponsorId,
                startDate: new Date(),
                isActive: true
              }
            })
          )
        );
      }

      return child;
    });

    // Fetch complete child data with relationships and profile photo
    const completeChild = await prisma.child.findUnique({
      where: { id: result.id },
      include: {
        school: true,
        sponsorships: {
          where: { isActive: true },
          include: {
            sponsor: {
              include: {
                proxy: true
              }
            }
          }
        }
      }
    });

    const processedChild = await processChildForResponse(completeChild, true);
    res.status(201).json(processedChild);
    
  } catch (error) {
    console.error('Error creating child:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      res.status(400).json({ error: 'A child with similar details already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create child record' });
    }
  }
});

// POST add sponsor to existing child
router.post('/:id/sponsors', async (req, res) => {
  try {
    const { id } = req.params;
    const { sponsorId, monthlyAmount, paymentMethod, notes } = req.body;

    if (!sponsorId) {
      return res.status(400).json({ error: 'Sponsor ID is required' });
    }

    // Check if child exists
    const child = await prisma.child.findUnique({
      where: { id: parseInt(id) }
    });
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Check if sponsor exists
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: parseInt(sponsorId) }
    });
    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    // Check for existing active sponsorship
    const existingSponsorship = await prisma.sponsorship.findFirst({
      where: {
        childId: parseInt(id),
        sponsorId: parseInt(sponsorId),
        isActive: true
      }
    });

    if (existingSponsorship) {
      return res.status(400).json({ error: 'This sponsor is already sponsoring this child' });
    }

    const sponsorship = await prisma.sponsorship.create({
      data: {
        childId: parseInt(id),
        sponsorId: parseInt(sponsorId),
        monthlyAmount: monthlyAmount ? parseFloat(monthlyAmount) : null,
        paymentMethod: paymentMethod?.trim() || null,
        notes: notes?.trim() || null,
        startDate: new Date(),
        isActive: true
      },
      include: {
        child: {
          include: {
            school: true
          }
        },
        sponsor: {
          include: {
            proxy: true
          }
        }
      }
    });

    // Update child's sponsored status
    await prisma.child.update({
      where: { id: parseInt(id) },
      data: { 
        isSponsored: true,
        lastProfileUpdate: new Date()
      }
    });

    res.status(201).json(sponsorship);
  } catch (error) {
    console.error('Error adding sponsor to child:', error);
    res.status(500).json({ error: 'Failed to add sponsor to child' });
  }
});

// DELETE remove sponsor from child (end sponsorship)
router.delete('/:id/sponsors/:sponsorId', async (req, res) => {
  try {
    const { id, sponsorId } = req.params;

    const sponsorship = await prisma.sponsorship.updateMany({
      where: {
        childId: parseInt(id),
        sponsorId: parseInt(sponsorId),
        isActive: true
      },
      data: {
        isActive: false,
        endDate: new Date()
      }
    });

    if (sponsorship.count === 0) {
      return res.status(404).json({ error: 'Active sponsorship not found' });
    }

    // Check remaining sponsorships
    const remainingSponsorships = await prisma.sponsorship.count({
      where: {
        childId: parseInt(id),
        isActive: true
      }
    });

    // Update child's sponsored status if no more active sponsorships
    if (remainingSponsorships === 0) {
      await prisma.child.update({
        where: { id: parseInt(id) },
        data: { 
          isSponsored: false,
          lastProfileUpdate: new Date()
        }
      });
    }

    res.json({ message: 'Sponsorship ended successfully' });
  } catch (error) {
    console.error('Error ending sponsorship:', error);
    res.status(500).json({ error: 'Failed to end sponsorship' });
  }
});

// PUT update specific child
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Validate child exists
    const existingChild = await prisma.child.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existingChild) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Process update data
    updateData.lastProfileUpdate = new Date();
    
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    
    if (updateData.schoolId) {
      updateData.schoolId = parseInt(updateData.schoolId);
      
      // Validate school exists
      const school = await prisma.school.findUnique({
        where: { id: updateData.schoolId }
      });
      if (!school) {
        return res.status(400).json({ error: 'Invalid school ID' });
      }
    }

    // Remove any image fields from update data (they should go through photo gallery)
    delete updateData.photoBase64;
    delete updateData.photoMimeType;
    delete updateData.photoFileName;
    delete updateData.photoSize;

    // Trim string fields
    const stringFields = ['firstName', 'lastName', 'fatherFullName', 'motherFullName', 'fatherAddress', 'fatherContact', 'motherAddress', 'motherContact', 'story', 'comment'];
    stringFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field]?.trim() || null;
      }
    });

    const child = await prisma.child.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        school: true,
        sponsorships: {
          where: { isActive: true },
          include: {
            sponsor: {
              include: {
                proxy: true
              }
            }
          }
        }
      }
    });

    const processedChild = await processChildForResponse(child, true);
    res.json(processedChild);
    
  } catch (error) {
    console.error('Error updating child:', error);
    res.status(500).json({ error: 'Failed to update child record' });
  }
});

// GET profile image endpoint for serving profile images directly
router.get('/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    
    const profilePhoto = await prisma.childPhoto.findFirst({
      where: { 
        childId: parseInt(id),
        isProfile: true 
      },
      select: {
        photoBase64: true,
        mimeType: true,
        fileName: true
      }
    });

    if (!profilePhoto || !profilePhoto.photoBase64 || !profilePhoto.mimeType) {
      return res.status(404).json({ error: 'Profile image not found' });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(profilePhoto.photoBase64, 'base64');

    // Set appropriate headers
    res.set({
      'Content-Type': profilePhoto.mimeType,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'ETag': `"${id}-${profilePhoto.photoBase64.substring(0, 10)}"`, // Simple ETag
    });

    // Set filename if available
    if (profilePhoto.fileName) {
      res.set('Content-Disposition', `inline; filename="profile_${profilePhoto.fileName}"`);
    }

    res.send(imageBuffer);
  } catch (error) {
    console.error('Error serving profile image:', error);
    res.status(500).json({ error: 'Failed to serve profile image' });
  }
});

// GET specific child by ID with full data - MUST be last
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const child = await prisma.child.findUnique({
      where: { id: parseInt(id) },
      include: {
        school: true,
        sponsorships: {
          include: {
            sponsor: {
              include: {
                proxy: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        photos: {
          select: {
            id: true,
            mimeType: true,
            fileName: true,
            fileSize: true,
            description: true,
            uploadedAt: true,
            isProfile: true
          },
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const processedChild = await processChildForResponse(child, true);
    res.json(processedChild);
    
  } catch (error) {
    console.error('Error fetching child:', error);
    res.status(500).json({ error: 'Failed to fetch child' });
  }
});

export default router;