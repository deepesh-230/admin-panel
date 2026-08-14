# DivyaangDisha --- Backend & Admin Dashboard Implementation Plan

## 1. Document Purpose

This document defines the implementation plan for completing the
**DivyaangDisha backend and Admin Dashboard** based on the provided
project PDF.

### Current priority

The immediate priority is:

-   Complete the backend.
-   Complete the Admin Dashboard.
-   Build stable, documented APIs.
-   Implement the business rules and workflows required by the PDF.
-   Keep the backend API-first so that the React Native mobile
    application can be developed later using the same APIs.

### Explicitly out of current scope

The following should **not** be the current development priority:

-   React Native mobile UI implementation
-   Mobile navigation
-   Mobile animations
-   Mobile-specific components
-   Mobile Figma implementation
-   Mobile state-management implementation

The backend should nevertheless expose all APIs required by the future
mobile application.

------------------------------------------------------------------------

# 2. Source Analysis and Confidence

The plan is based on the provided **DivyaangDisha project PDF**,
including the mobile-flow references and the Admin Dashboard pages.

The PDF defines:

-   Master data
-   Categories and subcategories
-   State admins
-   Mobile user roles
-   Dashboard user roles
-   Service Provider Search
-   Service Provider submission and approval
-   Service Provider Admin assignment
-   Enquiries
-   Internal chat
-   Notifications
-   Emergency Provider Search
-   Sale Items / Marketplace
-   Sell and Need/Buy flows
-   User Profile and maintenance
-   Common pages/options
-   Admin Dashboard
-   Listings
-   Upload Listings
-   Users
-   Enquiries
-   FAQ
-   Useful Links
-   Help & Support
-   Pages
-   Blog
-   Job Alerts
-   Suggestions
-   Sales List
-   Push Notifications
-   Settings
-   Social settings
-   Web/general settings
-   Banners
-   Dashboard filtering/navigation behavior

### Confidence

  Area                                                                    Confidence
  -------------------------------------------------------- -------------------------
  Product/business understanding                                               \~95%
  Major feature coverage                                                   \~93--95%
  Backend architecture direction                                               \~95%
  Admin dashboard coverage                                                     \~95%
  Exact implementation specification                         \~85% before code audit
  Expected confidence after code audit and clarification                       \~98%

The remaining uncertainty comes from requirements that are not
completely specified in the PDF, especially exact permission
granularity, complete chat behavior, bulk-upload format, exact report
definitions, some validation rules, notification providers, and some
detailed data fields.

These should be treated as **open requirements** rather than invented.

------------------------------------------------------------------------

# 3. Product Architecture

The target architecture should be API-first.

``` text
                         DIVYAANGDISHA
                              |
               +--------------+--------------+
               |                             |
        ADMIN DASHBOARD                FUTURE MOBILE APP
               |                             |
               +--------------+--------------+
                              |
                         REST API v1
                              |
       +----------------------+----------------------+
       |                      |                      |
   Auth / RBAC          Business Modules             CMS
       |                      |                      |
       |             +--------+---------+             |
       |             |        |         |             |
       |        Providers  Listings  Enquiries        |
       |             |        |         |             |
       |             +--------+---------+             |
       |                      |                      |
       |                Chat / Notifications          |
       |                      |                      |
       +----------------------+----------------------+
                              |
                           Database
                              |
                    +---------+---------+
                    |                   |
               File Storage       External Services
                                  - Google Maps
                                  - Push/FCM
                                  - WhatsApp
```

### Architectural principle

The Admin Dashboard must consume the same backend APIs that the future
mobile application will consume wherever practical.

Business logic should remain in the backend rather than being duplicated
in the admin or mobile clients.

------------------------------------------------------------------------

# 4. Phase 0 --- Existing Project Audit

## Objective

Before modifying the existing code, perform a complete audit of the
current backend and Admin Dashboard.

### Backend audit

Inspect:

-   Framework
-   Database
-   ORM/query layer
-   Existing models
-   Existing APIs
-   Authentication
-   Authorization
-   Middleware
-   Validation
-   File uploads
-   Image handling
-   Google Maps integration
-   Chat implementation
-   Notifications
-   Email/WhatsApp integrations
-   Existing admin APIs
-   Environment configuration
-   Deployment configuration
-   Logging
-   Error handling
-   Tests

### Admin audit

