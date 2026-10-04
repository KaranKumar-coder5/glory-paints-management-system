require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose = require("mongoose");
const dns = require("dns");

// DNS workaround for Windows c-ares ECONNREFUSED issue
const current = dns.getServers();
if (current.length === 1 && current[0] === "127.0.0.1") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

const User = require("./models/User");
const Vehicle = require("./models/Vehicle");
const JobCard = require("./models/JobCard");
const Invoice = require("./models/Invoice");
const Inventory = require("./models/Inventory");
const StatusLog = require("./models/StatusLog");
const FCCertificate = require("./models/FCCertificate");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/glory_paints";

const owners = [
  { name: "Rajesh Kumar", email: "owner@glorypaints.com", password: "password123", role: "owner", phone: "9876543210" },
];

const employees = [
  { name: "Suresh Patil", email: "suresh@glorypaints.com", password: "password123", role: "employee", phone: "9876543211" },
  { name: "Amit Jadhav", email: "amit@glorypaints.com", password: "password123", role: "employee", phone: "9876543212" },
  { name: "Vikram Singh", email: "vikram@glorypaints.com", password: "password123", role: "employee", phone: "9876543213" },
  { name: "Prakash More", email: "prakash@glorypaints.com", password: "password123", role: "employee", phone: "9876543214" },
];

const vehicleData = [
  { make: "Maruti Suzuki", model: "Swift Dzire", type: "car", plate: "MH-12-AB-1234", color: "White", year: 2021, service: "painting", status: "delivered", cost: 18000, jobCardStatus: "completed", diagnosis: "Full body paint refinish and clear coat application" },
  { make: "Tata", model: "Nexon", type: "car", plate: "MH-14-CD-5678", color: "Blue", year: 2022, service: "repair", status: "repair", cost: 12000, jobCardStatus: "repair_in_progress", diagnosis: "Front bumper dent removal and panel alignment" },
  { make: "Mahindra", model: "Thar", type: "car", plate: "MH-01-EF-9012", color: "Black", year: 2023, service: "full_service", status: "painting", cost: 35000, jobCardStatus: "painting", diagnosis: "Hardtop painting and underbody anti-rust coating" },
  { make: "Ashok Leyland", model: "Dost", type: "truck", plate: "MH-02-GH-3456", color: "Yellow", year: 2020, service: "repair", status: "inspection", cost: 8000, jobCardStatus: "inspection", diagnosis: "Cabin door hinge repair and touch-up paint" },
  { make: "Hero", model: "Splendor", type: "two-wheeler", plate: "MH-03-IJ-7890", color: "Red", year: 2022, service: "painting", status: "received", cost: 5000, jobCardStatus: "pending", diagnosis: "Fuel tank scratch repair and side cowl paint" },
  { make: "Hyundai", model: "Creta", type: "car", plate: "MH-04-KL-2345", color: "Silver", year: 2023, service: "fc_inspection", status: "fc_inspection", cost: 22000, jobCardStatus: "waiting_for_parts", diagnosis: "RTO Fitness Certificate prep and brake overhaul" },
  { make: "Tata", model: "Ace", type: "commercial", plate: "MH-05-MN-6789", color: "White", year: 2019, service: "repair", status: "quality_check", cost: 15000, jobCardStatus: "quality_check", diagnosis: "Rear cargo bed paint touch-up and tail light fix" },
  { make: "Eicher", model: "Pro 2049", type: "bus", plate: "MH-06-OP-0123", color: "Green", year: 2021, service: "painting", status: "ready_for_delivery", cost: 45000, jobCardStatus: "repair_in_progress", diagnosis: "Side panel rust treatment and exterior paint" },
  { make: "Bajaj", model: "Pulsar", type: "two-wheeler", plate: "MH-07-QR-4567", color: "Red", year: 2023, service: "repair", status: "delivered", cost: 7000, jobCardStatus: "completed", diagnosis: "Silencer heat shield painting and minor denting" },
  { make: "Toyota", model: "Innova", type: "car", plate: "MH-08-ST-8901", color: "White", year: 2022, service: "full_service", status: "repair", cost: 28000, jobCardStatus: "repair_in_progress", diagnosis: "Rear fender denting and bumper replacement paint" },
  { make: "Force", model: "Traveller", type: "bus", plate: "MH-09-UV-2345", color: "Blue", year: 2020, service: "painting", status: "painting", cost: 52000, jobCardStatus: "painting", diagnosis: "Full commercial vehicle exterior spray paint" },
  { make: "Mahindra", model: "Bolero", type: "car", plate: "MH-10-WX-6789", color: "White", year: 2021, service: "repair", status: "received", cost: 9500, jobCardStatus: "pending", diagnosis: "Left fender dent pulling and primer coat" },
  { make: "Maruti Suzuki", model: "Ertiga", type: "car", plate: "MH-11-YZ-0123", color: "Grey", year: 2023, service: "fc_inspection", status: "inspection", cost: 16000, jobCardStatus: "inspection", diagnosis: "Fitness renewal prep and headlamp polishing" },
  { make: "Tata", model: "Tiago", type: "car", plate: "MH-13-AB-4567", color: "Orange", year: 2022, service: "painting", status: "delivered", cost: 14000, jobCardStatus: "completed", diagnosis: "Roof contrast black painting and bonnet detailing" },
  { make: "Honda", model: "Activa", type: "two-wheeler", plate: "MH-15-CD-8901", color: "Black", year: 2023, service: "repair", status: "repair", cost: 3500, jobCardStatus: "waiting_for_parts", diagnosis: "Front apron replacement and color matching" },
];

