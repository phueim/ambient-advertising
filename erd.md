# Entity Relationship Diagram (ERD)

## USEA Ambient Advertising Platform Database Schema

### Overview
The database schema consists of **14 tables** organized into three main domains:

1. **Core Ambient Advertising** (8 tables) - Real-time data processing and ad triggering
2. **Business Logic** (6 tables) - Contract management and financial operations  
3. **Legacy Music System** - Not implemented in current schema

---

## Core Ambient Advertising Domain

### 1. governmentData
**Purpose**: Stores real-time Singapore government data feeds
```
┌─────────────────────────────────────────┐
│ governmentData                          │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ timestamp: TIMESTAMP DEFAULT NOW()      │
│ source: VARCHAR(50) NOT NULL           │ 
│ rawData: JSON NOT NULL                 │
│ temperature: DECIMAL(5,2)              │
│ humidity: INTEGER                      │
│ condition: VARCHAR(100)                │
│ uvIndex: INTEGER                       │
│ aqi: INTEGER                          │
│ floodLevel: VARCHAR(50)               │
│ location: VARCHAR(100)                │
└─────────────────────────────────────────┘
```

### 2. advertisers
**Purpose**: Advertiser accounts with budget management
```
┌─────────────────────────────────────────┐
│ advertisers                             │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ name: VARCHAR(100) NOT NULL            │
│ displayName: VARCHAR(100) NOT NULL     │
│ creditBalance: DECIMAL(10,2) DEFAULT 0  │
│ spentAmount: DECIMAL(10,2) DEFAULT 0    │
│ budgetCap: DECIMAL(10,2) NOT NULL      │
│ status: VARCHAR(20) DEFAULT 'active'    │
│ createdAt: TIMESTAMP DEFAULT NOW()      │
└─────────────────────────────────────────┘
```

### 3. conditionRules
**Purpose**: Rules for triggering ads based on environmental conditions
```
┌─────────────────────────────────────────┐
│ conditionRules                          │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ ruleId: VARCHAR(50) UNIQUE NOT NULL    │
│ advertiserId: INTEGER → advertisers.id │
│ priority: INTEGER NOT NULL             │
│ conditions: JSON NOT NULL              │
│ messageTemplate: TEXT NOT NULL         │
│ isActive: BOOLEAN DEFAULT TRUE         │
│ createdAt: TIMESTAMP DEFAULT NOW()      │
└─────────────────────────────────────────┘
```

### 4. locations
**Purpose**: Physical locations where ads are played
```
┌─────────────────────────────────────────┐
│ locations                               │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ name: VARCHAR(100) NOT NULL            │
│ address: TEXT                          │
│ type: VARCHAR(50)                      │
│ isActive: BOOLEAN DEFAULT TRUE         │
│ createdAt: TIMESTAMP DEFAULT NOW()      │
└─────────────────────────────────────────┘
```

### 5. scripts
**Purpose**: AI-generated advertisement scripts
```
┌─────────────────────────────────────────┐
│ scripts                                 │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ ruleId: VARCHAR(50) NOT NULL           │
│ text: TEXT NOT NULL                    │
│ variables: JSON                        │
│ generatedAt: TIMESTAMP DEFAULT NOW()    │
└─────────────────────────────────────────┘
```

### 6. voiceovers
**Purpose**: Voice synthesis results for scripts
```
┌─────────────────────────────────────────┐
│ voiceovers                              │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ scriptId: INTEGER → scripts.id         │
│ audioUrl: TEXT                         │
│ voiceType: VARCHAR(20) NOT NULL        │
│ duration: INTEGER                      │
│ status: VARCHAR(20) DEFAULT 'pending'   │
│ createdAt: TIMESTAMP DEFAULT NOW()      │
└─────────────────────────────────────────┘
```

### 7. adTriggers
**Purpose**: Log of every triggered advertisement
```
┌─────────────────────────────────────────┐
│ adTriggers                              │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ advertiserId: INTEGER → advertisers.id  │
│ ruleId: VARCHAR(50) NOT NULL           │
│ locationId: INTEGER → locations.id     │
│ scriptId: INTEGER → scripts.id         │
│ voiceoverId: INTEGER → voiceovers.id   │
│ cost: DECIMAL(8,2) NOT NULL            │
│ weatherData: JSON                      │
│ status: VARCHAR(20) DEFAULT 'pending'   │
│ triggeredAt: TIMESTAMP DEFAULT NOW()    │
└─────────────────────────────────────────┘
```

### 8. systemHealth
**Purpose**: System monitoring and health checks
```
┌─────────────────────────────────────────┐
│ systemHealth                            │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ service: VARCHAR(50) NOT NULL          │
│ status: VARCHAR(20) NOT NULL           │
│ lastCheck: TIMESTAMP DEFAULT NOW()      │
│ errorMessage: TEXT                     │
│ responseTime: INTEGER                  │
└─────────────────────────────────────────┘
```