Inspect:

-   Framework
-   Routing
-   Authentication
-   API service layer
-   State management
-   Existing screens
-   Existing components
-   Tables
-   Forms
-   Filters
-   Search
-   Pagination
-   Permissions
-   Existing modules
-   Dashboard statistics
-   Settings

### Audit output

Create a module-by-module matrix:

  -------------------------------------------------------------------------------------
  Module           Existing   Partial    Missing    Needs      PDF           Action
                                                    Refactor   Requirement   
  ---------------- ---------- ---------- ---------- ---------- ------------- ----------
  Authentication                                                             

  Users                                                                      

  Categories                                                                 

  Service                                                                    
  Providers                                                                  

  Emergency                                                                  
  Providers                                                                  

  Listings                                                                   

  Enquiries                                                                  

  Chat                                                                       

  Notifications                                                              

  CMS                                                                        

  Dashboard                                                                  

  Settings                                                                   
  -------------------------------------------------------------------------------------

### Rule

Do not rewrite working functionality simply because it can be
implemented differently. First identify what exists and what is actually
missing.

------------------------------------------------------------------------

# 5. Phase 1 --- Backend Foundation, Authentication and RBAC

The PDF defines mobile users as:

-   End User
-   Service Provider Admin
-   State Admin

Dashboard users are:

-   Admin
-   State Admin

## Core entities

``` text
User
Role
Permission
State
UserState
ServiceProviderAdmin
Session
RefreshToken
```

## Authentication APIs

``` text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me
```

## RBAC

Implement backend-enforced permissions.

Do not rely only on hiding UI buttons.

Example high-level roles:

``` text
ADMIN
STATE_ADMIN
END_USER
SERVICE_PROVIDER_ADMIN
```

The exact permission matrix must be confirmed against the source
requirements and existing application behavior before final
implementation.

------------------------------------------------------------------------

# 6. Phase 2 --- Master Data

The PDF explicitly starts with Master Data Setup and includes
category/subcategory information and State Admin setup.

## Modules

### States

``` text
GET    /api/v1/states
GET    /api/v1/states/:id
POST   /api/v1/states
PATCH  /api/v1/states/:id
DELETE /api/v1/states/:id
```

### State Admins

``` text
GET    /api/v1/state-admins
POST   /api/v1/state-admins
GET    /api/v1/state-admins/:id
PATCH  /api/v1/state-admins/:id
DELETE /api/v1/state-admins/:id
```

### Categories

``` text
GET    /api/v1/categories
POST   /api/v1/categories
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id
```

### Subcategories

``` text
GET    /api/v1/categories/:categoryId/subcategories
POST   /api/v1/subcategories
PATCH  /api/v1/subcategories/:id
DELETE /api/v1/subcategories/:id
```

### Keywords

Support category/subcategory keyword search as required by the Service
Provider Search flow.

Relationship:

``` text
Category
   |
   +-- Subcategory
          |
          +-- Keywords
```

------------------------------------------------------------------------

# 7. Phase 3 --- Users and State Administration

## User management

Admin APIs:

``` text
GET    /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
PATCH  /api/v1/users/:id/status
```

Support:

-   Search
-   State filtering
-   Role filtering
-   Status filtering
-   Pagination
-   Sorting

## State Admin

State Admins should be linked to their state.

The backend should enforce state-level access boundaries.

------------------------------------------------------------------------

# 8. Phase 4 --- Service Provider Management

This is a core module.

The PDF describes Service Provider submission, location selection,
category/subcategory selection, approval, and assignment of a Service
Provider Admin.

## Service Provider data

The exact fields must be confirmed during implementation, but the PDF
indicates support for information such as:

-   Name/title
-   Category
-   Subcategory
-   Description
-   Phone
-   Landline
-   Email
-   Address
-   Company information/about
-   Services
-   Location
-   Cover photo
-   Gallery
-   State/city
-   Google Maps-derived location information

## Suggested model

``` text
service_providers

id
name
category_id
subcategory_id
description
phone
landline
email
website
address
state_id
city
latitude
longitude
google_place_id
about
status
approval_status
created_by
approved_by
approved_at
rejected_reason
created_at
updated_at
```

## Provider Admin relationship

``` text
User
   |
   +-- ServiceProviderAdmin
             |
             +-- ServiceProvider
```

## Provider status workflow

