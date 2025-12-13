import { integer, pgTable, varchar, pgEnum, timestamp, decimal, geometry, } from "drizzle-orm/pg-core";

const roleEnum = pgEnum("role", ["user", "admin"]);

export const usersTable = pgTable("users", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    email: varchar("email").notNull().unique(),
    password: varchar("password").notNull(),
    role: roleEnum("role").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
});

const statusDriverEnum = pgEnum("status", ["idle", "busy", "offline"]);

export const driversTable = pgTable("drivers", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").notNull().references(() => usersTable.id),
    name: varchar("name").notNull(),
    phoneNumber: varchar("phone_number").notNull(),
    status: statusDriverEnum("status").notNull(),
    lastLocation: geometry("last_location").notNull(),
    vehicleDetail: varchar("vehicle_detail").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
});

const statusOrderEnum = pgEnum("status", ["pending", "assigned", "picked_up", "delivered", "cancelled"]);

export const ordersTable = pgTable("orders", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    customerName: varchar("customer_name").notNull(),
    customerPhoneNumber: varchar("customer_phone_number"),
    driverId: integer("driver_id").notNull().references(() => driversTable.id),
    pickUpPoint: geometry("pick_up_point").notNull(),
    dropOffPoint: geometry("drop_off_point").notNull(),
    pickUpAddress: varchar("pick_up_address").notNull(),
    dropOffAddress: varchar("drop_off_address").notNull(),
    status: statusOrderEnum("status").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
});

export const zonesTable = pgTable("zones", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name").notNull(),
    area: geometry("area").notNull(),
    description: varchar("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
})

export const locationHistoryTable = pgTable("location_history", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    driverId: integer("driver_id").notNull().references(() => driversTable.id),
    location: geometry("location").notNull(),
    speed: integer("speed").notNull(),
    heading: integer("heading").notNull(),
    recordedAt: timestamp("recorded_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
})

const eventEnum = pgEnum("event", ['enter', 'exit']);

export const zoneEventTable = pgTable("zone_event", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    zoneId: integer("zone_id").notNull().references(() => zonesTable.id),
    driverId: integer("driver_id").notNull().references(() => driversTable.id),
    event: eventEnum("event").notNull(),
    recordedAt: timestamp("recorded_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
})