"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/package.json
var require_package = __commonJS({
  "../../node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/package.json"(exports2, module2) {
    module2.exports = {
      name: "dotenv",
      version: "17.2.3",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run tests/**/*.js --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run tests/**/*.js --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      homepage: "https://github.com/motdotla/dotenv#readme",
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// ../../node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "../../node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/lib/main.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path2 = require("path");
    var os = require("os");
    var crypto = require("crypto");
    var packageJson = require_package();
    var version = packageJson.version;
    var TIPS = [
      "\u{1F510} encrypt with Dotenvx: https://dotenvx.com",
      "\u{1F510} prevent committing .env to code: https://dotenvx.com/precommit",
      "\u{1F510} prevent building .env in docker: https://dotenvx.com/prebuild",
      "\u{1F4E1} add observability to secrets: https://dotenvx.com/ops",
      "\u{1F465} sync secrets across teammates & machines: https://dotenvx.com/ops",
      "\u{1F5C2}\uFE0F backup and recover secrets: https://dotenvx.com/ops",
      "\u2705 audit secrets and track compliance: https://dotenvx.com/ops",
      "\u{1F504} add secrets lifecycle management: https://dotenvx.com/ops",
      "\u{1F511} add access controls to secrets: https://dotenvx.com/ops",
      "\u{1F6E0}\uFE0F  run anywhere with `dotenvx run -- yourcommand`",
      "\u2699\uFE0F  specify custom .env file path with { path: '/custom/path/.env' }",
      "\u2699\uFE0F  enable debug logging with { debug: true }",
      "\u2699\uFE0F  override existing env vars with { override: true }",
      "\u2699\uFE0F  suppress all logs with { quiet: true }",
      "\u2699\uFE0F  write to custom object with { processEnv: myObject }",
      "\u2699\uFE0F  load multiple .env files with { path: ['.env.local', '.env'] }"
    ];
    function _getRandomTip() {
      return TIPS[Math.floor(Math.random() * TIPS.length)];
    }
    function parseBoolean(value) {
      if (typeof value === "string") {
        return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
      }
      return Boolean(value);
    }
    function supportsAnsi() {
      return process.stdout.isTTY;
    }
    function dim(text) {
      return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
    }
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.error(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _log(message) {
      console.log(`[dotenv@${version}] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path2.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path2.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
      const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (debug || !quiet) {
        _log("Loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path2.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
      let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path3 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path3, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path3} ${e.message}`);
          }
          lastError = e;
        }
      }
      const populated = DotenvModule.populate(processEnv, parsedAll, options);
      debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
      quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
      if (debug || !quiet) {
        const keysCount = Object.keys(populated).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path2.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e) {
            if (debug) {
              _debug(`Failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injecting env (${keysCount}) from ${shortPaths.join(",")} ${dim(`-- tip: ${_getRandomTip()}`)}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config2(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      const populated = {};
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
            populated[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
          populated[key] = parsed[key];
        }
      }
      return populated;
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config: config2,
      decrypt,
      parse,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// ../../node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/lib/env-options.js
var require_env_options = __commonJS({
  "../../node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/lib/env-options.js"(exports2, module2) {
    "use strict";
    var options = {};
    if (process.env.DOTENV_CONFIG_ENCODING != null) {
      options.encoding = process.env.DOTENV_CONFIG_ENCODING;
    }
    if (process.env.DOTENV_CONFIG_PATH != null) {
      options.path = process.env.DOTENV_CONFIG_PATH;
    }
    if (process.env.DOTENV_CONFIG_QUIET != null) {
      options.quiet = process.env.DOTENV_CONFIG_QUIET;
    }
    if (process.env.DOTENV_CONFIG_DEBUG != null) {
      options.debug = process.env.DOTENV_CONFIG_DEBUG;
    }
    if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
      options.override = process.env.DOTENV_CONFIG_OVERRIDE;
    }
    if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
      options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
    }
    module2.exports = options;
  }
});

// ../../node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/lib/cli-options.js
var require_cli_options = __commonJS({
  "../../node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/lib/cli-options.js"(exports2, module2) {
    "use strict";
    var re = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
    module2.exports = function optionMatcher(args) {
      const options = args.reduce(function(acc, cur) {
        const matches = cur.match(re);
        if (matches) {
          acc[matches[1]] = matches[2];
        }
        return acc;
      }, {});
      if (!("quiet" in options)) {
        options.quiet = "true";
      }
      return options;
    };
  }
});

// src/client.ts
var client_exports = {};
__export(client_exports, {
  $Enums: () => enums_exports,
  AppointmentStatus: () => AppointmentStatus,
  DoctorApplicationStatus: () => DoctorApplicationStatus,
  DoctorType: () => DoctorType,
  HospitalType: () => HospitalType,
  Prisma: () => prismaNamespace_exports,
  PrismaClient: () => PrismaClient2,
  Role: () => Role,
  SchedulePeriod: () => SchedulePeriod,
  ScheduleStatus: () => ScheduleStatus,
  ScheduleType: () => ScheduleType,
  SlotStatus: () => SlotStatus,
  gender: () => gender,
  prisma: () => prisma
});
module.exports = __toCommonJS(client_exports);

// generated/prisma/client.ts
var path = __toESM(require("path"));
var import_node_url = require("url");

// generated/prisma/internal/class.ts
var runtime = __toESM(require("@prisma/client/runtime/client"));
var config = {
  "previewFeatures": [],
  "clientVersion": "7.2.0",
  "engineVersion": "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Appointment {\n  id                                String            @id @default(uuid())\n  customerId                        String\n  doctorId                          String\n  scheduleId                        String\n  slotId                            String            @unique\n  status                            AppointmentStatus @default(pending)\n  approvedSlotStart                 DateTime\n  approvedSlotEnd                   DateTime\n  notes                             String?\n  approvedBy                        String?\n  createdAt                         DateTime          @default(now())\n  updatedAt                         DateTime          @updatedAt\n  tx_ref                            String            @unique\n  hospitalId                        String\n  isPaid                            Boolean           @default(false)\n  User_Appointment_approvedByToUser User?             @relation("Appointment_approvedByToUser", fields: [approvedBy], references: [id])\n  User_Appointment_customerIdToUser User              @relation("Appointment_customerIdToUser", fields: [customerId], references: [id])\n  Doctor                            Doctor            @relation(fields: [doctorId], references: [id])\n  Hospital                          Hospital          @relation(fields: [hospitalId], references: [id])\n  Schedule                          Schedule          @relation(fields: [scheduleId], references: [id])\n  Payment                           Payment?\n  Slot                              Slot?\n}\n\nmodel AuditLog {\n  id        String   @id @default(uuid())\n  userId    String\n  action    String\n  metadata  Json?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  User      User     @relation(fields: [userId], references: [id])\n}\n\nmodel Doctor {\n  id                    String                  @id @default(uuid())\n  userId                String                  @unique\n  yearsOfExperience     Int?\n  bio                   String?\n  createdAt             DateTime                @default(now())\n  updatedAt             DateTime                @updatedAt\n  isDeactivated         Boolean                 @default(false)\n  Appointment           Appointment[]\n  User                  User                    @relation(fields: [userId], references: [id])\n  DoctorHospitalProfile DoctorHospitalProfile[]\n  DoctorSpecialization  DoctorSpecialization[]\n  Review                Review[]\n  SavedDoctorHospital   SavedDoctorHospital[]\n  Schedule              Schedule[]\n}\n\nmodel DoctorApplication {\n  id                String                  @id @default(uuid())\n  createdAt         DateTime                @default(now())\n  updatedAt         DateTime                @updatedAt\n  userId            String\n  hospitalId        String\n  yearsOfExperience Int?\n  bio               String?\n  status            DoctorApplicationStatus @default(pending)\n  specializationIds String[]\n  Hospital          Hospital                @relation(fields: [hospitalId], references: [id])\n  User              User                    @relation(fields: [userId], references: [id])\n\n  @@unique([userId, hospitalId])\n}\n\nmodel DoctorHospitalProfile {\n  id           String     @id @default(uuid())\n  doctorId     String\n  hospitalId   String\n  doctorType   DoctorType\n  slotDuration Int\n  createdAt    DateTime   @default(now())\n  updatedAt    DateTime   @updatedAt\n  Doctor       Doctor     @relation(fields: [doctorId], references: [id])\n  Hospital     Hospital   @relation(fields: [hospitalId], references: [id])\n\n  @@unique([doctorId, hospitalId])\n}\n\nmodel DoctorSpecialization {\n  id               String         @id @default(uuid())\n  doctorId         String\n  specializationId String\n  createdAt        DateTime       @default(now())\n  updatedAt        DateTime       @updatedAt\n  Doctor           Doctor         @relation(fields: [doctorId], references: [id])\n  Specialization   Specialization @relation(fields: [specializationId], references: [id])\n\n  @@unique([doctorId, specializationId])\n}\n\nmodel Hospital {\n  id                     String                   @id @default(uuid())\n  adminId                String                   @unique\n  name                   String                   @unique\n  description            String\n  address                String\n  city                   String\n  latitude               Decimal\n  longitude              Decimal\n  phone                  String\n  email                  String\n  website                String?\n  openTime               DateTime?\n  closeTime              DateTime?\n  is24Hours              Boolean                  @default(false)\n  emergencySupport       Boolean                  @default(true)\n  rating                 Decimal?                 @db.Decimal(3, 2)\n  reviewCount            Int                      @default(0)\n  logoUrl                String\n  createdAt              DateTime                 @default(now())\n  updatedAt              DateTime                 @updatedAt\n  isDeactivated          Boolean                  @default(false)\n  fee                    Decimal\n  type                   HospitalType\n  timezone               String                   @default("Africa/Addis_Ababa")\n  subAccountId           String\n  logoId                 String\n  Appointment            Appointment[]\n  DoctorApplication      DoctorApplication[]\n  DoctorHospitalProfile  DoctorHospitalProfile[]\n  User                   User                     @relation(fields: [adminId], references: [id])\n  HospitalSpecialization HospitalSpecialization[]\n  Review                 Review[]\n  SavedDoctorHospital    SavedDoctorHospital[]\n  Schedule               Schedule[]\n\n  @@index([name, id])\n}\n\nmodel HospitalSpecialization {\n  id               String         @id @default(uuid())\n  hospitalId       String\n  specializationId String\n  createdAt        DateTime       @default(now())\n  updatedAt        DateTime       @updatedAt\n  Hospital         Hospital       @relation(fields: [hospitalId], references: [id])\n  Specialization   Specialization @relation(fields: [specializationId], references: [id])\n\n  @@unique([hospitalId, specializationId])\n}\n\nmodel Notification {\n  id        String   @id @default(uuid())\n  userId    String\n  title     String\n  message   String\n  isRead    Boolean  @default(false)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  User      User     @relation(fields: [userId], references: [id])\n}\n\nmodel Payment {\n  id            String      @id @default(uuid())\n  appointmentId String      @unique\n  customerId    String\n  amount        Decimal     @db.Decimal(10, 2)\n  status        String\n  method        String\n  createdAt     DateTime    @default(now())\n  updatedAt     DateTime    @updatedAt\n  Appointment   Appointment @relation(fields: [appointmentId], references: [id])\n  User          User        @relation(fields: [customerId], references: [id])\n}\n\nmodel Review {\n  id         String    @id @default(uuid())\n  customerId String\n  doctorId   String?\n  hospitalId String?\n  rating     Int\n  comment    String?\n  createdAt  DateTime  @default(now())\n  updatedAt  DateTime  @updatedAt\n  User       User      @relation(fields: [customerId], references: [id])\n  Doctor     Doctor?   @relation(fields: [doctorId], references: [id])\n  Hospital   Hospital? @relation(fields: [hospitalId], references: [id])\n}\n\nmodel SavedDoctorHospital {\n  id         String    @id @default(uuid())\n  userId     String\n  doctorId   String?\n  hospitalId String?\n  createdAt  DateTime  @default(now())\n  updatedAt  DateTime  @updatedAt\n  Doctor     Doctor?   @relation(fields: [doctorId], references: [id])\n  Hospital   Hospital? @relation(fields: [hospitalId], references: [id])\n  User       User      @relation(fields: [userId], references: [id])\n}\n\nmodel Schedule {\n  id                    String         @id @default(uuid())\n  type                  ScheduleType\n  startTime             String\n  endTime               String\n  status                ScheduleStatus @default(pending)\n  createdBy             String\n  createdAt             DateTime       @default(now())\n  updatedAt             DateTime       @updatedAt\n  doctorId              String\n  endDate               String?\n  hospitalId            String\n  startDate             String\n  dayOfWeek             Int[]\n  name                  String\n  period                SchedulePeriod\n  isDeactivated         Boolean        @default(false)\n  isExpired             Boolean        @default(false)\n  slotLastGeneratedDate String?\n  Appointment           Appointment[]\n  User                  User           @relation(fields: [createdBy], references: [id])\n  Doctor                Doctor         @relation(fields: [doctorId], references: [id])\n  Hospital              Hospital       @relation(fields: [hospitalId], references: [id])\n  Slot                  Slot[]\n\n  @@index([type, status, startDate])\n}\n\nmodel SearchLog {\n  id        String   @id @default(uuid())\n  userId    String\n  query     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  User      User     @relation(fields: [userId], references: [id])\n}\n\nmodel Slot {\n  id            String       @id @default(uuid())\n  scheduleId    String\n  slotStart     DateTime\n  slotEnd       DateTime\n  status        SlotStatus\n  appointmentId String?      @unique\n  createdAt     DateTime     @default(now())\n  updatedAt     DateTime     @updatedAt\n  date          DateTime\n  Appointment   Appointment? @relation(fields: [appointmentId], references: [id])\n  Schedule      Schedule     @relation(fields: [scheduleId], references: [id])\n\n  @@unique([slotStart, scheduleId, date])\n  @@index([scheduleId, slotStart, status])\n}\n\nmodel Specialization {\n  id                     String                   @id @default(uuid())\n  name                   String                   @unique\n  createdAt              DateTime                 @default(now())\n  description            String\n  imageURL               String?\n  slug                   String?\n  updatedAt              DateTime                 @updatedAt\n  DoctorSpecialization   DoctorSpecialization[]\n  HospitalSpecialization HospitalSpecialization[]\n\n  @@index([name])\n}\n\nmodel User {\n  id                                       String                @id @default(uuid())\n  fullName                                 String\n  email                                    String?\n  emailVerified                            Boolean               @default(false)\n  createdAt                                DateTime              @default(now())\n  updatedAt                                DateTime              @updatedAt\n  phoneNumber                              String?               @unique\n  phoneNumberVerified                      Boolean?              @default(false)\n  gender                                   String?\n  role                                     Role?                 @default(user)\n  dateOfBirth                              String?\n  imageUrl                                 String?\n  imageId                                  String?\n  banned                                   Boolean               @default(false)\n  isOnboardingComplete                     Boolean               @default(false)\n  Appointment_Appointment_approvedByToUser Appointment[]         @relation("Appointment_approvedByToUser")\n  Appointment_Appointment_customerIdToUser Appointment[]         @relation("Appointment_customerIdToUser")\n  AuditLog                                 AuditLog[]\n  Doctor                                   Doctor?\n  DoctorApplication                        DoctorApplication[]\n  Hospital                                 Hospital?\n  Notification                             Notification[]\n  Payment                                  Payment[]\n  Review                                   Review[]\n  SavedDoctorHospital                      SavedDoctorHospital[]\n  Schedule                                 Schedule[]\n  SearchLog                                SearchLog[]\n  account                                  account[]\n  session                                  session[]\n\n  @@index([phoneNumber, fullName])\n}\n\nmodel account {\n  id                    String    @id @default(uuid())\n  accountId             String\n  providerId            String\n  userId                String\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n  User                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n}\n\nmodel session {\n  id        String   @id @default(uuid())\n  expiresAt DateTime\n  token     String   @unique\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  User      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n}\n\nmodel verification {\n  id         String   @id @default(uuid())\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n}\n\nenum AppointmentStatus {\n  pending\n  approved\n  rejected\n}\n\nenum DoctorApplicationStatus {\n  pending\n  approved\n  rejected\n}\n\nenum DoctorType {\n  permanent\n  rotating\n}\n\nenum HospitalType {\n  hospital\n  dentalClinic\n  dermatologyClinic\n  diagnosticCenter\n  clinic\n}\n\nenum Role {\n  admin\n  user\n  hospital_admin\n  hospital_operator\n  hospital_user\n  doctor\n}\n\nenum SchedulePeriod {\n  morning\n  afternoon\n  evening\n}\n\nenum ScheduleStatus {\n  pending\n  approved\n  rejected\n}\n\nenum ScheduleType {\n  recurring\n  temporary\n  one_time\n}\n\nenum SlotStatus {\n  available\n  booked\n  cancelled\n  expired\n}\n\nenum gender {\n  male\n  female\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Appointment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"doctorId","kind":"scalar","type":"String"},{"name":"scheduleId","kind":"scalar","type":"String"},{"name":"slotId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"AppointmentStatus"},{"name":"approvedSlotStart","kind":"scalar","type":"DateTime"},{"name":"approvedSlotEnd","kind":"scalar","type":"DateTime"},{"name":"notes","kind":"scalar","type":"String"},{"name":"approvedBy","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tx_ref","kind":"scalar","type":"String"},{"name":"hospitalId","kind":"scalar","type":"String"},{"name":"isPaid","kind":"scalar","type":"Boolean"},{"name":"User_Appointment_approvedByToUser","kind":"object","type":"User","relationName":"Appointment_approvedByToUser"},{"name":"User_Appointment_customerIdToUser","kind":"object","type":"User","relationName":"Appointment_customerIdToUser"},{"name":"Doctor","kind":"object","type":"Doctor","relationName":"AppointmentToDoctor"},{"name":"Hospital","kind":"object","type":"Hospital","relationName":"AppointmentToHospital"},{"name":"Schedule","kind":"object","type":"Schedule","relationName":"AppointmentToSchedule"},{"name":"Payment","kind":"object","type":"Payment","relationName":"AppointmentToPayment"},{"name":"Slot","kind":"object","type":"Slot","relationName":"AppointmentToSlot"}],"dbName":null},"AuditLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"metadata","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"User","kind":"object","type":"User","relationName":"AuditLogToUser"}],"dbName":null},"Doctor":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"yearsOfExperience","kind":"scalar","type":"Int"},{"name":"bio","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"isDeactivated","kind":"scalar","type":"Boolean"},{"name":"Appointment","kind":"object","type":"Appointment","relationName":"AppointmentToDoctor"},{"name":"User","kind":"object","type":"User","relationName":"DoctorToUser"},{"name":"DoctorHospitalProfile","kind":"object","type":"DoctorHospitalProfile","relationName":"DoctorToDoctorHospitalProfile"},{"name":"DoctorSpecialization","kind":"object","type":"DoctorSpecialization","relationName":"DoctorToDoctorSpecialization"},{"name":"Review","kind":"object","type":"Review","relationName":"DoctorToReview"},{"name":"SavedDoctorHospital","kind":"object","type":"SavedDoctorHospital","relationName":"DoctorToSavedDoctorHospital"},{"name":"Schedule","kind":"object","type":"Schedule","relationName":"DoctorToSchedule"}],"dbName":null},"DoctorApplication":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"hospitalId","kind":"scalar","type":"String"},{"name":"yearsOfExperience","kind":"scalar","type":"Int"},{"name":"bio","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"DoctorApplicationStatus"},{"name":"specializationIds","kind":"scalar","type":"String"},{"name":"Hospital","kind":"object","type":"Hospital","relationName":"DoctorApplicationToHospital"},{"name":"User","kind":"object","type":"User","relationName":"DoctorApplicationToUser"}],"dbName":null},"DoctorHospitalProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"doctorId","kind":"scalar","type":"String"},{"name":"hospitalId","kind":"scalar","type":"String"},{"name":"doctorType","kind":"enum","type":"DoctorType"},{"name":"slotDuration","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"Doctor","kind":"object","type":"Doctor","relationName":"DoctorToDoctorHospitalProfile"},{"name":"Hospital","kind":"object","type":"Hospital","relationName":"DoctorHospitalProfileToHospital"}],"dbName":null},"DoctorSpecialization":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"doctorId","kind":"scalar","type":"String"},{"name":"specializationId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"Doctor","kind":"object","type":"Doctor","relationName":"DoctorToDoctorSpecialization"},{"name":"Specialization","kind":"object","type":"Specialization","relationName":"DoctorSpecializationToSpecialization"}],"dbName":null},"Hospital":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"adminId","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"city","kind":"scalar","type":"String"},{"name":"latitude","kind":"scalar","type":"Decimal"},{"name":"longitude","kind":"scalar","type":"Decimal"},{"name":"phone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"website","kind":"scalar","type":"String"},{"name":"openTime","kind":"scalar","type":"DateTime"},{"name":"closeTime","kind":"scalar","type":"DateTime"},{"name":"is24Hours","kind":"scalar","type":"Boolean"},{"name":"emergencySupport","kind":"scalar","type":"Boolean"},{"name":"rating","kind":"scalar","type":"Decimal"},{"name":"reviewCount","kind":"scalar","type":"Int"},{"name":"logoUrl","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"isDeactivated","kind":"scalar","type":"Boolean"},{"name":"fee","kind":"scalar","type":"Decimal"},{"name":"type","kind":"enum","type":"HospitalType"},{"name":"timezone","kind":"scalar","type":"String"},{"name":"subAccountId","kind":"scalar","type":"String"},{"name":"logoId","kind":"scalar","type":"String"},{"name":"Appointment","kind":"object","type":"Appointment","relationName":"AppointmentToHospital"},{"name":"DoctorApplication","kind":"object","type":"DoctorApplication","relationName":"DoctorApplicationToHospital"},{"name":"DoctorHospitalProfile","kind":"object","type":"DoctorHospitalProfile","relationName":"DoctorHospitalProfileToHospital"},{"name":"User","kind":"object","type":"User","relationName":"HospitalToUser"},{"name":"HospitalSpecialization","kind":"object","type":"HospitalSpecialization","relationName":"HospitalToHospitalSpecialization"},{"name":"Review","kind":"object","type":"Review","relationName":"HospitalToReview"},{"name":"SavedDoctorHospital","kind":"object","type":"SavedDoctorHospital","relationName":"HospitalToSavedDoctorHospital"},{"name":"Schedule","kind":"object","type":"Schedule","relationName":"HospitalToSchedule"}],"dbName":null},"HospitalSpecialization":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"hospitalId","kind":"scalar","type":"String"},{"name":"specializationId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"Hospital","kind":"object","type":"Hospital","relationName":"HospitalToHospitalSpecialization"},{"name":"Specialization","kind":"object","type":"Specialization","relationName":"HospitalSpecializationToSpecialization"}],"dbName":null},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"User","kind":"object","type":"User","relationName":"NotificationToUser"}],"dbName":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"appointmentId","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"status","kind":"scalar","type":"String"},{"name":"method","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"Appointment","kind":"object","type":"Appointment","relationName":"AppointmentToPayment"},{"name":"User","kind":"object","type":"User","relationName":"PaymentToUser"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"doctorId","kind":"scalar","type":"String"},{"name":"hospitalId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"User","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"Doctor","kind":"object","type":"Doctor","relationName":"DoctorToReview"},{"name":"Hospital","kind":"object","type":"Hospital","relationName":"HospitalToReview"}],"dbName":null},"SavedDoctorHospital":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"doctorId","kind":"scalar","type":"String"},{"name":"hospitalId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"Doctor","kind":"object","type":"Doctor","relationName":"DoctorToSavedDoctorHospital"},{"name":"Hospital","kind":"object","type":"Hospital","relationName":"HospitalToSavedDoctorHospital"},{"name":"User","kind":"object","type":"User","relationName":"SavedDoctorHospitalToUser"}],"dbName":null},"Schedule":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"ScheduleType"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ScheduleStatus"},{"name":"createdBy","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"doctorId","kind":"scalar","type":"String"},{"name":"endDate","kind":"scalar","type":"String"},{"name":"hospitalId","kind":"scalar","type":"String"},{"name":"startDate","kind":"scalar","type":"String"},{"name":"dayOfWeek","kind":"scalar","type":"Int"},{"name":"name","kind":"scalar","type":"String"},{"name":"period","kind":"enum","type":"SchedulePeriod"},{"name":"isDeactivated","kind":"scalar","type":"Boolean"},{"name":"isExpired","kind":"scalar","type":"Boolean"},{"name":"slotLastGeneratedDate","kind":"scalar","type":"String"},{"name":"Appointment","kind":"object","type":"Appointment","relationName":"AppointmentToSchedule"},{"name":"User","kind":"object","type":"User","relationName":"ScheduleToUser"},{"name":"Doctor","kind":"object","type":"Doctor","relationName":"DoctorToSchedule"},{"name":"Hospital","kind":"object","type":"Hospital","relationName":"HospitalToSchedule"},{"name":"Slot","kind":"object","type":"Slot","relationName":"ScheduleToSlot"}],"dbName":null},"SearchLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"query","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"User","kind":"object","type":"User","relationName":"SearchLogToUser"}],"dbName":null},"Slot":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"scheduleId","kind":"scalar","type":"String"},{"name":"slotStart","kind":"scalar","type":"DateTime"},{"name":"slotEnd","kind":"scalar","type":"DateTime"},{"name":"status","kind":"enum","type":"SlotStatus"},{"name":"appointmentId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"Appointment","kind":"object","type":"Appointment","relationName":"AppointmentToSlot"},{"name":"Schedule","kind":"object","type":"Schedule","relationName":"ScheduleToSlot"}],"dbName":null},"Specialization":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"description","kind":"scalar","type":"String"},{"name":"imageURL","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"DoctorSpecialization","kind":"object","type":"DoctorSpecialization","relationName":"DoctorSpecializationToSpecialization"},{"name":"HospitalSpecialization","kind":"object","type":"HospitalSpecialization","relationName":"HospitalSpecializationToSpecialization"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"phoneNumber","kind":"scalar","type":"String"},{"name":"phoneNumberVerified","kind":"scalar","type":"Boolean"},{"name":"gender","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"dateOfBirth","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"imageId","kind":"scalar","type":"String"},{"name":"banned","kind":"scalar","type":"Boolean"},{"name":"isOnboardingComplete","kind":"scalar","type":"Boolean"},{"name":"Appointment_Appointment_approvedByToUser","kind":"object","type":"Appointment","relationName":"Appointment_approvedByToUser"},{"name":"Appointment_Appointment_customerIdToUser","kind":"object","type":"Appointment","relationName":"Appointment_customerIdToUser"},{"name":"AuditLog","kind":"object","type":"AuditLog","relationName":"AuditLogToUser"},{"name":"Doctor","kind":"object","type":"Doctor","relationName":"DoctorToUser"},{"name":"DoctorApplication","kind":"object","type":"DoctorApplication","relationName":"DoctorApplicationToUser"},{"name":"Hospital","kind":"object","type":"Hospital","relationName":"HospitalToUser"},{"name":"Notification","kind":"object","type":"Notification","relationName":"NotificationToUser"},{"name":"Payment","kind":"object","type":"Payment","relationName":"PaymentToUser"},{"name":"Review","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"SavedDoctorHospital","kind":"object","type":"SavedDoctorHospital","relationName":"SavedDoctorHospitalToUser"},{"name":"Schedule","kind":"object","type":"Schedule","relationName":"ScheduleToUser"},{"name":"SearchLog","kind":"object","type":"SearchLog","relationName":"SearchLogToUser"},{"name":"account","kind":"object","type":"account","relationName":"UserToaccount"},{"name":"session","kind":"object","type":"session","relationName":"UserTosession"}],"dbName":null},"account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"User","kind":"object","type":"User","relationName":"UserToaccount"}],"dbName":null},"session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"User","kind":"object","type":"User","relationName":"UserTosession"}],"dbName":null},"verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  }
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AppointmentScalarFieldEnum: () => AppointmentScalarFieldEnum,
  AuditLogScalarFieldEnum: () => AuditLogScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  DoctorApplicationScalarFieldEnum: () => DoctorApplicationScalarFieldEnum,
  DoctorHospitalProfileScalarFieldEnum: () => DoctorHospitalProfileScalarFieldEnum,
  DoctorScalarFieldEnum: () => DoctorScalarFieldEnum,
  DoctorSpecializationScalarFieldEnum: () => DoctorSpecializationScalarFieldEnum,
  HospitalScalarFieldEnum: () => HospitalScalarFieldEnum,
  HospitalSpecializationScalarFieldEnum: () => HospitalSpecializationScalarFieldEnum,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  ModelName: () => ModelName,
  NotificationScalarFieldEnum: () => NotificationScalarFieldEnum,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SavedDoctorHospitalScalarFieldEnum: () => SavedDoctorHospitalScalarFieldEnum,
  ScheduleScalarFieldEnum: () => ScheduleScalarFieldEnum,
  SearchLogScalarFieldEnum: () => SearchLogScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SlotScalarFieldEnum: () => SlotScalarFieldEnum,
  SortOrder: () => SortOrder,
  SpecializationScalarFieldEnum: () => SpecializationScalarFieldEnum,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
var runtime2 = __toESM(require("@prisma/client/runtime/client"));
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.2.0",
  engine: "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  Appointment: "Appointment",
  AuditLog: "AuditLog",
  Doctor: "Doctor",
  DoctorApplication: "DoctorApplication",
  DoctorHospitalProfile: "DoctorHospitalProfile",
  DoctorSpecialization: "DoctorSpecialization",
  Hospital: "Hospital",
  HospitalSpecialization: "HospitalSpecialization",
  Notification: "Notification",
  Payment: "Payment",
  Review: "Review",
  SavedDoctorHospital: "SavedDoctorHospital",
  Schedule: "Schedule",
  SearchLog: "SearchLog",
  Slot: "Slot",
  Specialization: "Specialization",
  User: "User",
  account: "account",
  session: "session",
  verification: "verification"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var AppointmentScalarFieldEnum = {
  id: "id",
  customerId: "customerId",
  doctorId: "doctorId",
  scheduleId: "scheduleId",
  slotId: "slotId",
  status: "status",
  approvedSlotStart: "approvedSlotStart",
  approvedSlotEnd: "approvedSlotEnd",
  notes: "notes",
  approvedBy: "approvedBy",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  tx_ref: "tx_ref",
  hospitalId: "hospitalId",
  isPaid: "isPaid"
};
var AuditLogScalarFieldEnum = {
  id: "id",
  userId: "userId",
  action: "action",
  metadata: "metadata",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var DoctorScalarFieldEnum = {
  id: "id",
  userId: "userId",
  yearsOfExperience: "yearsOfExperience",
  bio: "bio",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  isDeactivated: "isDeactivated"
};
var DoctorApplicationScalarFieldEnum = {
  id: "id",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  userId: "userId",
  hospitalId: "hospitalId",
  yearsOfExperience: "yearsOfExperience",
  bio: "bio",
  status: "status",
  specializationIds: "specializationIds"
};
var DoctorHospitalProfileScalarFieldEnum = {
  id: "id",
  doctorId: "doctorId",
  hospitalId: "hospitalId",
  doctorType: "doctorType",
  slotDuration: "slotDuration",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var DoctorSpecializationScalarFieldEnum = {
  id: "id",
  doctorId: "doctorId",
  specializationId: "specializationId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var HospitalScalarFieldEnum = {
  id: "id",
  adminId: "adminId",
  name: "name",
  description: "description",
  address: "address",
  city: "city",
  latitude: "latitude",
  longitude: "longitude",
  phone: "phone",
  email: "email",
  website: "website",
  openTime: "openTime",
  closeTime: "closeTime",
  is24Hours: "is24Hours",
  emergencySupport: "emergencySupport",
  rating: "rating",
  reviewCount: "reviewCount",
  logoUrl: "logoUrl",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  isDeactivated: "isDeactivated",
  fee: "fee",
  type: "type",
  timezone: "timezone",
  subAccountId: "subAccountId",
  logoId: "logoId"
};
var HospitalSpecializationScalarFieldEnum = {
  id: "id",
  hospitalId: "hospitalId",
  specializationId: "specializationId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var NotificationScalarFieldEnum = {
  id: "id",
  userId: "userId",
  title: "title",
  message: "message",
  isRead: "isRead",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  appointmentId: "appointmentId",
  customerId: "customerId",
  amount: "amount",
  status: "status",
  method: "method",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  customerId: "customerId",
  doctorId: "doctorId",
  hospitalId: "hospitalId",
  rating: "rating",
  comment: "comment",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SavedDoctorHospitalScalarFieldEnum = {
  id: "id",
  userId: "userId",
  doctorId: "doctorId",
  hospitalId: "hospitalId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ScheduleScalarFieldEnum = {
  id: "id",
  type: "type",
  startTime: "startTime",
  endTime: "endTime",
  status: "status",
  createdBy: "createdBy",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  doctorId: "doctorId",
  endDate: "endDate",
  hospitalId: "hospitalId",
  startDate: "startDate",
  dayOfWeek: "dayOfWeek",
  name: "name",
  period: "period",
  isDeactivated: "isDeactivated",
  isExpired: "isExpired",
  slotLastGeneratedDate: "slotLastGeneratedDate"
};
var SearchLogScalarFieldEnum = {
  id: "id",
  userId: "userId",
  query: "query",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SlotScalarFieldEnum = {
  id: "id",
  scheduleId: "scheduleId",
  slotStart: "slotStart",
  slotEnd: "slotEnd",
  status: "status",
  appointmentId: "appointmentId",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  date: "date"
};
var SpecializationScalarFieldEnum = {
  id: "id",
  name: "name",
  createdAt: "createdAt",
  description: "description",
  imageURL: "imageURL",
  slug: "slug",
  updatedAt: "updatedAt"
};
var UserScalarFieldEnum = {
  id: "id",
  fullName: "fullName",
  email: "email",
  emailVerified: "emailVerified",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  phoneNumber: "phoneNumber",
  phoneNumberVerified: "phoneNumberVerified",
  gender: "gender",
  role: "role",
  dateOfBirth: "dateOfBirth",
  imageUrl: "imageUrl",
  imageId: "imageId",
  banned: "banned",
  isOnboardingComplete: "isOnboardingComplete"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var enums_exports = {};
__export(enums_exports, {
  AppointmentStatus: () => AppointmentStatus,
  DoctorApplicationStatus: () => DoctorApplicationStatus,
  DoctorType: () => DoctorType,
  HospitalType: () => HospitalType,
  Role: () => Role,
  SchedulePeriod: () => SchedulePeriod,
  ScheduleStatus: () => ScheduleStatus,
  ScheduleType: () => ScheduleType,
  SlotStatus: () => SlotStatus,
  gender: () => gender
});
var AppointmentStatus = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected"
};
var DoctorApplicationStatus = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected"
};
var DoctorType = {
  permanent: "permanent",
  rotating: "rotating"
};
var HospitalType = {
  hospital: "hospital",
  dentalClinic: "dentalClinic",
  dermatologyClinic: "dermatologyClinic",
  diagnosticCenter: "diagnosticCenter",
  clinic: "clinic"
};
var Role = {
  admin: "admin",
  user: "user",
  hospital_admin: "hospital_admin",
  hospital_operator: "hospital_operator",
  hospital_user: "hospital_user",
  doctor: "doctor"
};
var SchedulePeriod = {
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening"
};
var ScheduleStatus = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected"
};
var ScheduleType = {
  recurring: "recurring",
  temporary: "temporary",
  one_time: "one_time"
};
var SlotStatus = {
  available: "available",
  booked: "booked",
  cancelled: "cancelled",
  expired: "expired"
};
var gender = {
  male: "male",
  female: "female"
};

// generated/prisma/client.ts
var import_meta = {};
var __PRISMA_IMPORT_META_URL__ = typeof import_meta !== "undefined" && import_meta.url ? import_meta.url : typeof __filename !== "undefined" ? (0, import_node_url.pathToFileURL)(__filename).toString() : void 0;
globalThis["__dirname"] = path.dirname((0, import_node_url.fileURLToPath)(__PRISMA_IMPORT_META_URL__));
var PrismaClient = getPrismaClientClass();

// src/client.ts
var import_adapter_pg = require("@prisma/adapter-pg");

// ../../node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/config.js
(function() {
  require_main().config(
    Object.assign(
      {},
      require_env_options(),
      require_cli_options()(process.argv)
    )
  );
})();

// src/client.ts
var adapter = new import_adapter_pg.PrismaPg({
  connectionString: process.env.DATABASE_URL
});
var PrismaClient2 = class extends PrismaClient {
  constructor(options) {
    const opts = options ? { ...options } : {};
    if (!opts.adapter) opts.adapter = adapter;
    super(opts);
  }
};
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? new PrismaClient2();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $Enums,
  AppointmentStatus,
  DoctorApplicationStatus,
  DoctorType,
  HospitalType,
  Prisma,
  PrismaClient,
  Role,
  SchedulePeriod,
  ScheduleStatus,
  ScheduleType,
  SlotStatus,
  gender,
  prisma
});