``` text
DRAFT
  |
PENDING_APPROVAL
  |
  +----> REJECTED
  |
APPROVED
  |
ACTIVE
```

The exact status set should be aligned with the existing code if a
working workflow already exists.

## Provider APIs

``` text
GET    /api/v1/service-providers
GET    /api/v1/service-providers/:id
POST   /api/v1/service-providers
PATCH  /api/v1/service-providers/:id
DELETE /api/v1/service-providers/:id

POST   /api/v1/service-providers/:id/approve
POST   /api/v1/service-providers/:id/reject

GET    /api/v1/service-providers/:id/admins
POST   /api/v1/service-providers/:id/admins
DELETE /api/v1/service-providers/:id/admins/:userId
```

------------------------------------------------------------------------

# 9. Phase 5 --- Service Provider Search

The mobile application will later require a robust search API.

Support:

-   Keyword search
-   Category
-   Subcategory
-   State
-   City
-   Location
-   Distance/radius if confirmed
-   Pagination
-   Sorting
-   Status

Example:

``` text
GET /api/v1/service-providers
    ?page=1
    &limit=20
    &search=hospital
    &categoryId=
    &subcategoryId=
    &stateId=
    &city=
    &latitude=
    &longitude=
    &radius=
```

The PDF specifically describes keyword searching to find related
categories/subcategories.

------------------------------------------------------------------------

# 10. Phase 6 --- Service Provider Admin and Enquiry Routing

This is a critical business rule.

The PDF specifies default enquiry forwarding in this order:

``` text
Service Provider Admin
        |
        v
State Admin
        |
        v
Main Admin
```

## Routing service

Implement a backend service such as:

``` text
EnquiryRoutingService
```

Pseudo-flow:

``` text
Find Provider Admin
      |
      +-- Found -> Assign
      |
      +-- Not Found
              |
          Find State Admin
              |
              +-- Found -> Assign
              |
              +-- Not Found
                      |
                  Assign Main Admin
```

If the current user is the Service Provider Admin for a provider, the
PDF states that Chat and Enquire Now should not be visible to that user.

This relationship should be exposed safely by the backend.

------------------------------------------------------------------------

# 11. Phase 7 --- Emergency Provider Module

The PDF defines Emergency Provider Search as a separate mobile tab and
says its submission flow is similar to the Service Provider submission.

## Core functionality

-   CRUD
-   Submission
-   Approval/rejection
-   Location
-   State/city
-   Category where applicable
-   Search
-   Filtering

## APIs

``` text
GET    /api/v1/emergency-providers
GET    /api/v1/emergency-providers/:id
POST   /api/v1/emergency-providers
PATCH  /api/v1/emergency-providers/:id
DELETE /api/v1/emergency-providers/:id

POST   /api/v1/emergency-providers/:id/approve
POST   /api/v1/emergency-providers/:id/reject
```

------------------------------------------------------------------------

# 12. Phase 8 --- Sale Items / Marketplace

The PDF defines the third mobile tab as Sale Items Search.

There are two concepts:

``` text
SELL
NEED / BUY
```

The NEED flow is important because users who need an item should be
visible so someone who has that item can connect and chat with them.

## Recommended model

``` text
Listing
   |
   +-- SELL
   |
   +-- NEED
```

## Suggested listing fields

``` text
id
type
product_name
description
category_id
subcategory_id
price
actual_price
offer_price
condition
brand
color
images
seller_id / requester_id
state_id
city
latitude
longitude
status
approval_status
created_at
updated_at
```

Exact fields should be finalized from the existing application and
source screens.

## APIs

``` text
GET    /api/v1/listings
GET    /api/v1/listings/:id
POST   /api/v1/listings
PATCH  /api/v1/listings/:id
DELETE /api/v1/listings/:id

POST   /api/v1/listings/:id/approve
POST   /api/v1/listings/:id/reject
```

Support:

``` text
?type=SELL
?type=NEED
?categoryId=
?subcategoryId=
?search=
?stateId=
```

------------------------------------------------------------------------

# 13. Phase 9 --- Bulk / Upload Listings

The Admin Dashboard contains a separate **Uploads Listings** module.

This should be treated separately from normal CRUD.

Expected workflow:

``` text
Upload File
     |
Validate
     |
Preview
     |
Show Errors
     |
Confirm Import
     |
Create Listings
     |
Import Summary
```