const customers = [
  { name: "Arun Sharma", phone: "9876500001", email: "arun@email.com" },
  { name: "Priya Deshmukh", phone: "9876500002", email: "priya@email.com" },
  { name: "Sanjay Kulkarni", phone: "9876500003", email: "sanjay@email.com" },
  { name: "Meena Pawar", phone: "9876500004", email: "meena@email.com" },
  { name: "Ravi Bhosale", phone: "9876500005", email: "ravi@email.com" },
  { name: "Sunita Reddy", phone: "9876500006", email: "sunita@email.com" },
  { name: "Deepak Nair", phone: "9876500007", email: "deepak@email.com" },
  { name: "Kavita Joshi", phone: "9876500008", email: "kavita@email.com" },
];

const inventoryItems = [
  { name: "Asian Paints Apex", category: "paint", quantity: 45, unit: "liters", minStock: 10, purchase: 350, selling: 450, supplier: "Asian Paints Depot" },
  { name: "Berger Paints Bison", category: "paint", quantity: 3, unit: "liters", minStock: 10, purchase: 380, selling: 480, supplier: "Berger Warehouse" },
  { name: "Primer - Exterior", category: "primer", quantity: 20, unit: "liters", minStock: 8, purchase: 200, selling: 280, supplier: "Asian Paints Depot" },
  { name: "Primer - Interior", category: "primer", quantity: 2, unit: "liters", minStock: 5, purchase: 180, selling: 250, supplier: "Berger Warehouse" },
  { name: "Thinner - Standard", category: "thinner", quantity: 30, unit: "liters", minStock: 10, purchase: 120, selling: 160, supplier: "Chemical Suppliers" },
  { name: "Sandpaper 120 grit", category: "sandpaper", quantity: 4, unit: "rolls", minStock: 10, purchase: 80, selling: 120, supplier: "Hardware Hub" },
  { name: "Sandpaper 240 grit", category: "sandpaper", quantity: 50, unit: "rolls", minStock: 10, purchase: 90, selling: 130, supplier: "Hardware Hub" },
  { name: "Spray Gun Nozzle", category: "tool", quantity: 6, unit: "pieces", minStock: 3, purchase: 450, selling: 600, supplier: "Tools India" },
  { name: "Masking Tape", category: "consumable", quantity: 0, unit: "boxes", minStock: 5, purchase: 200, selling: 300, supplier: "Hardware Hub" },
  { name: "Body Filler", category: "consumable", quantity: 8, unit: "kg", minStock: 5, purchase: 250, selling: 350, supplier: "Auto Parts Co" },
];

