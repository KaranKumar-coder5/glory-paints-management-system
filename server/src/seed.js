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
  { make: "Maruti Suzuki", model: "Swift Dzire", type: "car", plate: "MH-12-AB-1234", color: "White", year: 2021, service: "painting", status: "delivered", cost: 18000 },
  { make: "Tata", model: "Nexon", type: "car", plate: "MH-14-CD-5678", color: "Blue", year: 2022, service: "repair", status: "repair", cost: 12000 },
  { make: "Mahindra", model: "Thar", type: "car", plate: "MH-01-EF-9012", color: "Black", year: 2023, service: "full_service", status: "painting", cost: 35000 },
  { make: "Ashok Leyland", model: "Dost", type: "truck", plate: "MH-02-GH-3456", color: "Yellow", year: 2020, service: "repair", status: "inspection", cost: 8000 },
  { make: "Hero", model: "Splendor", type: "two-wheeler", plate: "MH-03-IJ-7890", color: "Red", year: 2022, service: "painting", status: "received", cost: 5000 },
  { make: "Hyundai", model: "Creta", type: "car", plate: "MH-04-KL-2345", color: "Silver", year: 2023, service: "fc_inspection", status: "fc_inspection", cost: 22000 },
  { make: "Tata", model: "Ace", type: "commercial", plate: "MH-05-MN-6789", color: "White", year: 2019, service: "repair", status: "quality_check", cost: 15000 },
  { make: "Eicher", model: "Pro 2049", type: "bus", plate: "MH-06-OP-0123", color: "Green", year: 2021, service: "painting", status: "ready_for_delivery", cost: 45000 },
  { make: "Bajaj", model: "Pulsar", type: "two-wheeler", plate: "MH-07-QR-4567", color: "Red", year: 2023, service: "repair", status: "delivered", cost: 7000 },
  { make: "Toyota", model: "Innova", type: "car", plate: "MH-08-ST-8901", color: "White", year: 2022, service: "full_service", status: "repair", cost: 28000 },
  { make: "Force", model: "Traveller", type: "bus", plate: "MH-09-UV-2345", color: "Blue", year: 2020, service: "painting", status: "painting", cost: 52000 },
  { make: "Mahindra", model: "Bolero", type: "car", plate: "MH-10-WX-6789", color: "White", year: 2021, service: "repair", status: "received", cost: 9500 },
  { make: "Maruti Suzuki", model: "Ertiga", type: "car", plate: "MH-11-YZ-0123", color: "Grey", year: 2023, service: "fc_inspection", status: "inspection", cost: 16000 },
  { make: "Tata", model: "Tiago", type: "car", plate: "MH-13-AB-4567", color: "Orange", year: 2022, service: "painting", status: "delivered", cost: 14000 },
  { make: "Honda", model: "Activa", type: "two-wheeler", plate: "MH-15-CD-8901", color: "Black", year: 2023, service: "repair", status: "repair", cost: 3500 },
];

const customers = [
  { name: "Arun Sharma", phone: "9876500001", email: "arun@email.com" },
  { name: "Priya Deshmukh", phone: "9876500002", email: "priya@email.com" },
  { name: "Sanjay Kulkarni", phone: "9876500003", email: "" },
  { name: "Meena Pawar", phone: "9876500004", email: "meena@email.com" },
  { name: "Ravi Bhosale", phone: "9876500005", email: "" },
  { name: "Sunita Reddy", phone: "9876500006", email: "sunita@email.com" },
  { name: "Deepak Nair", phone: "9876500007", email: "" },
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
  { name: "Masking Tape", category: "consumable", quantity: 1, unit: "boxes", minStock: 5, purchase: 200, selling: 300, supplier: "Hardware Hub" },
  { name: "Body Filler", category: "consumable", quantity: 8, unit: "kg", minStock: 5, purchase: 250, selling: 350, supplier: "Auto Parts Co" },
];

const statuses = ["received", "inspection", "repair", "painting", "quality_check", "fc_inspection", "ready_for_delivery", "delivered"];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Inventory.deleteMany({}),
      StatusLog.deleteMany({}),
      FCCertificate.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    const createdOwner = await User.create(owners[0]);
    const createdEmployees = await User.create(employees);
    console.log(`Created ${1} owner and ${createdEmployees.length} employees`);

    const allUsers = [createdOwner, ...createdEmployees];

    const createdVehicles = [];
    for (let i = 0; i < vehicleData.length; i++) {
      const v = vehicleData[i];
      const customer = customers[i % customers.length];
      const assignedTo = createdEmployees[i % createdEmployees.length];
      const statusIdx = statuses.indexOf(v.status);

      const statusHistory = [];
      for (let j = 0; j <= statusIdx; j++) {
        statusHistory.push({
          status: statuses[j],
          changedAt: new Date(Date.now() - (statusIdx - j) * 86400000 * (Math.random() * 3 + 1)),
          changedBy: assignedTo._id,
          notes: j === 0 ? "Vehicle received at workshop" : "",
        });
      }

      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const createdAt = new Date(Date.now() - daysAgo * 86400000);

      const vehicle = await Vehicle.create({
        jobId: `GP-2026-${String(i + 1).padStart(6, "0")}`,
        vehicleType: v.type,
        make: v.make,
        model: v.model,
        year: v.year,
        color: v.color,
        licensePlate: v.plate,
        customer: { name: customer.name, phone: customer.phone, email: customer.email },
        currentStatus: v.status,
        assignedEmployee: assignedTo._id,
        createdBy: createdOwner._id,
        serviceType: v.service,
        estimatedCost: v.cost,
        actualCost: v.status === "delivered" ? v.cost : 0,
        statusHistory,
        createdAt,
        updatedAt: createdAt,
      });

      createdVehicles.push(vehicle);

      for (const sh of statusHistory) {
        await StatusLog.create({
          vehicle: vehicle._id,
          jobId: vehicle.jobId,
          toStatus: sh.status,
          changedBy: sh.changedBy,
          notes: sh.notes,
          createdAt: sh.changedAt,
        });
      }
    }
    console.log(`Created ${createdVehicles.length} vehicles with status logs`);

    for (const item of inventoryItems) {
      const sku = `${item.category.toUpperCase().slice(0, 3)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      await Inventory.create({
        name: item.name,
        category: item.category,
        sku,
        quantity: item.quantity,
        unit: item.unit,
        minStockLevel: item.minStock,
        purchasePrice: item.purchase,
        sellingPrice: item.selling,
        supplier: { name: item.supplier, phone: "9800000000" },
      });
    }
    console.log(`Created ${inventoryItems.length} inventory items`);

    const fcVehicles = createdVehicles.filter((v) =>
      ["fc_inspection", "quality_check", "ready_for_delivery", "delivered"].includes(v.currentStatus)
    );
    for (const v of fcVehicles.slice(0, 4)) {
      await FCCertificate.create({
        vehicle: v._id,
        jobId: v.jobId,
        fcNumber: `FC-${2026}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 86400000),
        result: v.currentStatus === "delivered" ? "passed" : "pending",
        inspectedBy: "RTO Inspector",
        inspectionCenter: "Pune RTO",
        status: v.currentStatus === "delivered" ? "completed" : "scheduled",
      });
    }
    console.log(`Created ${Math.min(fcVehicles.length, 4)} FC certificates`);

    console.log("\n--- SEED COMPLETE ---");
    console.log("Owner login: owner@glorypaints.com / password123");
    console.log("Employee login: suresh@glorypaints.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