Requirements to finalize:

-   Accepted file format
-   Column names
-   Required fields
-   Duplicate handling
-   Error-report format
-   Maximum upload size
-   Image handling if applicable

Do not invent these details until the existing implementation/source
material is checked.

------------------------------------------------------------------------

# 14. Phase 10 --- Enquiries

Create a reusable enquiry system.

## Suggested model

``` text
enquiries

id
user_id
service_provider_id
listing_id
assigned_to
type
subject
message
status
priority
created_at
updated_at
```

## Status

Potential workflow:

``` text
OPEN
IN_PROGRESS
RESOLVED
CLOSED
```

The exact statuses should be aligned with the existing UI if already
implemented.

## APIs

``` text
GET    /api/v1/enquiries
GET    /api/v1/enquiries/:id
POST   /api/v1/enquiries
PATCH  /api/v1/enquiries/:id
POST   /api/v1/enquiries/:id/reply
POST   /api/v1/enquiries/:id/assign
```

Support separate admin views for:

-   Service enquiries
-   Product enquiries

------------------------------------------------------------------------

# 15. Phase 11 --- Internal Chat

The PDF defines direct internal chat behavior but also notes that the
chat screen could not be attached because of a server issue.

Therefore:

### Confirmed requirement

Chat should support communication between:

-   Users
-   Service Provider Admins
-   State Admins/Admins as applicable

### Backend model

``` text
conversations
conversation_participants
messages
message_attachments
message_read_status
```

## APIs

``` text
GET  /api/v1/conversations
GET  /api/v1/conversations/:id
GET  /api/v1/conversations/:id/messages
POST /api/v1/conversations/:id/messages
POST /api/v1/conversations/:id/read
```

Exact chat UI and some routing details remain an open requirement
because the PDF does not contain the complete chat screen.

------------------------------------------------------------------------

# 16. Phase 12 --- Notifications

The PDF mentions:

-   WhatsApp chat option
-   Internal chat notifications
-   Notifications from other users
-   Push Notifications in the Admin Dashboard

Implement a notification abstraction.

``` text
Notification
    |
    +-- In App
    +-- Push
    +-- Email
    +-- WhatsApp
```

Not every notification must use every channel.

## Notification model

``` text
notifications

id
user_id
type
title
body
reference_type
reference_id
is_read
created_at
```

## APIs

``` text
GET  /api/v1/notifications
POST /api/v1/notifications/:id/read
POST /api/v1/notifications/read-all
```

## Admin push notifications

Admin should be able to create and manage push notifications.

Exact targeting rules should be confirmed:

-   All users
-   State
-   Role
-   Specific users
-   Other segments if required

------------------------------------------------------------------------

# 17. Phase 13 --- User Profile and Common Features

The fourth mobile tab contains profile/maintenance/common functionality.

Backend should prepare APIs for:

``` text
GET    /api/v1/profile
PATCH  /api/v1/profile
POST   /api/v1/profile/change-password

GET    /api/v1/profile/providers
GET    /api/v1/profile/listings
GET    /api/v1/profile/enquiries
GET    /api/v1/profile/notifications
```

Common content APIs should include:

``` text
GET /api/v1/pages/about
GET /api/v1/pages/privacy-policy
GET /api/v1/pages/terms
GET /api/v1/faq
GET /api/v1/useful-links
GET /api/v1/contact
```

The exact complete profile menu should be matched against the PDF
screens and existing project.

------------------------------------------------------------------------

# 18. Phase 14 --- Admin Dashboard

The Admin Dashboard is a major deliverable, not just a supporting
interface.

## Dashboard statistics

Support cards/statistics for items shown in the PDF, including:

-   Total Users
-   Active Users
-   Inactive Users
-   Total Service Providers
-   Active Service Providers
-   Inactive Service Providers
-   Listings
-   Product Enquiries
-   Relevant recent activity / latest-7-days information

## Critical dashboard behavior

Dashboard cards should be clickable.

Example:

``` text
Total Users
     |
     v
Users page
     |
     v
Automatically filtered result
```

The PDF explicitly states that clickable buttons should navigate to
filtered result pages and allow further contextual filtering/search.

------------------------------------------------------------------------

# 19. Phase 15 --- Admin User Management

Admin UI:

``` text
Users
    |
    +-- All Users
    +-- Active Users
    +-- Inactive Users
    +-- State Admins
```