const vehicleStatuses = ["received", "inspection", "repair", "painting", "quality_check", "fc_inspection", "ready_for_delivery", "delivered"];
const jobCardStatuses = ["pending", "inspection", "repair_in_progress", "waiting_for_parts", "painting", "quality_check", "completed"];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clean all collections for idempotent seeding
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      JobCard.deleteMany({}),
      Invoice.deleteMany({}),
      Inventory.deleteMany({}),
      StatusLog.deleteMany({}),
      FCCertificate.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // 1. Users
    const createdOwner = await User.create(owners[0]);
    const createdEmployees = await User.create(employees);
    console.log(`Created 1 owner and ${createdEmployees.length} employees`);

    // 2. Inventory Items
    const createdInventory = [];
    for (const item of inventoryItems) {
      const sku = `${item.category.toUpperCase().slice(0, 3)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const inv = await Inventory.create({
        name: item.name,
        category: item.category,
        sku,
        quantity: item.quantity,
        unit: item.unit,
        minStockLevel: item.minStock,
        purchasePrice: item.purchase,
        sellingPrice: item.selling,
        supplier: { name: item.supplier, phone: "9800000000" },
        lastRestockedAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 86400000),
      });
      createdInventory.push(inv);
    }
    console.log(`Created ${createdInventory.length} inventory items`);

    // 3. Vehicles
    const createdVehicles = [];
    for (let i = 0; i < vehicleData.length; i++) {
      const v = vehicleData[i];
      const customer = customers[i % customers.length];
      const assignedTo = createdEmployees[i % createdEmployees.length];
      const statusIdx = vehicleStatuses.indexOf(v.status);

      const statusHistory = [];
      for (let j = 0; j <= statusIdx; j++) {
        statusHistory.push({
          status: vehicleStatuses[j],
          changedAt: new Date(Date.now() - (statusIdx - j) * 86400000 * 2),
          changedBy: assignedTo._id,
          notes: j === 0 ? "Vehicle received at workshop" : `Status updated to ${vehicleStatuses[j]}`,
        });
      }

      const daysAgo = 30 - i * 2;
      const createdAt = new Date(Date.now() - daysAgo * 86400000);

      const vehicle = await Vehicle.create({
        jobId: `GP-2026-${String(i + 1).padStart(6, "0")}`,
        vehicleType: v.type,
        make: v.make,
        model: v.model,
        year: v.year,
        color: v.color,
        fuelType: "petrol",
        odometer: 12000 + i * 4500,
        licensePlate: v.plate,
        customer: { name: customer.name, phone: customer.phone, email: customer.email },
        currentStatus: v.status,
        assignedEmployee: assignedTo._id,
        createdBy: createdOwner._id,
        serviceType: v.service,
        estimatedCost: v.cost,
        actualCost: v.status === "delivered" ? v.cost : 0,
        complaintDescription: v.diagnosis,
        statusHistory,
        createdAt,
        updatedAt: createdAt,
      });

      createdVehicles.push(vehicle);

      for (const sh of statusHistory) {
        await StatusLog.create({
          vehicle: vehicle._id,
          jobId: vehicle.jobId,
          fromStatus: sh.status === "received" ? "" : "received",
          toStatus: sh.status,
          changedBy: sh.changedBy,
          notes: sh.notes,
          createdAt: sh.changedAt,
        });
      }
    }
    console.log(`Created ${createdVehicles.length} vehicles with status logs`);

    // 4. Job Cards (15 Job Cards — 1 per vehicle)
    const createdJobCards = [];
    for (let i = 0; i < createdVehicles.length; i++) {
      const v = createdVehicles[i];
      const origData = vehicleData[i];
      const assignedTo = v.assignedEmployee;
      const status = origData.jobCardStatus;

      // Select 1-2 inventory items for partsUsed
      const item1 = createdInventory[i % createdInventory.length];
      const item2 = createdInventory[(i + 3) % createdInventory.length];
      
      const part1Qty = (i % 3) + 1;
      const part2Qty = (i % 2) + 1;

      const partsUsed = [
        {
          name: item1.name,
          quantity: part1Qty,
          unitPrice: item1.sellingPrice,
          total: part1Qty * item1.sellingPrice,
          inventoryItem: item1._id,
        },
      ];

      if (i % 2 === 0) {
        partsUsed.push({
          name: item2.name,
          quantity: part2Qty,
          unitPrice: item2.sellingPrice,
          total: part2Qty * item2.sellingPrice,
          inventoryItem: item2._id,
        });
      }

      const partsTotal = partsUsed.reduce((sum, p) => sum + p.total, 0);
      const labourCost = Math.round((origData.cost - partsTotal) * 0.7);
      const safeLabourCost = labourCost > 1000 ? labourCost : 3000;
      const totalCost = partsTotal + safeLabourCost;

      const jcStatusIdx = jobCardStatuses.indexOf(status);
      const jcStatusHistory = [];
      for (let k = 0; k <= jcStatusIdx; k++) {
        jcStatusHistory.push({
          status: jobCardStatuses[k],
          changedAt: new Date(Date.now() - (jcStatusIdx - k) * 86400000 * 2),
          changedBy: assignedTo,
          notes: `Job card state set to ${jobCardStatuses[k]}`,
        });
      }

      const jobCard = await JobCard.create({
        vehicle: v._id,
        jobId: `JC-2026-${String(i + 1).padStart(6, "0")}`,
        assignedEmployee: assignedTo,
        diagnosis: origData.diagnosis,
        repairNotes: [
          { note: "Initial inspection completed. Parts requested.", addedBy: assignedTo },
          { note: "Body work in progress. Surface prepared.", addedBy: assignedTo },
        ],
        partsUsed,
        labourCost: safeLabourCost,
        totalCost,
        priority: ["medium", "high", "urgent", "low"][i % 4],
        status,
        startDate: new Date(Date.now() - (i + 5) * 86400000),
        expectedCompletionDate: new Date(Date.now() + (10 - i) * 86400000),
        completedDate: status === "completed" ? new Date(Date.now() - (i + 1) * 86400000) : undefined,
        createdBy: createdOwner._id,
        updatedBy: createdOwner._id,
        statusHistory: jcStatusHistory,
        createdAt: v.createdAt,
      });

      createdJobCards.push(jobCard);
    }
    console.log(`Created ${createdJobCards.length} job cards`);

    // 5. Invoices (For 3 completed Job Cards)
    const completedJobCards = createdJobCards.filter((jc) => jc.status === "completed");
    const createdInvoices = [];

    const paymentConfigs = [
      { status: "paid", method: "upi", paidPercent: 1.0 },
      { status: "partially_paid", method: "cash", paidPercent: 0.5 },
      { status: "pending", method: "none", paidPercent: 0 },
    ];

    for (let i = 0; i < completedJobCards.length; i++) {
      const jc = completedJobCards[i];
      const v = createdVehicles.find((v) => v._id.toString() === jc.vehicle.toString());
      const pConfig = paymentConfigs[i % paymentConfigs.length];

      const partsCost = jc.partsUsed.reduce((sum, p) => sum + (p.total || 0), 0);
      const labourCost = jc.labourCost || 3000;
      const discount = i * 200;
      const additionalCharges = i * 300;
      const subtotal = partsCost + labourCost + additionalCharges - discount;
      const taxRate = 18;
      const taxAmount = Math.round(subtotal * 0.18);
      const grandTotal = subtotal + taxAmount;
      const amountPaid = Math.round(grandTotal * pConfig.paidPercent);

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      const invoice = await Invoice.create({
        invoiceNumber: `INV-2026-${String(i + 1).padStart(6, "0")}`,
        jobCard: jc._id,
        vehicle: v._id,
        customerName: v.customer.name,
        customerPhone: v.customer.phone,
        partsCost,
        labourCost,
        additionalCharges,
        discount,
        taxRate,
        taxAmount,
        subtotal,
        grandTotal,
        paymentStatus: pConfig.status,
        paymentMethod: pConfig.method,
        amountPaid,
        invoiceDate: new Date(Date.now() - (i + 1) * 86400000),
        dueDate,
        notes: `Standard invoice for job ${jc.jobId}`,
        createdBy: createdOwner._id,
      });

      createdInvoices.push(invoice);
    }
    console.log(`Created ${createdInvoices.length} invoices`);

    // 6. FC Certificates (5 certificates with various expiration states)
    const fcData = [
      { vehicleIdx: 0, fcNum: "FC-2026-1001", result: "passed", status: "completed", daysExpiry: 180 }, // Valid
      { vehicleIdx: 5, fcNum: "FC-2026-1002", result: "pending", status: "scheduled", daysExpiry: 12 },  // Expiring Soon
      { vehicleIdx: 6, fcNum: "FC-2026-1003", result: "failed", status: "completed", daysExpiry: -30 },  // Expired
      { vehicleIdx: 12, fcNum: "FC-2026-1004", result: "pending", status: "in_progress", daysExpiry: 5 },  // Expiring Soon
      { vehicleIdx: 8, fcNum: "FC-2026-1005", result: "passed", status: "completed", daysExpiry: 365 }, // Valid
    ];

    const createdFCs = [];
    for (const item of fcData) {
      const v = createdVehicles[item.vehicleIdx];
      const fc = await FCCertificate.create({
        vehicle: v._id,
        jobId: v.jobId,
        fcNumber: item.fcNum,
        issueDate: new Date(Date.now() - 30 * 86400000),
        expiryDate: new Date(Date.now() + item.daysExpiry * 86400000),
        result: item.result,
        inspectedBy: "RTO Senior Inspector",
        inspectionCenter: "Pune RTO Center #4",
        remarks: item.result === "failed" ? "Brake balance disparity detected" : "All fitness parameters clear",
        status: item.status,
      });
      createdFCs.push(fc);
    }
    console.log(`Created ${createdFCs.length} FC certificates`);

    console.log("\n==========================================");
    console.log("  DEMO DATA POPULATION PASS COMPLETE");
    console.log("==========================================");
    console.log("Owner login:    owner@glorypaints.com / password123");
    console.log("Employee login: suresh@glorypaints.com / password123");
    console.log("------------------------------------------");
    console.log(`Vehicles:        ${createdVehicles.length}`);
    console.log(`Job Cards:       ${createdJobCards.length}`);
    console.log(`Invoices:        ${createdInvoices.length}`);
    console.log(`Inventory Items: ${createdInventory.length}`);
    console.log(`FC Certificates: ${createdFCs.length}`);
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
