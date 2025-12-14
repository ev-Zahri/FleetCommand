/**
 * Driver Location Simulator
 * Simulates 5 drivers moving around Jakarta area
 * Run: npx tsx src/simulator.ts
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var API_URL = process.env.API_URL || 'http://localhost:3001';
// Jakarta area bounds
var JAKARTA_CENTER = { lat: -6.2088, lng: 106.8456 };
var MOVEMENT_RANGE = 0.02; // ~2km movement range
// Initialize 5 drivers at random positions around Jakarta
var drivers = [
    { id: 1, name: 'Ahmad Kurniawan', status: 'idle', latitude: JAKARTA_CENTER.lat + 0.01, longitude: JAKARTA_CENTER.lng + 0.01, heading: 0, speed: 0 },
    { id: 2, name: 'Budi Santoso', status: 'busy', latitude: JAKARTA_CENTER.lat - 0.01, longitude: JAKARTA_CENTER.lng + 0.02, heading: 90, speed: 30 },
    { id: 3, name: 'Citra Dewi', status: 'idle', latitude: JAKARTA_CENTER.lat + 0.02, longitude: JAKARTA_CENTER.lng - 0.01, heading: 180, speed: 0 },
    { id: 4, name: 'Dedi Prasetyo', status: 'busy', latitude: JAKARTA_CENTER.lat - 0.02, longitude: JAKARTA_CENTER.lng - 0.02, heading: 270, speed: 25 },
    { id: 5, name: 'Eka Putri', status: 'offline', latitude: JAKARTA_CENTER.lat, longitude: JAKARTA_CENTER.lng, heading: 45, speed: 0 },
];
// Randomly move driver position
function moveDriver(driver) {
    if (driver.status === 'offline')
        return;
    // Random movement direction
    var latChange = (Math.random() - 0.5) * 0.002; // ~200m
    var lngChange = (Math.random() - 0.5) * 0.002;
    driver.latitude += latChange;
    driver.longitude += lngChange;
    // Keep within Jakarta bounds
    driver.latitude = Math.max(JAKARTA_CENTER.lat - MOVEMENT_RANGE, Math.min(JAKARTA_CENTER.lat + MOVEMENT_RANGE, driver.latitude));
    driver.longitude = Math.max(JAKARTA_CENTER.lng - MOVEMENT_RANGE, Math.min(JAKARTA_CENTER.lng + MOVEMENT_RANGE, driver.longitude));
    // Update heading based on movement
    driver.heading = Math.atan2(lngChange, latChange) * (180 / Math.PI);
    if (driver.heading < 0)
        driver.heading += 360;
    // Random speed for busy drivers
    driver.speed = driver.status === 'busy' ? Math.floor(Math.random() * 40) + 10 : 0;
}
// Randomly change driver status
function randomlyChangeStatus() {
    var randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
    if (randomDriver === undefined)
        return;
    var statuses = ['idle', 'busy', 'offline'];
    var newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    if (newStatus !== undefined && newStatus !== randomDriver.status) {
        randomDriver.status = newStatus;
        console.log("\uD83D\uDCCD ".concat(randomDriver.name, " status changed to: ").concat(newStatus.toUpperCase()));
    }
}
// Send location update to server
function sendLocationUpdate(driver) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "/api/drivers/").concat(driver.id, "/location"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                latitude: driver.latitude,
                                longitude: driver.longitude,
                                heading: driver.heading,
                                speed: driver.speed,
                                name: driver.name,
                                status: driver.status
                            })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        console.error("Failed to update driver ".concat(driver.id, ":"), response.statusText);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error sending update for driver ".concat(driver.id, ":"), error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Main simulation loop
function simulate() {
    return __awaiter(this, void 0, void 0, function () {
        var iteration;
        var _this = this;
        return __generator(this, function (_a) {
            console.log('🚗 Starting Driver Simulator...');
            console.log("\uD83D\uDCE1 Sending updates to: ".concat(API_URL));
            console.log('-----------------------------------');
            iteration = 0;
            setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                var _i, drivers_1, driver;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            iteration++;
                            _i = 0, drivers_1 = drivers;
                            _a.label = 1;
                        case 1:
                            if (!(_i < drivers_1.length)) return [3 /*break*/, 4];
                            driver = drivers_1[_i];
                            moveDriver(driver);
                            return [4 /*yield*/, sendLocationUpdate(driver)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            console.log("[".concat(new Date().toLocaleTimeString(), "] Updated ").concat(drivers.length, " drivers"));
                            // Randomly change status every 10 iterations (~20 seconds)
                            if (iteration % 10 === 0) {
                                randomlyChangeStatus();
                            }
                            return [2 /*return*/];
                    }
                });
            }); }, 2000); // Update every 2 seconds
            return [2 /*return*/];
        });
    });
}
simulate();