Features:

-   Search
-   Filter
-   Sort
-   Pagination
-   View
-   Edit
-   Activate/deactivate
-   Role/state management where permitted

------------------------------------------------------------------------

# 20. Phase 16 --- Admin Listings Management

Admin menu should include:

``` text
Listings
    |
    +-- Categories
    +-- Sub Categories
    +-- Service Providers / Listings
    +-- Uploads Listings
```

Actions should include the appropriate:

-   Add
-   View
-   Edit
-   Delete
-   Approve
-   Reject
-   Activate
-   Deactivate
-   Search
-   Filter
-   Pagination
-   Export where required

------------------------------------------------------------------------

# 21. Phase 17 --- Sales List

The Admin Dashboard contains a separate Sales List.

The PDF shows information such as:

-   Product Name
-   Actual Price
-   Offer Price
-   Color
-   Brand
-   Created By
-   Status
-   Created Date
-   Actions

This should be implemented as a dedicated marketplace administration
view.

------------------------------------------------------------------------

# 22. Phase 18 --- CMS

Complete the dashboard CMS modules shown in the PDF.

## FAQ

``` text
question
answer
status
sort_order
```

## Useful Links

``` text
title
url
description
status
```

## Pages

Examples indicated by the PDF/common application content:

-   About Us
-   Privacy Policy
-   Terms and Conditions

## Blog

``` text
title
slug
description
content
image
author
status
published_at
```

## Job Alerts

``` text
title
description
application_url
post_date
last_date
status
```

## Suggestions

The dashboard shows:

-   Title
-   Comment
-   Received From
-   Ticket Status
-   Created Date
-   Status

Suggested model:

``` text
suggestions

id
user_id
title
comment
ticket_status
admin_response
status
created_at
updated_at
```

------------------------------------------------------------------------

# 23. Phase 19 --- Help & Support

Implement the dashboard Help & Support functionality shown in the PDF.

Potential areas:

-   Contact requests
-   Support requests
-   Enquiries
-   Admin response
-   Status tracking

Exact fields and workflow should be matched against the existing
project/PDF screens.

------------------------------------------------------------------------

# 24. Phase 20 --- Settings

The PDF contains a dedicated Settings area.

## General/Web Settings

Support configurable:

-   Company name
-   Logo
-   Favicon
-   Address
-   Phone
-   Email
-   Other contact information shown in the dashboard

## Social Settings

Support the platforms shown in the PDF, including:

-   WhatsApp
-   Facebook
-   Twitter
-   Instagram

## Banner management

The PDF shows separate banner types such as:

``` text
HOME
PRODUCT
LISTING
```

Recommended fields:

``` text
id
type
image
status
sort_order
start_date
end_date
```

Scheduling fields should only be included if confirmed as required.

------------------------------------------------------------------------

# 25. Phase 21 --- Reports and Dashboard Analytics

Reports should be designed after the actual dashboard requirements are
mapped.

Potential reporting areas:

-   Users
-   Service Providers
-   Listings
-   Enquiries
-   Product/Sales activity
-   State-wise statistics
-   Recent activity

State Admin reports should be restricted to the appropriate state scope.

Do not invent report metrics that are not required by the PDF or
existing dashboard.

------------------------------------------------------------------------

# 26. Phase 22 --- API Standards

All APIs should follow consistent conventions.

## Versioning

``` text
/api/v1/...
```

## Response

``` json
{
  "success": true,
  "message": "Service providers fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

## Error

``` json
{
  "success": false,
  "message": "Service provider not found",
  "error": {
    "code": "SERVICE_PROVIDER_NOT_FOUND"
  }
}
```

Standardize:

-   HTTP status codes
-   Validation
-   Pagination
-   Filtering
-   Sorting
-   Search
-   Error codes
-   File uploads
-   Image URLs
-   Date/time formats
-   Authentication
-   Authorization
-   Logging

------------------------------------------------------------------------

# 27. Phase 23 --- Database / ERD

Before implementing all modules, prepare the complete ERD.

High-level relationships:

``` text
users
 |
 +-- roles
 |
 +-- states
 |
 +-- service_provider_admins
 |          |
 |          +-- service_providers
 |
 +-- enquiries
 |
 +-- conversations
 |          |
 |          +-- messages
 |
 +-- listings
 |
 +-- notifications


