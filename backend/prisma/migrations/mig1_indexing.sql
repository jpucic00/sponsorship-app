-- ==================================================
-- INDEX CLEANUP MIGRATION
-- Remove redundant indexes and keep only essential ones
-- From 67 indexes down to ~15 essential indexes
-- ==================================================

SELECT 'Starting index cleanup - removing redundant indexes...' as status;

-- ==================================================
-- PHASE 1: DROP REDUNDANT CHILD_PHOTOS INDEXES
-- ==================================================

-- Keep: child_photos_childId_idx, idx_child_photo_profile
-- Remove redundant photo indexes
DROP INDEX IF EXISTS child_photos_childId_isProfile_idx;
DROP INDEX IF EXISTS child_photos_childId_uploadedAt_idx;
DROP INDEX IF EXISTS child_photos_isProfile_idx;
DROP INDEX IF EXISTS child_photos_uploadedAt_idx;
DROP INDEX IF EXISTS idx_child_photo_child_id;

-- ==================================================
-- DROP CHILDREN REDUNDANT INDEXES  
-- ==================================================
DROP INDEX IF EXISTS children_class_idx;
DROP INDEX IF EXISTS children_createdAt_idx;
DROP INDEX IF EXISTS children_dateOfBirth_idx;
DROP INDEX IF EXISTS children_gender_idx;
DROP INDEX IF EXISTS children_isSponsored_dateEnteredRegister_idx;
DROP INDEX IF EXISTS children_isSponsored_idx;
DROP INDEX IF EXISTS children_lastName_firstName_idx;
DROP INDEX IF EXISTS children_lastProfileUpdate_idx;
DROP INDEX IF EXISTS children_schoolId_class_idx;
DROP INDEX IF EXISTS children_schoolId_isSponsored_idx;
DROP INDEX IF EXISTS idx_child_class_sponsored;
DROP INDEX IF EXISTS idx_child_comprehensive_search;
DROP INDEX IF EXISTS idx_child_created_stats;
DROP INDEX IF EXISTS idx_child_gender_sponsored;
DROP INDEX IF EXISTS idx_child_school_id;
DROP INDEX IF EXISTS idx_child_school_sponsored;

-- ==================================================
-- DROP SPONSORSHIPS REDUNDANT INDEXES
-- ==================================================
DROP INDEX IF EXISTS sponsorships_childId_idx;
DROP INDEX IF EXISTS sponsorships_childId_isActive_idx;
DROP INDEX IF EXISTS sponsorships_endDate_idx;
DROP INDEX IF EXISTS sponsorships_isActive_idx;
DROP INDEX IF EXISTS sponsorships_isActive_startDate_idx;
DROP INDEX IF EXISTS sponsorships_monthlyAmount_idx;
DROP INDEX IF EXISTS sponsorships_paymentMethod_idx;
DROP INDEX IF EXISTS sponsorships_sponsorId_idx;
DROP INDEX IF EXISTS sponsorships_sponsorId_isActive_idx;
DROP INDEX IF EXISTS sponsorships_startDate_idx;
DROP INDEX IF EXISTS idx_sponsorship_created_stats;
DROP INDEX IF EXISTS idx_sponsorship_monthly_amount;

-- ==================================================
-- DROP SPONSORS REDUNDANT INDEXES
-- ==================================================
DROP INDEX IF EXISTS sponsors_createdAt_idx;
DROP INDEX IF EXISTS sponsors_fullName_idx;
DROP INDEX IF EXISTS sponsors_proxyId_fullName_idx;
DROP INDEX IF EXISTS idx_sponsor_created_stats;
DROP INDEX IF EXISTS idx_sponsor_proxy_active;
DROP INDEX IF EXISTS idx_sponsor_proxy_id;

-- ==================================================
-- DROP SCHOOLS REDUNDANT INDEXES
-- ==================================================
DROP INDEX IF EXISTS schools_isActive_idx;
DROP INDEX IF EXISTS schools_location_idx;
DROP INDEX IF EXISTS schools_name_idx;
DROP INDEX IF EXISTS idx_school_active_only;

-- ==================================================
-- DROP PROXIES REDUNDANT INDEXES
-- ==================================================
DROP INDEX IF EXISTS proxies_createdAt_idx;
DROP INDEX IF EXISTS proxies_role_idx;

-- ==================================================
-- DROP VOLUNTEERS REDUNDANT INDEXES
-- ==================================================
DROP INDEX IF EXISTS volunteers_createdAt_idx;
DROP INDEX IF EXISTS volunteers_isActive_idx;
DROP INDEX IF EXISTS volunteers_lastName_firstName_idx;
DROP INDEX IF EXISTS volunteers_role_idx;
DROP INDEX IF EXISTS volunteers_role_isActive_idx;

-- ==================================================
-- PHASE 7: ENSURE ESSENTIAL INDEXES EXIST
-- ==================================================

-- Create only the essential indexes we need
CREATE INDEX IF NOT EXISTS idx_sponsorship_child_active ON sponsorships(childId, isActive);
CREATE INDEX IF NOT EXISTS idx_sponsorship_sponsor_active ON sponsorships(sponsorId, isActive);
CREATE INDEX IF NOT EXISTS idx_sponsorship_lookup ON sponsorships(childId, isActive, sponsorId);
CREATE INDEX IF NOT EXISTS idx_child_filters ON children(schoolId, gender, isSponsored);
CREATE INDEX IF NOT EXISTS idx_child_name_search ON children(LOWER(firstName || ' ' || lastName));
CREATE INDEX IF NOT EXISTS idx_child_names ON children(firstName, lastName);
CREATE INDEX IF NOT EXISTS idx_child_photo_profile ON child_photos(childId, isProfile) WHERE isProfile = 1;
CREATE INDEX IF NOT EXISTS idx_sponsor_name_search ON sponsors(LOWER(fullName));
CREATE INDEX IF NOT EXISTS idx_school_name_search ON schools(LOWER(name)) WHERE isActive = 1;
CREATE INDEX IF NOT EXISTS idx_volunteer_active ON volunteers(isActive) WHERE isActive = 1;

-- ==================================================
-- FINAL VERIFICATION
-- ==================================================

SELECT 'Index cleanup completed!' as status;
SELECT 'Essential indexes remaining:' as info;
SELECT name FROM sqlite_master 
WHERE type = 'index' 
AND name NOT LIKE 'sqlite_%' 
ORDER BY name;

SELECT 'Total indexes after cleanup:' as summary;
SELECT COUNT(*) as total_count 
FROM sqlite_master 
WHERE type = 'index' 
AND name NOT LIKE 'sqlite_%';

-- Expected result: ~15-20 indexes instead of 67