---

## Business Logic Domain

### 9. venues
**Purpose**: Partners that host advertising systems
```
┌─────────────────────────────────────────┐
│ venues                                  │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ name: VARCHAR(255) NOT NULL            │
│ location: VARCHAR(255) NOT NULL        │
│ type: VARCHAR(100) NOT NULL            │
│ country: VARCHAR(100) NOT NULL         │
│ city: VARCHAR(100) NOT NULL            │
│ capacity: INTEGER                      │
│ isActive: BOOLEAN DEFAULT TRUE         │
│ createdAt: TIMESTAMP DEFAULT NOW()      │
│ updatedAt: TIMESTAMP DEFAULT NOW()      │
└─────────────────────────────────────────┘
```

### 10. contractTemplates
**Purpose**: Pricing tier templates for contracts
```
┌─────────────────────────────────────────┐
│ contractTemplates                       │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ name: VARCHAR(255) NOT NULL            │
│ tier: VARCHAR(50) NOT NULL             │
│ category: VARCHAR(100) NOT NULL        │
│ currency: VARCHAR(3) NOT NULL          │
│ billingType: VARCHAR(50) NOT NULL      │
│ monthlyFixedFee: DECIMAL(10,2) DEF 0   │
│ perTriggerRate: DECIMAL(10,2) DEF 0    │
│ minimumGuarantee: DECIMAL(10,2) DEF 0  │
│ performanceBonusThreshold: DECIMAL(10,2)│
│ performanceBonusRate: DECIMAL(5,2)     │
│ venuePayoutType: VARCHAR(50) NOT NULL  │
│ venueFixedMonthly: DECIMAL(10,2) DEF 0 │
│ venuePercentageRate: DECIMAL(5,2) DEF 0│
│ venueMinimumGuarantee: DECIMAL(10,2)   │
│ venuePerformanceBonusThreshold: DEC    │
│ venuePerformanceBonusRate: DECIMAL(5,2)│
│ maxTriggersPerMonth: INT DEF 999999    │
│ monthlyBudget: DECIMAL(10,2) DEF 0     │
│ isActive: BOOLEAN DEFAULT TRUE         │
│ createdAt: TIMESTAMP DEFAULT NOW()      │
│ updatedAt: TIMESTAMP DEFAULT NOW()      │
└─────────────────────────────────────────┘
```

### 11. advertiserContracts
**Purpose**: Active contracts with advertisers
```
┌─────────────────────────────────────────┐
│ advertiserContracts                     │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ advertiserId: INT → advertisers.id     │
│ templateId: INT → contractTemplates.id │
│ contractName: VARCHAR(255) NOT NULL    │
│ currency: VARCHAR(3) NOT NULL          │
│ billingType: VARCHAR(50) NOT NULL      │
│ monthlyFixedFee: DECIMAL(10,2) DEF 0   │
│ perTriggerRate: DECIMAL(10,2) DEF 0    │
│ minimumGuarantee: DECIMAL(10,2) DEF 0  │
│ performanceBonusThreshold: DECIMAL(10,2)│
│ performanceBonusRate: DECIMAL(10,2)    │
│ maxTriggersPerMonth: INT DEF 999999    │
│ monthlyBudget: DECIMAL(10,2) DEF 0     │
│ currentMonthSpend: DECIMAL(10,2) DEF 0 │
│ currentMonthTriggers: INT DEF 0        │
│ startDate: DATE NOT NULL               │
│ endDate: DATE                          │
│ status: VARCHAR(50) DEFAULT 'active'    │
│ createdAt: TIMESTAMP DEFAULT NOW()      │
│ updatedAt: TIMESTAMP DEFAULT NOW()      │
└─────────────────────────────────────────┘
```

### 12. venueContracts
**Purpose**: Payout contracts with venues
```
┌─────────────────────────────────────────┐
│ venueContracts                          │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ venueId: INTEGER → venues.id           │
│ templateId: INT → contractTemplates.id │
│ contractName: VARCHAR(255) NOT NULL    │
│ currency: VARCHAR(3) NOT NULL          │
│ payoutType: VARCHAR(50) NOT NULL       │
│ fixedMonthly: DECIMAL(10,2) DEF 0      │
│ percentageRate: DECIMAL(5,2) DEF 0     │
│ minimumGuarantee: DECIMAL(10,2) DEF 0  │
│ performanceBonusThreshold: DECIMAL(10,2)│
│ performanceBonusRate: DECIMAL(10,2)    │
│ currentMonthRevenue: DECIMAL(10,2) DF 0│
│ currentMonthTriggers: INT DEF 0        │
│ startDate: DATE NOT NULL               │
│ endDate: DATE                          │
│ status: VARCHAR(50) DEFAULT 'active'    │
│ createdAt: TIMESTAMP DEFAULT NOW()      │
│ updatedAt: TIMESTAMP DEFAULT NOW()      │
└─────────────────────────────────────────┘
```