categories
 |
 +-- subcategories

service_providers
 |
 +-- category
 +-- subcategory
 +-- state
 +-- admins
 +-- enquiries

listings
 |
 +-- category
 +-- subcategory
 +-- creator
 +-- state
 +-- enquiries
```

The final ERD should be generated after the current backend is audited
so that existing valid structures are preserved where possible.

------------------------------------------------------------------------

# 28. Phase 24 --- Security and Production Readiness

Before calling the backend complete:

## Security

-   Password hashing
-   Token security
-   Refresh-token handling
-   RBAC
-   Input validation
-   Authorization on every protected resource
-   File-upload validation
-   Rate limiting where required
-   CORS configuration
-   Sensitive-data protection
-   Secure environment variables

## Reliability

-   Centralized error handling
-   Structured logging
-   Request IDs where useful
-   Database transactions
-   Retry strategy for external services
-   Background jobs where required

## Operations

-   Production environment
-   Database migrations
-   Backups
-   Monitoring
-   Health checks
-   Deployment process
-   Rollback process

------------------------------------------------------------------------

# 29. Phase 25 --- Testing

Testing should cover both backend and Admin Dashboard.

## Backend

### Unit tests

-   Business logic
-   Validation
-   Enquiry routing
-   Permission checks
-   Status transitions

### Integration tests

-   Authentication
-   Provider approval
-   Listing approval
-   Enquiry creation
-   Chat
-   Notifications
-   Admin APIs

### API tests

Verify:

-   Authentication
-   Authorization
-   Validation
-   Pagination
-   Filtering
-   Error responses
-   State-level access restrictions

## Admin

Test:

-   Login
-   Dashboard
-   CRUD
-   Filters
-   Search
-   Pagination
-   Approvals
-   Rejections
-   Settings
-   Notifications
-   State Admin restrictions

------------------------------------------------------------------------

# 30. Phase 26 --- API Documentation

Before mobile development starts, the API must be documented.

Recommended:

``` text
OpenAPI / Swagger
```

Documentation should include:

-   Authentication
-   Endpoint
-   Request parameters
-   Request body
-   Response
-   Error responses
-   Permissions
-   Pagination
-   Examples

The future mobile developer should be able to build the React Native app
from the API documentation without needing to understand backend
internals.

------------------------------------------------------------------------

# 31. Complete Feature Matrix

The following is the working feature matrix derived from the PDF.

  ------------------------------------------------------------------------------------------------
  ID            Module          Feature                Admin      Backend    Future     Priority
                                                                             Mobile API 
  ------------- --------------- ---------------------- ---------- ---------- ---------- ----------
  AUTH-001      Auth            Register/Login         ✓          ✓          ✓          Critical

  AUTH-002      Auth            Refresh/Logout         ✓          ✓          ✓          Critical

  AUTH-003      Auth            Forgot/Reset Password  ✓          ✓          ✓          Critical

  RBAC-001      Roles           Admin                  ✓          ✓          ---        Critical

  RBAC-002      Roles           State Admin            ✓          ✓          ✓          Critical

  MD-001        Master Data     States                 ✓          ✓          ✓          Critical

  MD-002        Master Data     State Admins           ✓          ✓          ✓          Critical

  MD-003        Master Data     Categories             ✓          ✓          ✓          Critical

  MD-004        Master Data     Subcategories          ✓          ✓          ✓          Critical

  MD-005        Master Data     Keywords               ✓          ✓          ✓          High

  USER-001      Users           User Management        ✓          ✓          ✓          Critical

  SP-001        Provider        Add Provider           ---        ✓          ✓          Critical

  SP-002        Provider        Location               ---        ✓          ✓          Critical

  SP-003        Provider        Category/Subcategory   ✓          ✓          ✓          Critical

  SP-004        Provider        Approval               ✓          ✓          ---        Critical

  SP-005        Provider        Provider Admin         ✓          ✓          ✓          Critical
                                Assignment                                              

  SP-006        Provider        Search                 ✓          ✓          ✓          Critical

  EP-001        Emergency       CRUD                   ✓          ✓          ✓          High

  EP-002        Emergency       Approval               ✓          ✓          ---        High

  SALE-001      Sales           Sell Listing           ✓          ✓          ✓          Critical

  SALE-002      Sales           Need/Buy Listing       ✓          ✓          ✓          Critical

  SALE-003      Sales           Approval               ✓          ✓          ---        Critical

  SALE-004      Sales           Sales List             ✓          ✓          ✓          Critical

  SALE-005      Sales           Upload Listings        ✓          ✓          ---        High

  ENQ-001       Enquiries       Service Enquiry        ✓          ✓          ✓          Critical

  ENQ-002       Enquiries       Product Enquiry        ✓          ✓          ✓          Critical

  ENQ-003       Enquiries       Routing                ✓          ✓          ✓          Critical

  CHAT-001      Chat            Conversations          ✓          ✓          ✓          High

  CHAT-002      Chat            Messages               ✓          ✓          ✓          High

  CHAT-003      Chat            Read Status            ✓          ✓          ✓          Medium

  NOTIF-001     Notifications   In-App                 ✓          ✓          ✓          High

  NOTIF-002     Notifications   Push                   ✓          ✓          ✓          High

  NOTIF-003     Notifications   Admin Push             ✓          ✓          ✓          High

  CMS-001       CMS             FAQ                    ✓          ✓          ✓          Medium

  CMS-002       CMS             Useful Links           ✓          ✓          ✓          Medium

  CMS-003       CMS             Pages                  ✓          ✓          ✓          Medium

  CMS-004       CMS             Blog                   ✓          ✓          ✓          Medium

  CMS-005       CMS             Job Alerts             ✓          ✓          ✓          Medium

  SUPPORT-001   Support         Suggestions            ✓          ✓          ✓          Medium

  SUPPORT-002   Support         Help/Contact           ✓          ✓          ✓          Medium

  SET-001       Settings        General/Web            ✓          ✓          ✓          Medium

  SET-002       Settings        Social                 ✓          ✓          ✓          Medium

  SET-003       Settings        Banners                ✓          ✓          ✓          Medium

  DASH-001      Dashboard       Statistics             ✓          ✓          ---        Critical

  DASH-002      Dashboard       Clickable Filters      ✓          ✓          ---        Critical

  REPORT-001    Reports         State-wise Reports     ✓          ✓          ---        High

  API-001       API             Swagger/OpenAPI        ---        ✓          ---        Critical

  QA-001        QA              Automated Tests        ---        ✓          ---        Critical

  OPS-001       Ops             Production Deployment  ---        ✓          ---        Critical
  ------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 32. Recommended Sprint Structure

## Sprint 1 --- Foundation

-   Existing code audit
-   Backend architecture
-   Database audit
-   Authentication
-   RBAC
-   Admin authentication

## Sprint 2 --- Master Data

-   States
-   State Admins
-   Categories
-   Subcategories
-   Keywords

## Sprint 3 --- Users + Providers

-   Users
-   Service Providers
-   Provider submission
-   Provider approval
-   Provider Admin assignment
-   Search
-   Location

## Sprint 4 --- Emergency + Marketplace

-   Emergency Providers
-   Sell Listings
-   Need Listings
-   Listing approval
-   Sales List

## Sprint 5 --- Enquiries + Communication

-   Enquiries
-   Routing
-   Internal Chat
-   Messages
-   Notifications

## Sprint 6 --- Admin Dashboard

-   Dashboard statistics
-   Clickable cards
-   Users
-   Providers
-   Listings
-   Enquiries
-   Sales List
-   Filters/search/pagination

## Sprint 7 --- CMS + Support

-   FAQ
-   Useful Links
-   Pages
-   Blog
-   Job Alerts
-   Suggestions
-   Help & Support

## Sprint 8 --- Settings

-   General settings
-   Social settings
-   Banners
-   Push Notifications

## Sprint 9 --- Uploads + Reports

-   Upload Listings
-   Validation/preview
-   Import errors
-   Reports
-   Export if required

## Sprint 10 --- Production Readiness

-   API documentation
-   Security
-   Testing
-   Performance
-   Logging
-   Monitoring
-   Backup
-   Deployment

------------------------------------------------------------------------

# 33. Definition of Backend Complete

The backend should not be considered complete merely because CRUD APIs
exist.

## Core

-   [ ] Authentication
-   [ ] Authorization
-   [ ] RBAC
-   [ ] Users
-   [ ] States
-   [ ] State Admins
-   [ ] Categories
-   [ ] Subcategories
-   [ ] Keywords

## Providers

-   [ ] Service Provider CRUD
-   [ ] Provider submission
-   [ ] Approval/rejection
-   [ ] Provider Admin assignment
-   [ ] Search
-   [ ] Filters
-   [ ] Location
-   [ ] Emergency Providers

## Marketplace

-   [ ] Sell listings
-   [ ] Need listings
-   [ ] Approval
-   [ ] Search
-   [ ] Category filtering
-   [ ] Image handling
-   [ ] Sales List
-   [ ] Bulk upload

## Communication

-   [ ] Enquiries
-   [ ] Enquiry routing
-   [ ] Chat
-   [ ] Messages
-   [ ] Notifications
-   [ ] Push notifications

## CMS

-   [ ] FAQ
-   [ ] Useful Links
-   [ ] Pages
-   [ ] Blog
-   [ ] Job Alerts
-   [ ] Suggestions
-   [ ] Help & Support
-   [ ] Social
-   [ ] General settings
-   [ ] Banners

## Production

-   [ ] API documentation
-   [ ] Validation
-   [ ] Security
-   [ ] Logging
-   [ ] Error handling
-   [ ] Unit tests
-   [ ] Integration tests
-   [ ] Database backup
-   [ ] Deployment
-   [ ] Monitoring

------------------------------------------------------------------------

# 34. Definition of Admin Dashboard Complete

The Admin Dashboard should allow authorized users to operate the
platform without directly modifying the database.

Admin should be able to:

``` text
Manage Users
      |
