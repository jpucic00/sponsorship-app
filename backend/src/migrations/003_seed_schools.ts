import { Client } from '@libsql/client';
import { Migration } from './runner';

// Schools data from schools.json
const schoolsData = [
  { id: 2, name: "ABIM SECONDARY SCHOOL", location: "Abim", isActive: 1 },
  { id: 3, name: "ABIM TECHNICAL INSTITUTE", location: "Abim", isActive: 1 },
  { id: 4, name: "ACHUKUDU COMMUNITY PRIMARY SCHOOL", location: "Achukudu", isActive: 1 },
  { id: 5, name: "ADEA PRIMARY SCHOOL", location: "Adea", isActive: 1 },
  { id: 6, name: "ADWARI SECONDARY SCHOOL", location: "Adwari", isActive: 1 },
  { id: 7, name: "AKIGENO NURSERY AND PRIMARY SCHOOL", location: "Akigeno", isActive: 1 },
  { id: 8, name: "AKWANGAGWEL PRIMARY SCHOOL", location: "Akwangagwel", isActive: 1 },
  { id: 9, name: "ALIR PRIMARY SCHOOL", location: "Alir", isActive: 1 },
  { id: 10, name: "ANKOLE INSTITUTE OF BUSINESS AND VOCATIONAL STUDIES", location: "Mbarara", isActive: 1 },
  { id: 11, name: "APOSTLES OF JESUS SEMINARY", location: "Moroto", isActive: 1 },
  { id: 12, name: "ARAPAI AGRICULTURAL COLLEGE", location: "Soroti", isActive: 1 },
  { id: 13, name: "BUSITEMA UNIVERSITY SOROTI BRANCH", location: "Soroti", isActive: 1 },
  { id: 14, name: "FATHER BASH FOUNDATION", location: "Uganda", isActive: 1 },
  { id: 15, name: "FLORENCE NIGHTINGALE SCHOOL OF NURSING AND MIDWIFERY", location: "Uganda", isActive: 1 },
  { id: 16, name: "GLORY NURSERY AND PRIMARY SCHOOL", location: "Uganda", isActive: 1 },
  { id: 17, name: "GOOD DADDY NURSERY AND PRIMARY SCHOOL", location: "Uganda", isActive: 1 },
  { id: 18, name: "GULU UNIVERSITY", location: "Gulu", isActive: 1 },
  { id: 19, name: "HALCYON HIGH SCHOOL", location: "Uganda", isActive: 1 },
  { id: 20, name: "HUMAN DEVELOPMENT TECHNICAL TRAINING SCHOOL", location: "Lira", isActive: 1 },
  { id: 21, name: "IMMACULATE HEART OF MARY", location: "Uganda", isActive: 1 },
  { id: 22, name: "INTERNATIONAL INSTITUTE OF HEALTH SCIENCES", location: "Jinja", isActive: 1 },
  { id: 23, name: "JUBILEE 2000 SSS", location: "Karenga", isActive: 1 },
  { id: 24, name: "KAMPALA INTERNATIONAL UNIVERSITY", location: "Kampala", isActive: 1 },
  { id: 25, name: "KANGOLE GIRLS PRIMARY SCHOOL", location: "Kangole", isActive: 1 },
  { id: 26, name: "KANGOLE GIRLS SECONDARY SCHOOL", location: "Kangole", isActive: 1 },
  { id: 27, name: "KING'S KID PRIMARY SCHOOL", location: "Uganda", isActive: 1 },
  { id: 28, name: "KOMUKUNY BOYS PRIMARY SCHOOL", location: "Komukuny", isActive: 1 },
  { id: 29, name: "LIRA CENTRAL PRIMARY SCHOOL", location: "Lira", isActive: 1 },
  { id: 30, name: "LOTUKE SEED SECONDARY SCHOOL", location: "Lotuke", isActive: 1 },
  { id: 31, name: "LUZIRA SECONDARY SCHOOL", location: "Luzira", isActive: 1 },
  { id: 32, name: "MAKERERE UNIVERSITY", location: "Kampala", isActive: 1 },
  { id: 33, name: "MAKERERE UNIVERSITY JINJA CAMPUS", location: "Jinja", isActive: 1 },
  { id: 34, name: "MBALE SCHOOL FOR THE DEAF", location: "Mbale", isActive: 1 },
  { id: 35, name: "MBALE SCHOOL FOR THE DEAF - HAIRDRESSING", location: "Mbale", isActive: 1 },
  { id: 36, name: "MBARARA UNIVERSITY SCIENCE AND TECHNOLOGY", location: "Mbarara", isActive: 1 },
  { id: 37, name: "MITYANA STANDARD SECONDARY SCHOOL", location: "Gagavu", isActive: 1 },
  { id: 38, name: "MORULEM BOYS PRIMARY SCHOOL", location: "Morulem", isActive: 1 },
  { id: 39, name: "MORULEM GIRLS PRIMARY SCHOOL", location: "Morulem", isActive: 1 },
  { id: 40, name: "MORULEM GIRLS SECONDARY SCHOOL", location: "Morulem", isActive: 1 },
  { id: 41, name: "NALAKAS PRIMARY SCHOOL", location: "Nalakas", isActive: 1 },
  { id: 42, name: "NILE VOCATIONAL INSTITUTE", location: "Jinja", isActive: 1 },
  { id: 43, name: "NSAMIZI TRAINING INSTITUTE OF SOCIAL DEVELOPMENT", location: "Uganda", isActive: 1 },
  { id: 44, name: "NYAKWAE SEED SECONDARY SCHOOL", location: "Nyakwae", isActive: 1 },
  { id: 45, name: "OBOLOKOME PRIMARY SCHOOL", location: "Obolokome", isActive: 1 },
  { id: 46, name: "OJWINA PRIMARY SCHOOL", location: "Ojwina", isActive: 1 },
  { id: 47, name: "ORETA PRIMARY SCHOOL", location: "Oreta", isActive: 1 },
  { id: 48, name: "POPE JOHN PAUL II MEMORIAL SECONDARY SCHOOL", location: "Uganda", isActive: 1 },
  { id: 49, name: "RACHKOKO PRIMARY SCHOOL", location: "Rachkoko", isActive: 1 },
  { id: 50, name: "SISTO MAZZOLDI NURSERY AND PRIMARY SCHOOL", location: "Uganda", isActive: 1 },
  { id: 51, name: "SOROTI TRAINING INSTITUTE", location: "Soroti", isActive: 1 },
  { id: 52, name: "SOROTI UNIVERSITY", location: "Soroti", isActive: 1 },
  { id: 53, name: "ST ANDREW'S SECONDARY SCHOOL", location: "Obalanga", isActive: 1 },
  { id: 54, name: "ST. DANIEL COMBONI PRIMARY SCHOOL", location: "Uganda", isActive: 1 },
  { id: 55, name: "ST. KATHERINE SENIOR SECONDARY SCHOOL", location: "Lira", isActive: 1 },
  { id: 56, name: "ST. KIZITO NURSERY AND PRIMARY SCHOOL", location: "Amul", isActive: 1 },
  { id: 57, name: "ST. KIZITO PRIMARY SCHOOL", location: "Amul", isActive: 1 },
  { id: 58, name: "ST. MARY'S COLLEGE ABOKE", location: "Aboke", isActive: 1 },
  { id: 59, name: "ST. MARY'S NURSERY AND PRIMARY SCHOOL", location: "Uganda", isActive: 1 },
  { id: 60, name: "ST. MARY'S SEMINARY", location: "Nadiket", isActive: 1 },
  { id: 61, name: "ST. PETER AND PAUL PRIMARY SCHOOL", location: "Achukudu", isActive: 1 },
  { id: 62, name: "ST. PHILOMENA JUNIOR", location: "Uganda", isActive: 1 },
  { id: 63, name: "ST. THERESA NURSERY", location: "Uganda", isActive: 1 },
  { id: 64, name: "STARLIGHT NURSERY SCHOOL", location: "Uganda", isActive: 1 },
  { id: 65, name: "TOTO MARIA VOCATIONAL TRAINING CENTER", location: "Uganda", isActive: 1 },
  { id: 66, name: "YMCA WANDEGEYA", location: "Wandegeya", isActive: 1 },
  { id: 67, name: "ST. GRACIOUS S S LIRA", location: "Lira", isActive: 1 },
];

export const migration: Migration = {
  id: '003',
  name: 'seed_schools',

  async up(client: Client): Promise<void> {
    console.log(`   Seeding ${schoolsData.length} schools...`);

    let inserted = 0;
    let skipped = 0;

    for (const school of schoolsData) {
      // Use INSERT OR IGNORE to skip if name already exists (name is unique)
      const result = await client.execute({
        sql: 'INSERT OR IGNORE INTO schools (id, name, location, isActive) VALUES (?, ?, ?, ?)',
        args: [school.id, school.name, school.location, school.isActive],
      });

      if (result.rowsAffected > 0) {
        inserted++;
      } else {
        skipped++;
      }
    }

    console.log(`   Inserted: ${inserted}, Skipped (already exist): ${skipped}`);
  },

  async down(client: Client): Promise<void> {
    // Remove only the schools we seeded (by their specific IDs)
    const ids = schoolsData.map(s => s.id);
    const placeholders = ids.map(() => '?').join(', ');

    await client.execute({
      sql: `DELETE FROM schools WHERE id IN (${placeholders})`,
      args: ids,
    });

    console.log(`   Removed ${ids.length} seeded schools`);
  },
};
