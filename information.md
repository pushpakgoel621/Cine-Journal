# Product Requirements Document (PRD): CineJournal

## 1. Executive Summary & Product Vision
**CineJournal** is a high-fidelity personal media journal designed for film enthusiasts. It transcends standard CRUD (Create, Read, Update, Delete) watchlist applications by focusing on the *experiential* metadata of movie-watching. 

The system must track not only standard movie metadata (title, genre, release year) but also highly personalized, user-generated context (emotional state, viewing platform, chronological history). The architecture must be highly modular, designed from day one to support complex media handling (high-res posters, custom user uploads) and future extensibility for advanced data querying (such as semantic search over personal reviews or automated sentiment tagging).

## 2. Core User Workflows & System Behavior

### A. The Onboarding & Authentication Flow
* **Context:** The entry point must be frictionless and visually immersive, setting a cinematic tone immediately.
* **Requirements:**
  * Secure user authentication supporting both OAuth providers (e.g., Google) and standard Email/Password logic.
  * Session management to ensure users remain logged in across visits.
  * A dedicated routing guard to prevent unauthenticated users from accessing internal dashboard routes.

### B. The Dashboard (Command Center)
* **Context:** The landing page upon login. It serves as both a reminder system and a showcase of the user's highest-rated media.
* **Requirements:**
  * **Watchlist Reminder Module:** A dynamic query section that fetches and displays movies tagged with a `To-Watch` status, prioritizing items added longest ago or items with approaching external release dates.
  * **Hall of Fame:** A horizontally scrolling carousel displaying the user's top-rated entries (e.g., 5-star ratings).
  * **Global Action State:** A globally accessible "Quick Add" trigger (like a Floating Action Button) to initialize the logging workflow from anywhere in the app.

### C. The Logging Engine (Search & Data Entry)
* **Context:** The most critical interactive component. It must feel instantaneous.
* **Requirements:**
  * **Asynchronous Auto-Suggest Search:** An input field hooked into the TMDb API. As the user types, it must debounce the input and return a dropdown list of matching movies (Title, Year, Thumbnail).
  * **Hybrid Data Binding:** When a user selects a movie from the auto-suggest list, the system must automatically populate the form with TMDb metadata (Poster URL, Title, ID) while leaving user-specific fields blank.
  * **The "Feelings Panel":** A multi-select UI component for tags. The system should provide a default array of emotional tags (e.g., *Nostalgic, Thrilled, Tearjerker*) but allow the user to create and append custom string tags to their profile.
  * **Contextual Data:** Dropdown or radio selection for the viewing platform (Theater, Netflix, Prime, Local Media, etc.).
  * **Media Override:** A dedicated upload handler allowing the user to reject the default TMDb poster and upload a custom image file to cloud storage.

### D. The Library (Discovery & Filtering)
* **Context:** The user's historical database. It must handle large datasets gracefully.
* **Requirements:**
  * **Grid Architecture:** A responsive grid displaying movie posters.
  * **Stateful Filtering System:** A complex filtering panel that allows querying the user's dataset by intersecting parameters:
    * *Filter by:* Pre-defined Genre, Custom Emotion Tag, Platform.
    * *Sort by:* Date Watched (Asc/Desc), Rating (Asc/Desc), Release Year.
  * **Tactile Interactions:** The UI should support a "flip" or "reveal" state for each movie card, transitioning from the poster view to the user's contextual data (Rating, Tags, Date).

## 3. UI/UX & Aesthetic Guidelines
The agent must build the frontend with a strict adherence to these design principles, using variable-based design tokens to allow for seamless theme switching.

* **Cinematic Default:** The baseline theme is dark mode. Deep blacks, high-contrast text, and a focus on letting the movie posters provide the color palette.
* **Theme Toggling System:** The application state must support a global theme variable, dynamically switching the application's color tokens between:
  * *Classic Dark:* Sleek blacks and deep grays.
  * *Popcorn & Retro:* Warm reds, vintage typography.
  * *Neon Cyberpunk:* High-contrast neon accents (blues/pinks) with dark backgrounds.
* **Animation Philosophy:** State changes (opening modals, filtering lists, flipping cards) should rely on smooth, hardware-accelerated transitions. 

## 4. Agnostic Data Architecture (Schema Blueprint)
The database architecture must be relational or document-based, but must strictly adhere to this separation of concerns:

### **Entity: `Users`**
* `user_id` (Primary Key / Unique Identifier)
* `email` (String)
* `display_name` (String)
* `preferences` (JSON/Object - stores chosen theme, custom user-created emotion tags)
* `created_at` (Timestamp)

### **Entity: `WatchLogs` (The Core Ledger)**
* `log_id` (Primary Key)
* `user_id` (Foreign Key -> Users)
* `tmdb_id` (Integer - For referencing external metadata without duplicating it)
* `title` (String - Cached from API)
* `poster_url` (String - API link OR link to custom cloud storage bucket)
* `rating` (Float/Integer)
* `emotions` (Array of Strings)
* `platform` (String)
* `review_text` (Text/Long String)
* `watch_status` (Enum: 'Watched', 'To-Watch')
* `watched_at` (Timestamp)

## 5. Extensibility & Future-Proofing
The application's API and backend communication layers must be designed to accommodate complex, resource-heavy operations in the future. 

* **Microservice Readiness:** The architecture should easily allow attaching external services (e.g., Python-based data processing servers) to handle intensive tasks later on.
* **AI & Machine Learning Hooks:** Data fields like `review_text` and `emotions` should be structured cleanly so they can eventually be fed into Large Language Models (LLMs) for tasks like automated sentiment analysis, generating personalized watch recommendations via Retrieval-Augmented Generation (RAG), or conversational search agents.
* **Media Pipelines:** The storage logic for custom images must be robust enough to eventually support user-generated AI imagery (e.g., custom posters generated via external text-to-image workflows) being passed into the application.

## 6. Development Phasing for the Agent

* **Phase 1: The Skeleton (Data & Auth)**
  * Implement authentication.
  * Construct the database schema.
  * Build the core API routes/actions for creating, reading, updating, and deleting a `WatchLog`.
* **Phase 2: The Engine (External API & Input)**
  * Integrate the TMDb API.
  * Build the auto-suggest search interface and the full "Add Entry" logging form with the Feelings Panel.
* **Phase 3: The Presentation (UI & Filtering)**
  * Construct the Dashboard and Library views.
  * Implement the complex filtering and sorting logic.
  * Apply the multi-theme design token system and tactile animations.