Manage States
      |
Manage State Admins
      |
Manage Categories
      |
Manage Subcategories
      |
Approve Providers
      |
Manage Providers
      |
Manage Emergency Providers
      |
Manage Listings
      |
Upload Listings
      |
Manage Sales
      |
Manage Enquiries
      |
Reply to Enquiries
      |
Manage Communication
      |
Manage Notifications
      |
Manage FAQ
      |
Manage Pages
      |
Manage Blog
      |
Manage Job Alerts
      |
Manage Suggestions
      |
Manage Help & Support
      |
Manage Banners
      |
Manage Social Settings
      |
Manage General Settings
      |
View Reports
```

------------------------------------------------------------------------

# 35. Important Open Requirements

These items should **not be guessed** from the PDF.

Before final implementation, confirm:

1.  Exact permission matrix for Admin vs State Admin.
2.  Exact Service Provider fields and validation rules.
3.  Exact Emergency Provider fields.
4.  Exact Sales Listing fields.
5.  Bulk Upload file format and validation rules.
6.  Exact chat UI and message behavior.
7.  Exact notification channels and providers.
8.  Push notification targeting rules.
9.  Exact report metrics.
10. Image/file size and format restrictions.
11. Exact approval/rejection rules for each entity.
12. Exact duplicate handling.
13. Search ranking and location-radius behavior.
14. Exact status values used throughout the system.
15. Exact language/multi-language behavior if required.
16. Any sponsor-maintenance functionality mentioned for Main Admin.
17. Exact behavior of common profile/menu options.

These should be recorded as decisions in the project requirements before
implementation.

------------------------------------------------------------------------

# 36. Recommended Development Principle

Do not implement the application screen-by-screen.

Use this sequence:

``` text
PDF
  |
  v
Functional Requirements
  |
  v
Feature Matrix
  |
  v
Database / ERD
  |
  v
API Contracts
  |
  v
Backend Services
  |
  v
Admin Dashboard
  |
  v
Testing
  |
  v
API Documentation
  |
  v
Future React Native App
```

This prevents the backend from becoming tightly coupled to the current
Admin Dashboard UI.

------------------------------------------------------------------------

# 37. Final Recommendation

The immediate objective should be:

> **Complete the DivyaangDisha backend as an API-first platform and
> complete the Admin Dashboard as the operational management system.**

The future React Native application should then consume the
already-tested APIs.

The next concrete step is **Phase 0: audit the existing backend and
Admin Dashboard source code against the PDF and produce a Current →
Required → Missing → Modify checklist**.

Only after that checklist is complete should development begin on the
implementation phases.

------------------------------------------------------------------------

## Source Note

This implementation plan is derived from the provided **DivyaangDisha
project PDF**. Where the PDF does not specify exact technical behavior,
the document explicitly marks the item as an open requirement rather
than treating an assumption as a confirmed requirement.