### 13. billingRecords
**Purpose**: Monthly billing records for advertisers
```
┌─────────────────────────────────────────┐
│ billingRecords                          │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ contractId: INT → advertiserContracts.id│
│ billingPeriod: VARCHAR(7) NOT NULL     │
│ totalAmount: DECIMAL(10,2) NOT NULL    │
│ monthlyFee: DECIMAL(10,2) DEF 0        │
│ triggerCosts: DECIMAL(10,2) DEF 0      │
│ totalTriggers: INTEGER DEFAULT 0       │
│ currency: VARCHAR(3) NOT NULL          │
│ status: VARCHAR(20) DEFAULT 'pending'   │
│ invoiceDate: TIMESTAMP DEFAULT NOW()    │
│ dueDate: TIMESTAMP NOT NULL            │
│ paidDate: TIMESTAMP                    │
└─────────────────────────────────────────┘
```

### 14. payoutRecords
**Purpose**: Monthly payout records for venues
```
┌─────────────────────────────────────────┐
│ payoutRecords                           │
├─────────────────────────────────────────┤
│ id: SERIAL PRIMARY KEY                  │
│ contractId: INT → venueContracts.id    │
│ payoutPeriod: VARCHAR(7) NOT NULL      │
│ totalAmount: DECIMAL(10,2) NOT NULL    │
│ fixedAmount: DECIMAL(10,2) DEF 0       │
│ revenueShare: DECIMAL(10,2) DEF 0      │
│ bonusAmount: DECIMAL(10,2) DEF 0       │
│ totalTriggers: INTEGER DEFAULT 0       │
│ currency: VARCHAR(3) NOT NULL          │
│ status: VARCHAR(20) DEFAULT 'pending'   │
│ payoutDate: TIMESTAMP DEFAULT NOW()     │
│ paidDate: TIMESTAMP                    │
└─────────────────────────────────────────┘
```

---

## Relationships & Constraints

### Primary Relationships

```
advertisers ──┬─ One-to-Many ─→ conditionRules
              └─ One-to-Many ─→ adTriggers
              └─ One-to-Many ─→ advertiserContracts

locations ──── One-to-Many ─→ adTriggers

scripts ──┬─── One-to-Many ─→ voiceovers
          └─── One-to-Many ─→ adTriggers

voiceovers ─── One-to-Many ─→ adTriggers

venues ──┬──── One-to-Many ─→ venueContracts

contractTemplates ──┬─ One-to-Many ─→ advertiserContracts
                    └─ One-to-Many ─→ venueContracts

advertiserContracts ─ One-to-Many ─→ billingRecords

venueContracts ───── One-to-Many ─→ payoutRecords
```

### Foreign Key Constraints

- `conditionRules.advertiserId` → `advertisers.id`
- `voiceovers.scriptId` → `scripts.id`
- `adTriggers.advertiserId` → `advertisers.id`
- `adTriggers.locationId` → `locations.id`
- `adTriggers.scriptId` → `scripts.id`
- `adTriggers.voiceoverId` → `voiceovers.id`
- `advertiserContracts.advertiserId` → `advertisers.id`
- `advertiserContracts.templateId` → `contractTemplates.id`
- `venueContracts.venueId` → `venues.id`
- `venueContracts.templateId` → `contractTemplates.id`
- `billingRecords.contractId` → `advertiserContracts.id`
- `payoutRecords.contractId` → `venueContracts.id`

### Unique Constraints

- `conditionRules.ruleId` (UNIQUE)

### Business Logic Notes

1. **Financial Precision**: All monetary values use `DECIMAL` for accuracy
2. **Contract-Based Billing**: Three billing models supported:
   - Monthly Fixed: Flat rate regardless of triggers
   - Per-Trigger: Pay per advertisement played  
   - Hybrid: Fixed base + per-trigger costs
3. **Budget Controls**: Monthly spending limits and trigger caps
4. **Audit Trail**: Complete transaction history via billing/payout records
5. **Multi-Currency**: SGD/MYR support for Singapore market
6. **Real-Time Processing**: Government data feeds every 5 minutes
7. **AI Integration**: Automated script generation and voice synthesis

### Data Flow

```
governmentData → conditionRules → scripts → voiceovers → adTriggers
                      ↓                                      ↓
                 advertisers ←──── advertiserContracts ← billingRecords
                                          ↓
              venues ←──── venueContracts ← payoutRecords
```

---

## Technical Implementation

- **Database**: PostgreSQL with Drizzle ORM
- **Environment**: Neon serverless database
- **Schema Management**: Drizzle Kit migrations
- **Data Types**: Optimized for financial calculations and JSON storage
- **Indexing**: Auto-generated primary keys, unique constraints on business keys
- **Timestamps**: Automatic tracking of creation and modification times

---

*Last Updated: 2025-08-03*
*Schema Version: Current implementation from shared/schema.ts*