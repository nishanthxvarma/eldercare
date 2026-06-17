import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { Facility } from '../models/Facility';
import { User } from '../models/User';
import { Resident } from '../models/Resident';
import { Medication } from '../models/Medication';
import { HealthRecord } from '../models/HealthRecord';
import { DailyCareLog } from '../models/DailyCareLog';
import { Notification } from '../models/Notification';
import { Message } from '../models/Message';

const firstNames = ['Margaret', 'Robert', 'Dorothy', 'James', 'Helen', 'William', 'Betty', 'Richard', 'Patricia', 'Charles', 'Alice', 'George', 'Virginia', 'Walter', 'Ruth', 'Frank', 'Florence', 'Harold', 'Evelyn', 'Arthur'];
const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Jackson', 'Thompson', 'White', 'Lopez', 'Lee', 'Gonzalez'];

const medications = [
  { name: 'Aspirin', dosage: '100mg', frequency: 'ONCE_DAILY', instructions: 'Take after meals' },
  { name: 'Metformin', dosage: '500mg', frequency: 'TWICE_DAILY', instructions: 'Take with food' },
  { name: 'Lisinopril', dosage: '10mg', frequency: 'ONCE_DAILY', instructions: 'Take in the morning' },
  { name: 'Atorvastatin', dosage: '20mg', frequency: 'ONCE_DAILY', instructions: 'Take at night' },
  { name: 'Amoxicillin', dosage: '250mg', frequency: 'THREE_TIMES_DAILY', instructions: 'Complete the course' },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to DB for seeding...');

    // Clear existing data
    await Promise.all([
      Facility.deleteMany({}),
      User.deleteMany({}),
      Resident.deleteMany({}),
      Medication.deleteMany({}),
      HealthRecord.deleteMany({}),
      DailyCareLog.deleteMany({}),
      Notification.deleteMany({}),
      Message.deleteMany({})
    ]);

    console.log('Cleared existing data.');

    // 1 Facility
    const facility = await Facility.create({
      name: 'ElderCare Sunrise Home',
      address: '123 Care Lane, Wellness City',
      contactEmail: 'admin@sunrisehome.com',
      contactPhone: '123-456-7890'
    });

    const defaultPassword = await bcrypt.hash('password123', 12);

    // 1 Admin
    await User.create({
      facilityId: facility._id,
      email: 'admin@test.com',
      passwordHash: defaultPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '111-111-1111',
      role: 'ADMIN',
    });

    // 5 Caretakers
    const caretakers = [];
    const shifts = ['MORNING', 'EVENING', 'NIGHT'];
    for (let i = 1; i <= 5; i++) {
      caretakers.push(await User.create({
        facilityId: facility._id,
        email: `caretaker${i}@test.com`,
        passwordHash: defaultPassword,
        firstName: `Caretaker`,
        lastName: `Staff${i}`,
        phone: `222-222-222${i}`,
        role: 'CARETAKER',
        shift: shifts[i % shifts.length],
        employeeId: `EMP00${i}`,
      }));
    }

    // 20 Residents
    const residents = [];
    for (let i = 0; i < 20; i++) {
      residents.push(await Resident.create({
        facilityId: facility._id,
        firstName: firstNames[i],
        lastName: lastNames[i],
        dateOfBirth: new Date(1935 + (i % 15), i % 12, (i % 28) + 1),
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        roomNumber: `${100 + i + 1}`,
        admissionDate: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)),
        medicalHistory: [
          { condition: 'Hypertension', diagnosedDate: new Date('2015-01-01'), notes: 'Controlled with medication' },
          { condition: 'Type 2 Diabetes', diagnosedDate: new Date('2018-05-10'), notes: 'Diet-managed' }
        ],
        allergies: i % 3 === 0 ? ['Penicillin'] : i % 5 === 0 ? ['Sulfa', 'Aspirin'] : [],
        emergencyContact: {
          name: `${firstNames[(i + 5) % 20]} ${lastNames[(i + 5) % 20]}`,
          relationship: i % 2 === 0 ? 'Son' : 'Daughter',
          phone: `555-${String(i + 100).padStart(3, '0')}-${String(i * 7 + 1000).padStart(4, '0')}`
        }
      }));
    }

    // Assign residents to caretakers (4 per caretaker)
    for (let i = 0; i < residents.length; i++) {
      const caretaker = caretakers[Math.floor(i / 4)];
      await User.findByIdAndUpdate(caretaker._id, { $addToSet: { assignedResidents: residents[i]._id } });
    }

    // 20 Family Members
    for (let i = 0; i < 20; i++) {
      await User.create({
        facilityId: facility._id,
        email: `family${i + 1}@test.com`,
        passwordHash: defaultPassword,
        firstName: firstNames[(i + 10) % 20],
        lastName: lastNames[i],
        phone: `444-${String(i + 100).padStart(3, '0')}-0000`,
        role: 'FAMILY',
        familyRelations: [{ residentId: residents[i]._id, relationshipType: i % 2 === 0 ? 'Son' : 'Daughter' }]
      });
    }

    // Medications per resident
    for (const resident of residents) {
      const med = medications[residents.indexOf(resident) % medications.length];
      await Medication.create({
        facilityId: facility._id,
        residentId: resident._id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        startDate: new Date(),
        instructions: med.instructions,
        prescribedBy: 'Dr. Eleanor Smith',
        isActive: true,
      });
    }

    // Health records for each resident (last 7 days)
    for (const resident of residents) {
      for (let day = 0; day < 7; day++) {
        const recordDate = new Date();
        recordDate.setDate(recordDate.getDate() - day);
        await HealthRecord.create({
          residentId: resident._id,
          caretakerId: caretakers[0]._id,
          vitals: {
            bloodPressure: { systolic: 110 + Math.floor(Math.random() * 30), diastolic: 70 + Math.floor(Math.random() * 20) },
            heartRate: 65 + Math.floor(Math.random() * 20),
            temperature: 97.5 + Math.random() * 2,
            bloodSugar: 85 + Math.floor(Math.random() * 40),
            oxygenLevel: 95 + Math.floor(Math.random() * 5),
          },
          notes: day === 0 ? 'Routine checkup, all normal.' : undefined,
          recordedAt: recordDate,
          source: 'MANUAL',
        });
      }
    }

    // Care logs
    for (const resident of residents) {
      await DailyCareLog.create({
        residentId: resident._id,
        caretakerId: caretakers[residents.indexOf(resident) % caretakers.length]._id,
        type: 'MEAL',
        description: 'Breakfast: Oatmeal with fruit. Lunch: Grilled chicken and salad. Dinner: Vegetable soup.',
        timestamp: new Date(),
      });
      await DailyCareLog.create({
        residentId: resident._id,
        caretakerId: caretakers[residents.indexOf(resident) % caretakers.length]._id,
        type: 'MOOD',
        description: 'Resident was cheerful and cooperative throughout the day.',
        timestamp: new Date(),
      });
    }

    // Notifications for admin
    const adminUser = await User.findOne({ role: 'ADMIN', facilityId: facility._id });
    if (adminUser) {
      await Notification.create({
        userId: adminUser._id,
        title: 'System Ready',
        message: 'ElderCare Connect has been successfully set up with demo data.',
        type: 'INFO',
        isRead: false,
      });
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Demo Credentials:');
    console.log('  Admin:     admin@test.com / password123');
    console.log('  Caretaker: caretaker1@test.com / password123');
    console.log('  Family:    family1@test.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
